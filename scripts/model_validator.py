"""Model validation and testing utilities."""
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Tuple, Any
import logging
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)
import joblib

logger = logging.getLogger(__name__)


class ModelValidator:
    """Validate trained models against test data and benchmarks."""

    def __init__(self, model_path: str, test_data_path: str):
        """
        Initialize model validator.
        
        Args:
            model_path: Path to the trained model file
            test_data_path: Path to test dataset
        """
        self.model_path = Path(model_path)
        self.test_data_path = Path(test_data_path)
        self.model = None
        self.test_data = None
        self.X_test = None
        self.y_test = None

    def load_model(self):
        """Load the trained model."""
        try:
            self.model = joblib.load(self.model_path)
            logger.info(f"Model loaded from {self.model_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            return False

    def load_test_data(self):
        """Load and prepare test data."""
        try:
            self.test_data = pd.read_csv(self.test_data_path)
            
            # Assuming standard ESG features
            feature_cols = [
                'environment_risk_score',
                'social_risk_score',
                'governance_risk_score',
                'controversy_score',
                'full_time_employees'
            ]
            target_col = 'risk_level'
            
            self.X_test = self.test_data[feature_cols]
            self.y_test = self.test_data[target_col]
            
            logger.info(f"Test data loaded: {len(self.test_data)} samples")
            return True
        except Exception as e:
            logger.error(f"Failed to load test data: {e}")
            return False

    def validate(self) -> Dict[str, Any]:
        """
        Run comprehensive model validation.
        
        Returns:
            Dictionary containing validation metrics and results
        """
        if not self.load_model() or not self.load_test_data():
            return {"status": "failed", "error": "Failed to load model or data"}

        try:
            # Make predictions
            y_pred = self.model.predict(self.X_test)
            y_pred_proba = self.model.predict_proba(self.X_test)

            # Calculate metrics
            metrics = {
                "accuracy": accuracy_score(self.y_test, y_pred),
                "precision": precision_score(self.y_test, y_pred, average='weighted', zero_division=0),
                "recall": recall_score(self.y_test, y_pred, average='weighted', zero_division=0),
                "f1_score": f1_score(self.y_test, y_pred, average='weighted', zero_division=0),
            }

            # Classification report
            class_report = classification_report(
                self.y_test,
                y_pred,
                output_dict=True,
                zero_division=0
            )

            # Confusion matrix
            conf_matrix = confusion_matrix(self.y_test, y_pred)

            # Data quality checks
            data_checks = self._run_data_checks()

            # Model performance checks
            performance_checks = self._run_performance_checks(metrics)

            results = {
                "status": "success",
                "metrics": metrics,
                "classification_report": class_report,
                "confusion_matrix": conf_matrix.tolist(),
                "data_checks": data_checks,
                "performance_checks": performance_checks,
                "test_samples": len(self.X_test),
            }

            logger.info(f"Model validation completed. Accuracy: {metrics['accuracy']:.4f}")
            return results

        except Exception as e:
            logger.error(f"Validation failed: {e}")
            return {"status": "failed", "error": str(e)}

    def _run_data_checks(self) -> Dict[str, Any]:
        """Run data quality checks."""
        checks = {}
        
        # Check for missing values
        checks["missing_values"] = self.X_test.isnull().sum().to_dict()
        checks["has_missing"] = self.X_test.isnull().any().any()
        
        # Check for duplicates
        checks["duplicate_rows"] = self.X_test.duplicated().sum()
        
        # Check value ranges
        checks["value_ranges"] = {
            col: {"min": float(self.X_test[col].min()), "max": float(self.X_test[col].max())}
            for col in self.X_test.columns
        }
        
        # Check class distribution
        checks["class_distribution"] = self.y_test.value_counts().to_dict()
        
        return checks

    def _run_performance_checks(self, metrics: Dict[str, float]) -> Dict[str, bool]:
        """Run performance threshold checks."""
        # Define minimum acceptable thresholds
        thresholds = {
            "accuracy": 0.70,
            "precision": 0.65,
            "recall": 0.65,
            "f1_score": 0.65,
        }
        
        checks = {}
        for metric, threshold in thresholds.items():
            checks[f"{metric}_acceptable"] = metrics[metric] >= threshold
        
        checks["all_checks_passed"] = all(checks.values())
        
        return checks

    def generate_report(self, output_path: str = "model_validation_report.txt"):
        """Generate a human-readable validation report."""
        results = self.validate()
        
        if results["status"] == "failed":
            logger.error("Validation failed, cannot generate report")
            return
        
        report_lines = [
            "=" * 80,
            "MODEL VALIDATION REPORT",
            "=" * 80,
            f"\nModel: {self.model_path}",
            f"Test Data: {self.test_data_path}",
            f"Test Samples: {results['test_samples']}",
            "\n" + "=" * 80,
            "PERFORMANCE METRICS",
            "=" * 80,
        ]
        
        for metric, value in results["metrics"].items():
            report_lines.append(f"{metric.upper()}: {value:.4f}")
        
        report_lines.extend([
            "\n" + "=" * 80,
            "PERFORMANCE CHECKS",
            "=" * 80,
        ])
        
        for check, passed in results["performance_checks"].items():
            status = "✓ PASS" if passed else "✗ FAIL"
            report_lines.append(f"{check}: {status}")
        
        report_lines.extend([
            "\n" + "=" * 80,
            "DATA QUALITY CHECKS",
            "=" * 80,
            f"Missing values: {results['data_checks']['has_missing']}",
            f"Duplicate rows: {results['data_checks']['duplicate_rows']}",
        ])
        
        report_text = "\n".join(report_lines)
        
        # Save to file
        with open(output_path, "w") as f:
            f.write(report_text)
        
        logger.info(f"Validation report saved to {output_path}")
        print(report_text)


def validate_model_cli():
    """Command-line interface for model validation."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Validate ESG risk prediction model")
    parser.add_argument("--model", required=True, help="Path to model file")
    parser.add_argument("--test-data", required=True, help="Path to test data CSV")
    parser.add_argument("--output", default="model_validation_report.txt", help="Output report path")
    
    args = parser.parse_args()
    
    validator = ModelValidator(args.model, args.test_data)
    validator.generate_report(args.output)


if __name__ == "__main__":
    validate_model_cli()
