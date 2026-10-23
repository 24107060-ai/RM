import pytest
from fastapi.testclient import TestClient
import os
import sys

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.model_service import model_service

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "model_loaded" in data
    assert "model_version" in data
    assert data["dataset_records"] >= 6000

def test_metadata_endpoint():
    response = client.get("/metadata")
    assert response.status_code == 200
    data = response.json()
    assert "features" in data
    assert "target" in data
    assert data["target"]["units"] == "INR (₹)"
    assert len(data["supported_locations"]) > 300

def test_model_metrics_endpoint():
    response = client.get("/model-metrics")
    assert response.status_code == 200
    data = response.json()
    assert "best_model" in data
    assert "metrics" in data
    assert len(data["metrics"]) >= 4  # Dummy, Ridge, RF, Extra Trees, HistGradientBoosting
    dummy = next((m for m in data["metrics"] if "Dummy" in m["model_name"]), None)
    best = next((m for m in data["metrics"] if m["model_name"] == data["best_model"]), None)
    assert dummy is not None
    assert best is not None
    # Best model should beat dummy
    assert best["test_mae"] < dummy["test_mae"]

def test_predict_valid_property():
    payload = {
        "area": 850.0,
        "bedrooms": 2,
        "location": "Kharghar",
        "new_or_resale": 0,
        "gymnasium": 1,
        "lift_available": 1,
        "car_parking": 1,
        "maintenance_staff": 1,
        "security_24x7": 1,
        "children_play_area": 1,
        "clubhouse": 1,
        "intercom": 1,
        "landscaped_gardens": 1,
        "indoor_games": 0,
        "gas_connection": 1,
        "jogging_track": 1,
        "swimming_pool": 1
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["estimated_price_inr"] > 1000000  # realistic price > 10 Lakhs
    assert "Cr" in data["estimated_price_formatted"] or "Lakh" in data["estimated_price_formatted"]
    assert data["price_per_sqft"] > 1000
    assert data["location_known"] is True
    assert data["confidence_interval"] is not None
    assert data["confidence_interval"]["lower_bound_inr"] < data["estimated_price_inr"]
    assert data["confidence_interval"]["upper_bound_inr"] > data["estimated_price_inr"]

def test_predict_unseen_location():
    payload = {
        "area": 1200.0,
        "bedrooms": 3,
        "location": "NonExistentSuburbsXYZ",
        "new_or_resale": 1,
        "gymnasium": 1,
        "lift_available": 1,
        "car_parking": 1,
        "maintenance_staff": 0,
        "security_24x7": 1,
        "children_play_area": 0,
        "clubhouse": 0,
        "intercom": 0,
        "landscaped_gardens": 0,
        "indoor_games": 0,
        "gas_connection": 0,
        "jogging_track": 0,
        "swimming_pool": 0
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["location_known"] is False
    assert any("not seen in the historical training dataset" in w for w in data["warnings"])

def test_predict_invalid_inputs():
    # Negative area
    bad_payload_area = {
        "area": -50.0,
        "bedrooms": 2,
        "location": "Thane West"
    }
    res1 = client.post("/predict", json=bad_payload_area)
    assert res1.status_code == 422  # Unprocessable Entity

    # Zero bedrooms
    bad_payload_bhk = {
        "area": 600.0,
        "bedrooms": 0,
        "location": "Thane West"
    }
    res2 = client.post("/predict", json=bad_payload_bhk)
    assert res2.status_code == 422

    # Blank location
    bad_payload_loc = {
        "area": 600.0,
        "bedrooms": 1,
        "location": "   "
    }
    res3 = client.post("/predict", json=bad_payload_loc)
    assert res3.status_code == 422

def test_dataset_summary_endpoint():
    response = client.get("/api/dataset/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_records"] == 6347
    assert data["price_summary"]["min"] >= 2000000
    assert len(data["top_locations"]) > 0

def test_locations_endpoint():
    response = client.get("/api/dataset/locations?q=Khar")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(loc["name"] == "Kharghar" for loc in data)
