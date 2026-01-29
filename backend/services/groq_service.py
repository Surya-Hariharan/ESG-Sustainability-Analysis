"""
Groq LLM Service for ESG Analysis
Uses Groq's fast inference API for AI-powered analysis
"""
import os
import logging
from typing import Dict, List, Optional
import httpx
from ..core.config import settings

logger = logging.getLogger(__name__)


class GroqService:
    """Service for interacting with Groq API for LLM-powered ESG analysis"""
    
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.base_url = "https://api.groq.com/openai/v1"
        self.model = "llama-3.3-70b-versatile"  # Latest stable model
        self.timeout = 30.0

        
        if not self.api_key or self.api_key == "your_groq_api_key_here":
            logger.warning(
                "⚠️  GROQ_API_KEY not configured! "
                "Get your key from https://console.groq.com/keys and add to .env"
            )
    
    def is_available(self) -> bool:
        """Check if Groq API is configured and available"""
        return bool(self.api_key and self.api_key != "your_groq_api_key_here")
    
    async def analyze_esg_news(
        self,
        company_name: str,
        news_articles: List[Dict],
        company_data: Optional[Dict] = None
    ) -> Dict:
        """
        Analyze ESG news articles using Groq LLM
        
        Args:
            company_name: Company name
            news_articles: List of news articles
            company_data: Optional company ESG data
            
        Returns:
            Dict with analysis results
        """
        if not self.is_available():
            return {
                "error": "Groq API not configured",
                "message": "Please set GROQ_API_KEY in .env file"
            }
        
        if not news_articles:
            return {
                "summary": f"No recent news available for {company_name}",
                "themes": [],
                "sentiment": "neutral"
            }
        
        # Prepare context
        news_context = "\n".join([
            f"- {article.get('title', '')}: {article.get('description', '')}"
            for article in news_articles[:10]  # Limit to top 10
        ])
        
        company_context = ""
        if company_data:
            company_context = f"""
Company ESG Scores:
- Total ESG Risk: {company_data.get('total_esg_risk_score', 'N/A')}
- Environment: {company_data.get('environment_risk_score', 'N/A')}
- Social: {company_data.get('social_risk_score', 'N/A')}
- Governance: {company_data.get('governance_risk_score', 'N/A')}
- Controversy Score: {company_data.get('controversy_score', 'N/A')}
"""
        
        prompt = f"""Analyze the following ESG-related news for {company_name}.

{company_context}

Recent News:
{news_context}

Provide a concise analysis including:
1. Key ESG themes (Environmental, Social, Governance)
2. Overall sentiment (positive/negative/mixed)
3. Notable risks or opportunities
4. Recommendation summary

Be specific and factual. Focus on ESG implications."""

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are an expert ESG analyst providing concise, factual analysis."
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.3,
                        "max_tokens": 500
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    analysis_text = result["choices"][0]["message"]["content"]
                    
                    return {
                        "company": company_name,
                        "analysis": analysis_text,
                        "model": self.model,
                        "timestamp": httpx.get("https://worldtimeapi.org/api/timezone/Etc/UTC").json()["datetime"]
                    }
                else:
                    logger.error(f"Groq API error: {response.status_code} - {response.text}")
                    return {
                        "error": f"API request failed: {response.status_code}",
                        "message": response.text
                    }
                    
        except httpx.TimeoutException:
            logger.error("Groq API timeout")
            return {
                "error": "Request timeout",
                "message": "Groq API took too long to respond"
            }
        except Exception as e:
            logger.error(f"Groq API error: {str(e)}")
            return {
                "error": "Analysis failed",
                "message": str(e)
            }
    
    async def synthesize_agent_discussion(
        self,
        news_analysis: Dict,
        model_prediction: Dict,
        company_name: str
    ) -> Dict:
        """
        Synthesize multi-agent analysis into coherent recommendations
        
        Args:
            news_analysis: Results from news analysis agent
            model_prediction: Results from model prediction agent
            company_name: Company name
            
        Returns:
            Synthesized analysis and recommendations
        """
        if not self.is_available():
            return self._fallback_synthesis(news_analysis, model_prediction, company_name)
        
        context = f"""
Company: {company_name}

News Analysis:
{news_analysis.get('summary', 'No news analysis available')}

Model Prediction:
- Risk Level: {model_prediction.get('risk_level', 'Unknown')}
- Confidence: {model_prediction.get('confidence', 0):.2%}

Synthesize these insights and provide:
1. Overall ESG risk assessment
2. Key action items for stakeholders
3. Areas of concern or opportunity
"""
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are synthesizing multi-agent ESG analysis into actionable recommendations."
                            },
                            {
                                "role": "user",
                                "content": context
                            }
                        ],
                        "temperature": 0.4,
                        "max_tokens": 400
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    synthesis = result["choices"][0]["message"]["content"]
                    
                    return {
                        "company": company_name,
                        "synthesis": synthesis,
                        "news_summary": news_analysis.get('summary'),
                        "predicted_risk": model_prediction.get('risk_level'),
                        "confidence": model_prediction.get('confidence'),
                        "model": self.model
                    }
                else:
                    return self._fallback_synthesis(news_analysis, model_prediction, company_name)
                    
        except Exception as e:
            logger.error(f"Synthesis error: {str(e)}")
            return self._fallback_synthesis(news_analysis, model_prediction, company_name)
    
    def _fallback_synthesis(self, news_analysis: Dict, model_prediction: Dict, company_name: str) -> Dict:
        """Fallback synthesis when Groq API is unavailable"""
        risk_level = model_prediction.get('risk_level', 'Unknown')
        confidence = model_prediction.get('confidence', 0)
        
        synthesis = f"""
**{company_name} ESG Risk Assessment**

Model Prediction: {risk_level} risk (confidence: {confidence:.1%})

News Insights: {news_analysis.get('summary', 'No recent news available')}

Recommendation: {'Monitor closely due to elevated risk' if risk_level == 'High' else 'Continue regular monitoring'}
"""
        
        return {
            "company": company_name,
            "synthesis": synthesis,
            "news_summary": news_analysis.get('summary'),
            "predicted_risk": risk_level,
            "confidence": confidence,
            "note": "Using fallback synthesis (Groq API not configured)"
        }
    
    async def chat(
        self,
        message: str,
        company_data: Optional[Dict] = None,
        chat_history: Optional[List[Dict]] = None
    ) -> Dict:
        """
        Conversational chat interface for ESG queries
        
        Args:
            message: User's message
            company_data: Optional company ESG data for context
            chat_history: Optional previous conversation history
            
        Returns:
            Dict with response and metadata
        """
        if not self.is_available():
            return {
                "response": "I'm sorry, the AI service is not configured. Please set up your GROQ_API_KEY in the .env file to enable chat functionality.",
                "error": True
            }
        
        # Build system prompt
        system_prompt = """You are an expert ESG (Environmental, Social, Governance) analyst assistant. 
You help users understand ESG risks, sustainability metrics, and corporate responsibility.

Your capabilities:
- Explain ESG concepts and metrics
- Analyze company sustainability performance
- Discuss ESG risks and opportunities
- Provide insights on sectors and industries
- Answer questions about environmental, social, and governance factors

Be concise, factual, and helpful. If asked about specific company data, use the provided context.
Format your responses with clear structure when appropriate."""

        # Build messages
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add chat history if provided
        if chat_history:
            for msg in chat_history[-6:]:  # Keep last 6 messages for context
                messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", "")
                })
        
        # Build user message with context
        user_content = message
        if company_data:
            context = f"""
[Company Context]
Symbol: {company_data.get('symbol', 'N/A')}
Name: {company_data.get('name', 'N/A')}
Sector: {company_data.get('sector', 'N/A')}
ESG Risk Score: {company_data.get('total_esg_risk_score', 'N/A')}
Environment Risk: {company_data.get('environment_risk_score', 'N/A')}
Social Risk: {company_data.get('social_risk_score', 'N/A')}
Governance Risk: {company_data.get('governance_risk_score', 'N/A')}
Controversy Score: {company_data.get('controversy_score', 'N/A')}

User Question: {message}"""
            user_content = context
        
        messages.append({"role": "user", "content": user_content})
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": messages,
                        "temperature": 0.7,
                        "max_tokens": 800
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    ai_response = result["choices"][0]["message"]["content"]
                    
                    return {
                        "response": ai_response,
                        "model": self.model,
                        "error": False
                    }
                else:
                    logger.error(f"Groq chat error: {response.status_code} - {response.text}")
                    return {
                        "response": f"I encountered an error processing your request. Please try again.",
                        "error": True
                    }
                    
        except httpx.TimeoutException:
            return {
                "response": "The request timed out. Please try again.",
                "error": True
            }
        except Exception as e:
            logger.error(f"Chat error: {str(e)}")
            return {
                "response": f"An error occurred: {str(e)}",
                "error": True
            }


groq_service = GroqService()

