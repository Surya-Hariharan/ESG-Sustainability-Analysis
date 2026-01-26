"""MLflow configuration and utilities for experiment tracking."""
import os
import mlflow
import mlflow.sklearn
from pathlib import Path
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class MLflowConfig:
    """MLflow configuration and utilities."""

    def __init__(self):
        self.tracking_uri = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
        self.experiment_name = os.getenv("MLFLOW_EXPERIMENT_NAME", "esg-risk-prediction")
        self._setup_mlflow()

    def _setup_mlflow(self):
        """Initialize MLflow tracking."""
        mlflow.set_tracking_uri(self.tracking_uri)
        
        # Create experiment if it doesn't exist
        try:
            experiment = mlflow.get_experiment_by_name(self.experiment_name)
            if experiment is None:
                mlflow.create_experiment(self.experiment_name)
            mlflow.set_experiment(self.experiment_name)
            logger.info(f"MLflow tracking configured: {self.tracking_uri}")
        except Exception as e:
            logger.warning(f"MLflow setup failed: {e}")

    def start_run(self, run_name: Optional[str] = None) -> mlflow.ActiveRun:
        """Start a new MLflow run."""
        return mlflow.start_run(run_name=run_name)

    def log_params(self, params: Dict[str, Any]):
        """Log parameters to MLflow."""
        try:
            mlflow.log_params(params)
        except Exception as e:
            logger.warning(f"Failed to log params: {e}")

    def log_metrics(self, metrics: Dict[str, float], step: Optional[int] = None):
        """Log metrics to MLflow."""
        try:
            mlflow.log_metrics(metrics, step=step)
        except Exception as e:
            logger.warning(f"Failed to log metrics: {e}")

    def log_model(self, model, artifact_path: str = "model", **kwargs):
        """Log model to MLflow."""
        try:
            mlflow.sklearn.log_model(model, artifact_path, **kwargs)
            logger.info(f"Model logged to MLflow: {artifact_path}")
        except Exception as e:
            logger.error(f"Failed to log model: {e}")

    def log_artifact(self, local_path: str, artifact_path: Optional[str] = None):
        """Log artifact to MLflow."""
        try:
            mlflow.log_artifact(local_path, artifact_path)
        except Exception as e:
            logger.warning(f"Failed to log artifact: {e}")

    def log_figure(self, figure, artifact_file: str):
        """Log matplotlib/plotly figure to MLflow."""
        try:
            mlflow.log_figure(figure, artifact_file)
        except Exception as e:
            logger.warning(f"Failed to log figure: {e}")

    def set_tags(self, tags: Dict[str, str]):
        """Set tags for the current run."""
        try:
            mlflow.set_tags(tags)
        except Exception as e:
            logger.warning(f"Failed to set tags: {e}")

    def end_run(self):
        """End the current MLflow run."""
        mlflow.end_run()

    def load_model(self, run_id: str, artifact_path: str = "model"):
        """Load a model from MLflow."""
        try:
            model_uri = f"runs:/{run_id}/{artifact_path}"
            return mlflow.sklearn.load_model(model_uri)
        except Exception as e:
            logger.error(f"Failed to load model from MLflow: {e}")
            return None


# Global MLflow instance
_mlflow_config = None


def get_mlflow_config() -> MLflowConfig:
    """Get or create MLflow configuration singleton."""
    global _mlflow_config
    if _mlflow_config is None:
        _mlflow_config = MLflowConfig()
    return _mlflow_config


def log_training_run(
    model,
    params: Dict[str, Any],
    metrics: Dict[str, float],
    artifacts: Optional[Dict[str, str]] = None,
    run_name: Optional[str] = None
):
    """
    Log a complete training run to MLflow.
    
    Args:
        model: Trained model to log
        params: Hyperparameters used for training
        metrics: Performance metrics
        artifacts: Dict of artifact_name: local_path to log
        run_name: Name for the MLflow run
    """
    config = get_mlflow_config()
    
    with config.start_run(run_name=run_name):
        # Log parameters
        config.log_params(params)
        
        # Log metrics
        config.log_metrics(metrics)
        
        # Log model
        config.log_model(model)
        
        # Log artifacts
        if artifacts:
            for artifact_name, local_path in artifacts.items():
                if os.path.exists(local_path):
                    config.log_artifact(local_path)
        
        # Add tags
        config.set_tags({
            "project": "esg-sustainability",
            "model_type": type(model).__name__
        })
        
        logger.info("Training run logged to MLflow successfully")
