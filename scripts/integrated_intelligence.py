"""
Integrated Agentic AI + News Pipeline
Combines news analysis with AI agents for comprehensive ESG insights
"""

import asyncio
from typing import Dict, List, Any
from datetime import datetime
import json

from news_api import NewsInsightsGenerator, NewsAPIClient
from agentic_pipeline import AgenticPipeline, AgentRole


class IntegratedESGIntelligence:
    """
    Complete ESG intelligence system combining:
    - Real-time news monitoring
    - Agentic AI analysis
    - Personalized recommendations
    - Interpretable insights
    """
    
    def __init__(self):
        self.news_generator = NewsInsightsGenerator()
        self.ai_pipeline = AgenticPipeline()
        self.news_client = NewsAPIClient()
    
    async def comprehensive_company_analysis(
        self,
        company_name: str,
        company_data: Dict[str, Any],
        user_preferences: Dict[str, Any],
        days_back: int = 7
    ) -> Dict[str, Any]:
        """
        Run complete analysis pipeline:
        1. Fetch latest news
        2. Generate news insights
        3. Run AI agent analysis
        4. Provide recommendations
        5. Generate interpretable report
        """
        
        print(f"\n{'='*80}")
        print(f"COMPREHENSIVE ESG ANALYSIS: {company_name}")
        print(f"{'='*80}\n")
        
        # Stage 1: News Intelligence
        print("📰 Stage 1: Fetching and analyzing news...")
        news_insights = await self.news_generator.generate_company_insights(
            company_name, 
            days_back=days_back
        )
        
        # Get detailed articles for AI analysis
        news_articles = await self.news_client.fetch_esg_news(
            company=company_name,
            days_back=days_back,
            limit=10
        )
        
        # Prepare news data for agents
        news_data_for_agents = [
            {
                'title': article.title,
                'content': article.description,
                'company': company_name,
                'source': article.source,
                'published_at': article.published_at.isoformat(),
                'sentiment': article.sentiment_score,
                'url': article.url
            }
            for article in news_articles[:5]
        ]
        
        # Stage 2: AI Agent Analysis
        print("🤖 Stage 2: Running AI agent analysis...")
        
        # Enrich company data with news insights
        enriched_company_data = {
            **company_data,
            'recent_news': news_insights.get('total_articles', 0),
            'news_sentiment': news_insights.get('avg_sentiment', 0),
            'risk_alerts': len(news_insights.get('risk_alerts', []))
        }
        
        # Run full agentic pipeline
        ai_results = await self.ai_pipeline.run_full_analysis(
            enriched_company_data,
            news_data_for_agents,
            user_preferences
        )
        
        # Stage 3: Integration & Synthesis
        print("🔍 Stage 3: Synthesizing insights...")
        
        integrated_results = {
            'company': company_name,
            'analysis_timestamp': datetime.now().isoformat(),
            'analysis_period': f'Last {days_back} days',
            
            # News Intelligence
            'news_intelligence': {
                'summary': news_insights,
                'sentiment_trend': self._calculate_sentiment_trend(news_articles),
                'esg_category_focus': news_insights.get('category_breakdown', {}),
                'risk_alerts': news_insights.get('risk_alerts', []),
                'top_stories': news_insights.get('top_articles', [])
            },
            
            # AI Agent Insights
            'ai_insights': {
                'risk_assessment': {
                    'content': ai_results.get('risk_assessment').content if ai_results.get('risk_assessment') else 'N/A',
                    'confidence': ai_results.get('risk_assessment').confidence if ai_results.get('risk_assessment') else 0,
                    'reasoning': ai_results.get('risk_assessment').reasoning if ai_results.get('risk_assessment') else []
                },
                'recommendations': {
                    'content': ai_results.get('recommendations').content if ai_results.get('recommendations') else 'N/A',
                    'confidence': ai_results.get('recommendations').confidence if ai_results.get('recommendations') else 0
                },
                'interpretation': {
                    'content': ai_results.get('interpretation').content if ai_results.get('interpretation') else 'N/A',
                    'confidence': ai_results.get('interpretation').confidence if ai_results.get('interpretation') else 0
                }
            },
            
            # Actionable Insights
            'actionable_insights': self._generate_actionable_insights(
                news_insights,
                ai_results,
                company_data
            ),
            
            # Overall Score
            'overall_assessment': self._calculate_overall_assessment(
                news_insights,
                ai_results,
                company_data
            )
        }
        
        return integrated_results
    
    def _calculate_sentiment_trend(self, articles: List) -> str:
        """Determine sentiment trend from articles"""
        
        if not articles:
            return "Neutral"
        
        # Sort by date and calculate moving sentiment
        sorted_articles = sorted(articles, key=lambda x: x.published_at)
        
        if len(sorted_articles) < 2:
            return "Neutral"
        
        recent_sentiment = sum(a.sentiment_score or 0 for a in sorted_articles[-3:]) / min(3, len(sorted_articles))
        earlier_sentiment = sum(a.sentiment_score or 0 for a in sorted_articles[:3]) / min(3, len(sorted_articles))
        
        if recent_sentiment > earlier_sentiment + 0.2:
            return "Improving"
        elif recent_sentiment < earlier_sentiment - 0.2:
            return "Declining"
        else:
            return "Stable"
    
    def _generate_actionable_insights(
        self,
        news_insights: Dict,
        ai_results: Dict,
        company_data: Dict
    ) -> List[Dict[str, str]]:
        """Generate specific actionable insights"""
        
        insights = []
        
        # News-based insights
        if news_insights.get('avg_sentiment', 0) < -0.3:
            insights.append({
                'type': 'alert',
                'priority': 'high',
                'insight': 'Negative news sentiment detected. Monitor closely for ESG risks.',
                'action': 'Review recent controversies and prepare mitigation strategies.'
            })
        
        if news_insights.get('risk_alerts'):
            insights.append({
                'type': 'risk',
                'priority': 'high',
                'insight': f"{len(news_insights['risk_alerts'])} risk alerts identified in recent news.",
                'action': 'Investigate flagged incidents and assess potential impact.'
            })
        
        # Score-based insights
        env_score = company_data.get('environment_score', 50)
        if env_score > 60:
            insights.append({
                'type': 'opportunity',
                'priority': 'medium',
                'insight': 'Environmental score indicates improvement needed.',
                'action': 'Focus on carbon reduction and renewable energy initiatives.'
            })
        
        gov_score = company_data.get('governance_score', 50)
        if gov_score < 30:
            insights.append({
                'type': 'strength',
                'priority': 'low',
                'insight': 'Strong governance practices detected.',
                'action': 'Maintain current standards and share best practices.'
            })
        
        return insights
    
    def _calculate_overall_assessment(
        self,
        news_insights: Dict,
        ai_results: Dict,
        company_data: Dict
    ) -> Dict[str, Any]:
        """Calculate overall ESG assessment"""
        
        # Calculate composite score
        env_score = company_data.get('environment_score', 50)
        soc_score = company_data.get('social_score', 50)
        gov_score = company_data.get('governance_score', 50)
        
        base_score = (env_score + soc_score + gov_score) / 3
        
        # Adjust for news sentiment
        news_adjustment = news_insights.get('avg_sentiment', 0) * 5
        
        # Adjust for risk alerts
        risk_penalty = min(len(news_insights.get('risk_alerts', [])) * 3, 15)
        
        final_score = max(0, min(100, base_score + news_adjustment - risk_penalty))
        
        # Determine rating
        if final_score < 25:
            rating = "Excellent"
            risk_level = "Low"
        elif final_score < 50:
            rating = "Good"
            risk_level = "Medium-Low"
        elif final_score < 70:
            rating = "Fair"
            risk_level = "Medium"
        else:
            rating = "Poor"
            risk_level = "High"
        
        return {
            'composite_score': round(final_score, 2),
            'rating': rating,
            'risk_level': risk_level,
            'confidence': 0.85,
            'factors': {
                'base_esg_score': round(base_score, 2),
                'news_sentiment_adjustment': round(news_adjustment, 2),
                'risk_alert_penalty': risk_penalty
            }
        }
    
    def generate_report(self, results: Dict[str, Any]) -> str:
        """Generate formatted analysis report"""
        
        report = []
        report.append("\n" + "="*100)
        report.append(f"ESG INTELLIGENCE REPORT: {results['company']}")
        report.append("="*100)
        report.append(f"\nGenerated: {results['analysis_timestamp']}")
        report.append(f"Period: {results['analysis_period']}\n")
        
        # Overall Assessment
        assessment = results['overall_assessment']
        report.append("\n📊 OVERALL ASSESSMENT")
        report.append("-"*100)
        report.append(f"Rating: {assessment['rating']} | Risk Level: {assessment['risk_level']} | Score: {assessment['composite_score']}/100")
        report.append(f"Confidence: {assessment['confidence']:.0%}\n")
        
        # News Intelligence
        news = results['news_intelligence']
        report.append("\n📰 NEWS INTELLIGENCE")
        report.append("-"*100)
        report.append(f"Total Articles: {news['summary']['total_articles']}")
        report.append(f"Average Sentiment: {news['summary']['avg_sentiment']:.2f}")
        report.append(f"Sentiment Trend: {news['sentiment_trend']}")
        report.append(f"Risk Alerts: {len(news['risk_alerts'])}\n")
        
        if news['top_stories']:
            report.append("Top Stories:")
            for i, story in enumerate(news['top_stories'][:3], 1):
                report.append(f"  {i}. {story['title']} ({story['source']})")
                report.append(f"     Sentiment: {story.get('sentiment', 0):.2f} | {story['url']}\n")
        
        # AI Insights
        ai = results['ai_insights']
        report.append("\n🤖 AI AGENT ANALYSIS")
        report.append("-"*100)
        report.append(f"\nRisk Assessment (Confidence: {ai['risk_assessment']['confidence']:.0%}):")
        report.append(f"{ai['risk_assessment']['content'][:500]}...\n")
        
        report.append(f"\nRecommendations (Confidence: {ai['recommendations']['confidence']:.0%}):")
        report.append(f"{ai['recommendations']['content'][:500]}...\n")
        
        # Actionable Insights
        report.append("\n💡 ACTIONABLE INSIGHTS")
        report.append("-"*100)
        for i, insight in enumerate(results['actionable_insights'], 1):
            report.append(f"\n{i}. [{insight['priority'].upper()}] {insight['type'].upper()}")
            report.append(f"   Insight: {insight['insight']}")
            report.append(f"   Action: {insight['action']}")
        
        report.append("\n" + "="*100 + "\n")
        
        return "\n".join(report)
    
    async def batch_analysis(
        self,
        companies: List[Dict[str, Any]],
        user_preferences: Dict[str, Any],
        days_back: int = 7
    ) -> List[Dict[str, Any]]:
        """Run analysis for multiple companies in parallel"""
        
        tasks = [
            self.comprehensive_company_analysis(
                company['name'],
                company,
                user_preferences,
                days_back
            )
            for company in companies
        ]
        
        results = await asyncio.gather(*tasks)
        return results


# Example usage
async def main():
    """Demo of integrated intelligence system"""
    
    intelligence = IntegratedESGIntelligence()
    
    # Sample company data
    company_data = {
        'name': 'Apple Inc.',
        'symbol': 'AAPL',
        'sector': 'Technology',
        'environment_score': 28,
        'social_score': 32,
        'governance_score': 22,
        'controversy_score': 15,
        'full_time_employees': 164000
    }
    
    # User preferences
    user_preferences = {
        'risk_appetite': 'moderate',
        'focus_areas': ['environmental', 'governance'],
        'horizon': 'long-term',
        'esg_priorities': {
            'environmental': 0.4,
            'social': 0.3,
            'governance': 0.3
        }
    }
    
    # Run comprehensive analysis
    results = await intelligence.comprehensive_company_analysis(
        company_data['name'],
        company_data,
        user_preferences,
        days_back=7
    )
    
    # Generate report
    report = intelligence.generate_report(results)
    print(report)
    
    # Save results
    with open('esg_intelligence_report.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print("\n✅ Analysis complete! Results saved to esg_intelligence_report.json")


if __name__ == "__main__":
    asyncio.run(main())
