# 🌱 ESG Sustainability Analysis Dashboard

[![Python](https://img.shields.io/badge/python-v3.11+-blue.svg)](https://www.python.org/downloads/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15+-blue.svg)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/react-v18+-61DAFB.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/fastapi-modern-009688.svg)](https://fastapi.tiangolo.com/)
[![Groq](https://img.shields.io/badge/AI-Groq-orange.svg)](https://groq.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A production-ready, full-stack ESG (Environmental, Social, Governance) analytics platform with ML-powered risk prediction, **AI Chatbot**, interactive dashboards, and comprehensive API.

## 🌟 Key Features

### 🧠 AI Intelligence
- **🤖 ESG Chatbot**: Context-aware AI assistant powered by **Groq (Llama 3.3)** to answer queries about specific companies or general ESG trends.
- **🔮 Risk Prediction**: ML models predict future ESG risks (Low/Medium/High) based on historical data.

### 📊 Analytics & Insights
- **📈 Real-time Dashboard**: Interactive filtering and search for thousands of companies.
- **🏢 Sector Benchmarking**: Compare performance across industries.
- **⚠️ Controversy Tracking**: Monitor high-risk events and their impact on scores.
- **📉 Trend Analysis**: Visualize historical performance and volatility.

### 🛡️ Enterprise Grade
- **Security**: SQL Injection/XSS protection middleware, robust CORS configuration.
- **Architecture**: Full separation of concerns (FastAPI Backend + React Frontend).
- **Performance**: Redis caching support, async database operations.

## 📁 Project Structure

```
├── backend/                      # FastAPI application
│   ├── main.py                   # App entry point (CORS + Middleware)
│   ├── services/                 # Business logic (GroqService, AnalyticsService)
│   ├── middleware/               # Security (SQL Injection, XSS)
│   ├── routers/                  # API routes (Chat, Analytics, Predictions)
│   └── sql/                      # Database schemas
├── frontend/                     # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/           # Chatbot, Charts, UI elements
│   │   ├── pages/                # Companies, Sectors, Controversies
│   │   └── services/             # API integration
├── scripts/                      # ML pipelines & Data processing
└── data/                         # Datasets & Trained Models
```

## 🚀 Quick Start

### Prerequisites
- **Backend**: Python 3.11+, PostgreSQL 15+
- **Frontend**: Node.js 20+ or Bun
- **AI**: [Groq API Key](https://console.groq.com/) (Free tier available)

### 1. Environment Setup

```bash
# Clone repository
git clone https://github.com/Surya-Hariharan/ESG-Sustainability-Analysis.git
cd ESG-Sustainability-Analysis

# Create environment file
cp .env.example .env
```

**Edit `.env`** with your credentials:
```env
# Database
DB_PASSWORD=your_db_password

# AI Chatbot (Required for Chat feature)
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### 2. Database Setup

```bash
# Create Database
createdb esg_db

# Apply Schema (ensure PostgreSQL is running)
psql -h localhost -U postgres -d esg_db -f backend/sql/01_create_tables.sql

# Load Data
python scripts/database_loader.py
```

### 3. Run Backend

```bash
# Create venv
python -m venv venv
# Activate (Windows: venv\Scripts\activate, Mac/Linux: source venv/bin/activate)

# Install
pip install -r requirements.txt

# Run Server (Auto-reloads)
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*API is available at http://127.0.0.1:8000/api/docs*

### 4. Run Frontend

```bash
cd frontend
npm install
npm run dev
```
*App is available at http://localhost:8080*

## 🔧 Troubleshooting

### "Unable to connect" or 400 Errors
- **Restart Backend**: If you change `.env` or `main.py`.
- **Backend URL**: Ensure frontend finds backend at `http://127.0.0.1:8000` (configured in `api.ts`).
- **CORS**: We use a regex `https?://.*` in development to handle `localhost` vs `127.0.0.1`.

### React Strict Mode
- In development, you might see **"Request canceled"** in the console. This is normal due to React Strict Mode double-invoking effects. The app is designed to ignore these cancellation errors safely.

### Groq API Errors
- **400 Bad Request**: Likely an invalid model name. We default to `llama-3.3-70b-versatile`. Check `groq_service.py` if Groq deprecates models.

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/AI-Enhancement`)
3. Commit usage (`git commit -m 'Add new AI capability'`)
4. Push & PR

## 📧 Contact

**Surya Hariharan** - [@Surya-Hariharan](https://github.com/Surya-Hariharan)

---
**Built with ❤️ for a sustainable future** 🌍
