"""Run batch predictions for ESG risk level using the trained model.

Usage:
  python scripts/predict.py --input data/processed/new_companies.csv --output reports/predictions.csv
"""
from pathlib import Path
import argparse
import pandas as pd
import joblib

from backend.model import FEATURE_ORDER, MODEL_PATH


def parse_args():
    p = argparse.ArgumentParser(description="Batch ESG risk predictions")
    p.add_argument("--input", required=True, help="CSV containing feature columns")
    p.add_argument("--output", default="reports/predictions.csv", help="Where to write predictions")
    p.add_argument("--model", default=str(MODEL_PATH), help="Path to model artifact")
    return p.parse_args()


def main():
    args = parse_args()
    input_path = Path(args.input)
    if not input_path.exists():
        raise FileNotFoundError(f"Input CSV not found: {input_path}")
    df = pd.read_csv(input_path)
    missing = set(FEATURE_ORDER) - set(df.columns)
    if missing:
        raise ValueError(f"Missing required feature columns: {missing}")
    model = joblib.load(args.model)
    probs = model.predict_proba(df[FEATURE_ORDER])
    labels = model.classes_[probs.argmax(axis=1)]
    conf = probs.max(axis=1)
    out_df = df.copy()
    out_df["predicted_risk_level"] = labels
    out_df["confidence"] = conf
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    out_df.to_csv(output_path, index=False)
    print(f"Predictions written to {output_path}")


if __name__ == "__main__":
    main()
