from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging

from backend.services.news_service import news_service
from backend.services.agent_service import agent_pipeline
from backend.services.database import db_service

router = APIRouter(prefix="/api/agents", tags=["agents"])
logger = logging.getLogger(__name__)

class CompanyAnalysisRequest(BaseModel):
    symbol: str
    days_back: Optional[int] = 30
    include_news: Optional[bool] = True
    include_prediction: Optional[bool] = True

class ChatRequest(BaseModel):
    company: str
    message: str
    context: Optional[Dict[str, Any]] = None

@router.post("/analyze-company")
async def analyze_company(request: CompanyAnalysisRequest):
    try:
        # Use the db_service method for consistent table/column names
        company = db_service.get_company_by_symbol(request.symbol)
        
        if not company:
            raise HTTPException(status_code=404, detail=f"Company {request.symbol} not found")
        
        # Format company data for agent pipeline
        company_data = {
            "symbol": company.get("symbol"),
            "name": company.get("name"),
            "sector": company.get("sector"),
            "industry": company.get("industry"),
            "total_esg_risk_score": company.get("total_esg_risk_score"),
            "environment_risk_score": company.get("environment_risk_score"),
            "social_risk_score": company.get("social_risk_score"),
            "governance_risk_score": company.get("governance_risk_score"),
            "controversy_score": company.get("controversy_score"),
            "controversy_level": company.get("controversy_level"),
            "esg_risk_level": company.get("esg_risk_level"),
        }
        
        news_articles = []
        if request.include_news:
            news_articles = await news_service.fetch_company_news(
                company_name=company_data["name"],
                days_back=request.days_back
            )
        
        model_prediction = {
            "predicted_class": company_data.get("esg_risk_level", "Unknown"),
            "features_used": ["Environment Risk", "Social Risk", "Governance Risk", "Controversy Score"]
        }
        
        analysis = await agent_pipeline.run(
            company_name=company_data["name"],
            company_data=company_data,
            news_articles=news_articles,
            model_prediction=model_prediction
        )
        
        return {
            "success": True,
            "company": company_data,
            "news_count": len(news_articles),
            "analysis": analysis
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in analyze_company: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/company-news/{symbol}")
async def get_company_news(symbol: str, days: int = 30):
    try:
        # Use db_service for consistent queries
        company = db_service.get_company_by_symbol(symbol)
        
        if not company:
            raise HTTPException(status_code=404, detail=f"Company {symbol} not found")
        
        company_name = company.get("name")
        articles = await news_service.fetch_company_news(company_name, days_back=days)
        signals = news_service.extract_esg_signals(articles)
        
        return {
            "company": company_name,
            "symbol": symbol,
            "articles": articles,
            "signals": signals
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching news: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sector-insights/{sector}")
async def get_sector_insights(sector: str, days: int = 7):
    try:
        articles = await news_service.fetch_sector_news(sector, days_back=days)
        signals = news_service.extract_esg_signals(articles)
        
        return {
            "sector": sector,
            "news_summary": signals,
            "recent_articles": articles[:5]
        }
        
    except Exception as e:
        logger.error(f"Error fetching sector insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def chat_with_agents(request: ChatRequest):
    return {
        "message": "Chat functionality coming soon",
        "company": request.company,
        "response": "This endpoint will enable conversational analysis of ESG data with AI agents."
    }
