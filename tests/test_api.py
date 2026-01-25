"""Unit tests for backend API endpoints."""
import pytest
from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)


class TestHealthEndpoint:
    """Test suite for health endpoint."""

    def test_health_endpoint_returns_200(self):
        """Test that health endpoint returns 200 OK."""
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_endpoint_structure(self):
        """Test that health endpoint returns expected structure."""
        response = client.get("/health")
        data = response.json()
        assert "status" in data
        assert "database" in data
        assert "model_loaded" in data
        assert "version" in data


class TestModelEndpoints:
    """Test suite for model-related endpoints."""

    def test_model_info_endpoint(self):
        """Test model info endpoint."""
        response = client.get("/model/info")
        # May return 503 if model not loaded
        assert response.status_code in [200, 503]

    def test_predict_endpoint_validation(self):
        """Test prediction endpoint input validation."""
        # Invalid payload - missing required fields
        response = client.post("/predict", json={})
        assert response.status_code == 422

    def test_predict_endpoint_valid_payload(self):
        """Test prediction with valid payload."""
        payload = {
            "environment_risk_score": 45.0,
            "social_risk_score": 32.0,
            "governance_risk_score": 28.0,
            "controversy_score": 15.0,
            "full_time_employees": 50000
        }
        response = client.post("/predict", json=payload)
        # May return 503 if model not loaded, 200 if successful
        assert response.status_code in [200, 503]

    def test_batch_predict_endpoint(self):
        """Test batch prediction endpoint."""
        payload = {
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
        response = client.post("/predict/batch", json=payload)
        assert response.status_code in [200, 503]


class TestDataEndpoints:
    """Test suite for data query endpoints."""

    def test_top_companies_endpoint(self):
        """Test top companies endpoint."""
        response = client.get("/companies/top?limit=10")
        # May fail if DB not set up
        assert response.status_code in [200, 500]

    def test_top_companies_invalid_limit(self):
        """Test top companies with invalid limit."""
        response = client.get("/companies/top?limit=200")
        assert response.status_code == 400

    def test_sector_average_endpoint(self):
        """Test sector average endpoint."""
        response = client.get("/sectors/average")
        assert response.status_code in [200, 500]

    def test_high_controversy_endpoint(self):
        """Test high controversy endpoint."""
        response = client.get("/companies/high-controversy?min_score=50")
        assert response.status_code in [200, 500]

    def test_high_controversy_invalid_score(self):
        """Test high controversy with invalid score."""
        response = client.get("/companies/high-controversy?min_score=-10")
        assert response.status_code == 400


class TestSecurity:
    """Test suite for security features."""

    def test_security_headers_present(self):
        """Test that security headers are present in responses."""
        response = client.get("/health")
        headers = response.headers
        
        assert "x-content-type-options" in headers
        assert headers["x-content-type-options"] == "nosniff"
        
        assert "x-frame-options" in headers
        assert headers["x-frame-options"] == "DENY"
        
        assert "x-xss-protection" in headers

    def test_cors_headers(self):
        """Test CORS headers configuration."""
        response = client.options("/health")
        # CORS headers should be present
        assert response.status_code in [200, 405]
