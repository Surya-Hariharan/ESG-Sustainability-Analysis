# 🌱 ESG Sustainability Analysis Dashboard

[![CI Pipeline](https://github.com/Surya-Hariharan/ESG-Sustainability-Analysis/actions/workflows/ci.yml/badge.svg)](https://github.com/Surya-Hariharan/ESG-Sustainability-Analysis/actions/workflows/ci.yml)
[![Deploy](https://github.com/Surya-Hariharan/ESG-Sustainability-Analysis/actions/workflows/deploy.yml/badge.svg)](https://github.com/Surya-Hariharan/ESG-Sustainability-Analysis/actions/workflows/deploy.yml)
[![Python](https://img.shields.io/badge/python-v3.11+-blue.svg)](https://www.python.org/downloads/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15+-blue.svg)](https://www.postgresql.org/)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A production-ready, full-stack ESG (Environmental, Social, Governance) analytics platform with ML-powered risk prediction, interactive dashboards, and comprehensive API. Built with modern DevOps practices, security best practices, and scalability in mind.

## 🌟 Key Features

### Analytics & Insights
- 📊 Company-level ESG score analysis (Total ESG + E/S/G sub-scores)
- 🏢 Sector and industry benchmarking
- ⚠️ Controversy risk assessment and tracking
- 📈 Interactive dashboards with advanced filtering
- 🤖 ML-powered ESG risk prediction (Low/Medium/High)
- 📉 Trend analysis and historical comparisons

### Technical Excellence
- 🔒 **Security**: Environment-based secrets, CORS, security headers, input validation
- 🐳 **Docker**: Full containerization with development and production configurations
- 🚀 **CI/CD**: Automated testing, linting, security scanning, and deployment
- 📦 **MLflow**: Experiment tracking and model versioning
- 🧪 **Testing**: Comprehensive unit and integration tests (backend & frontend)
- 📊 **Monitoring**: Structured logging and health checks
- ⚡ **Performance**: Code splitting, lazy loading, PWA support
- ♿ **Accessibility**: React Error Boundaries and semantic HTML

## 📁 Project Structure

```
├── .github/
│   ├── dependabot.yml            # Automated dependency updates
│   └── workflows/
│       ├── ci.yml                # CI pipeline (test, lint, build)
│       └── deploy.yml            # Deployment automation
├── backend/                      # FastAPI application
│   ├── app.py                    # API with security middleware
│   ├── db_config.py              # Database connection with env vars
│   ├── logging_config.py         # Centralized logging
│   ├── model.py                  # ML model inference
│   ├── schemas.py                # Pydantic validation models
│   └── sql/                      # Database scripts
├── frontend/                     # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── ErrorBoundary.tsx # Error handling
│   │   │   └── ui/               # Shadcn UI components
│   │   ├── pages/                # Lazy-loaded routes
│   │   └── test/                 # Test setup
│   ├── Dockerfile                # Multi-stage build
│   ├── nginx.conf                # Production web server config
│   └── vitest.config.ts          # Test configuration
├── scripts/
│   ├── mlflow_config.py          # Experiment tracking
│   ├── validate_model.py         # Model validation pipeline
│   └── train_pipeline.py         # Training automation
├── tests/                        # Backend tests
│   ├── test_api.py
│   ├── test_schemas.py
│   └── conftest.py
├── docker-compose.yml            # Development environment
├── docker-compose.prod.yml       # Production environment
├── Dockerfile                    # Backend container
├── .env.example                  # Environment template
├── .pre-commit-config.yaml       # Code quality hooks
├── pyproject.toml                # Python tooling config
└── requirements.txt              # Python dependencies
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+ / Bun
- PostgreSQL 15+
- Docker & Docker Compose (optional but recommended)

### Option 1: Docker (Recommended)

1. **Clone and configure**:
```bash
git clone https://github.com/Surya-Hariharan/ESG-Sustainability-Analysis.git
cd ESG-Sustainability-Analysis
cp .env.example .env
# Edit .env with your settings
```

2. **Start services**:
```bash
docker-compose up -d
```

3. **Access applications**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs
- MLflow: http://localhost:5000

### Option 2: Local Development

1. **Backend setup**:
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
psql -h localhost -U postgres -d esg_db -f backend/sql/schema.sql

# Start backend
python -m backend.app
```

2. **Frontend setup**:
```bash
cd frontend
bun install  # or: npm install
bun run dev  # or: npm run dev
```

## 🧪 Testing

### Backend Tests
```bash
# Run all tests with coverage
pytest

# Run specific test file
pytest tests/test_api.py -v

# Run with coverage report
pytest --cov=backend --cov-report=html
```

### Frontend Tests
```bash
cd frontend

# Run tests
bun test

# Run with UI
bun test:ui

# Coverage report
bun test:coverage
```

### Security Scanning
```bash
# Check for vulnerabilities
safety check

# Security linting
bandit -r backend/ scripts/

# Run all pre-commit hooks
pre-commit run --all-files
```

## 📊 ML Model Training & Validation

### Train Model
```bash
python scripts/train_pipeline.py
```

### Validate Model
```bash
python scripts/validate_model.py \
  --model models/esg_risk_model.joblib \
  --test-data data/processed/test_data.csv \
  --output validation_report.txt
```

### Track Experiments with MLflow
```bash
# Start MLflow UI
mlflow ui --port 5000

# Training automatically logs to MLflow when configured
```

## 🚢 Deployment

### Production Deployment with Docker
```bash
# Build and deploy production stack
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### Environment Variables for Production
```env
# .env.production
ENVIRONMENT=production
DEBUG=False
LOG_LEVEL=WARNING

# Database
DB_HOST=your-production-db-host
DB_NAME=esg_db_prod
DB_USER=prod_user
DB_PASSWORD=strong_password_here

# Security
SECRET_KEY=generate-with-openssl-rand-hex-32
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ORIGINS=https://yourdomain.com

# API
API_WORKERS=4
API_RELOAD=False

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### CI/CD Pipeline

The project includes automated GitHub Actions workflows:

**CI Pipeline** (`.github/workflows/ci.yml`):
- ✅ Runs on every push and PR
- 🔍 Linting (Black, Flake8, ESLint)
- 🔒 Security scanning (Bandit, Safety)
- 🧪 Tests with coverage
- 🐳 Docker build validation

**Deploy Pipeline** (`.github/workflows/deploy.yml`):
- 🚀 Automated deployment to staging on main branch
- 📦 Builds and pushes Docker images to GHCR
- 🔄 Manual production deployment with approval
- ↩️ Rollback capability

## 📖 API Documentation

### Interactive API Docs
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

### Key Endpoints

#### Health Check
```http
GET /health
```

#### Analytics
```http
GET /companies/top?limit=10
GET /sectors/average
GET /companies/high-controversy?min_score=50
```

#### ML Predictions
```http
POST /predict
Content-Type: application/json

{
  "environment_risk_score": 45.0,
  "social_risk_score": 32.0,
  "governance_risk_score": 28.0,
  "controversy_score": 15.0,
  "full_time_employees": 50000
}
```

```http
POST /predict/batch
Content-Type: application/json

{
  "items": [
    { "environment_risk_score": 45.0, ... },
    { "environment_risk_score": 65.0, ... }
  ]
}
```

#### Model Management
```http
GET /model/info
GET /model/feature-importances
POST /model/reload
```

## 🛠️ Development

### Pre-commit Hooks
```bash
# Install pre-commit hooks
pip install pre-commit
pre-commit install

# Run manually
pre-commit run --all-files
```

### Code Formatting
```bash
# Python
black backend/ scripts/
isort backend/ scripts/
flake8 backend/ scripts/

# TypeScript/React
cd frontend
bun run lint
bun run format  # If prettier script exists
```

### Database Migrations
```bash
# Create new migration
# (Add your migration tool here - Alembic recommended)

# Apply migrations
psql -h localhost -U postgres -d esg_db -f backend/sql/schema.sql
```

## 🔒 Security Best Practices

This project implements multiple security layers:

1. **Environment Variables**: All secrets in `.env` files (never committed)
2. **Input Validation**: Pydantic schemas validate all API inputs
3. **Security Headers**: HSTS, X-Frame-Options, CSP, etc.
4. **CORS Configuration**: Restricted origins in production
5. **Dependency Scanning**: Automated with Dependabot
6. **Code Scanning**: Bandit for Python, ESLint for TypeScript
7. **Container Security**: Non-root users, minimal base images
8. **Database Security**: Parameterized queries, connection pooling

## 📈 Performance Optimizations

- **Frontend**:
  - Code splitting with React.lazy()
  - Image optimization and lazy loading
  - Service worker for offline support
  - CDN-ready static assets
  - Gzip compression

- **Backend**:
  - Database connection pooling
  - Query optimization and indexing
  - Response caching
  - Async request handling
  - Health check endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow code style (Black, ESLint)
- Write tests for new features
- Update documentation
- Ensure CI passes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- ESG data providers and sustainability reporting frameworks
- Open source community
- Contributors and maintainers

## 📧 Contact

**Surya Hariharan** - [@Surya-Hariharan](https://github.com/Surya-Hariharan)

Project Link: [https://github.com/Surya-Hariharan/ESG-Sustainability-Analysis](https://github.com/Surya-Hariharan/ESG-Sustainability-Analysis)

---

**Built with ❤️ for a sustainable future** 🌍
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

