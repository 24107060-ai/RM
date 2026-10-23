import os
import sys
import numpy as np
import pandas as pd
import pytest

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from ml.train import load_and_validate_data, build_preprocessor, ALL_FEATURE_COLUMNS, TARGET_COLUMN
from app.model_service import model_service

def test_data_validation():
    csv_path = os.path.join(os.path.dirname(backend_dir), "Mumbai1.csv")
    if os.path.exists(csv_path):
        df = load_and_validate_data(csv_path)
        assert len(df) > 6000
        assert TARGET_COLUMN in df.columns
        for col in ALL_FEATURE_COLUMNS:
            assert col in df.columns
        assert (df["Price"] > 0).all()
        assert (df["Area"] > 0).all()
        assert (df["No. of Bedrooms"] >= 1).all()

def test_preprocessor_transformation():
    preprocessor = build_preprocessor()
    sample_df = pd.DataFrame({
        "Area": [750.0, 1200.0],
        "No. of Bedrooms": [2, 3],
        "Location": ["Kharghar", "UnknownXYZ"],
        "New/Resale": [0, 1],
        "Gymnasium": [1, 0],
        "Lift Available": [1, 1],
        "Car Parking": [1, 1],
        "Maintenance Staff": [0, 1],
        "24x7 Security": [1, 1],
        "Children's Play Area": [1, 0],
        "Clubhouse": [1, 0],
        "Intercom": [1, 0],
        "Landscaped Gardens": [1, 0],
        "Indoor Games": [0, 0],
        "Gas Connection": [1, 1],
        "Jogging Track": [1, 0],
        "Swimming Pool": [1, 0]
    })
    preprocessor.fit(sample_df)
    transformed = preprocessor.transform(sample_df)
    assert transformed.shape[0] == 2
    assert not np.isnan(transformed).any()

def test_pipeline_prediction():
    assert model_service.is_loaded
    assert model_service.model is not None
    test_sample = pd.DataFrame([{
        "Area": 1000.0,
        "Location": "Andheri West",
        "No. of Bedrooms": 2,
        "New/Resale": 0,
        "Gymnasium": 1,
        "Lift Available": 1,
        "Car Parking": 1,
        "Maintenance Staff": 1,
        "24x7 Security": 1,
        "Children's Play Area": 1,
        "Clubhouse": 1,
        "Intercom": 1,
        "Landscaped Gardens": 1,
        "Indoor Games": 1,
        "Gas Connection": 1,
        "Jogging Track": 1,
        "Swimming Pool": 1
    }])
    pred = model_service.model.predict(test_sample)
    assert len(pred) == 1
    assert pred[0] > 1000000  # realistic estimate in Mumbai
