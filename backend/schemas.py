"""Pydantic models for request/response validation."""
from pydantic import BaseModel, Field, validator
from typing import List


class ESGPredictionRequest(BaseModel):
    environment_risk_score: float = Field(..., ge=0, le=100)
    social_risk_score: float = Field(..., ge=0, le=100)
    governance_risk_score: float = Field(..., ge=0, le=100)
    controversy_score: float = Field(..., ge=0, le=100)
    full_time_employees: int = Field(..., ge=0)

    @validator("full_time_employees")
    def employees_reasonable(cls, v):  # noqa: D401
        if v > 1_000_000:
            raise ValueError("full_time_employees unusually large")
        return v


class ESGPredictionResponse(BaseModel):
    risk_level: str
    probability: float


class BatchPredictionRequest(BaseModel):
    items: List[ESGPredictionRequest]


class BatchPredictionItem(BaseModel):
    risk_level: str
    probability: float


class BatchPredictionResponse(BaseModel):
    predictions: List[BatchPredictionItem]
