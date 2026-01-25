"""Unit tests for schemas and validation."""
import pytest
from pydantic import ValidationError
from backend.schemas import ESGPredictionRequest, BatchPredictionRequest


class TestESGPredictionRequest:
    """Test suite for ESG prediction request schema."""

    def test_valid_request(self):
        """Test valid ESG prediction request."""
        data = {
            "environment_risk_score": 45.0,
            "social_risk_score": 32.0,
            "governance_risk_score": 28.0,
            "controversy_score": 15.0,
            "full_time_employees": 50000
        }
        request = ESGPredictionRequest(**data)
        assert request.environment_risk_score == 45.0
        assert request.full_time_employees == 50000

    def test_scores_out_of_range(self):
        """Test that scores must be between 0 and 100."""
        with pytest.raises(ValidationError):
            ESGPredictionRequest(
                environment_risk_score=150.0,  # Invalid
                social_risk_score=32.0,
                governance_risk_score=28.0,
                controversy_score=15.0,
                full_time_employees=50000
            )

    def test_negative_employees(self):
        """Test that employees cannot be negative."""
        with pytest.raises(ValidationError):
            ESGPredictionRequest(
                environment_risk_score=45.0,
                social_risk_score=32.0,
                governance_risk_score=28.0,
                controversy_score=15.0,
                full_time_employees=-100  # Invalid
            )

    def test_excessive_employees(self):
        """Test validation for unreasonably large employee count."""
        with pytest.raises(ValidationError):
            ESGPredictionRequest(
                environment_risk_score=45.0,
                social_risk_score=32.0,
                governance_risk_score=28.0,
                controversy_score=15.0,
                full_time_employees=2_000_000  # Too large
            )

    def test_missing_fields(self):
        """Test that all fields are required."""
        with pytest.raises(ValidationError):
            ESGPredictionRequest(
                environment_risk_score=45.0,
                social_risk_score=32.0
                # Missing required fields
            )


class TestBatchPredictionRequest:
    """Test suite for batch prediction request schema."""

    def test_valid_batch_request(self):
        """Test valid batch prediction request."""
        data = {
            "items": [
                {
                    "environment_risk_score": 45.0,
                    "social_risk_score": 32.0,
                    "governance_risk_score": 28.0,
                    "controversy_score": 15.0,
                    "full_time_employees": 50000
                },
                {
                    "environment_risk_score": 65.0,
                    "social_risk_score": 52.0,
                    "governance_risk_score": 48.0,
                    "controversy_score": 35.0,
                    "full_time_employees": 10000
                }
            ]
        }
        request = BatchPredictionRequest(**data)
        assert len(request.items) == 2

    def test_empty_batch(self):
        """Test that empty batch is invalid."""
        with pytest.raises(ValidationError):
            BatchPredictionRequest(items=[])
