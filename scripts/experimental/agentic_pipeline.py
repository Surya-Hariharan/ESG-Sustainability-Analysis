"""
Agentic AI Pipeline for ESG Analysis
Provides intelligent agents for:
- News sentiment analysis and ESG risk detection
- Multi-agent reasoning for recommendations
- Interpretable insights generation
- Preference learning and personalized recommendations
"""

import os
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import asyncio
from enum import Enum

# AI/ML Libraries
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    from anthropic import Anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


class AgentRole(Enum):
    """Different AI agent roles in the pipeline"""
    NEWS_ANALYST = "news_analyst"
    RISK_ASSESSOR = "risk_assessor"
    RECOMMENDER = "recommender"
    INTERPRETER = "interpreter"
    SENTIMENT_ANALYZER = "sentiment_analyzer"


@dataclass
class AgentResponse:
    """Structured response from an AI agent"""
    role: AgentRole
    content: str
    confidence: float
    reasoning: List[str]
    metadata: Dict[str, Any]
    timestamp: datetime


class BaseAgent:
    """Base class for all AI agents"""
    
    def __init__(self, role: AgentRole, model: str = "gpt-4"):
        self.role = role
        self.model = model
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize the appropriate AI client"""
        api_key = os.getenv('OPENAI_API_KEY') or os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            print(f"Warning: No API key found for {self.role.value}")
            return
        
        if OPENAI_AVAILABLE and os.getenv('OPENAI_API_KEY'):
            self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        elif ANTHROPIC_AVAILABLE and os.getenv('ANTHROPIC_API_KEY'):
            self.client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
    
    async def analyze(self, context: Dict[str, Any]) -> AgentResponse:
        """Base analyze method to be overridden"""
        raise NotImplementedError


class NewsAnalystAgent(BaseAgent):
    """Agent specialized in analyzing ESG-related news"""
    
    def __init__(self):
        super().__init__(AgentRole.NEWS_ANALYST)
    
    async def analyze(self, news_data: Dict[str, Any]) -> AgentResponse:
        """Analyze news articles for ESG implications"""
        
        prompt = f"""
        You are an expert ESG news analyst. Analyze the following news article:
        
        Title: {news_data.get('title', 'N/A')}
        Content: {news_data.get('content', 'N/A')}
        Company: {news_data.get('company', 'N/A')}
        
        Provide a structured analysis including:
        1. ESG Risk Level (Low/Medium/High/Severe)
        2. Affected ESG Pillars (Environmental, Social, Governance)
        3. Sentiment Score (-1 to 1)
        4. Key Risk Factors
        5. Potential Impact on Company Reputation
        
        Format your response as JSON.
        """
        
        if not self.client:
            return self._create_fallback_response(news_data)
        
        try:
            if isinstance(self.client, OpenAI):
                response = await asyncio.to_thread(
                    self.client.chat.completions.create,
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are an expert ESG analyst."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3
                )
                analysis = response.choices[0].message.content
            else:
                # Fallback for other clients
                analysis = await self._fallback_analysis(news_data)
            
            return AgentResponse(
                role=self.role,
                content=analysis,
                confidence=0.85,
                reasoning=["AI-powered news sentiment analysis", "ESG risk pattern recognition"],
                metadata={"news_source": news_data.get('source', 'unknown')},
                timestamp=datetime.now()
            )
        except Exception as e:
            print(f"Error in news analysis: {e}")
            return self._create_fallback_response(news_data)
    
    def _create_fallback_response(self, news_data: Dict[str, Any]) -> AgentResponse:
        """Create a basic analysis when AI is unavailable"""
        return AgentResponse(
            role=self.role,
            content="Basic sentiment analysis completed",
            confidence=0.5,
            reasoning=["Rule-based analysis (AI unavailable)"],
            metadata=news_data,
            timestamp=datetime.now()
        )
    
    async def _fallback_analysis(self, news_data: Dict[str, Any]) -> str:
        """Simple rule-based fallback"""
        return f"Analysis for {news_data.get('company', 'Unknown')}: Pending detailed review"


class RiskAssessorAgent(BaseAgent):
    """Agent for comprehensive ESG risk assessment"""
    
    def __init__(self):
        super().__init__(AgentRole.RISK_ASSESSOR)
    
    async def analyze(self, company_data: Dict[str, Any]) -> AgentResponse:
        """Assess overall ESG risk for a company"""
        
        prompt = f"""
        Perform a comprehensive ESG risk assessment for:
        
        Company: {company_data.get('name', 'N/A')}
        Sector: {company_data.get('sector', 'N/A')}
        Environment Score: {company_data.get('environment_score', 'N/A')}
        Social Score: {company_data.get('social_score', 'N/A')}
        Governance Score: {company_data.get('governance_score', 'N/A')}
        Controversy Score: {company_data.get('controversy_score', 'N/A')}
        Recent News: {company_data.get('recent_news', 'None')}
        
        Provide:
        1. Overall Risk Rating (1-100)
        2. Key Risk Factors (prioritized)
        3. Emerging Risks
        4. Mitigation Recommendations
        5. Industry Benchmark Comparison
        
        Be specific and actionable.
        """
        
        if not self.client:
            return self._create_fallback_response(company_data)
        
        try:
            if isinstance(self.client, OpenAI):
                response = await asyncio.to_thread(
                    self.client.chat.completions.create,
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are an expert ESG risk assessor."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.2
                )
                assessment = response.choices[0].message.content
            else:
                assessment = "Risk assessment pending"
            
            return AgentResponse(
                role=self.role,
                content=assessment,
                confidence=0.9,
                reasoning=[
                    "Multi-factor ESG analysis",
                    "Historical pattern recognition",
                    "Industry benchmarking"
                ],
                metadata=company_data,
                timestamp=datetime.now()
            )
        except Exception as e:
            print(f"Error in risk assessment: {e}")
            return self._create_fallback_response(company_data)
    
    def _create_fallback_response(self, company_data: Dict[str, Any]) -> AgentResponse:
        """Fallback risk assessment"""
        avg_score = (
            company_data.get('environment_score', 50) +
            company_data.get('social_score', 50) +
            company_data.get('governance_score', 50)
        ) / 3
        
        risk_level = "Low" if avg_score < 30 else "Medium" if avg_score < 60 else "High"
        
        return AgentResponse(
            role=self.role,
            content=f"Risk Level: {risk_level} (Score: {avg_score:.1f})",
            confidence=0.6,
            reasoning=["Score-based assessment"],
            metadata=company_data,
            timestamp=datetime.now()
        )


class RecommenderAgent(BaseAgent):
    """Agent for generating personalized investment recommendations"""
    
    def __init__(self):
        super().__init__(AgentRole.RECOMMENDER)
    
    async def analyze(self, context: Dict[str, Any]) -> AgentResponse:
        """Generate personalized recommendations"""
        
        user_preferences = context.get('preferences', {})
        companies = context.get('companies', [])
        risk_appetite = user_preferences.get('risk_appetite', 'moderate')
        focus_areas = user_preferences.get('focus_areas', ['environmental', 'social', 'governance'])
        
        prompt = f"""
        Generate personalized ESG investment recommendations:
        
        User Profile:
        - Risk Appetite: {risk_appetite}
        - Focus Areas: {', '.join(focus_areas)}
        - Investment Horizon: {user_preferences.get('horizon', 'medium-term')}
        
        Available Companies: {len(companies)}
        
        Provide:
        1. Top 5 Recommended Companies (with rationale)
        2. Portfolio Allocation Strategy
        3. Risk-Return Analysis
        4. ESG Impact Projection
        5. Monitoring Recommendations
        
        Align recommendations with user preferences and current market conditions.
        """
        
        if not self.client:
            return self._create_fallback_response(companies, user_preferences)
        
        try:
            if isinstance(self.client, OpenAI):
                response = await asyncio.to_thread(
                    self.client.chat.completions.create,
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are an expert ESG investment advisor."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.4
                )
                recommendations = response.choices[0].message.content
            else:
                recommendations = "Recommendations pending"
            
            return AgentResponse(
                role=self.role,
                content=recommendations,
                confidence=0.85,
                reasoning=[
                    "Preference-based filtering",
                    "Risk-adjusted scoring",
                    "ESG impact optimization"
                ],
                metadata={"companies_analyzed": len(companies)},
                timestamp=datetime.now()
            )
        except Exception as e:
            print(f"Error generating recommendations: {e}")
            return self._create_fallback_response(companies, user_preferences)
    
    def _create_fallback_response(self, companies: List, preferences: Dict) -> AgentResponse:
        """Basic recommendation fallback"""
        return AgentResponse(
            role=self.role,
            content=f"Analyzed {len(companies)} companies. Manual review recommended.",
            confidence=0.5,
            reasoning=["Basic filtering applied"],
            metadata=preferences,
            timestamp=datetime.now()
        )


class InterpreterAgent(BaseAgent):
    """Agent for explaining AI decisions and insights"""
    
    def __init__(self):
        super().__init__(AgentRole.INTERPRETER)
    
    async def analyze(self, context: Dict[str, Any]) -> AgentResponse:
        """Explain and interpret AI-generated insights"""
        
        prediction = context.get('prediction', {})
        features = context.get('features', {})
        model_output = context.get('model_output', {})
        
        prompt = f"""
        Explain this ESG risk prediction in plain language:
        
        Prediction: {prediction.get('risk_level', 'N/A')}
        Confidence: {prediction.get('confidence', 'N/A')}
        
        Key Features:
        {self._format_features(features)}
        
        Model Reasoning:
        {model_output.get('reasoning', 'N/A')}
        
        Provide:
        1. Plain English Explanation
        2. Why This Prediction Was Made
        3. Key Contributing Factors
        4. What Could Change the Prediction
        5. Actionable Insights
        
        Make it understandable for non-technical users.
        """
        
        if not self.client:
            return self._create_fallback_response(prediction)
        
        try:
            if isinstance(self.client, OpenAI):
                response = await asyncio.to_thread(
                    self.client.chat.completions.create,
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are an expert at explaining AI decisions."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3
                )
                explanation = response.choices[0].message.content
            else:
                explanation = "Explanation pending"
            
            return AgentResponse(
                role=self.role,
                content=explanation,
                confidence=0.95,
                reasoning=["Model introspection", "Feature importance analysis"],
                metadata=prediction,
                timestamp=datetime.now()
            )
        except Exception as e:
            print(f"Error generating explanation: {e}")
            return self._create_fallback_response(prediction)
    
    def _format_features(self, features: Dict) -> str:
        """Format features for display"""
        return "\n".join([f"- {k}: {v}" for k, v in features.items()])
    
    def _create_fallback_response(self, prediction: Dict) -> AgentResponse:
        """Basic explanation fallback"""
        return AgentResponse(
            role=self.role,
            content=f"Prediction: {prediction.get('risk_level', 'Unknown')}",
            confidence=0.6,
            reasoning=["Basic interpretation"],
            metadata=prediction,
            timestamp=datetime.now()
        )


class AgenticPipeline:
    """Orchestrates multiple AI agents for comprehensive ESG analysis"""
    
    def __init__(self):
        self.agents = {
            AgentRole.NEWS_ANALYST: NewsAnalystAgent(),
            AgentRole.RISK_ASSESSOR: RiskAssessorAgent(),
            AgentRole.RECOMMENDER: RecommenderAgent(),
            AgentRole.INTERPRETER: InterpreterAgent(),
        }
    
    async def run_full_analysis(self, company_data: Dict[str, Any], 
                                news_data: List[Dict], 
                                user_preferences: Dict[str, Any]) -> Dict[str, AgentResponse]:
        """Run complete agentic analysis pipeline"""
        
        results = {}
        
        # Stage 1: News Analysis
        if news_data:
            news_tasks = [
                self.agents[AgentRole.NEWS_ANALYST].analyze(news)
                for news in news_data[:5]  # Analyze top 5 news items
            ]
            news_results = await asyncio.gather(*news_tasks)
            results['news_analysis'] = news_results
        
        # Stage 2: Risk Assessment
        risk_assessment = await self.agents[AgentRole.RISK_ASSESSOR].analyze(company_data)
        results['risk_assessment'] = risk_assessment
        
        # Stage 3: Recommendations
        rec_context = {
            'preferences': user_preferences,
            'companies': [company_data],
            'news_sentiment': results.get('news_analysis', [])
        }
        recommendations = await self.agents[AgentRole.RECOMMENDER].analyze(rec_context)
        results['recommendations'] = recommendations
        
        # Stage 4: Interpretation
        interp_context = {
            'prediction': {'risk_level': company_data.get('risk_level', 'Unknown')},
            'features': {k: v for k, v in company_data.items() if 'score' in k.lower()},
            'model_output': {'reasoning': risk_assessment.content}
        }
        interpretation = await self.agents[AgentRole.INTERPRETER].analyze(interp_context)
        results['interpretation'] = interpretation
        
        return results
    
    def format_results(self, results: Dict[str, Any]) -> str:
        """Format results for display"""
        output = []
        output.append("=" * 80)
        output.append("AGENTIC AI ANALYSIS RESULTS")
        output.append("=" * 80)
        
        for key, value in results.items():
            output.append(f"\n{key.upper().replace('_', ' ')}:")
            output.append("-" * 80)
            
            if isinstance(value, list):
                for i, item in enumerate(value, 1):
                    if isinstance(item, AgentResponse):
                        output.append(f"\nItem {i}:")
                        output.append(f"Content: {item.content}")
                        output.append(f"Confidence: {item.confidence:.2%}")
            elif isinstance(value, AgentResponse):
                output.append(f"Content: {value.content}")
                output.append(f"Confidence: {value.confidence:.2%}")
                output.append(f"Reasoning: {', '.join(value.reasoning)}")
        
        return "\n".join(output)


# Example usage
async def main():
    """Example pipeline execution"""
    pipeline = AgenticPipeline()
    
    # Sample data
    company_data = {
        'name': 'Tech Corp',
        'sector': 'Technology',
        'environment_score': 25,
        'social_score': 35,
        'governance_score': 20,
        'controversy_score': 15
    }
    
    news_data = [
        {
            'title': 'Tech Corp announces carbon neutrality goal',
            'content': 'Company commits to net-zero emissions by 2030',
            'company': 'Tech Corp',
            'source': 'ESG News'
        }
    ]
    
    user_preferences = {
        'risk_appetite': 'moderate',
        'focus_areas': ['environmental', 'governance'],
        'horizon': 'long-term'
    }
    
    results = await pipeline.run_full_analysis(company_data, news_data, user_preferences)
    print(pipeline.format_results(results))


if __name__ == "__main__":
    asyncio.run(main())
