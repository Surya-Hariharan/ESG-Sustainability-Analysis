"""Train ESG Risk Level prediction model and persist artifact.

The model predicts categorical ESG risk level (e.g., Low / Medium / High) based on
numeric features. Adjust LABEL_COLUMN if your dataset uses a different field.

Usage:
  python scripts/train_model.py --input data/processed/esg_model_training.csv --output models/esg_risk_model.joblib
"""
from pathlib import Path
import argparse
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib

FEATURES = [
    "environment_risk_score",
    "social_risk_score",
    "governance_risk_score",
    "controversy_score",
    "full_time_employees",
]
LABEL_COLUMN = "esg_risk_level"


def parse_args():
    p = argparse.ArgumentParser(description="Train ESG risk prediction model")
    p.add_argument("--input", required=True, help="Path to training CSV")
    p.add_argument("--output", default="models/esg_risk_model.joblib", help="Output model path")
    p.add_argument("--test-size", type=float, default=0.2, help="Test split fraction")
    p.add_argument("--n-estimators", type=int, default=400)
    return p.parse_args()


def main():
    args = parse_args()
    input_path = Path(args.input)
    if not input_path.exists():
        raise FileNotFoundError(f"Training file not found: {input_path}")
    df = pd.read_csv(input_path)
    missing = set(FEATURES + [LABEL_COLUMN]) - set(df.columns)
    if missing:
        raise ValueError(f"Input file missing required columns: {missing}")
    X = df[FEATURES]
    y = df[LABEL_COLUMN]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=args.test_size, stratify=y, random_state=42)
    model = RandomForestClassifier(n_estimators=args.n_estimators, random_state=42, class_weight="balanced")
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    print(classification_report(y_test, preds))
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, output_path)
    print(f"Model saved to {output_path}")


if __name__ == "__main__":
    main()
