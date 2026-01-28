import pytest
import asyncio
from backend.services.news_service import NewsService
from backend.services.agent_service import AgentPipeline, AgentContext
import os

@pytest.mark.asyncio
async def test_news_service_rate_limiting():
    service = NewsService()
    
    if not service.news_api_key:
        pytest.skip("NEWS_API_KEY not configured")
    
    articles = await service.fetch_company_news("Apple Inc.", days_back=7)
    assert isinstance(articles, list)
    
    signals = service.extract_esg_signals(articles)
    assert "total_articles" in signals
    assert "dominant_theme" in signals

@pytest.mark.asyncio
async def test_agent_pipeline():
    pipeline = AgentPipeline()
    
    company_data = {
        "Name": "Test Company",
        "Total ESG Risk score": 25.5,
        "Environment Risk Score": 8.2,
        "Social Risk Score": 10.3,
        "Governance Risk Score": 7.0,
        "Controversy Score": 2.5,
        "ESG Risk Level": "Medium"
    }
    
    news_articles = [
        {"title": "Test renewable energy", "description": "Company invests in solar", "source": "Test"}
    ]
    
    model_prediction = {
        "predicted_class": "Medium"
    }
    
    result = await pipeline.run(
        company_name="Test Company",
        company_data=company_data,
        news_articles=news_articles,
        model_prediction=model_prediction
    )
    
    assert "agents" in result
    assert "news_analysis" in result["agents"]
    assert "model_interpretation" in result["agents"]
    assert "synthesis" in result["agents"]

def test_model_loading():
    from backend.services.agent_service import ModelInterpretabilityAgent
    agent = ModelInterpretabilityAgent()
    
    if agent.model:
        assert agent.scaler is not None
        assert len(agent.feature_columns) > 0
        print(f"✅ Model loaded: {len(agent.feature_columns)} features")
    else:
        print("⚠️  Model not found - train model first (notebook 03)")

if __name__ == "__main__":
    asyncio.run(test_news_service_rate_limiting())
    asyncio.run(test_agent_pipeline())
    test_model_loading()
    print("✅ All tests passed")
