"""Script to load processed ESG dataset into PostgreSQL.

Usage (PowerShell):
  python scripts/load_db.py --csv data/processed/esg_data_cleaned.csv --table esg_companies
"""
from pathlib import Path
import argparse
import pandas as pd
from backend.utils import load_dataframe_to_db


def parse_args():
    p = argparse.ArgumentParser(description="Load ESG processed CSV into database")
    p.add_argument("--csv", required=True, help="Path to processed CSV file")
    p.add_argument("--table", default="esg_companies", help="Target table name")
    return p.parse_args()


def main():
    args = parse_args()
    csv_path = Path(args.csv)
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")
    df = pd.read_csv(csv_path)
    inserted = load_dataframe_to_db(df, args.table)
    print(f"Inserted {inserted} rows into {args.table}")


if __name__ == "__main__":
    main()
