from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from pydantic import BaseModel, Field, validator
from slowapi import Limiter
from slowapi.util import get_remote_address
import logging
from ..services.database import db_service
from ..services.cache import cache_response

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analytics", tags=["Analytics"])
limiter = Limiter(key_func=get_remote_address)


class CompanyResponse(BaseModel):
    symbol: str
    name: str
    sector: str
    total_esg_risk_score: float


class SectorAverageResponse(BaseModel):
    sector: str
    avg_esg_score: float
    company_count: int


class HighControversyResponse(BaseModel):
    symbol: str
    name: str
    controversy_score: float
    controversy_level: str


class CompanyDetailResponse(BaseModel):
    symbol: str
    name: str
    sector: str
    industry: Optional[str]
    total_esg_risk_score: Optional[float]
    environment_risk_score: Optional[float]
    social_risk_score: Optional[float]
    governance_risk_score: Optional[float]
    controversy_score: Optional[float]
    controversy_level: Optional[str]
    esg_risk_level: Optional[str]


@router.get("/companies/top", response_model=List[CompanyResponse])
@cache_response(ttl=600, key_prefix="top_companies")
async def get_top_companies(
    limit: int = Query(10, ge=1, le=100, description="Number of top companies to return")
):
    try:
        companies = db_service.get_top_companies(limit)
        return companies
    except Exception as e:
        logger.error(f"Error fetching top companies: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch companies")


@router.get("/sectors/average", response_model=List[SectorAverageResponse])
@cache_response(ttl=600, key_prefix="sector_averages")
async def get_sector_averages():
    try:
        sectors = db_service.get_sector_averages()
        return sectors
    except Exception as e:
        logger.error(f"Error fetching sector averages: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch sector averages")


@router.get("/companies/high-controversy", response_model=List[HighControversyResponse])
@cache_response(ttl=600, key_prefix="high_controversy")
async def get_high_controversy_companies(
    min_score: float = Query(50.0, ge=0.0, le=100.0, description="Minimum controversy score")
):
    try:
        companies = db_service.get_high_controversy_companies(min_score)
        return companies
    except Exception as e:
        logger.error(f"Error fetching high controversy companies: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch companies")


@router.get("/companies/{symbol}", response_model=CompanyDetailResponse)
@cache_response(ttl=600, key_prefix="company_detail")
async def get_company_detail(symbol: str):
    try:
        company = db_service.get_company_by_symbol(symbol)
        if not company:
            raise HTTPException(status_code=404, detail=f"Company with symbol '{symbol}' not found")
        return company
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching company detail: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch company detail")


@router.get("/companies/search", response_model=List[CompanyResponse])
async def search_companies(
    q: str = Query(..., min_length=1, max_length=100, description="Search query"),
    sector: Optional[str] = Query(None, max_length=100, description="Filter by sector"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of results")
):
    try:
        companies = db_service.search_companies(q, sector, limit)
        return companies
    except Exception as e:
        logger.error(f"Error searching companies: {e}")
        raise HTTPException(status_code=500, detail="Failed to search companies")
