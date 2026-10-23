from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator

class PropertyPredictionRequest(BaseModel):
    area: float = Field(..., ge=100.0, le=15000.0, description="Carpet/Built-up area in Square Feet", json_schema_extra={"example": 850.0})
    bedrooms: int = Field(..., ge=1, le=10, description="Number of Bedrooms (BHK)", json_schema_extra={"example": 2})
    location: str = Field(..., min_length=2, max_length=100, description="Mumbai locality name", json_schema_extra={"example": "Kharghar"})
    new_or_resale: int = Field(0, ge=0, le=1, description="0 for Resale, 1 for New property", json_schema_extra={"example": 0})
    
    # Amenities (0 or 1)
    gymnasium: int = Field(0, ge=0, le=1, description="Gymnasium facility (0/1)")
    lift_available: int = Field(1, ge=0, le=1, description="Elevator/Lift available (0/1)")
    car_parking: int = Field(1, ge=0, le=1, description="Dedicated Car Parking (0/1)")
    maintenance_staff: int = Field(0, ge=0, le=1, description="Maintenance Staff on site (0/1)")
    security_24x7: int = Field(1, ge=0, le=1, description="24x7 Security guards/CCTV (0/1)")
    children_play_area: int = Field(1, ge=0, le=1, description="Children's Play Area (0/1)")
    clubhouse: int = Field(0, ge=0, le=1, description="Community Clubhouse (0/1)")
    intercom: int = Field(0, ge=0, le=1, description="Intercom facility (0/1)")
    landscaped_gardens: int = Field(0, ge=0, le=1, description="Landscaped Gardens (0/1)")
    indoor_games: int = Field(0, ge=0, le=1, description="Indoor Games room (0/1)")
    gas_connection: int = Field(0, ge=0, le=1, description="Piped Gas Connection (0/1)")
    jogging_track: int = Field(0, ge=0, le=1, description="Jogging / Walking track (0/1)")
    swimming_pool: int = Field(0, ge=0, le=1, description="Swimming Pool (0/1)")

    @field_validator("location")
    @classmethod
    def clean_location(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Location name cannot be blank")
        return cleaned

class PredictionResponse(BaseModel):
    estimated_price_inr: float = Field(..., description="Estimated total property price in INR (₹)")
    estimated_price_formatted: str = Field(..., description="Human-readable formatted price (e.g. ₹1.25 Cr or ₹85.0 Lakhs)")
    price_per_sqft: float = Field(..., description="Estimated price per square foot in INR (₹/sqft)")
    price_per_sqft_formatted: str = Field(..., description="Formatted price per square foot")
    confidence_interval: Optional[Dict[str, Any]] = Field(None, description="Calibrated empirical prediction interval (80% confidence)")
    submitted_features: Dict[str, Any] = Field(..., description="Echo of parsed and validated feature inputs")
    location_known: bool = Field(..., description="Whether the location exists in the historical training dataset")
    location_property_count: int = Field(..., description="Number of properties recorded in this locality in the dataset")
    model_version: str = Field(..., description="Version of the model that generated the estimate")
    model_name: str = Field(..., description="Name of the selected machine learning algorithm")
    disclaimer: str = Field(..., description="Transparency and responsible estimation disclaimer")
    warnings: List[str] = Field(default_factory=list, description="Any advisory notes or outlier notices")

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_version: str
    dataset_records: int
    locations_count: int

class ModelMetricItem(BaseModel):
    model_name: str
    cv_r2_mean: float
    cv_r2_std: float
    train_mae: float
    train_rmse: float
    train_r2: float
    test_mae: float
    test_rmse: float
    test_r2: float

class ModelMetricsResponse(BaseModel):
    best_model: str
    metrics: List[ModelMetricItem]
    evaluation_notes: str
    feature_importances: List[Dict[str, Any]]

class DatasetSummaryResponse(BaseModel):
    total_records: int
    train_records: int
    test_records: int
    num_locations: int
    target_units: str
    price_summary: Dict[str, float]
    area_summary: Dict[str, float]
    bedrooms_distribution: Dict[str, int]
    new_resale_distribution: Dict[str, int]
    amenities_percentage: Dict[str, float]
    top_locations: List[Dict[str, Any]]

class LocationItem(BaseModel):
    name: str
    count: int
    avg_price: float
    median_price: float
    avg_price_per_sqft: float

class FAQItem(BaseModel):
    question: str
    answer: str
    category: str
