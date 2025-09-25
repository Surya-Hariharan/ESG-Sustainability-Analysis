"""Generate summary analytical tables and simple static figures.

This script pulls aggregated insights from the database and writes them into
`reports/tables` and `reports/figures`.

Usage:
  python scripts/generate_reports.py
"""
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
from backend.utils import fetch_query

OUTPUT_TABLE_DIR = Path("reports/tables")
OUTPUT_FIG_DIR = Path("reports/figures")


QUERIES = {
    "sector_averages": """
        SELECT sector, ROUND(AVG(total_esg_risk_score)::numeric,2) AS avg_esg_risk, COUNT(*) as companies
        FROM esg_companies
        WHERE total_esg_risk_score IS NOT NULL
        GROUP BY sector
        ORDER BY avg_esg_risk ASC;""",
    "top_companies": """
        SELECT symbol, name, sector, total_esg_risk_score
        FROM esg_companies
        WHERE total_esg_risk_score IS NOT NULL
        ORDER BY total_esg_risk_score ASC
        LIMIT 20;""",
    "high_controversy": """
        SELECT symbol, name, controversy_score, controversy_level
        FROM esg_companies
        WHERE controversy_score >= 50
        ORDER BY controversy_score DESC;""",
}


def save_tables():
    OUTPUT_TABLE_DIR.mkdir(parents=True, exist_ok=True)
    results = {}
    for name, q in QUERIES.items():
        df = fetch_query(q)
        out_path = OUTPUT_TABLE_DIR / f"{name}.csv"
        df.to_csv(out_path, index=False)
        results[name] = df
        print(f"Saved table: {out_path}")
    return results


def save_figures(tables):
    OUTPUT_FIG_DIR.mkdir(parents=True, exist_ok=True)
    # Sector average bar chart
    sector_df = tables["sector_averages"]
    if not sector_df.empty:
        plt.figure(figsize=(10, 5))
        plt.bar(sector_df["sector"], sector_df["avg_esg_risk"], color="#2e8b57")
        plt.xticks(rotation=45, ha="right")
        plt.ylabel("Avg ESG Risk Score")
        plt.title("Average ESG Risk by Sector")
        plt.tight_layout()
        out_path = OUTPUT_FIG_DIR / "sector_avg_esg.png"
        plt.savefig(out_path, dpi=150)
        plt.close()
        print(f"Saved figure: {out_path}")


def main():
    tables = save_tables()
    save_figures(tables)


if __name__ == "__main__":
    main()
