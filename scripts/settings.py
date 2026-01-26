"""Application Configuration Settings

Centralized configuration for ESG analysis scripts including paths,
model parameters, and processing settings.
"""
from pathlib import Path
from typing import Dict, Any
import os


class ScriptConfig:
    """Configuration class for ESG analysis scripts."""
    
    # Project Paths
    PROJECT_ROOT = Path(__file__).parent.parent
    DATA_DIR = PROJECT_ROOT / "data"
    RAW_DATA_DIR = DATA_DIR / "raw"
    PROCESSED_DATA_DIR = DATA_DIR / "processed"
    MODELS_DIR = PROJECT_ROOT / "models"
    REPORTS_DIR = PROJECT_ROOT / "reports"
    LOGS_DIR = PROJECT_ROOT / "logs"
    
    # Data Files
    RAW_DATASET = RAW_DATA_DIR / "dataset.csv"
    CLEANED_DATASET = PROCESSED_DATA_DIR / "esg_data_cleaned.csv"
    TRAINING_DATASET = PROCESSED_DATA_DIR / "esg_model_training.csv"
    
    # Model Files
    MODEL_ARTIFACT = MODELS_DIR / "esg_risk_pipeline.joblib"
    MODEL_METADATA = MODELS_DIR / "model_metadata.json"
    SCALER_ARTIFACT = MODELS_DIR / "feature_scaler.joblib"
    
    # Feature Configuration
    FEATURE_COLUMNS = [
        "environment_risk_score",
        "social_risk_score",
        "governance_risk_score",
        "controversy_score",
        "full_time_employees",
    ]
    
    TARGET_COLUMN = "esg_risk_level"
    
    # Model Training Parameters
    RANDOM_STATE = 42
    TEST_SIZE = 0.2
    VALIDATION_SIZE = 0.15
    CV_FOLDS = 5
    
    # Random Forest Default Parameters
    RF_N_ESTIMATORS = 500
    RF_MAX_DEPTH = 20
    RF_MIN_SAMPLES_SPLIT = 10
    RF_MIN_SAMPLES_LEAF = 4
    RF_MAX_FEATURES = "sqrt"
    
    # Hyperparameter Tuning
    OPTUNA_N_TRIALS = 100
    OPTUNA_TIMEOUT_SECONDS = 3600  # 1 hour
    OPTUNA_N_JOBS = -1  # Use all CPUs
    
    # MLflow Configuration
    MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "file:./mlruns")
    MLFLOW_EXPERIMENT_NAME = "ESG_Risk_Prediction"
    
    # Processing Configuration
    CHUNK_SIZE = 10_000
    N_JOBS = -1  # Parallel processing
    VERBOSE = 1
    
    # Report Configuration
    REPORT_FORMATS = ["csv", "json", "html"]
    REPORT_TIMESTAMP_FORMAT = "%Y%m%d_%H%M%S"
    
    # AI Agent Configuration (Crew AI + Groq)
    GROQ_MODEL = os.getenv("GROQ_MODEL", "mixtral-8x7b-32768")
    CREW_AI_VERBOSE = True
    CREW_AI_MEMORY = True
    MAX_ITERATIONS = 10
    
    @classmethod
    def ensure_directories(cls):
        """Create necessary directories if they don't exist."""
        for dir_path in [
            cls.DATA_DIR,
            cls.RAW_DATA_DIR,
            cls.PROCESSED_DATA_DIR,
            cls.MODELS_DIR,
            cls.REPORTS_DIR,
            cls.LOGS_DIR,
        ]:
            dir_path.mkdir(parents=True, exist_ok=True)
    
    @classmethod
    def get_model_params(cls) -> Dict[str, Any]:
        """Get default Random Forest parameters."""
        return {
            "n_estimators": cls.RF_N_ESTIMATORS,
            "max_depth": cls.RF_MAX_DEPTH,
            "min_samples_split": cls.RF_MIN_SAMPLES_SPLIT,
            "min_samples_leaf": cls.RF_MIN_SAMPLES_LEAF,
            "max_features": cls.RF_MAX_FEATURES,
            "random_state": cls.RANDOM_STATE,
            "class_weight": "balanced",
            "n_jobs": cls.N_JOBS,
            "verbose": cls.VERBOSE,
        }
    
    @classmethod
    def get_hyperparam_space(cls) -> Dict[str, Any]:
        """Get hyperparameter search space for Optuna."""
        return {
            "n_estimators": (100, 1000),
            "max_depth": (10, 50),
            "min_samples_split": (2, 20),
            "min_samples_leaf": (1, 10),
            "max_features": ["sqrt", "log2", None],
        }


# Global config instance
config = ScriptConfig()
