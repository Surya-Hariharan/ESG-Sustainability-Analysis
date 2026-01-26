"""
News API Integration for ESG Insights
Fetches and analyzes ESG-related news from multiple sources
"""

import os
import asyncio
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass
import aiohttp
import json

@dataclass
class NewsArticle:
    """Structured news article data"""
    title: str
    description: str
    content: str
    url: str
    source: str
    published_at: datetime
    company: Optional[str] = None
    sentiment_score: Optional[float] = None
    esg_relevance: Optional[float] = None
    category: Optional[str] = None


class NewsAPIClient:
    """Multi-source news aggregator for ESG topics"""
    
    def __init__(self):
        self.newsapi_key = os.getenv('NEWSAPI_KEY')
        self.gnews_key = os.getenv('GNEWS_API_KEY')
        self.finnhub_key = os.getenv('FINNHUB_API_KEY')
        
        # News API endpoints
        self.newsapi_url = "https://newsapi.org/v2/everything"
        self.gnews_url = "https://gnews.io/api/v4/search"
        self.finnhub_url = "https://finnhub.io/api/v1/company-news"
        
        # ESG-related keywords
        self.esg_keywords = [
            "ESG", "sustainability", "carbon emissions", "climate change",
            "renewable energy", "diversity", "labor practices", "corporate governance",
            "environmental impact", "social responsibility", "ethical business",
            "carbon neutral", "green energy", "circular economy"
        ]
    
    async def fetch_esg_news(self, 
                            company: Optional[str] = None,
                            sector: Optional[str] = None,
                            days_back: int = 7,
                            limit: int = 50) -> List[NewsArticle]:
        """Fetch ESG-related news from multiple sources"""
        
        articles = []
        
        # Build search query
        if company:
            query = f'"{company}" AND ({" OR ".join(self.esg_keywords[:5])})'
        elif sector:
            query = f'"{sector}" AND ({" OR ".join(self.esg_keywords[:5])})'
        else:
            query = " OR ".join(self.esg_keywords[:10])
        
        # Fetch from available sources
        tasks = []
        
        if self.newsapi_key:
            tasks.append(self._fetch_newsapi(query, days_back, limit))
        
        if self.gnews_key:
            tasks.append(self._fetch_gnews(query, days_back, limit))
        
        if self.finnhub_key and company:
            tasks.append(self._fetch_finnhub(company, days_back))
        
        if not tasks:
            print("Warning: No API keys configured. Using fallback data.")
            return self._get_fallback_news(company or sector)
        
        # Gather results from all sources
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in results:
            if isinstance(result, list):
                articles.extend(result)
            elif isinstance(result, Exception):
                print(f"Error fetching news: {result}")
        
        # Deduplicate and sort by relevance
        articles = self._deduplicate_articles(articles)
        articles = sorted(articles, key=lambda x: x.published_at, reverse=True)
        
        return articles[:limit]
    
    async def _fetch_newsapi(self, query: str, days_back: int, limit: int) -> List[NewsArticle]:
        """Fetch from NewsAPI.org"""
        
        from_date = (datetime.now() - timedelta(days=days_back)).isoformat()
        
        params = {
            'q': query,
            'from': from_date,
            'sortBy': 'relevancy',
            'language': 'en',
            'pageSize': min(limit, 100),
            'apiKey': self.newsapi_key
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(self.newsapi_url, params=params, timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_newsapi_response(data)
                    else:
                        print(f"NewsAPI error: {response.status}")
                        return []
            except Exception as e:
                print(f"NewsAPI fetch error: {e}")
                return []
    
    async def _fetch_gnews(self, query: str, days_back: int, limit: int) -> List[NewsArticle]:
        """Fetch from GNews API"""
        
        params = {
            'q': query,
            'lang': 'en',
            'max': min(limit, 10),
            'token': self.gnews_key
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(self.gnews_url, params=params, timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_gnews_response(data)
                    else:
                        print(f"GNews error: {response.status}")
                        return []
            except Exception as e:
                print(f"GNews fetch error: {e}")
                return []
    
    async def _fetch_finnhub(self, company_symbol: str, days_back: int) -> List[NewsArticle]:
        """Fetch company news from Finnhub"""
        
        from_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')
        to_date = datetime.now().strftime('%Y-%m-%d')
        
        params = {
            'symbol': company_symbol,
            'from': from_date,
            'to': to_date,
            'token': self.finnhub_key
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(self.finnhub_url, params=params, timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_finnhub_response(data, company_symbol)
                    else:
                        print(f"Finnhub error: {response.status}")
                        return []
            except Exception as e:
                print(f"Finnhub fetch error: {e}")
                return []
    
    def _parse_newsapi_response(self, data: Dict) -> List[NewsArticle]:
        """Parse NewsAPI response"""
        articles = []
        
        for item in data.get('articles', []):
            try:
                article = NewsArticle(
                    title=item.get('title', ''),
                    description=item.get('description', ''),
                    content=item.get('content', ''),
                    url=item.get('url', ''),
                    source=item.get('source', {}).get('name', 'Unknown'),
                    published_at=datetime.fromisoformat(item.get('publishedAt', '').replace('Z', '+00:00'))
                )
                articles.append(article)
            except Exception as e:
                print(f"Error parsing article: {e}")
                continue
        
        return articles
    
    def _parse_gnews_response(self, data: Dict) -> List[NewsArticle]:
        """Parse GNews response"""
        articles = []
        
        for item in data.get('articles', []):
            try:
                article = NewsArticle(
                    title=item.get('title', ''),
                    description=item.get('description', ''),
                    content=item.get('content', ''),
                    url=item.get('url', ''),
                    source=item.get('source', {}).get('name', 'Unknown'),
                    published_at=datetime.fromisoformat(item.get('publishedAt', '').replace('Z', '+00:00'))
                )
                articles.append(article)
            except Exception as e:
                print(f"Error parsing GNews article: {e}")
                continue
        
        return articles
    
    def _parse_finnhub_response(self, data: List, company: str) -> List[NewsArticle]:
        """Parse Finnhub response"""
        articles = []
        
        for item in data:
            try:
                article = NewsArticle(
                    title=item.get('headline', ''),
                    description=item.get('summary', ''),
                    content=item.get('summary', ''),
                    url=item.get('url', ''),
                    source=item.get('source', 'Finnhub'),
                    published_at=datetime.fromtimestamp(item.get('datetime', 0)),
                    company=company
                )
                articles.append(article)
            except Exception as e:
                print(f"Error parsing Finnhub article: {e}")
                continue
        
        return articles
    
    def _deduplicate_articles(self, articles: List[NewsArticle]) -> List[NewsArticle]:
        """Remove duplicate articles based on title similarity"""
        seen_titles = set()
        unique_articles = []
        
        for article in articles:
            title_key = article.title.lower().strip()[:100]
            if title_key not in seen_titles:
                seen_titles.add(title_key)
                unique_articles.append(article)
        
        return unique_articles
    
    def _get_fallback_news(self, topic: Optional[str] = None) -> List[NewsArticle]:
        """Generate fallback news data when APIs are unavailable"""
        
        fallback_data = [
            {
                'title': f'{topic or "Companies"} Increasing ESG Commitments',
                'description': 'Leading companies announce new sustainability initiatives',
                'content': 'Multiple companies have committed to enhanced ESG practices...',
                'url': 'https://example.com/news/1',
                'source': 'ESG News',
                'published_at': datetime.now() - timedelta(days=1)
            },
            {
                'title': f'Carbon Neutrality Goals Accelerate in {topic or "Various Sectors"}',
                'description': 'Industry leaders set aggressive carbon reduction targets',
                'content': 'New carbon neutrality commitments announced...',
                'url': 'https://example.com/news/2',
                'source': 'Sustainability Today',
                'published_at': datetime.now() - timedelta(days=2)
            },
            {
                'title': 'ESG Investing Reaches Record Highs',
                'description': 'Sustainable investment funds see unprecedented growth',
                'content': 'ESG-focused funds attract record capital...',
                'url': 'https://example.com/news/3',
                'source': 'Financial Times',
                'published_at': datetime.now() - timedelta(days=3)
            }
        ]
        
        return [
            NewsArticle(
                title=item['title'],
                description=item['description'],
                content=item['content'],
                url=item['url'],
                source=item['source'],
                published_at=item['published_at'],
                company=topic
            )
            for item in fallback_data
        ]
    
    async def analyze_sentiment(self, article: NewsArticle) -> float:
        """Analyze sentiment of news article (-1 to 1)"""
        
        # Simple keyword-based sentiment for now
        positive_keywords = ['success', 'growth', 'improvement', 'commitment', 'achievement', 
                           'innovation', 'positive', 'sustainable', 'green', 'clean']
        negative_keywords = ['controversy', 'scandal', 'violation', 'failure', 'decline',
                           'lawsuit', 'penalty', 'criticism', 'pollution', 'harm']
        
        text = (article.title + " " + article.description).lower()
        
        pos_count = sum(1 for word in positive_keywords if word in text)
        neg_count = sum(1 for word in negative_keywords if word in text)
        
        total = pos_count + neg_count
        if total == 0:
            return 0.0
        
        sentiment = (pos_count - neg_count) / total
        return max(-1.0, min(1.0, sentiment))
    
    async def calculate_esg_relevance(self, article: NewsArticle) -> float:
        """Calculate ESG relevance score (0 to 1)"""
        
        text = (article.title + " " + article.description).lower()
        
        keyword_matches = sum(1 for keyword in self.esg_keywords if keyword.lower() in text)
        max_score = min(len(self.esg_keywords), 10)
        
        relevance = keyword_matches / max_score
        return min(1.0, relevance)
    
    async def enrich_articles(self, articles: List[NewsArticle]) -> List[NewsArticle]:
        """Add sentiment and relevance scores to articles"""
        
        for article in articles:
            article.sentiment_score = await self.analyze_sentiment(article)
            article.esg_relevance = await self.calculate_esg_relevance(article)
        
        return articles
    
    def categorize_article(self, article: NewsArticle) -> str:
        """Categorize article by ESG pillar"""
        
        text = (article.title + " " + article.description).lower()
        
        env_keywords = ['environment', 'carbon', 'climate', 'emission', 'renewable', 'pollution', 'waste']
        soc_keywords = ['social', 'labor', 'diversity', 'employee', 'human rights', 'community', 'safety']
        gov_keywords = ['governance', 'board', 'ethics', 'compliance', 'transparency', 'audit', 'corruption']
        
        env_score = sum(1 for kw in env_keywords if kw in text)
        soc_score = sum(1 for kw in soc_keywords if kw in text)
        gov_score = sum(1 for kw in gov_keywords if kw in text)
        
        scores = {'Environmental': env_score, 'Social': soc_score, 'Governance': gov_score}
        category = max(scores, key=scores.get)
        
        return category if scores[category] > 0 else 'General ESG'


class NewsInsightsGenerator:
    """Generate insights from news articles"""
    
    def __init__(self):
        self.news_client = NewsAPIClient()
    
    async def generate_company_insights(self, company: str, days_back: int = 7) -> Dict[str, Any]:
        """Generate comprehensive news insights for a company"""
        
        # Fetch news
        articles = await self.news_client.fetch_esg_news(company=company, days_back=days_back)
        
        # Enrich with sentiment and relevance
        articles = await self.news_client.enrich_articles(articles)
        
        # Generate insights
        insights = {
            'company': company,
            'period': f'Last {days_back} days',
            'total_articles': len(articles),
            'avg_sentiment': sum(a.sentiment_score or 0 for a in articles) / len(articles) if articles else 0,
            'avg_relevance': sum(a.esg_relevance or 0 for a in articles) / len(articles) if articles else 0,
            'category_breakdown': self._categorize_articles(articles),
            'trending_topics': self._extract_trending_topics(articles),
            'risk_alerts': self._identify_risk_alerts(articles),
            'top_articles': [
                {
                    'title': a.title,
                    'source': a.source,
                    'sentiment': a.sentiment_score,
                    'url': a.url,
                    'published': a.published_at.isoformat()
                }
                for a in sorted(articles, key=lambda x: x.esg_relevance or 0, reverse=True)[:5]
            ]
        }
        
        return insights
    
    def _categorize_articles(self, articles: List[NewsArticle]) -> Dict[str, int]:
        """Count articles by ESG category"""
        categories = {}
        
        for article in articles:
            category = self.news_client.categorize_article(article)
            categories[category] = categories.get(category, 0) + 1
        
        return categories
    
    def _extract_trending_topics(self, articles: List[NewsArticle]) -> List[str]:
        """Extract trending topics from articles"""
        
        # Simple word frequency analysis
        from collections import Counter
        import re
        
        words = []
        for article in articles:
            text = article.title + " " + article.description
            words.extend(re.findall(r'\b[a-z]{4,}\b', text.lower()))
        
        # Filter out common words
        stopwords = {'that', 'this', 'with', 'from', 'have', 'been', 'will', 'said', 'their'}
        words = [w for w in words if w not in stopwords]
        
        # Get top 10 trending words
        trending = Counter(words).most_common(10)
        return [word for word, count in trending]
    
    def _identify_risk_alerts(self, articles: List[NewsArticle]) -> List[Dict[str, Any]]:
        """Identify potential ESG risk alerts from news"""
        
        risk_keywords = ['scandal', 'lawsuit', 'violation', 'fine', 'penalty', 'breach', 
                        'controversy', 'investigation', 'accident', 'spill']
        
        alerts = []
        for article in articles:
            text = (article.title + " " + article.description).lower()
            
            matched_risks = [kw for kw in risk_keywords if kw in text]
            
            if matched_risks or (article.sentiment_score and article.sentiment_score < -0.3):
                alerts.append({
                    'title': article.title,
                    'severity': 'High' if article.sentiment_score and article.sentiment_score < -0.5 else 'Medium',
                    'risk_type': matched_risks[0] if matched_risks else 'negative_sentiment',
                    'url': article.url,
                    'published': article.published_at.isoformat()
                })
        
        return sorted(alerts, key=lambda x: x['severity'], reverse=True)[:5]


# Example usage
async def main():
    """Example usage of news API integration"""
    
    insights_generator = NewsInsightsGenerator()
    
    # Generate insights for a company
    insights = await insights_generator.generate_company_insights('Tesla', days_back=7)
    
    print(json.dumps(insights, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
