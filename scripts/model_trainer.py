"""CLI script to train the ESG risk classification pipeline and persist artifact + metadata.

Usage (PowerShell):
  python scripts/train_pipeline.py --input data/processed/cleaned_dataset.csv \
         --output models/esg_risk_model.joblib

If no processed dataset exists, you can point --input to raw dataset after cleaning steps
mirroring notebook 04_esg_risk_prediction.
"""
from __future__ import annotations
import argparse
from pathlib import Path
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import joblib

from backend.model import FEATURE_COLUMNS, save_metadata

# Mapping from possible raw/spaced column headers to canonical snake_case feature names
RAW_TO_CANONICAL = {
    "Environment Risk Score": "environment_risk_score",
    "Social Risk Score": "social_risk_score",
    "Governance Risk Score": "governance_risk_score",
    "Controversy Score": "controversy_score",
    "Full Time Employees": "full_time_employees",
    # Already snake_case entries will be kept if present
}

RISK_LEVEL_CANDIDATES = ["risk_level", "ESG Risk Level", "esg_risk_level"]


def canonicalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    # First trim whitespace
    df.columns = [c.strip() for c in df.columns]
    # Rename known raw headers
    rename_map = {raw: canon for raw, canon in RAW_TO_CANONICAL.items() if raw in df.columns}
    df = df.rename(columns=rename_map)
    # If risk_level not present but any candidate exists, rename it
    if "risk_level" not in df.columns:
        for cand in RISK_LEVEL_CANDIDATES:
            if cand in df.columns:
                df = df.rename(columns={cand: "risk_level"})
                break
    return df


def derive_risk_level_if_missing(df: pd.DataFrame) -> pd.DataFrame:
    if "risk_level" in df.columns:
        return df
    # Derive from total score if available
    total_cols = [c for c in df.columns if c.lower().startswith("total") and "risk" in c.lower()]
    if total_cols:
        total_col = total_cols[0]
        # Define simple bins (adjust as needed)
        bins = [ -1, 20, 40, 60, 80, 200 ]
        labels = ["Very Low", "Low", "Medium", "High", "Severe"]
        df["risk_level"] = pd.cut(df[total_col], bins=bins, labels=labels)
    else:
        raise SystemExit("Unable to find or derive risk_level. Provide a column 'ESG Risk Level' or 'risk_level'.")
    return df


def coerce_numeric(df: pd.DataFrame, cols) -> pd.DataFrame:
    for c in cols:
        if c in df.columns:
            df[c] = (df[c]
                     .astype(str)
                     .str.replace(",", "", regex=False)
                     .str.strip()
                     .replace({"": None})
            )
            df[c] = pd.to_numeric(df[c], errors="coerce")
    return df


def prepare_dataset(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    df = canonicalize_columns(df)
    df = derive_risk_level_if_missing(df)
    expected = set(FEATURE_COLUMNS)
    missing_feats = expected - set(df.columns)
    if missing_feats:
        # Attempt another pass: lower-case / snake-case heuristics
        lower_map = {c.lower().replace(" ", "_"): c for c in df.columns}
        recovered = []
        for feat in list(missing_feats):
            if feat in lower_map:
                df = df.rename(columns={lower_map[feat]: feat})
                recovered.append(feat)
        missing_feats -= set(recovered)
    if missing_feats:
        raise SystemExit(f"Missing feature columns after normalization: {missing_feats}")

    # Coerce numerics
    df = coerce_numeric(df, FEATURE_COLUMNS)
    # Drop rows with all feature columns null
    df = df.dropna(subset=FEATURE_COLUMNS, how="all")
    # Impute remaining numeric NaNs with column medians
    medians = df[FEATURE_COLUMNS].median(numeric_only=True)
    df[FEATURE_COLUMNS] = df[FEATURE_COLUMNS].fillna(medians)
    # Ensure risk_level is string
    df["risk_level"] = df["risk_level"].astype(str)
    return df


def build_pipeline() -> Pipeline:
    return Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            (
                "rf",
                RandomForestClassifier(
                    n_estimators=300,
                    max_depth=None,
                    random_state=42,
                    n_jobs=-1,
                ),
            ),
        ]
    )


def main():
    parser = argparse.ArgumentParser(description="Train ESG risk Pipeline")
    parser.add_argument("--input", required=True, help="Path to processed CSV with features + risk_level column")
    parser.add_argument("--output", default="models/esg_risk_model.joblib", help="Destination joblib path")
    args = parser.parse_args()

    data_path = Path(args.input)
    if not data_path.exists():
        raise SystemExit(f"Input file not found: {data_path}")
    df = prepare_dataset(data_path)
    X = df[FEATURE_COLUMNS]
    y = df["risk_level"].astype(str)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    # Record training sklearn version for compatibility diagnostics
    try:  # pragma: no cover
        import sklearn  # type: ignore
        setattr(pipeline, "_training_sklearn_version", sklearn.__version__)
    except Exception:
        pass

    preds = pipeline.predict(X_test)
    print("\nClassification Report:\n")
    print(classification_report(y_test, preds))

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, out_path)
    print(f"Saved pipeline to {out_path}")

    # Write metadata JSON
    save_metadata(pipeline)
    print("Metadata file written alongside model.")


if __name__ == "__main__":
    main()
