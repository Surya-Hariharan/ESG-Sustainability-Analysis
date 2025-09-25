"""FastAPI application exposing ESG analytics and prediction endpoints."""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from typing import List
import uvicorn
import logging
from .utils import fetch_query, get_db_health
from .db_init import ensure_database_ready
from .schemas import (
    ESGPredictionRequest,
    ESGPredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
    BatchPredictionItem,
)
from .model import (
    load_model,
    predict_single,
    predict_batch,
    load_metadata,
    save_metadata,
)
import sklearn  # type: ignore

logger = logging.getLogger("esg_api")
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(name)s | %(message)s")

app = FastAPI(title="ESG Dashboard API", description="Endpoints for ESG analytics and risk prediction", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup():
    """Initialize database (idempotent) then load ML model pipeline."""
    # 1. Ensure database schema exists so API data endpoints don't 500 on first run
    ensure_database_ready()

    # 2. Load model
    try:
        pipeline = load_model()
        app.state.pipeline = pipeline
        try:
            app.state.metadata = load_metadata(pipeline)
        except Exception as meta_exc:  # pragma: no cover
            logger.warning("Metadata generation failed: %s", meta_exc)
            app.state.metadata = None
        logger.info("Pipeline loaded successfully.")
    except FileNotFoundError:
        app.state.pipeline = None
        app.state.metadata = None
        logger.warning("Model pipeline file not found. Train and save it first.")
    except Exception as exc:
        app.state.pipeline = None
        app.state.metadata = None
        logger.exception("Unexpected error loading pipeline: %s", exc)


@app.get("/health", summary="Health & readiness probe")
def health():
    db_ok, db_msg = get_db_health()
    model_loaded = app.state.pipeline is not None
    status = "healthy" if db_ok else "degraded"
    return {
        "status": status,
        "database": db_msg,
        "model_loaded": model_loaded,
        "version": app.version,
        "sklearn_runtime": sklearn.__version__,
    }


@app.post("/model/reload", summary="Reload model artifact from disk")
def reload_model():
    try:
        pipeline = load_model()
        app.state.pipeline = pipeline
        try:
            app.state.metadata = load_metadata(pipeline)
        except Exception:
            app.state.metadata = None
        return {"reloaded": True, "model_loaded": True}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Reload failed: {exc}")


@app.get("/model/info", summary="Model metadata and feature summary")
def model_info():
    if app.state.pipeline is None:
        raise HTTPException(status_code=503, detail="Model pipeline not loaded.")
    # Regenerate metadata to refresh importances if model was swapped on disk
    meta = save_metadata(app.state.pipeline)
    return jsonable_encoder(meta)


@app.get("/model/feature-importances", summary="Current feature importances (if supported)")
def feature_importances():
    if app.state.pipeline is None:
        raise HTTPException(status_code=503, detail="Model pipeline not loaded.")
    meta = load_metadata(app.state.pipeline)
    return {
        "features": meta.get("features", []),
        "feature_importances": meta.get("feature_importances", {}),
    }


@app.get("/companies/top", summary="Top companies with lowest ESG risk")
def top_companies(limit: int = 10):
    if limit <= 0 or limit > 100:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 100")
    query = f"""
        SELECT symbol, name, sector, total_esg_risk_score
        FROM esg_companies
        WHERE total_esg_risk_score IS NOT NULL
        ORDER BY total_esg_risk_score ASC
        LIMIT {limit};
    """
    df = fetch_query(query)
    return jsonable_encoder(df.to_dict(orient="records"))


@app.get("/sectors/average", summary="Average ESG risk score by sector")
def sector_avg():
    query = """
        SELECT sector, ROUND(AVG(total_esg_risk_score)::numeric, 2) AS avg_esg_score,
               COUNT(*) AS company_count
        FROM esg_companies
        WHERE total_esg_risk_score IS NOT NULL
        GROUP BY sector
        ORDER BY avg_esg_score ASC;
    """
    df = fetch_query(query)
    return jsonable_encoder(df.to_dict(orient="records"))


@app.get("/companies/high-controversy", summary="Companies with high controversy scores")
def high_controversy(min_score: int = 50):
    if min_score < 0:
        raise HTTPException(status_code=400, detail="min_score must be >= 0")
    query = f"""
        SELECT symbol, name, controversy_score, controversy_level
        FROM esg_companies
        WHERE controversy_score >= {min_score}
        ORDER BY controversy_score DESC;
    """
    df = fetch_query(query)
    return jsonable_encoder(df.to_dict(orient="records"))


@app.post("/predict", response_model=ESGPredictionResponse, summary="Predict ESG risk level for a single record")
def predict(payload: ESGPredictionRequest):
    if app.state.pipeline is None:
        raise HTTPException(status_code=503, detail="Model pipeline not loaded.")
    try:
        result = predict_single(app.state.pipeline, payload.dict())
        return ESGPredictionResponse(**result)
    except Exception as exc:
        logger.exception("Prediction error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/predict/batch", response_model=BatchPredictionResponse, summary="Batch predict ESG risk levels")
def predict_batch_endpoint(batch: BatchPredictionRequest):
    if app.state.pipeline is None:
        raise HTTPException(status_code=503, detail="Model pipeline not loaded.")
    try:
        results = predict_batch(app.state.pipeline, [item.dict() for item in batch.items])
        wrapped = [BatchPredictionItem(**r) for r in results]
        return BatchPredictionResponse(predictions=wrapped)
    except Exception as exc:
        logger.exception("Batch prediction error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.exception_handler(Exception)
def generic_exception_handler(request, exc):  # type: ignore
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


if __name__ == "__main__":  # pragma: no cover
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True)
