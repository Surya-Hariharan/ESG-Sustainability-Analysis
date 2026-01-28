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
        with db_service.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT "Symbol", "Name", "Sector", "Total ESG Risk score",
                       "Environment Risk Score", "Social Risk Score", "Governance Risk Score",
                       "Controversy Score", "ESG Risk Level", "Full Time Employees"
                FROM esg_data
                WHERE "Symbol" = %s
                """,
                (request.symbol,)
            )
            
            row = cursor.fetchone()
            cursor.close()
        
        if not row:
            raise HTTPException(status_code=404, detail=f"Company {request.symbol} not found")
        
        company_data = {
            "Symbol": row[0],
            "Name": row[1],
            "Sector": row[2],
            "Total ESG Risk score": row[3],
            "Environment Risk Score": row[4],
            "Social Risk Score": row[5],
            "Governance Risk Score": row[6],
            "Controversy Score": row[7],
            "ESG Risk Level": row[8],
            "Full Time Employees": row[9]
        }
        
        news_articles = []
        if request.include_news:
            news_articles = await news_service.fetch_company_news(
                company_name=company_data["Name"],
                days_back=request.days_back
            )
        
        model_prediction = {
            "predicted_class": company_data.get("ESG Risk Level", "Unknown"),
            "features_used": ["Environment Risk", "Social Risk", "Governance Risk", "Controversy Score"]
        }
        
        analysis = await agent_pipeline.run(
            company_name=company_data["Name"],
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
        with db_service.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT "Name" FROM esg_data WHERE "Symbol" = %s', (symbol,))
            row = cursor.fetchone()
            cursor.close()
        
        if not row:
            raise HTTPException(status_code=404, detail=f"Company {symbol} not found")
        
        company_name = row[0]
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
