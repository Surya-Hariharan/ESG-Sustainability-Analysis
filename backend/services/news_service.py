import os
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import httpx
from functools import lru_cache
import logging
import time

logger = logging.getLogger(__name__)

class NewsService:
    def __init__(self):
        self.news_api_key = os.getenv("NEWS_API_KEY")
        self.base_url = "https://newsapi.org/v2"
        self.timeout = 10.0
        self.cache_ttl = 3600
        self.last_request_time = 0
        self.min_request_interval = 1.0
        self.max_retries = 3
        
    async def fetch_company_news(
        self, 
        company_name: str, 
        days_back: int = 30,
        esg_keywords: Optional[List[str]] = None
    ) -> List[Dict]:
        if not self.news_api_key:
            logger.warning("NEWS_API_KEY not configured")
            return []
        
        esg_terms = esg_keywords or [
            "ESG", "sustainability", "environmental", "carbon", "emissions",
            "governance", "social responsibility", "climate", "renewable"
        ]
        
        query = f'"{company_name}" AND ({" OR ".join(esg_terms)})'
        from_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")
        
        params = {
            "q": query,
            "from": from_date,
            "sortBy": "relevancy",
            "language": "en",
            "apiKey": self.news_api_key,
            "pageSize": 20
        }
        
        for attempt in range(self.max_retries):
            try:
                await self._rate_limit()
                
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.get(f"{self.base_url}/everything", params=params)
                    
                    if response.status_code == 429:
                        wait_time = 2 ** attempt
                        logger.warning(f"Rate limited, waiting {wait_time}s")
                        await asyncio.sleep(wait_time)
                        continue
                    
                    response.raise_for_status()
                    data = response.json()
                    
                    if data.get("status") != "ok":
                        logger.error(f"NewsAPI error: {data.get('message')}")
                        return []
                    
                    articles = data.get("articles", [])
                    return [
                        {
                            "title": article.get("title"),
                            "description": article.get("description"),
                            "url": article.get("url"),
                            "source": article.get("source", {}).get("name"),
                            "published_at": article.get("publishedAt"),
                            "sentiment_score": None
                        }
                        for article in articles
                        if article.get("title") and article.get("description")
                    ]
            except httpx.TimeoutException:
                logger.warning(f"Timeout on attempt {attempt + 1}/{self.max_retries}")
                if attempt == self.max_retries - 1:
                    return []
                await asyncio.sleep(2 ** attempt)
            except Exception as e:
                logger.error(f"Error fetching news for {company_name}: {str(e)}")
                if attempt == self.max_retries - 1:
                    return []
                await asyncio.sleep(1)
        return []
    
    async def _rate_limit(self):
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.min_request_interval:
            await asyncio.sleep(self.min_request_interval - time_since_last)
        self.last_request_time = time.time()
    
    async def fetch_sector_news(self, sector: str, days_back: int = 7) -> List[Dict]:
        esg_keywords = ["ESG", "sustainability", "environmental impact"]
        query = f'"{sector}" AND ({" OR ".join(esg_keywords)})'
        from_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")
        
        params = {
            "q": query,
            "from": from_date,
            "sortBy": "publishedAt",
            "language": "en",
            "apiKey": self.news_api_key,
            "pageSize": 10
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/everything", params=params)
                response.raise_for_status()
                data = response.json()
                return data.get("articles", [])[:10]
        except Exception as e:
            logger.error(f"Error fetching sector news: {str(e)}")
            return []
    
    def extract_esg_signals(self, articles: List[Dict]) -> Dict[str, any]:
        if not articles:
            return {"sentiment": "neutral", "topic_count": 0, "recent_events": []}
        
        environmental_keywords = ["carbon", "emissions", "climate", "renewable", "pollution"]
        social_keywords = ["diversity", "labor", "community", "safety", "human rights"]
        governance_keywords = ["board", "ethics", "compliance", "transparency", "corruption"]
        
        env_count = sum(
            1 for article in articles 
            if any(kw in (article.get("description") or "").lower() for kw in environmental_keywords)
        )
        social_count = sum(
            1 for article in articles 
            if any(kw in (article.get("description") or "").lower() for kw in social_keywords)
        )
        gov_count = sum(
            1 for article in articles 
            if any(kw in (article.get("description") or "").lower() for kw in governance_keywords)
        )
        
        return {
            "total_articles": len(articles),
            "environmental_mentions": env_count,
            "social_mentions": social_count,
            "governance_mentions": gov_count,
            "dominant_theme": max(
                [("environmental", env_count), ("social", social_count), ("governance", gov_count)],
                key=lambda x: x[1]
            )[0] if articles else "none",
            "recent_headlines": [a.get("title") for a in articles[:5]]
        }

news_service = NewsService()
