# 🌱 ESG-Sustainability Analysis Dashboard

[![Python](https://img.shields.io/badge/python-v3.10+-blue.svg)](https://www.python.org/downloads/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15+-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

An interactive ESG (Environmental, Social, Governance) analytics dashboard that helps analysts, investors, and sustainability officers evaluate ESG performance across companies and industries. This project integrates PostgreSQL for data management and Power BI/Dash for visualization.

## 🌟 Key Features

- Company-level ESG score analysis (Total ESG + E/S/G sub-scores)
- Sector and industry benchmarking
- Controversy risk assessment
- Interactive dashboards with filters for sector, company, and ESG risk level
- Optional ML model to predict ESG Risk Level (Low / Medium / High)

## 📁 Project Structure
```
├── backend/                # FastAPI application & database utilities
│   ├── app.py              # API entrypoint (analytics + prediction)
│   ├── db_config.py        # PostgreSQL connection configuration
│   ├── utils.py            # Reusable DB helpers
│   ├── model.py            # Model load & inference helpers
│   ├── schemas.py          # Pydantic request/response models
│   └── sql/                # SQL assets (schema, load, analysis queries)
├── data/
│   ├── raw/                # Original input dataset(s)
│   └── processed/          # Cleaned & feature engineered datasets
├── notebooks/              # Jupyter notebooks (cleaning, EDA, modeling, integration)
├── scripts/                # Automation scripts (load db, train model, predict)
├── reports/                # Generated reports, figures, prediction outputs
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (NOT COMMITTED)
└── README.md               # Project documentation
```

## 🗄️ Database Setup
1. Create a PostgreSQL database (default name: `esg_db`).
2. Populate a `.env` file at repo root:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=esg_db
DB_USER=postgres
DB_PASSWORD=yourpassword
```
3. Apply schema:
```
psql -h localhost -U postgres -d esg_db -f backend/sql/schema.sql
```
4. (Optional) Load data via COPY (adjust path first) using `backend/sql/load_data.sql`.

## 🚀 Running the API
Install dependencies then start FastAPI with Uvicorn:
```
pip install -r requirements.txt
python -m uvicorn backend.app:app --reload --port 8000
```
Open: http://localhost:8000/docs for interactive Swagger.

## 🤖 Training the Model
Prepare a processed CSV containing features:
Required columns: `environment_risk_score, social_risk_score, governance_risk_score, controversy_score, full_time_employees, esg_risk_level`
```
python scripts/train_model.py --input data/processed/esg_model_training.csv --output models/esg_risk_model.joblib
```
After training restart the API (it auto-loads the model at startup).

## 🔮 Making Predictions (Batch)
```
python scripts/predict.py --input data/processed/new_companies.csv --output reports/predictions/predictions.csv
```

Or via API:
```
POST /predict
{
	"environment_risk_score": 12.3,
	"social_risk_score": 18.4,
	"governance_risk_score": 10.2,
	"controversy_score": 25.0,
	"full_time_employees": 34000
}
```

## 📊 Key Endpoints
| Endpoint | Description |
|----------|-------------|
| `/health` | Health & readiness (DB + model) |
| `/companies/top?limit=10` | Lowest ESG risk companies |
| `/sectors/average` | Sector-level average scores |
| `/companies/high-controversy?min_score=50` | High controversy filter |
| `/predict` | Single prediction |
| `/predict/batch` | Batch predictions |

## ✅ Data Quality & Reproducibility
Notebooks provide a transparent lineage from raw data → cleaned → modeling dataset. Scripts operationalize those flows for automation / scheduling.

## 🧪 Testing (Suggested Additions)
Add unit tests for:
- DB utility functions (mocked connection)
- Model prediction shape
- API endpoint responses (TestClient)

## 🔐 Security Notes
- Restrict `allow_origins` in production.
- Use role-based DB credentials with least privilege.
- Consider adding rate limiting & API key auth for hosted deployment.

## 📌 Roadmap Ideas
- Add CI workflow (lint + tests + Docker build)
- Feature importance & SHAP analysis endpoint
- Incremental data ingestion pipeline (Airflow / Prefect)
- Dashboard container (Dash or Streamlit) with reverse proxy

## 📝 License
MIT License. See `LICENSE` for details.

---
If you find this useful, a star ⭐ on the repository helps others discover it.

