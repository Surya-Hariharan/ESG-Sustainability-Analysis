# 🔌 API Reference

## Base URL
Development: `http://127.0.0.1:8000/api`

## 🤖 Agents (AI)

### Chat with ESG Assistant
`POST /agents/chat`

Conversational interface using LLM (Llama 3.3).

**Request Body**:
```json
{
  "message": "Analyze Apple's ESG score",
  "company_context": { ... } // Optional
}
```

**Response**:
```json
{
  "response": "Apple has a strong environmental score...",
  "error": false
}
```

---

## 📊 Analytics

### Get Top Companies
`GET /analytics/companies/top`

Fetch highest-rated ESG companies.

**Parameters**:
- `limit` (int, default=10): Number of records.

### Sector Averages
`GET /analytics/sectors/average`

Aggregated ESG scores grouped by sector.

### High Controversy
`GET /analytics/companies/high-controversy`

Companies with controversy scores exceeding threshold.

**Parameters**:
- `min_score` (int): Minimum controversy score.

---

## 🔮 Predictions

### Predict Risk
`POST /predict`

Real-time ML inference for a single company profile.

**Request Body**:
```json
{
  "environment_risk_score": 25.5,
  "social_risk_score": 15.0,
  "governance_risk_score": 10.0,
  "controversy_score": 5.0,
  "full_time_employees": 10000
}
```

**Response**:
```json
{
  "risk_level": "Low",
  "confidence": 0.85
}
```

---

## 🏥 System

### Health Check
`GET /health`
Returns system status and database connectivity.
