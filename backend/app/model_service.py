import os
import json
import logging
from typing import Optional, Dict, Any, List
import joblib
import numpy as np
import pandas as pd
from app.config import settings
from app.schemas import PropertyPredictionRequest, PredictionResponse

logger = logging.getLogger(__name__)

class ModelService:
    def __init__(self):
        self.model = None
        self.metadata = None
        self.is_loaded = False
        self.load()

    def load(self):
        """Load trained pipeline and metadata from artifacts."""
        if not os.path.exists(settings.MODEL_PATH) or not os.path.exists(settings.METADATA_PATH):
            logger.warning(f"Model artifacts not found at {settings.MODEL_PATH}. Prediction service disabled.")
            self.model = None
            self.metadata = None
            self.is_loaded = False
            return

        try:
            self.model = joblib.load(settings.MODEL_PATH)
            with open(settings.METADATA_PATH, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)
            self.is_loaded = True
            logger.info(f"Loaded model {self.metadata.get('model_name')} v{self.metadata.get('model_version')}")
        except Exception as e:
            logger.error(f"Failed to load model pipeline: {e}")
            self.model = None
            self.metadata = None
            self.is_loaded = False

    @staticmethod
    def format_inr(val: float) -> str:
        """Format number into Indian currency notation (Crores / Lakhs)."""
        if val >= 10000000:
            crores = val / 10000000
            return f"₹{crores:.2f} Cr"
        elif val >= 100000:
            lakhs = val / 100000
            return f"₹{lakhs:.2f} Lakh"
        else:
            return f"₹{val:,.0f}"

    def predict(self, req: PropertyPredictionRequest) -> PredictionResponse:
        if not self.is_loaded or self.model is None:
            raise RuntimeError("Model artifact is not loaded or unavailable on server.")

        # Construct single-row DataFrame matching the exact feature order
        feature_dict = {
            "Area": [float(req.area)],
            "Location": [req.location.strip()],
            "No. of Bedrooms": [int(req.bedrooms)],
            "New/Resale": [int(req.new_or_resale)],
            "Gymnasium": [int(req.gymnasium)],
            "Lift Available": [int(req.lift_available)],
            "Car Parking": [int(req.car_parking)],
            "Maintenance Staff": [int(req.maintenance_staff)],
            "24x7 Security": [int(req.security_24x7)],
            "Children's Play Area": [int(req.children_play_area)],
            "Clubhouse": [int(req.clubhouse)],
            "Intercom": [int(req.intercom)],
            "Landscaped Gardens": [int(req.landscaped_gardens)],
            "Indoor Games": [int(req.indoor_games)],
            "Gas Connection": [int(req.gas_connection)],
            "Jogging Track": [int(req.jogging_track)],
            "Swimming Pool": [int(req.swimming_pool)],
        }
        X_df = pd.DataFrame(feature_dict)

        # Raw pipeline prediction
        raw_pred = float(self.model.predict(X_df)[0])
        # Safety clamp to realistic positive minimum
        pred_price = max(raw_pred, 100000.0)
        price_per_sqft = pred_price / req.area

        # Check location familiarity
        location_stats = self.metadata.get("location_stats", {})
        supported_locs = self.metadata.get("supported_locations", [])
        matched_loc = None
        for loc in supported_locs:
            if loc.lower() == req.location.strip().lower():
                matched_loc = loc
                break

        location_known = matched_loc is not None
        location_count = location_stats.get(matched_loc, {}).get("count", 0) if matched_loc else 0

        warnings = []
        if not location_known:
            warnings.append(
                f"'{req.location}' was not seen in the historical training dataset. Prediction used regional MMR base tier encoding; treat with wider uncertainty."
            )
        elif location_count < 5:
            warnings.append(
                f"'{matched_loc}' has only {location_count} historical records in the dataset; statistical confidence is moderate."
            )

        if req.area > 5000:
            warnings.append("Area exceeds 5,000 sq ft, which represents the top 1% luxury tail of the dataset.")

        # Compute empirical 80% confidence interval (z = 1.282) using validated log residuals
        residual_std_log = self.metadata.get("residual_std_log", 0.45)
        z = 1.282  # 80% two-sided normal interval
        ci_lower = max(float(np.exp(np.log(pred_price) - z * residual_std_log)), 100000.0)
        ci_upper = float(np.exp(np.log(pred_price) + z * residual_std_log))

        ci_data = {
            "confidence_level": "80%",
            "lower_bound_inr": round(ci_lower, 2),
            "upper_bound_inr": round(ci_upper, 2),
            "lower_formatted": self.format_inr(ci_lower),
            "upper_formatted": self.format_inr(ci_upper),
            "explanation": (
                "Empirical 80% prediction interval computed from test residual error distribution. "
                "Approximately 80% of actual property prices are expected to fall within this band."
            )
        }

        submitted = {
            "area_sqft": req.area,
            "bedrooms": req.bedrooms,
            "location": req.location,
            "property_type": "New Construction" if req.new_or_resale == 1 else "Resale",
            "amenities_count": sum([
                req.gymnasium, req.lift_available, req.car_parking, req.maintenance_staff,
                req.security_24x7, req.children_play_area, req.clubhouse, req.intercom,
                req.landscaped_gardens, req.indoor_games, req.gas_connection,
                req.jogging_track, req.swimming_pool
            ])
        }

        disclaimer = (
            "This figure is a statistical estimate produced by machine learning trained on historical "
            "Mumbai real estate records (Mumbai1.csv). It does not constitute an appraisal, formal valuation, "
            "or guarantee of market price. Actual market rates depend on floor level, view, legal title, "
            "developer reputation, exact road width, and current market negotiations."
        )

        return PredictionResponse(
            estimated_price_inr=round(pred_price, 2),
            estimated_price_formatted=self.format_inr(pred_price),
            price_per_sqft=round(price_per_sqft, 2),
            price_per_sqft_formatted=f"₹{price_per_sqft:,.0f} / sq ft",
            confidence_interval=ci_data,
            submitted_features=submitted,
            location_known=location_known,
            location_property_count=location_count,
            model_version=self.metadata.get("model_version", "1.0.0"),
            model_name=self.metadata.get("model_name", "Machine Learning Model"),
            disclaimer=disclaimer,
            warnings=warnings
        )

model_service = ModelService()
