"""Pytest configuration and fixtures."""
import pytest
import os


@pytest.fixture(scope="session")
def test_env():
    """Set up test environment variables."""
    os.environ["ENVIRONMENT"] = "test"
    os.environ["DB_HOST"] = "localhost"
    os.environ["DB_PORT"] = "5432"
    os.environ["DB_NAME"] = "esg_db_test"
    os.environ["DB_USER"] = "postgres"
    os.environ["DB_PASSWORD"] = "postgres"
    os.environ["LOG_LEVEL"] = "DEBUG"
    yield
    # Cleanup after tests


@pytest.fixture
def sample_esg_data():
    """Provide sample ESG data for testing."""
    return {
        "environment_risk_score": 45.0,
        "social_risk_score": 32.0,
        "governance_risk_score": 28.0,
        "controversy_score": 15.0,
        "full_time_employees": 50000
    }


@pytest.fixture
def sample_batch_data():
    """Provide sample batch ESG data for testing."""
    return [
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
