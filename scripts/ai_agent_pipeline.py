"""Agentic AI Pipeline for ESG Analysis using Crew AI and Groq

Multi-agent system for comprehensive ESG analysis, risk assessment,
and intelligent recommendations powered by Crew AI framework and Groq LLM.
"""
import os
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import json
from pathlib import Path
import pandas as pd

try:
    from crewai import Agent, Task, Crew, Process
    from crewai_tools import SerperDevTool, FileReadTool, WebsiteSearchTool
    from langchain_groq import ChatGroq
    CREW_AI_AVAILABLE = True
except ImportError:
    CREW_AI_AVAILABLE = False
    print("⚠️  Crew AI not installed. Run: pip install crewai crewai-tools langchain-groq")

from settings import config


@dataclass
class ESGAnalysisResult:
    """Structured result from ESG analysis."""
    company_name: str
    risk_level: str
    confidence: float
    esg_scores: Dict[str, float]
    analysis: str
    recommendations: List[str]
    risks: List[str]
    opportunities: List[str]
    timestamp: datetime
    agent_insights: Dict[str, Any]


class ESGAgenticPipeline:
    """
    Multi-agent AI system for ESG analysis using Crew AI and Groq.
    
    Features:
    - Data Analysis Agent: Analyzes ESG metrics and trends
    - Risk Assessment Agent: Identifies and evaluates risks
    - Sustainability Expert: Provides domain expertise
    - Report Generator: Creates comprehensive reports
    """
    
    def __init__(
        self,
        groq_api_key: Optional[str] = None,
        model: str = "mixtral-8x7b-32768",
        temperature: float = 0.3,
        verbose: bool = True
    ):
        """
        Initialize the agentic pipeline.
        
        Args:
            groq_api_key: Groq API key (or uses GROQ_API_KEY env var)
            model: Groq model to use
            temperature: LLM temperature setting
            verbose: Whether to print agent activities
        """
        if not CREW_AI_AVAILABLE:
            raise ImportError("Crew AI is required. Install with: pip install crewai crewai-tools langchain-groq")
        
        self.groq_api_key = groq_api_key or os.getenv("GROQ_API_KEY")
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY must be set in environment or passed as argument")
        
        self.model_name = model
        self.temperature = temperature
        self.verbose = verbose
        
        # Initialize Groq LLM
        self.llm = ChatGroq(
            api_key=self.groq_api_key,
            model=self.model_name,
            temperature=self.temperature
        )
        
        # Initialize tools
        self.search_tool = SerperDevTool() if os.getenv("SERPER_API_KEY") else None
        self.file_tool = FileReadTool()
        
        # Create agents
        self.agents = self._create_agents()
        
    def _create_agents(self) -> Dict[str, Agent]:
        """Create specialized AI agents."""
        agents = {}
        
        # Data Analysis Agent
        agents["data_analyst"] = Agent(
            role="ESG Data Analyst",
            goal="Analyze ESG metrics and identify patterns, trends, and anomalies",
            backstory="""You are an expert data analyst specializing in ESG metrics.
            You excel at identifying trends, calculating risk scores, and providing
            data-driven insights about company sustainability performance.""",
            llm=self.llm,
            verbose=self.verbose,
            allow_delegation=False,
        )
        
        # Risk Assessment Agent
        agents["risk_assessor"] = Agent(
            role="ESG Risk Assessment Specialist",
            goal="Evaluate ESG risks and their potential impact on business value",
            backstory="""You are a seasoned risk assessment expert with deep knowledge
            of environmental, social, and governance risks. You excel at identifying
            potential threats and their business implications.""",
            llm=self.llm,
            verbose=self.verbose,
            allow_delegation=False,
        )
        
        # Sustainability Expert
        agents["sustainability_expert"] = Agent(
            role="Sustainability Strategy Expert",
            goal="Provide expert recommendations for improving ESG performance",
            backstory="""You are a sustainability consultant with 15+ years experience
            helping companies improve their ESG performance. You provide actionable,
            practical recommendations aligned with global sustainability standards.""",
            llm=self.llm,
            verbose=self.verbose,
            allow_delegation=False,
        )
        
        # Opportunity Analyst
        agents["opportunity_analyst"] = Agent(
            role="ESG Opportunity Analyst",
            goal="Identify ESG-related opportunities for value creation",
            backstory="""You specialize in finding opportunities within ESG challenges.
            You identify areas where sustainability improvements can drive innovation,
            cost savings, and competitive advantage.""",
            llm=self.llm,
            verbose=self.verbose,
            allow_delegation=False,
        )
        
        # Report Generator
        agents["report_generator"] = Agent(
            role="Executive Report Writer",
            goal="Create clear, comprehensive ESG analysis reports for stakeholders",
            backstory="""You are an expert at synthesizing complex ESG data into
            clear, actionable reports for executives and investors. Your reports
            balance technical accuracy with accessibility.""",
            llm=self.llm,
            verbose=self.verbose,
            allow_delegation=False,
        )
        
        return agents
    
    def analyze_company(
        self,
        company_name: str,
        company_data: Dict[str, Any],
        include_recommendations: bool = True
    ) -> ESGAnalysisResult:
        """
        Run comprehensive ESG analysis on a company.
        
        Args:
            company_name: Name of the company
            company_data: Dictionary with ESG metrics
            include_recommendations: Whether to include recommendations
            
        Returns:
            ESGAnalysisResult with comprehensive analysis
        """
        print(f"\n{'='*80}")
        print(f"🤖 AGENTIC AI ANALYSIS: {company_name}")
        print(f"{'='*80}\n")
        
        # Create tasks
        tasks = self._create_analysis_tasks(company_name, company_data, include_recommendations)
        
        # Create crew
        crew = Crew(
            agents=list(self.agents.values()),
            tasks=tasks,
            process=Process.sequential,
            verbose=self.verbose,
        )
        
        # Execute analysis
        print("🚀 Starting multi-agent analysis...")
        result = crew.kickoff()
        
        # Parse and structure results
        analysis_result = self._parse_crew_output(
            company_name=company_name,
            company_data=company_data,
            crew_output=str(result)
        )
        
        print("\n✅ Analysis complete!")
        return analysis_result
    
    def _create_analysis_tasks(
        self,
        company_name: str,
        company_data: Dict[str, Any],
        include_recommendations: bool
    ) -> List[Task]:
        """Create analysis tasks for the crew."""
        tasks = []
        
        # Format company data for context
        data_context = f"""
        Company: {company_name}
        Environment Risk Score: {company_data.get('environment_risk_score', 'N/A')}
        Social Risk Score: {company_data.get('social_risk_score', 'N/A')}
        Governance Risk Score: {company_data.get('governance_risk_score', 'N/A')}
        Controversy Score: {company_data.get('controversy_score', 'N/A')}
        Total ESG Risk: {company_data.get('total_esg_risk_score', 'N/A')}
        Sector: {company_data.get('sector', 'N/A')}
        Industry: {company_data.get('industry', 'N/A')}
        """
        
        # Task 1: Data Analysis
        tasks.append(Task(
            description=f"""Analyze the ESG data for {company_name}:
            {data_context}
            
            Provide:
            1. Overall ESG performance assessment
            2. Key trends and patterns in the metrics
            3. Comparison to industry benchmarks (if sector/industry known)
            4. Areas of concern based on the scores
            5. Data quality and completeness assessment""",
            agent=self.agents["data_analyst"],
            expected_output="Detailed data analysis with key findings and metrics assessment"
        ))
        
        # Task 2: Risk Assessment
        tasks.append(Task(
            description=f"""Based on the data analysis, assess ESG risks for {company_name}:
            {data_context}
            
            Identify and evaluate:
            1. Top 5 ESG risks based on the scores
            2. Severity and likelihood of each risk
            3. Potential business impact (financial, reputational, operational)
            4. Short-term vs long-term risks
            5. Interconnected risks across E, S, and G dimensions""",
            agent=self.agents["risk_assessor"],
            expected_output="Comprehensive risk assessment with prioritized risk list"
        ))
        
        # Task 3: Opportunity Analysis
        tasks.append(Task(
            description=f"""Identify ESG opportunities for {company_name}:
            {data_context}
            
            Find opportunities for:
            1. Value creation through ESG improvements
            2. Competitive advantage in sustainability
            3. Cost savings through efficiency
            4. Innovation in sustainable practices
            5. Stakeholder relationship improvement""",
            agent=self.agents["opportunity_analyst"],
            expected_output="List of strategic ESG opportunities with implementation potential"
        ))
        
        # Task 4: Recommendations (if requested)
        if include_recommendations:
            tasks.append(Task(
                description=f"""Develop actionable recommendations for {company_name}:
                
                Based on the data analysis, risks, and opportunities identified,
                provide:
                1. Top 5 strategic recommendations prioritized by impact
                2. Quick wins (0-6 months)
                3. Medium-term initiatives (6-24 months)
                4. Long-term transformations (2+ years)
                5. Resource requirements and success metrics
                6. Alignment with global standards (GRI, SASB, TCFD)""",
                agent=self.agents["sustainability_expert"],
                expected_output="Prioritized, actionable recommendations with implementation roadmap"
            ))
        
        # Task 5: Report Generation
        tasks.append(Task(
            description=f"""Create an executive summary report for {company_name}:
            
            Synthesize all findings into a clear, concise report including:
            1. Executive summary (2-3 paragraphs)
            2. Current ESG status and risk level
            3. Key findings from analysis
            4. Critical risks and opportunities
            5. Strategic recommendations (if applicable)
            6. Next steps and priorities
            
            Format for executive audience - clear, data-driven, actionable.""",
            agent=self.agents["report_generator"],
            expected_output="Professional executive summary report"
        ))
        
        return tasks
    
    def _parse_crew_output(
        self,
        company_name: str,
        company_data: Dict[str, Any],
        crew_output: str
    ) -> ESGAnalysisResult:
        """Parse crew output into structured result."""
        # Extract risk level from data
        total_risk = company_data.get('total_esg_risk_score', 0)
        if total_risk < 20:
            risk_level = "Low"
        elif total_risk < 40:
            risk_level = "Medium"
        else:
            risk_level = "High"
        
        # Calculate confidence (simplified)
        confidence = 0.85  # This would be calculated based on data completeness
        
        # Extract ESG scores
        esg_scores = {
            "environment": company_data.get('environment_risk_score', 0),
            "social": company_data.get('social_risk_score', 0),
            "governance": company_data.get('governance_risk_score', 0),
            "controversy": company_data.get('controversy_score', 0),
            "total": total_risk,
        }
        
        # Parse recommendations and risks from output (simplified)
        recommendations = self._extract_list_items(crew_output, "recommend")
        risks = self._extract_list_items(crew_output, "risk")
        opportunities = self._extract_list_items(crew_output, "opportunit")
        
        return ESGAnalysisResult(
            company_name=company_name,
            risk_level=risk_level,
            confidence=confidence,
            esg_scores=esg_scores,
            analysis=crew_output,
            recommendations=recommendations[:5] if recommendations else [],
            risks=risks[:5] if risks else [],
            opportunities=opportunities[:5] if opportunities else [],
            timestamp=datetime.now(),
            agent_insights={
                "model": self.model_name,
                "temperature": self.temperature,
                "agents_used": len(self.agents),
            }
        )
    
    def _extract_list_items(self, text: str, keyword: str) -> List[str]:
        """Extract list items related to keyword from text."""
        items = []
        lines = text.lower().split('\n')
        for line in lines:
            if keyword in line and any(c in line for c in ['1.', '2.', '-', '•']):
                cleaned = line.strip().lstrip('0123456789.-•* ')
                if len(cleaned) > 10:
                    items.append(cleaned)
        return items[:10]  # Max 10 items
    
    def save_analysis(
        self,
        result: ESGAnalysisResult,
        output_dir: Path
    ):
        """Save analysis result to file."""
        output_dir.mkdir(parents=True, exist_ok=True)
        timestamp = result.timestamp.strftime("%Y%m%d_%H%M%S")
        company_slug = result.company_name.lower().replace(" ", "_")
        
        # Save JSON
        json_path = output_dir / f"esg_analysis_{company_slug}_{timestamp}.json"
        with open(json_path, 'w') as f:
            json.dump({
                "company_name": result.company_name,
                "risk_level": result.risk_level,
                "confidence": result.confidence,
                "esg_scores": result.esg_scores,
                "recommendations": result.recommendations,
                "risks": result.risks,
                "opportunities": result.opportunities,
                "timestamp": result.timestamp.isoformat(),
                "agent_insights": result.agent_insights,
            }, f, indent=2)
        
        # Save detailed report
        report_path = output_dir / f"esg_report_{company_slug}_{timestamp}.txt"
        with open(report_path, 'w') as f:
            f.write(f"ESG ANALYSIS REPORT\n")
            f.write(f"{'='*80}\n\n")
            f.write(f"Company: {result.company_name}\n")
            f.write(f"Analysis Date: {result.timestamp.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Risk Level: {result.risk_level}\n")
            f.write(f"Confidence: {result.confidence:.2%}\n\n")
            f.write(f"DETAILED ANALYSIS\n")
            f.write(f"{'-'*80}\n")
            f.write(result.analysis)
        
        print(f"\n💾 Analysis saved to:")
        print(f"   JSON: {json_path}")
        print(f"   Report: {report_path}")


def analyze_company_from_csv(
    csv_path: Path,
    company_symbol: str,
    output_dir: Optional[Path] = None
):
    """
    Convenience function to analyze a company from CSV data.
    
    Args:
        csv_path: Path to CSV with company data
        company_symbol: Company symbol to analyze
        output_dir: Optional output directory for results
    """
    # Load data
    df = pd.read_csv(csv_path)
    company_row = df[df['Symbol'].str.upper() == company_symbol.upper()]
    
    if company_row.empty:
        raise ValueError(f"Company {company_symbol} not found in dataset")
    
    # Convert to dict
    company_data = company_row.iloc[0].to_dict()
    company_name = company_data.get('Name', company_symbol)
    
    # Initialize pipeline
    pipeline = ESGAgenticPipeline(verbose=True)
    
    # Run analysis
    result = pipeline.analyze_company(
        company_name=company_name,
        company_data=company_data,
        include_recommendations=True
    )
    
    # Save results
    if output_dir:
        pipeline.save_analysis(result, output_dir)
    
    return result


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="ESG Agentic AI Analysis")
    parser.add_argument("--input", type=Path, required=True, help="CSV with company data")
    parser.add_argument("--symbol", type=str, required=True, help="Company symbol to analyze")
    parser.add_argument("--output", type=Path, default=config.REPORTS_DIR / "ai_analysis")
    parser.add_argument("--model", type=str, default="mixtral-8x7b-32768")
    
    args = parser.parse_args()
    
    # Run analysis
    result = analyze_company_from_csv(
        csv_path=args.input,
        company_symbol=args.symbol,
        output_dir=args.output
    )
    
    print(f"\n{'='*80}")
    print(f"✅ ANALYSIS COMPLETE: {result.company_name}")
    print(f"{'='*80}")
    print(f"Risk Level: {result.risk_level}")
    print(f"Confidence: {result.confidence:.2%}")
    print(f"Recommendations: {len(result.recommendations)}")
    print(f"Risks Identified: {len(result.risks)}")
    print(f"Opportunities: {len(result.opportunities)}")
