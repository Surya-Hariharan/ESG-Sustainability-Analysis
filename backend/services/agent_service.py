import os
import json
import asyncio
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import torch
import torch.nn as nn
import joblib
import numpy as np
from pathlib import Path
from datetime import datetime
import logging
from ..core.config import settings
from .groq_service import groq_service

logger = logging.getLogger(__name__)

class ESGRiskClassifier(nn.Module):
    def __init__(self, input_dim, hidden_dims, num_classes, dropout=0.5):
        super(ESGRiskClassifier, self).__init__()
        layers = []
        prev_dim = input_dim
        for hidden_dim in hidden_dims:
            layers.append(nn.Linear(prev_dim, hidden_dim))
            layers.append(nn.BatchNorm1d(hidden_dim))
            layers.append(nn.ReLU())
            layers.append(nn.Dropout(dropout))
            prev_dim = hidden_dim
        layers.append(nn.Linear(prev_dim, num_classes))
        self.network = nn.Sequential(*layers)
    
    def forward(self, x):
        return self.network(x)

@dataclass
class AgentContext:
    company_name: str
    company_data: Dict
    news_articles: List[Dict]
    model_prediction: Dict
    conversation_history: List[Dict]

class BaseAgent:
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role
        self.system_prompt = self._build_system_prompt()
    
    def _build_system_prompt(self) -> str:
        return f"You are {self.name}, a specialized AI agent for {self.role}."
    
    async def process(self, context: AgentContext) -> Dict[str, Any]:
        raise NotImplementedError

class NewsAnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="ESG News Analyst",
            role="analyzing ESG-related news and extracting actionable insights"
        )
    
    async def process(self, context: AgentContext) -> Dict[str, Any]:
        articles = context.news_articles
        
        if not articles:
            return {
                "agent": self.name,
                "summary": "No recent news available for analysis.",
                "key_themes": [],
                "sentiment": "neutral",
                "risk_indicators": []
            }
        
        environmental_keywords = ["carbon", "emissions", "climate", "renewable", "pollution", "waste"]
        social_keywords = ["diversity", "labor", "community", "safety", "human rights", "employee"]
        governance_keywords = ["board", "ethics", "compliance", "transparency", "corruption", "audit"]
        controversy_keywords = ["lawsuit", "scandal", "investigation", "violation", "fine", "penalty"]
        
        env_articles = [a for a in articles if any(kw in (a.get("description") or "").lower() for kw in environmental_keywords)]
        social_articles = [a for a in articles if any(kw in (a.get("description") or "").lower() for kw in social_keywords)]
        gov_articles = [a for a in articles if any(kw in (a.get("description") or "").lower() for kw in governance_keywords)]
        controversy_articles = [a for a in articles if any(kw in (a.get("description") or "").lower() for kw in controversy_keywords)]
        
        key_themes = []
        if env_articles:
            key_themes.append({"theme": "Environmental", "count": len(env_articles), "examples": [a["title"] for a in env_articles[:2]]})
        if social_articles:
            key_themes.append({"theme": "Social", "count": len(social_articles), "examples": [a["title"] for a in social_articles[:2]]})
        if gov_articles:
            key_themes.append({"theme": "Governance", "count": len(gov_articles), "examples": [a["title"] for a in gov_articles[:2]]})
        
        sentiment = "positive" if not controversy_articles else "negative" if len(controversy_articles) > 2 else "mixed"
        
        risk_indicators = []
        if controversy_articles:
            risk_indicators.extend([f"Controversy detected: {a['title']}" for a in controversy_articles[:3]])
        
        return {
            "agent": self.name,
            "summary": f"Analyzed {len(articles)} ESG-related articles for {context.company_name}. "
                      f"Dominant theme: {key_themes[0]['theme'] if key_themes else 'None'}. "
                      f"Sentiment: {sentiment}.",
            "key_themes": key_themes,
            "sentiment": sentiment,
            "risk_indicators": risk_indicators,
            "total_articles": len(articles),
            "controversy_count": len(controversy_articles)
        }

class ModelInterpretabilityAgent(BaseAgent):
    def __init__(self, model_path: str = "../models/esg_risk_model.pt"):
        super().__init__(
            name="Model Explainer",
            role="explaining ESG risk model predictions with feature importance"
        )
        self.model_path = Path(model_path)
        self.model = None
        self.metadata = None
        self._load_model()
    
    def _load_model(self):
        try:
            if self.model_path.exists():
                checkpoint = torch.load(self.model_path, map_location='cpu')
                self.metadata = checkpoint
                
                arch = checkpoint.get('model_architecture', {})
                self.model = ESGRiskClassifier(
                    input_dim=arch.get('input_dim', 31),
                    hidden_dims=arch.get('hidden_dims', [512, 256, 128]),
                    num_classes=arch.get('num_classes', 3),
                    dropout=arch.get('dropout', 0.5)
                )
                self.model.load_state_dict(checkpoint['model_state_dict'])
                self.model.eval()
                
                scaler_path = self.model_path.parent / 'scaler.pkl'
                if scaler_path.exists():
                    self.scaler = joblib.load(scaler_path)
                else:
                    self.scaler = None
                
                self.feature_columns = checkpoint.get('feature_columns', [])
                self.label_mapping_inv = {v: k for k, v in checkpoint.get('label_mapping', {}).items()}
                
                logger.info("Model loaded successfully with inference capability")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            self.model = None
            self.scaler = None
    
    async def process(self, context: AgentContext) -> Dict[str, Any]:
        company_data = context.company_data
        
        if self.model and self.scaler and self.feature_columns:
            risk_level, confidence, probabilities = self._run_inference(company_data)
        else:
            prediction = context.model_prediction
            risk_level = prediction.get("predicted_class", "Unknown")
            confidence = prediction.get("confidence", 0.0)
            probabilities = None
        
        feature_importance = self._analyze_features(company_data)
        
        explanation = self._generate_explanation(
            risk_level, 
            confidence, 
            feature_importance,
            context.company_name,
            probabilities
        )
        
        return {
            "agent": self.name,
            "risk_level": risk_level,
            "confidence": f"{confidence:.2%}",
            "probabilities": {self.label_mapping_inv.get(i, f"Class_{i}"): f"{p:.2%}" for i, p in enumerate(probabilities)} if probabilities else None,
            "explanation": explanation,
            "key_factors": feature_importance[:5],
            "model_accuracy": f"{self.metadata.get('test_accuracy', 0):.2%}" if self.metadata else "N/A"
        }
    
    def _run_inference(self, company_data: Dict) -> tuple:
        try:
            feature_values = []
            for col in self.feature_columns:
                val = company_data.get(col, 0)
                feature_values.append(float(val) if val is not None else 0.0)
            
            feature_array = np.array([feature_values])
            feature_scaled = self.scaler.transform(feature_array)
            
            with torch.no_grad():
                tensor = torch.FloatTensor(feature_scaled)
                outputs = self.model(tensor)
                probabilities = torch.softmax(outputs, dim=1)
                predicted_class = torch.argmax(probabilities, dim=1).item()
                confidence = probabilities[0][predicted_class].item()
            
            risk_level = self.label_mapping_inv.get(predicted_class, "Unknown")
            return risk_level, confidence, probabilities[0].numpy()
        except Exception as e:
            logger.error(f"Inference error: {str(e)}")
            return "Unknown", 0.0, None
    
    def _analyze_features(self, company_data: Dict) -> List[Dict]:
        features = []
        
        if "Total ESG Risk score" in company_data:
            score = company_data["Total ESG Risk score"]
            features.append({
                "feature": "Total ESG Risk",
                "value": score,
                "impact": "High" if score > 30 else "Medium" if score > 20 else "Low"
            })
        
        if "Environment Risk Score" in company_data:
            features.append({
                "feature": "Environmental Risk",
                "value": company_data["Environment Risk Score"],
                "impact": "High" if company_data["Environment Risk Score"] > 10 else "Medium"
            })
        
        if "Controversy Score" in company_data:
            features.append({
                "feature": "Controversy Level",
                "value": company_data["Controversy Score"],
                "impact": "High" if company_data["Controversy Score"] > 3 else "Low"
            })
        
        return features
    
    def _generate_explanation(self, risk_level: str, confidence: float, features: List[Dict], company: str, probabilities=None) -> str:
        explanation = f"The model predicts {company} has '{risk_level}' ESG risk with {confidence:.1%} confidence. "
        
        if features:
            top_feature = features[0]
            explanation += f"Primary factor: {top_feature['feature']} ({top_feature['impact']} impact). "
        
        if confidence > 0.8:
            explanation += "High confidence in this prediction based on historical patterns."
        elif confidence < 0.6:
            explanation += "Lower confidence suggests borderline classification or limited data."
        
        return explanation

class DiscussionOrchestrator(BaseAgent):
    def __init__(self):
        super().__init__(
            name="ESG Insight Orchestrator",
            role="synthesizing news analysis and model predictions into actionable insights"
        )
    
    async def process(self, context: AgentContext) -> Dict[str, Any]:
        company = context.company_name
        news_analysis = context.conversation_history[-2] if len(context.conversation_history) >= 2 else {}
        model_analysis = context.conversation_history[-1] if context.conversation_history else {}
        
        news_sentiment = news_analysis.get("sentiment", "neutral")
        model_risk = model_analysis.get("risk_level", "Unknown")
        risk_indicators = news_analysis.get("risk_indicators", [])
        
        alignment = self._check_alignment(news_sentiment, model_risk)
        
        if groq_service.is_available():
            return await self._groq_synthesis(context, news_analysis, model_analysis, alignment)
        else:
            return self._fallback_synthesis(context, news_analysis, model_analysis, alignment)
    
    async def _groq_synthesis(
        self,
        context: AgentContext,
        news_analysis: Dict,
        model_analysis: Dict,
        alignment: str
    ) -> Dict[str, Any]:
        """Use Groq LLM for intelligent synthesis"""
        model_prediction = {
            "risk_level": model_analysis.get("risk_level", "Unknown"),
            "confidence": model_analysis.get("confidence", "0%")
        }
        
        groq_result = await groq_service.synthesize_agent_discussion(
            news_analysis=news_analysis,
            model_prediction=model_prediction,
            company_name=context.company_name
        )
        
        recommendations = self._generate_recommendations(
            news_analysis.get("sentiment", "neutral"),
            model_analysis.get("risk_level", "Unknown"),
            news_analysis.get("risk_indicators", []),
            alignment
        )
        
        return {
            "agent": self.name,
            "synthesis": groq_result.get("synthesis", ""),
            "news_model_alignment": alignment,
            "recommendations": recommendations,
            "overall_risk_assessment": self._assess_overall_risk(
                news_analysis.get("sentiment", "neutral"),
                model_analysis.get("risk_level", "Unknown"),
                alignment
            ),
            "powered_by": "Groq LLM (llama-3.1-70b)"
        }
    
    def _fallback_synthesis(
        self,
        context: AgentContext,
        news_analysis: Dict,
        model_analysis: Dict,
        alignment: str
    ) -> Dict[str, Any]:
        """Fallback rule-based synthesis when Groq unavailable"""
        news_sentiment = news_analysis.get("sentiment", "neutral")
        model_risk = model_analysis.get("risk_level", "Unknown")
        risk_indicators = news_analysis.get("risk_indicators", [])
        
        recommendations = self._generate_recommendations(
            news_sentiment,
            model_risk,
            risk_indicators,
            alignment
        )
        
        synthesis = self._synthesize_insights(
            context.company_name,
            news_analysis,
            model_analysis,
            alignment
        )
        
        return {
            "agent": self.name,
            "synthesis": synthesis,
            "news_model_alignment": alignment,
            "recommendations": recommendations,
            "overall_risk_assessment": self._assess_overall_risk(
                news_sentiment,
                model_risk,
                alignment
            ),
            "note": "Using rule-based synthesis (Groq API not configured)"
        }
    
    def _check_alignment(self, news_sentiment: str, model_risk: str) -> str:
        risk_sentiment_map = {
            "Low": "positive",
            "Medium": "mixed",
            "High": "negative"
        }
        
        expected_sentiment = risk_sentiment_map.get(model_risk, "neutral")
        
        if news_sentiment == expected_sentiment:
            return "Strong alignment"
        elif news_sentiment == "mixed":
            return "Partial alignment"
        else:
            return "Divergent signals"
    
    def _generate_recommendations(self, sentiment: str, risk: str, indicators: List[str], alignment: str) -> List[str]:
        recommendations = []
        
        if risk == "High" or sentiment == "negative":
            recommendations.append("Conduct detailed due diligence on recent controversies")
            recommendations.append("Monitor regulatory compliance status")
        
        if alignment == "Divergent signals":
            recommendations.append("Investigate discrepancy between news sentiment and model prediction")
            recommendations.append("Review recent events not captured in training data")
        
        if indicators:
            recommendations.append(f"Address {len(indicators)} identified risk indicators immediately")
        
        if not recommendations:
            recommendations.append("Maintain current ESG monitoring practices")
            recommendations.append("Continue tracking sustainability metrics quarterly")
        
        return recommendations
    
    def _synthesize_insights(self, company: str, news: Dict, model: Dict, alignment: str) -> str:
        synthesis = f"**{company} ESG Analysis Summary:**\n\n"
        synthesis += f"Model Assessment: {model.get('risk_level', 'N/A')} risk ({model.get('confidence', 'N/A')} confidence)\n"
        synthesis += f"News Sentiment: {news.get('sentiment', 'N/A')} based on {news.get('total_articles', 0)} articles\n"
        synthesis += f"News-Model Alignment: {alignment}\n\n"
        
        if news.get('key_themes'):
            synthesis += "Key ESG Themes:\n"
            for theme in news.get('key_themes', [])[:3]:
                synthesis += f"- {theme['theme']}: {theme['count']} mentions\n"
        
        return synthesis
    
    def _assess_overall_risk(self, sentiment: str, model_risk: str, alignment: str) -> str:
        if sentiment == "negative" and model_risk == "High":
            return "Critical: High risk confirmed by both model and news"
        elif sentiment == "negative" or model_risk == "High":
            return "Elevated: Significant risk indicators present"
        elif alignment == "Divergent signals":
            return "Uncertain: Mixed signals require further investigation"
        else:
            return "Moderate: Standard monitoring recommended"

class AgentPipeline:
    def __init__(self):
        self.news_agent = NewsAnalysisAgent()
        self.model_agent = ModelInterpretabilityAgent()
        self.orchestrator = DiscussionOrchestrator()
    
    async def run(
        self,
        company_name: str,
        company_data: Dict,
        news_articles: List[Dict],
        model_prediction: Dict
    ) -> Dict[str, Any]:
        context = AgentContext(
            company_name=company_name,
            company_data=company_data,
            news_articles=news_articles,
            model_prediction=model_prediction,
            conversation_history=[]
        )
        
        news_result = await self.news_agent.process(context)
        context.conversation_history.append(news_result)
        
        model_result = await self.model_agent.process(context)
        context.conversation_history.append(model_result)
        
        final_result = await self.orchestrator.process(context)
        
        return {
            "company": company_name,
            "timestamp": datetime.now().isoformat(),
            "agents": {
                "news_analysis": news_result,
                "model_interpretation": model_result,
                "synthesis": final_result
            },
            "conversation_log": context.conversation_history
        }

agent_pipeline = AgentPipeline()
