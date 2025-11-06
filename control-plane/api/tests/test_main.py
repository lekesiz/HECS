"""
Tests for main application
"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "version" in data
    assert "status" in data
    assert data["status"] == "running"


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "version" in data


def test_api_status():
    """Test API status endpoint"""
    response = client.get("/api/v1/status")
    assert response.status_code == 200
    data = response.json()
    assert data["api_version"] == "v1"
    assert data["status"] == "operational"
    assert "endpoints" in data


def test_not_found():
    """Test 404 handler"""
    response = client.get("/non-existent-endpoint")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert data["error"] == "Not Found"
