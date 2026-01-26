# 🌱 ESG Sustainability Analysis Dashboard

[![Python](https://img.shields.io/badge/python-v3.11+-blue.svg)](https://www.python.org/downloads/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15+-blue.svg)](https://www.postgresql.org/)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A production-ready, full-stack ESG (Environmental, Social, Governance) analytics platform with ML-powered risk prediction, interactive dashboards, and comprehensive API.

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
- 🐳 **Docker**: Backend containerization for easy deployment
- ☁️ **Vercel**: Optimized frontend deployment
- 📦 **MLflow**: Experiment tracking and model versioning
- 📊 **Monitoring**: Structured logging and health checks
- ⚡ **Performance**: Code splitting, lazy loading, PWA support

## 📁 Project Structure

```
├── backend/                      # FastAPI application
│   ├── main.py                   # Main API entry point
│   ├── core/                     # Core configuration
│   ├── middleware/               # Security middleware
│   ├── routers/                  # API route handlers
│   ├── services/                 # Business logic services
│   ├── db_init.py                # Database initialization
│   ├── logging_config.py         # Centralized logging
│   ├── model.py                  # ML model inference
│   ├── schemas.py                # Pydantic validation
│   └── sql/                      # Database scripts
├── frontend/                     # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/           # UI components
│   │   ├── pages/                # Route pages
│   │   └── lib/                  # Utilities
│   └── package.json
├── scripts/
│   ├── mlflow_config.py          # Experiment tracking
│   ├── validate_model.py         # Model validation
│   ├── train_pipeline.py         # Training automation
│   └── load_db.py                # Data loading
├── notebooks/                    # Jupyter analysis notebooks
│   ├── 01_data_cleaning.ipynb
│   ├── 02_eda_visualization.ipynb
│   ├── 03_sector_industry_analysis.ipynb
│   ├── 04_esg_risk_prediction.ipynb
│   └── 05_dashboard_integration.ipynb
├── data/
│   ├── raw/                      # Original datasets
│   └── processed/                # Cleaned data
├── models/                       # Trained ML models
├── Dockerfile                    # Backend container
├── vercel.json                   # Frontend deployment config
├── .env.example                  # Environment template
└── requirements.txt              # Python dependencies
```

## 🚀 Quick Start

### Prerequisites
- **Backend**: Python 3.11+, PostgreSQL 15+, Docker (optional)
- **Frontend**: Node.js 20+ or Bun
- **Data Science**: Jupyter Notebook

### 1. Environment Setup

```bash
# Clone repository
git clone https://github.com/Surya-Hariharan/ESG-Sustainability-Analysis.git
cd ESG-Sustainability-Analysis

# Create environment file (IMPORTANT!)
cp .env.example .env
# Edit .env with your database credentials and settings
```

**⚠️ IMPORTANT**: The `.env` file contains sensitive credentials and is **never** committed to Git. Always use `.env.example` as a template.

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb esg_db

# Apply schema
psql -h localhost -U postgres -d esg_db -f backend/sql/schema.sql

# Load sample data (optional)
python scripts/load_db.py
```

### 3. Backend Deployment

#### Option A: Docker (Recommended)

```bash
# Build Docker image
docker build -t esg-backend .

# Run container
docker run -d \
  --name esg-backend \
  -p 8000:8000 \
  --env-file .env \
  esg-backend

# Check logs
docker logs -f esg-backend
```

#### Option B: Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend
python -m backend.main
```

**Backend URL**: http://localhost:8000  
**API Docs**: http://localhost:8000/api/docs

### 4. Frontend Deployment

#### For Vercel (Production)

1. **Push to GitHub**
2. **Import to Vercel**: 
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel will auto-detect settings from `vercel.json`
3. **Set Environment Variables** in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```
4. **Deploy**: Vercel will auto-deploy on every push to main

#### For Local Development

```bash
cd frontend

# Install dependencies
bun install  # or: npm install

# Start dev server
bun run dev  # or: npm run dev
```

**Frontend URL**: http://localhost:8080

## 🗄️ Database Configuration

Update your `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=esg_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
```

For production, use environment variables in your hosting platform.

## 📊 ML Model Training

```bash
# Train model
python scripts/train_pipeline.py

# Validate model
python scripts/validate_model.py \
  --model models/esg_risk_model.joblib \
  --test-data data/processed/test_data.csv

# Start MLflow UI (optional)
mlflow ui --port 5000
```

## 📖 API Documentation

### Health Check
```http
GET /health
```

### Analytics Endpoints
```http
GET /companies/top?limit=10
GET /sectors/average
GET /companies/high-controversy?min_score=50
```

### ML Prediction
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

### Model Management
```http
GET /model/info
GET /model/feature-importances
POST /model/reload
```

**Interactive Docs**: Visit http://localhost:8000/api/docs for full API documentation.

## 🔒 Security Best Practices

1. **Never commit `.env`** - It's in `.gitignore`
2. **Use strong passwords** for database
3. **Generate secret key**: `python -c "import secrets; print(secrets.token_hex(32))"`
4. **Update CORS_ORIGINS** in production to your actual frontend URL
5. **Use HTTPS** in production
6. **Keep dependencies updated**: `pip install --upgrade -r requirements.txt`

## 📦 Production Deployment

### Backend (Docker)

```bash
# Build production image
docker build -t esg-backend:prod .

# Run with production settings
docker run -d \
  --name esg-backend-prod \
  -p 8000:8000 \
  -e ENVIRONMENT=production \
  -e DEBUG=False \
  --env-file .env.production \
  --restart unless-stopped \
  esg-backend:prod
```

### Frontend (Vercel)

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Configure Build**:
   - Build Command: `bun run build` (auto-detected from vercel.json)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `bun install` (auto-detected)
3. **Environment Variables**:
   ```
   VITE_API_URL=https://api.yoursite.com
   ```
4. **Deploy**: Push to main branch for automatic deployment

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
```

## 🛠️ Development

### Code Formatting

```bash
# Python
black backend/ scripts/
isort backend/ scripts/

# TypeScript/React
cd frontend
bun run lint
```

### Running Notebooks

All notebooks reference the `data/` folder correctly using relative paths (`../data/`):

```python
# Example path in notebooks
df = pd.read_csv('../data/raw/dataset.csv')
df.to_csv('../data/processed/cleaned_data.csv', index=False)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

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

