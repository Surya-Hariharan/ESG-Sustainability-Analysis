"""Model utilities for ESG risk prediction.

Design principles:
 - Single persisted artifact: models/esg_risk_model.joblib (sklearn Pipeline).
 - Optional metadata file: models/esg_risk_model.meta.json (created on demand if absent).
 - Snake_case feature names across ingestion, training and inference.
 - All helper functions are pure / side-effect free except for disk IO.
"""
from __future__ import annotations
from pathlib import Path
from typing import List, Dict, Any
import os
import warnings
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
import sklearn  # type: ignore
from sklearn.ensemble import RandomForestClassifier  # type: ignore
try:  # sklearn may not expose this if version drifts, so guard import
    from sklearn.exceptions import InconsistentVersionWarning  # type: ignore
except Exception:  # pragma: no cover
    class InconsistentVersionWarning(Warning):  # fallback placeholder
        pass

MODEL_PATH = Path("models/esg_risk_model.joblib")
META_PATH = Path("models/esg_risk_model.meta.json")

FEATURE_COLUMNS: List[str] = [
    "environment_risk_score",
    "social_risk_score",
    "governance_risk_score",
    "controversy_score",
    "full_time_employees",
]

MODEL_INFO_VERSION = 1


def load_model():
    """Load the persisted pipeline artifact with validation."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model artifact not found at {MODEL_PATH}")
    strict = os.getenv("ESG_STRICT_MODEL_VERSION", "0") == "1"
    # Capture version warnings and optionally enforce strictness
    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always", InconsistentVersionWarning)
        pipeline = joblib.load(MODEL_PATH)
        version_warnings = [w for w in caught if isinstance(w.message, InconsistentVersionWarning)]
        if version_warnings:
            if strict:
                raise RuntimeError(
                    "Model was trained under a different scikit-learn version. Retrain with current environment "
                    "or install the original version. Set ESG_STRICT_MODEL_VERSION=0 to ignore temporarily." 
                )
            # If not strict, silently suppress after load (we've already captured warnings)
    if not hasattr(pipeline, "predict_proba"):
        raise TypeError("Loaded artifact does not expose predict_proba; ensure you saved the full classifier pipeline")
    # Heuristic compatibility patch: add missing monotonic_cst attr for pre-1.4 trees (prevents AttributeError in newer sklearn)
    try:  # pragma: no cover
        final_est = getattr(pipeline, "named_steps", {}).get("rf") or getattr(pipeline, "steps", [[None, None]])[-1][1]
        if isinstance(final_est, RandomForestClassifier):
            patched = 0
            for est in getattr(final_est, "estimators_", []):
                if not hasattr(est, "monotonic_cst"):
                    setattr(est, "monotonic_cst", None)
                    patched += 1
            if patched:
                # silently continue; optional: could log patch count
                pass
    except Exception:
        pass
    # Proactive sanity: attempt a dry-run prediction to surface latent AttributeErrors (e.g., monotonic_cst)
    try:
        import pandas as _pd  # local import to avoid top-level cost if unused
        dummy = _pd.DataFrame([[0] * len(FEATURE_COLUMNS)], columns=FEATURE_COLUMNS)
        _ = pipeline.predict_proba(dummy)
    except AttributeError as attr_err:  # typical for version skew (monotonic_cst etc.)
        raise RuntimeError(
            "Model artifact incompatible with current scikit-learn runtime (attribute missing during predict). "
            "Delete models/esg_risk_model.joblib and retrain with scripts/train_pipeline.py under this environment."
        ) from attr_err
    except Exception:
        # Non-fatal; ignore other errors to keep original behavior
        pass
    return pipeline


def _rows_to_frame(samples: List[Dict[str, Any]]) -> pd.DataFrame:
    missing_any = [c for c in FEATURE_COLUMNS if any(c not in s for s in samples)]
    if missing_any:
        raise KeyError(f"Missing required feature(s): {missing_any}")
    return pd.DataFrame([{c: s[c] for c in FEATURE_COLUMNS} for s in samples])


def predict_single(pipeline, sample: Dict[str, Any]) -> Dict[str, Any]:
    df = _rows_to_frame([sample])
    proba = pipeline.predict_proba(df)[0]
    idx = int(np.argmax(proba))
    return {"risk_level": str(pipeline.classes_[idx]), "probability": float(proba[idx])}


def predict_batch(pipeline, samples: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    df = _rows_to_frame(samples)
    all_proba = pipeline.predict_proba(df)
    idxs = np.argmax(all_proba, axis=1)
    return [
        {"risk_level": str(pipeline.classes_[i]), "probability": float(all_proba[row, i])}
        for row, i in enumerate(idxs)
    ]


def _extract_feature_importances(pipeline) -> Dict[str, float]:
    """Return normalized feature importances if the final estimator exposes them."""
    final_est = getattr(pipeline, "named_steps", {}).get("rf") or getattr(pipeline, "steps", [[None, None]])[-1][1]
    if hasattr(final_est, "feature_importances_"):
        importances = final_est.feature_importances_
        total = importances.sum() or 1.0
        return {feat: float(val / total) for feat, val in zip(FEATURE_COLUMNS, importances)}
    return {}


def generate_metadata(pipeline) -> Dict[str, Any]:
    # Safely obtain repr (older sklearn artifacts may break when pprint'ing due to param drift)
    try:
        estimator_repr = repr(pipeline)
    except Exception as exc:  # pragma: no cover - defensive
        estimator_repr = f"<repr-failed {exc.__class__.__name__}: {exc}>"
    try:
        feature_importances = _extract_feature_importances(pipeline)
    except Exception:  # pragma: no cover
        feature_importances = {}
    meta = {
        "version": MODEL_INFO_VERSION,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "model_path": str(MODEL_PATH),
        "classes": [str(c) for c in getattr(pipeline, "classes_", [])],
        "features": FEATURE_COLUMNS,
        "feature_importances": feature_importances,
        "estimator_repr": estimator_repr,
        "sklearn_version_runtime": getattr(__import__("sklearn"), "__version__", "unknown"),
        "sklearn_version_trained": getattr(pipeline, "_training_sklearn_version", None),
    }
    return meta


def save_metadata(pipeline) -> Dict[str, Any]:
    META_PATH.parent.mkdir(parents=True, exist_ok=True)
    meta = generate_metadata(pipeline)
    META_PATH.write_text(json.dumps(meta, indent=2))
    return meta


def load_metadata(pipeline=None) -> Dict[str, Any]:
    if META_PATH.exists():
        try:
            return json.loads(META_PATH.read_text())
        except Exception:
            pass  # fall back to regeneration
    if pipeline is None:
        pipeline = load_model()
    return save_metadata(pipeline)
