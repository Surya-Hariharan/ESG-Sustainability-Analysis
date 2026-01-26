"""Data Preprocessing Module

Comprehensive data cleaning, transformation, and feature engineering
for ESG sustainability analysis.
"""
import pandas as pd
import numpy as np
from typing import Optional, List, Dict, Any
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class ESGDataPreprocessor:
    """Handles all data preprocessing operations for ESG datasets."""
    
    def __init__(self, remove_outliers: bool = True, fill_strategy: str = "median"):
        """
        Initialize preprocessor.
        
        Args:
            remove_outliers: Whether to remove statistical outliers
            fill_strategy: Strategy for filling missing values ('median', 'mean', 'zero')
        """
        self.remove_outliers = remove_outliers
        self.fill_strategy = fill_strategy
        self.statistics: Dict[str, Any] = {}
    
    def clean_dataset(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Comprehensive cleaning pipeline.
        
        Args:
            df: Raw dataframe
            
        Returns:
            Cleaned dataframe
        """
        logger.info(f"Starting data cleaning. Initial shape: {df.shape}")
        
        df = df.copy()
        
        # Step 1: Remove exact duplicates
        initial_rows = len(df)
        df = df.drop_duplicates()
        logger.info(f"Removed {initial_rows - len(df)} duplicate rows")
        
        # Step 2: Clean column names
        df = self._clean_column_names(df)
        
        # Step 3: Handle missing values
        df = self._handle_missing_values(df)
        
        # Step 4: Type conversion and validation
        df = self._convert_data_types(df)
        
        # Step 5: Remove outliers if enabled
        if self.remove_outliers:
            df = self._remove_outliers(df)
        
        # Step 6: Normalize text fields
        df = self._normalize_text_fields(df)
        
        # Step 7: Feature engineering
        df = self._engineer_features(df)
        
        logger.info(f"Cleaning complete. Final shape: {df.shape}")
        return df
    
    def _clean_column_names(self, df: pd.DataFrame) -> pd.DataFrame:
        """Standardize column names to snake_case."""
        df.columns = df.columns.str.strip()
        
        # Map common column variations to standard names
        column_mapping = {
            "Environment Risk Score": "environment_risk_score",
            "Social Risk Score": "social_risk_score",
            "Governance Risk Score": "governance_risk_score",
            "Controversy Score": "controversy_score",
            "Controversy Level": "controversy_level",
            "Full Time Employees": "full_time_employees",
            "Total ESG Risk score": "total_esg_risk_score",
            "ESG Risk Level": "esg_risk_level",
            "ESG Risk Percentile": "esg_risk_percentile",
            "Symbol": "symbol",
            "Name": "name",
            "Sector": "sector",
            "Industry": "industry",
            "Address": "address",
            "Description": "description",
        }
        
        df = df.rename(columns=column_mapping)
        return df
    
    def _handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handle missing values based on fill strategy."""
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        text_cols = df.select_dtypes(include=['object']).columns
        
        # Numeric columns
        if self.fill_strategy == "median":
            for col in numeric_cols:
                if df[col].isna().any():
                    fill_value = df[col].median()
                    df[col] = df[col].fillna(fill_value)
                    self.statistics[f"{col}_fill_value"] = fill_value
        elif self.fill_strategy == "mean":
            for col in numeric_cols:
                if df[col].isna().any():
                    fill_value = df[col].mean()
                    df[col] = df[col].fillna(fill_value)
                    self.statistics[f"{col}_fill_value"] = fill_value
        else:  # zero
            df[numeric_cols] = df[numeric_cols].fillna(0)
        
        # Text columns - fill with 'Unknown'
        df[text_cols] = df[text_cols].fillna("Unknown")
        
        return df
    
    def _convert_data_types(self, df: pd.DataFrame) -> pd.DataFrame:
        """Convert columns to appropriate data types."""
        # Numeric columns that should be floats
        float_cols = [
            "environment_risk_score",
            "social_risk_score",
            "governance_risk_score",
            "controversy_score",
            "total_esg_risk_score",
            "esg_risk_percentile",
        ]
        
        for col in float_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Full time employees as integer
        if "full_time_employees" in df.columns:
            # Remove commas and convert
            df["full_time_employees"] = (
                df["full_time_employees"]
                .astype(str)
                .str.replace(",", "")
                .str.strip()
            )
            df["full_time_employees"] = pd.to_numeric(
                df["full_time_employees"], errors='coerce'
            )
            # Cap at reasonable maximum
            df.loc[df["full_time_employees"] > 10_000_000, "full_time_employees"] = np.nan
            df.loc[df["full_time_employees"] < 0, "full_time_employees"] = np.nan
        
        return df
    
    def _remove_outliers(self, df: pd.DataFrame) -> pd.DataFrame:
        """Remove statistical outliers using IQR method."""
        numeric_cols = [
            "environment_risk_score",
            "social_risk_score",
            "governance_risk_score",
            "controversy_score",
        ]
        
        initial_rows = len(df)
        
        for col in numeric_cols:
            if col in df.columns:
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 3 * IQR
                upper_bound = Q3 + 3 * IQR
                df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
        
        logger.info(f"Removed {initial_rows - len(df)} outlier rows")
        return df
    
    def _normalize_text_fields(self, df: pd.DataFrame) -> pd.DataFrame:
        """Normalize text fields for consistency."""
        text_cols = ["sector", "industry", "controversy_level", "esg_risk_level"]
        
        for col in text_cols:
            if col in df.columns:
                df[col] = df[col].str.strip().str.title()
        
        # Standardize risk levels
        if "esg_risk_level" in df.columns:
            risk_mapping = {
                "Negligible": "Low",
                "Very Low": "Low",
                "Severe": "High",
                "Very High": "High",
            }
            df["esg_risk_level"] = df["esg_risk_level"].replace(risk_mapping)
        
        return df
    
    def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create additional features for modeling."""
        # Average ESG score
        if all(col in df.columns for col in ["environment_risk_score", "social_risk_score", "governance_risk_score"]):
            df["avg_esg_score"] = df[
                ["environment_risk_score", "social_risk_score", "governance_risk_score"]
            ].mean(axis=1)
        
        # Risk score variance
        if all(col in df.columns for col in ["environment_risk_score", "social_risk_score", "governance_risk_score"]):
            df["esg_score_variance"] = df[
                ["environment_risk_score", "social_risk_score", "governance_risk_score"]
            ].var(axis=1)
        
        # Company size category
        if "full_time_employees" in df.columns:
            df["company_size"] = pd.cut(
                df["full_time_employees"],
                bins=[0, 100, 1000, 10000, np.inf],
                labels=["Small", "Medium", "Large", "Enterprise"]
            )
        
        # High controversy flag
        if "controversy_score" in df.columns:
            df["high_controversy"] = (df["controversy_score"] > 50).astype(int)
        
        return df
    
    def get_statistics(self) -> Dict[str, Any]:
        """Return preprocessing statistics."""
        return self.statistics


def load_and_preprocess_data(
    input_path: Path,
    output_path: Optional[Path] = None,
    remove_outliers: bool = True,
    fill_strategy: str = "median"
) -> pd.DataFrame:
    """
    Load and preprocess ESG data.
    
    Args:
        input_path: Path to raw CSV file
        output_path: Optional path to save cleaned data
        remove_outliers: Whether to remove outliers
        fill_strategy: Missing value fill strategy
        
    Returns:
        Cleaned dataframe
    """
    logger.info(f"Loading data from {input_path}")
    df = pd.read_csv(input_path)
    
    preprocessor = ESGDataPreprocessor(
        remove_outliers=remove_outliers,
        fill_strategy=fill_strategy
    )
    
    df_clean = preprocessor.clean_dataset(df)
    
    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        df_clean.to_csv(output_path, index=False)
        logger.info(f"Saved cleaned data to {output_path}")
    
    return df_clean
