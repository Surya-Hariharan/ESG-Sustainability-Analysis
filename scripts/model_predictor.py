"""Model Prediction Module

Run batch or single predictions using trained ESG risk models.
Supports probability outputs and confidence scores.
"""
import pandas as pd
import numpy as np
from pathlib import Path
import argparse
import joblib
import json
from typing import Dict, List, Any, Optional, Union
import logging
from datetime import datetime

from settings import config

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger(__name__)


class ESGRiskPredictor:
    """Handles ESG risk predictions with trained models."""
    
    def __init__(self, model_path: Optional[Path] = None):
        """
        Initialize predictor.
        
        Args:
            model_path: Path to model artifact (uses default if None)
        """
        self.model_path = model_path or config.MODEL_ARTIFACT
        self.model = None
        self.metadata = None
        self.load_model()
    
    def load_model(self):
        """Load model and metadata."""
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Model not found at {self.model_path}. Train model first."
            )
        
        logger.info(f"Loading model from {self.model_path}")
        self.model = joblib.load(self.model_path)
        
        # Load metadata if available
        metadata_path = self.model_path.parent / "model_metadata.json"
        if metadata_path.exists():
            with open(metadata_path, 'r') as f:
                self.metadata = json.load(f)
            logger.info(f"Loaded model metadata: {self.metadata.get('model_type', 'Unknown')}")
    
    def predict_single(
        self,
        environment_risk_score: float,
        social_risk_score: float,
        governance_risk_score: float,
        controversy_score: float,
        full_time_employees: int
    ) -> Dict[str, Any]:
        """
        Predict risk for a single company.
        
        Args:
            environment_risk_score: Environmental risk score
            social_risk_score: Social risk score
            governance_risk_score: Governance risk score
            controversy_score: Controversy score
            full_time_employees: Number of full-time employees
            
        Returns:
            Dictionary with prediction, confidence, and probabilities
        """
        features = pd.DataFrame([{
            "environment_risk_score": environment_risk_score,
            "social_risk_score": social_risk_score,
            "governance_risk_score": governance_risk_score,
            "controversy_score": controversy_score,
            "full_time_employees": full_time_employees,
        }])
        
        return self._predict_with_confidence(features)[0]
    
    def predict_batch(
        self,
        data: Union[pd.DataFrame, Path, str],
        output_path: Optional[Path] = None
    ) -> pd.DataFrame:
        """
        Predict risk for multiple companies.
        
        Args:
            data: DataFrame or path to CSV with feature columns
            output_path: Optional path to save predictions
            
        Returns:
            DataFrame with predictions and confidence scores
        """
        # Load data if path provided
        if isinstance(data, (Path, str)):
            logger.info(f"Loading data from {data}")
            df = pd.read_csv(data)
        else:
            df = data.copy()
        
        # Validate required columns
        missing_cols = set(config.FEATURE_COLUMNS) - set(df.columns)
        if missing_cols:
            raise ValueError(f"Missing required columns: {missing_cols}")
        
        # Make predictions
        logger.info(f"Predicting for {len(df)} rows")
        predictions = self._predict_with_confidence(df[config.FEATURE_COLUMNS])
        
        # Add predictions to dataframe
        result_df = df.copy()
        result_df["predicted_risk_level"] = [p["prediction"] for p in predictions]
        result_df["confidence"] = [p["confidence"] for p in predictions]
        
        # Add probability columns
        if predictions and "probabilities" in predictions[0]:
            for class_name in predictions[0]["probabilities"].keys():
                result_df[f"prob_{class_name}"] = [
                    p["probabilities"][class_name] for p in predictions
                ]
        
        # Save if output path provided
        if output_path:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            result_df.to_csv(output_path, index=False)
            logger.info(f"Saved predictions to {output_path}")
        
        return result_df
    
    def _predict_with_confidence(self, features: pd.DataFrame) -> List[Dict[str, Any]]:
        """Make predictions with confidence scores."""
        # Get probability predictions
        probs = self.model.predict_proba(features)
        classes = self.model.classes_
        
        # Get predicted class (highest probability)
        pred_idx = probs.argmax(axis=1)
        predictions = classes[pred_idx]
        
        # Confidence is the maximum probability
        confidences = probs.max(axis=1)
        
        # Build result list
        results = []
        for i in range(len(features)):
            result = {
                "prediction": predictions[i],
                "confidence": float(confidences[i]),
                "probabilities": {
                    str(class_name): float(probs[i, j])
                    for j, class_name in enumerate(classes)
                }
            }
            results.append(result)
        
        return results
    
    def generate_prediction_report(
        self,
        predictions_df: pd.DataFrame,
        output_dir: Path
    ):
        """
        Generate comprehensive prediction report.
        
        Args:
            predictions_df: DataFrame with predictions
            output_dir: Directory to save reports
        """
        output_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime(config.REPORT_TIMESTAMP_FORMAT)
        
        # Summary statistics
        summary = {
            "total_predictions": len(predictions_df),
            "timestamp": timestamp,
            "risk_distribution": predictions_df["predicted_risk_level"].value_counts().to_dict(),
            "avg_confidence": float(predictions_df["confidence"].mean()),
            "low_confidence_count": int((predictions_df["confidence"] < 0.7).sum()),
        }
        
        # Save summary JSON
        summary_path = output_dir / f"prediction_summary_{timestamp}.json"
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        logger.info(f"Saved prediction summary to {summary_path}")
        
        # Save detailed CSV
        csv_path = output_dir / f"predictions_detailed_{timestamp}.csv"
        predictions_df.to_csv(csv_path, index=False)
        
        logger.info(f"Saved detailed predictions to {csv_path}")


def main():
    """CLI entry point for batch predictions."""
    parser = argparse.ArgumentParser(
        description="ESG Risk Prediction - Batch Processing"
    )
    parser.add_argument(
        "--input",
        required=True,
        type=Path,
        help="Path to CSV file with company features"
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=config.REPORTS_DIR / "predictions.csv",
        help="Output path for predictions CSV"
    )
    parser.add_argument(
        "--model",
        type=Path,
        default=config.MODEL_ARTIFACT,
        help="Path to trained model artifact"
    )
    parser.add_argument(
        "--report",
        action="store_true",
        help="Generate detailed prediction report"
    )
    
    args = parser.parse_args()
    
    # Initialize predictor
    predictor = ESGRiskPredictor(model_path=args.model)
    
    # Run predictions
    predictions_df = predictor.predict_batch(
        data=args.input,
        output_path=args.output
    )
    
    # Generate report if requested
    if args.report:
        predictor.generate_prediction_report(
            predictions_df=predictions_df,
            output_dir=config.REPORTS_DIR
        )
    
    logger.info("Prediction complete!")
    logger.info(f"Risk distribution: {predictions_df['predicted_risk_level'].value_counts().to_dict()}")


if __name__ == "__main__":
    main()
