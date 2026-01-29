# 🤖 Machine Learning Model Design

## Overview
The ESG Risk Prediction Model classifies companies into risk categories (Very Low to Severe) based on their sustainability metrics.

## 🧠 Algorithm: Random Forest 
We utilize a **Random Forest Classifier** (`sklearn.ensemble.RandomForestClassifier`), an ensemble learning method that fits multiple decision trees.

### Configuration
- **Estimators**: 300 Trees (Robust against overfitting)
- **Criterion**: Gini Impurity
- **Max Depth**: None (Trees grow fully)
- **Stratification**: Training splits maintain class distribution

## 🛠️ Feature Engineering

### Input Features
The model trains on 5 key quantitative metrics:
1. **Environment Risk Score** (Numeric)
2. **Social Risk Score** (Numeric)
3. **Governance Risk Score** (Numeric)
4. **Controversy Score** (Numeric, 0-100)
5. **Full Time Employees** (Numeric proxy for company size)

### Preprocessing Pipeline
Implemented via `sklearn.pipeline.Pipeline`:
1. **Cleaning**:
   - Snake_case normalization of column names.
   - Removal of commas in numeric strings.
2. **Imputation**:
   - Missing values filled with column **median** (robust to outliers).
3. **Scaling**:
   - `StandardScaler()`: Standardizes features by removing the mean and scaling to unit variance.

## 🎯 Target Variable
**`risk_level`** (Categorical)
- **Classes**: `Very Low`, `Low`, `Medium`, `High`, `Severe`
- **Derivation**: If missing, derived from Total ESG Score binning:
  - 0-20: Very Low
  - 20-40: Low
  - 40-60: Medium
  - 60-80: High
  - 80+: Severe

## 📄 Model Persistence
- **Format**: `.joblib` (Efficient for sklearn objects)
- **Metadata**: JSON file saved alongside model containing features and version info.
- **Location**: `models/esg_risk_model.joblib`

## 🔄 Training Pipeline
Run via `scripts/model_trainer.py`:
1. Load CSV Data
2. Clean & Preprocess
3. Split (80% Train / 20% Test)
4. Train Pipeline
5. Evaluate (Precision, Recall, F1-Score)
6. Serialize Model
