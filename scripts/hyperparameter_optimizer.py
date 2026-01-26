"""Hyperparameter Optimization Module

Automated hyperparameter tuning using Optuna with cross-validation
and MLflow experiment tracking.
"""
import optuna
from optuna.integration.sklearn import OptunaSearchCV
from optuna.visualization import (
    plot_optimization_history,
    plot_param_importances,
    plot_parallel_coordinate,
)
import pandas as pd
import numpy as np
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import f1_score, make_scorer
from pathlib import Path
import joblib
import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime

from settings import config

try:
    import mlflow
    import mlflow.sklearn
    MLFLOW_AVAILABLE = True
except ImportError:
    MLFLOW_AVAILABLE = False

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger(__name__)


class HyperparameterTuner:
    """Optimizes model hyperparameters using Optuna."""
    
    def __init__(
        self,
        n_trials: int = 100,
        cv_folds: int = 5,
        timeout: Optional[int] = None,
        random_state: int = 42
    ):
        """
        Initialize tuner.
        
        Args:
            n_trials: Number of optimization trials
            cv_folds: Number of cross-validation folds
            timeout: Max optimization time in seconds
            random_state: Random seed
        """
        self.n_trials = n_trials
        self.cv_folds = cv_folds
        self.timeout = timeout
        self.random_state = random_state
        self.study = None
        self.best_params = None
        self.best_score = None
    
    def objective(self, trial: optuna.Trial, X: np.ndarray, y: np.ndarray) -> float:
        """
        Optuna objective function for optimization.
        
        Args:
            trial: Optuna trial object
            X: Feature matrix
            y: Target labels
            
        Returns:
            Cross-validated F1 score
        """
        # Suggest hyperparameters
        params = {
            "n_estimators": trial.suggest_int("n_estimators", 100, 1000, step=50),
            "max_depth": trial.suggest_int("max_depth", 5, 50),
            "min_samples_split": trial.suggest_int("min_samples_split", 2, 20),
            "min_samples_leaf": trial.suggest_int("min_samples_leaf", 1, 10),
            "max_features": trial.suggest_categorical(
                "max_features", ["sqrt", "log2", None]
            ),
            "class_weight": "balanced",
            "random_state": self.random_state,
            "n_jobs": -1,
        }
        
        # Create model
        model = RandomForestClassifier(**params)
        
        # Cross-validation
        cv = StratifiedKFold(n_splits=self.cv_folds, shuffle=True, random_state=self.random_state)
        scorer = make_scorer(f1_score, average='weighted')
        
        scores = cross_val_score(
            model, X, y,
            cv=cv,
            scoring=scorer,
            n_jobs=-1
        )
        
        # Log to MLflow if available
        if MLFLOW_AVAILABLE:
            with mlflow.start_run(nested=True):
                mlflow.log_params(params)
                mlflow.log_metric("mean_f1_score", scores.mean())
                mlflow.log_metric("std_f1_score", scores.std())
        
        return scores.mean()
    
    def optimize(
        self,
        X: pd.DataFrame,
        y: pd.Series,
        study_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Run hyperparameter optimization.
        
        Args:
            X: Feature dataframe
            y: Target series
            study_name: Optional study name for tracking
            
        Returns:
            Dictionary with best parameters and score
        """
        logger.info(f"Starting hyperparameter optimization with {self.n_trials} trials")
        
        # Create study
        study_name = study_name or f"esg_optimization_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        self.study = optuna.create_study(
            study_name=study_name,
            direction="maximize",
            sampler=optuna.samplers.TPESampler(seed=self.random_state),
        )
        
        # Optimize
        self.study.optimize(
            lambda trial: self.objective(trial, X.values, y.values),
            n_trials=self.n_trials,
            timeout=self.timeout,
            show_progress_bar=True,
        )
        
        # Get best parameters
        self.best_params = self.study.best_params
        self.best_score = self.study.best_value
        
        logger.info(f"Optimization complete!")
        logger.info(f"Best F1 score: {self.best_score:.4f}")
        logger.info(f"Best parameters: {self.best_params}")
        
        return {
            "best_params": self.best_params,
            "best_score": self.best_score,
            "n_trials": len(self.study.trials),
        }
    
    def train_best_model(
        self,
        X: pd.DataFrame,
        y: pd.Series,
        output_path: Optional[Path] = None
    ) -> RandomForestClassifier:
        """
        Train model with best parameters.
        
        Args:
            X: Feature dataframe
            y: Target series
            output_path: Optional path to save model
            
        Returns:
            Trained model
        """
        if self.best_params is None:
            raise ValueError("Run optimize() first to find best parameters")
        
        logger.info("Training model with optimized parameters")
        
        # Add required params
        params = self.best_params.copy()
        params.update({
            "class_weight": "balanced",
            "random_state": self.random_state,
            "n_jobs": -1,
        })
        
        # Train model
        model = RandomForestClassifier(**params)
        model.fit(X, y)
        
        # Save if path provided
        if output_path:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            joblib.dump(model, output_path)
            logger.info(f"Saved optimized model to {output_path}")
            
            # Save parameters
            params_path = output_path.parent / "optimized_params.json"
            with open(params_path, 'w') as f:
                json.dump({
                    "best_params": self.best_params,
                    "best_score": self.best_score,
                    "timestamp": datetime.now().isoformat(),
                }, f, indent=2)
        
        return model
    
    def save_optimization_report(self, output_dir: Path):
        """
        Save optimization visualizations and report.
        
        Args:
            output_dir: Directory to save reports
        """
        if self.study is None:
            raise ValueError("Run optimize() first")
        
        output_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime(config.REPORT_TIMESTAMP_FORMAT)
        
        # Save optimization history plot
        try:
            fig = plot_optimization_history(self.study)
            fig.write_html(output_dir / f"optimization_history_{timestamp}.html")
        except Exception as e:
            logger.warning(f"Could not save optimization history: {e}")
        
        # Save parameter importance plot
        try:
            fig = plot_param_importances(self.study)
            fig.write_html(output_dir / f"param_importances_{timestamp}.html")
        except Exception as e:
            logger.warning(f"Could not save parameter importances: {e}")
        
        # Save parallel coordinate plot
        try:
            fig = plot_parallel_coordinate(self.study)
            fig.write_html(output_dir / f"parallel_coordinate_{timestamp}.html")
        except Exception as e:
            logger.warning(f"Could not save parallel coordinate: {e}")
        
        # Save trial data
        trials_df = self.study.trials_dataframe()
        trials_df.to_csv(output_dir / f"optimization_trials_{timestamp}.csv", index=False)
        
        logger.info(f"Saved optimization reports to {output_dir}")


def run_hyperparameter_tuning(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    n_trials: int = 100,
    save_model: bool = True
) -> Dict[str, Any]:
    """
    Convenience function to run full optimization pipeline.
    
    Args:
        X_train: Training features
        y_train: Training labels
        n_trials: Number of optimization trials
        save_model: Whether to save the optimized model
        
    Returns:
        Dictionary with optimization results
    """
    # Initialize tuner
    tuner = HyperparameterTuner(
        n_trials=n_trials,
        cv_folds=config.CV_FOLDS,
        timeout=config.OPTUNA_TIMEOUT_SECONDS,
        random_state=config.RANDOM_STATE,
    )
    
    # Run optimization
    results = tuner.optimize(X_train, y_train)
    
    # Train best model
    if save_model:
        model_path = config.MODELS_DIR / "esg_risk_optimized.joblib"
        tuner.train_best_model(X_train, y_train, output_path=model_path)
    
    # Save reports
    tuner.save_optimization_report(config.REPORTS_DIR / "hyperparameter_tuning")
    
    return results


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Hyperparameter Optimization")
    parser.add_argument("--input", type=Path, required=True, help="Training data CSV")
    parser.add_argument("--trials", type=int, default=100, help="Number of trials")
    parser.add_argument("--output", type=Path, help="Output model path")
    
    args = parser.parse_args()
    
    # Load data
    logger.info(f"Loading data from {args.input}")
    df = pd.read_csv(args.input)
    
    X = df[config.FEATURE_COLUMNS]
    y = df[config.TARGET_COLUMN]
    
    # Run optimization
    tuner = HyperparameterTuner(n_trials=args.trials)
    results = tuner.optimize(X, y)
    
    # Train and save best model
    output_path = args.output or config.MODELS_DIR / "esg_risk_optimized.joblib"
    tuner.train_best_model(X, y, output_path=output_path)
    tuner.save_optimization_report(config.REPORTS_DIR / "hyperparameter_tuning")
    
    logger.info("Optimization complete!")
