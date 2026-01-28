from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
import torch
import torch.nn as nn
import numpy as np
import joblib
from pathlib import Path
import logging
import json

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/predict", tags=["Predictions"])

class ESGRiskClassifier(nn.Module):
    def __init__(self, input_dim, hidden_dims, num_classes, dropout=0.5):
        super(ESGRiskClassifier, self).__init__()
        layers = []
        prev_dim = input_dim
        for hidden_dim in hidden_dims:
            layers.append(nn.Linear(prev_dim, hidden_dim))
            layers.append(nn.BatchNorm1d(hidden_dim))
            layers.append(nn.ReLU())
            layers.append(nn.Dropout(dropout))
            prev_dim = hidden_dim
        layers.append(nn.Linear(prev_dim, num_classes))
        self.network = nn.Sequential(*layers)
    
    def forward(self, x):
        return self.network(x)

class ESGPredictionRequest(BaseModel):
    environment_risk_score: float = Field(..., ge=0.0, le=100.0)
    social_risk_score: float = Field(..., ge=0.0, le=100.0)
    governance_risk_score: float = Field(..., ge=0.0, le=100.0)
    controversy_score: float = Field(..., ge=0.0, le=100.0)
    full_time_employees: int = Field(..., ge=0)
    
    @validator('full_time_employees')
    def validate_employees(cls, v):
        if v < 0:
            raise ValueError('full_time_employees must be non-negative')
        return v


class ESGPredictionResponse(BaseModel):
    risk_level: str
    confidence: float
    probabilities: Dict[str, float]


class BatchPredictionRequest(BaseModel):
    items: List[ESGPredictionRequest]
    
    @validator('items')
    def validate_batch_size(cls, v):
        if len(v) > 1000:
            raise ValueError('Batch size must not exceed 1000')
        return v


class BatchPredictionResponse(BaseModel):
    predictions: List[ESGPredictionResponse]
    count: int


class ModelService:
    _instance = None
    _model = None
    _scaler = None
    _metadata = None
    _device = None
    _feature_columns = []
    _label_mapping = {}
    _classes = ['Low', 'Medium', 'High']
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelService, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance
    
    def _load_model(self):
        try:
            model_path = Path('models/esg_risk_model.pt')
            scaler_path = Path('models/scaler.pkl')
            metadata_path = Path('models/model_metadata.json')
            
            self._device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            
            if model_path.exists():
                checkpoint = torch.load(model_path, map_location=self._device)
                
                arch = checkpoint.get('model_architecture', {})
                self._model = ESGRiskClassifier(
                    input_dim=arch.get('input_dim', 31),
                    hidden_dims=arch.get('hidden_dims', [512, 256, 128]),
                    num_classes=arch.get('num_classes', 3),
                    dropout=arch.get('dropout', 0.5)
                )
                self._model.load_state_dict(checkpoint['model_state_dict'])
                self._model.to(self._device)
                self._model.eval()
                
                self._feature_columns = checkpoint.get('feature_columns', [])
                self._label_mapping = checkpoint.get('label_mapping', {})
                self._metadata = checkpoint
                
                logger.info(f"✅ Loaded PyTorch model with {len(self._feature_columns)} features")
            else:
                logger.warning("⚠️  Model not found. Please train the model (notebook 03)")
                self._model = None
            
            if scaler_path.exists():
                self._scaler = joblib.load(scaler_path)
                logger.info(f"✅ Loaded scaler")
            
            if metadata_path.exists():
                with open(metadata_path, 'r') as f:
                    meta = json.load(f)
                    logger.info(f"✅ Model accuracy: {meta.get('test_accuracy', 'N/A')}")
        except Exception as e:
            logger.error(f"❌ Error loading model: {str(e)}")
            self._model = None
            self._scaler = None
                with open(metadata_path, 'r') as f:
                    self._metadata = json.load(f)
                logger.info("✅ Loaded model metadata")
            
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            raise
    
    def predict_single(self, request: ESGPredictionRequest) -> ESGPredictionResponse:
        try:
            features = np.array([[
                request.environment_risk_score,
                request.social_risk_score,
                request.governance_risk_score,
                request.controversy_score,
                float(request.full_time_employees)
            ]])
            
            if self._scaler:
                features = self._scaler.transform(features)
            
            if isinstance(self._model, torch.nn.Module):
                features_tensor = torch.FloatTensor(features).to(self._device)
                with torch.no_grad():
                    logits = self._model(features_tensor)
                    probabilities = torch.softmax(logits, dim=1).cpu().numpy()[0]
                    prediction = np.argmax(probabilities)
            else:
                probabilities = self._model.predict_proba(features)[0]
                prediction = np.argmax(probabilities)
            
            risk_level = self._classes[prediction]
            confidence = float(probabilities[prediction])
            
            return ESGPredictionResponse(
                risk_level=risk_level,
                confidence=confidence,
                probabilities={
                    cls: float(prob) for cls, prob in zip(self._classes, probabilities)
                }
            )
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise HTTPException(status_code=500, detail="Prediction failed")
    
    def predict_batch(self, requests: List[ESGPredictionRequest]) -> BatchPredictionResponse:
        predictions = [self.predict_single(req) for req in requests]
        return BatchPredictionResponse(predictions=predictions, count=len(predictions))
    
    def get_model_info(self) -> Dict:
        return {
            "status": "loaded",
            "type": "PyTorch" if isinstance(self._model, torch.nn.Module) else "scikit-learn",
            "device": str(self._device) if self._device else "cpu",
            "classes": self._classes,
            "features": ["environment_risk_score", "social_risk_score", 
                        "governance_risk_score", "controversy_score", "full_time_employees"],
            "metadata": self._metadata or {}
        }


model_service = ModelService()


@router.post("/", response_model=ESGPredictionResponse)
async def predict_risk(request: ESGPredictionRequest):
    return model_service.predict_single(request)


@router.post("/batch", response_model=BatchPredictionResponse)
async def predict_batch(request: BatchPredictionRequest):
    return model_service.predict_batch(request.items)


@router.get("/model/info")
async def get_model_info():
    return model_service.get_model_info()
