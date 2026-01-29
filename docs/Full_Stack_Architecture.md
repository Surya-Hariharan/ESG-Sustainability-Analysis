# 🏗️ Full Stack Architecture

## Overview
The ESG Sustainability Analysis platform follows a modern, decoupled client-server architecture.

### High-Level Diagram
```mermaid
graph TD
    User[User / Browser] <-->|HTTPS/JSON| Frontend[Frontend (React + Vite)]
    Frontend <-->|REST API| Backend[Backend (FastAPI)]
    Backend <-->|SQL| DB[(PostgreSQL Database)]
    Backend <-->|Inference| ML[ML Model (Scikit-Learn)]
    Backend <-->|API| Groq[Groq AI (Llama 3.3)]
```

---

## 🎨 Frontend (Client Side)
Built with **React 18**, **TypeScript**, and **Vite** for high performance.

### Key Technologies
- **Framework**: React with Hooks (`useState`, `useEffect`)
- **Build Tool**: Vite (Instant HMR)
- **Styling**: TailwindCSS + `index.css` (Glassmorphism design)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **HTTP Client**: Axios with sophisticated interceptors (handling errors & cancellations)

### Directory Structure
- `src/components`: Reusable UI elements (Chatbot, Cards, Layouts)
- `src/pages`: Main views (Companies, Sectors, Controversies)
- `src/services`: API service abstraction (`api.ts`)

---

## ⚙️ Backend (Server Side)
Powered by **FastAPI** (Python 3.11), prioritizing async performance and security.

### Core Components
- **API Router**: `routers/` module handles endpoints for Analytics, Predictions, and Chat.
- **Middleware**: 
  - `SecurityHeadersMiddleware`: Adds HSTS, X-Frame-Options.
  - `SQLInjectionProtectionMiddleware`: Regex-based query sanitization.
  - `XSSProtectionMiddleware`: Prevents script injection.
  - `CORSMiddleware`: Handles cross-origin requests (`localhost` vs `127.0.0.1`).
- **Services**:
  - `GroqService`: Manages AI LLM interactions.
  - `AnalyticsService`: Aggregates DB data.

### Security Implementation
- **Input Validation**: Pydantic models ensure data integrity.
- **Environment config**: Credentials via `.env` files.
- **Rate Limiting**: Prepared for high-traffic scenarios.

---

## 🗄️ Database (Persistence Layer)
**PostgreSQL 15+** serves as the relational backbone.

### Schema Design
- **Companies Table**: Core entity (`total_esg_score`, `risk_level`, `industry`).
- **Indices**: Optimized BTREE indices on commonly filtered columns (`sector`, `esg_score`).

### Operations
- **ORM**: SQLAlchemy (Async) or raw SQL scripts for bulk loading.
- **Initialization**: `scripts/database_loader.py` handles ETL from CSV to SQL.
