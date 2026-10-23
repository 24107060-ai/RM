export interface PropertyPredictionRequest {
  area: number;
  bedrooms: number;
  location: string;
  new_or_resale: number;
  gymnasium: number;
  lift_available: number;
  car_parking: number;
  maintenance_staff: number;
  security_24x7: number;
  children_play_area: number;
  clubhouse: number;
  intercom: number;
  landscaped_gardens: number;
  indoor_games: number;
  gas_connection: number;
  jogging_track: number;
  swimming_pool: number;
}

export interface ConfidenceInterval {
  confidence_level: string;
  lower_bound_inr: number;
  upper_bound_inr: number;
  lower_formatted: string;
  upper_formatted: string;
  explanation: string;
}

export interface PredictionResponse {
  estimated_price_inr: number;
  estimated_price_formatted: string;
  price_per_sqft: number;
  price_per_sqft_formatted: string;
  confidence_interval?: ConfidenceInterval;
  submitted_features: {
    area_sqft: number;
    bedrooms: number;
    location: string;
    property_type: string;
    amenities_count: number;
  };
  location_known: boolean;
  location_property_count: number;
  model_version: string;
  model_name: string;
  disclaimer: string;
  warnings: string[];
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  model_version: string;
  dataset_records: number;
  locations_count: number;
}

export interface ModelMetricItem {
  model_name: string;
  cv_r2_mean: number;
  cv_r2_std: number;
  train_mae: number;
  train_rmse: number;
  train_r2: number;
  test_mae: number;
  test_rmse: number;
  test_r2: number;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
}

export interface ModelMetricsResponse {
  best_model: string;
  metrics: ModelMetricItem[];
  evaluation_notes: string;
  feature_importances: FeatureImportanceItem[];
}

export interface LocationItem {
  name: string;
  count: number;
  avg_price: number;
  median_price: number;
  avg_price_per_sqft: number;
}

export interface DatasetSummaryResponse {
  total_records: number;
  train_records: number;
  test_records: number;
  num_locations: number;
  target_units: string;
  price_summary: {
    min: number;
    max: number;
    mean: number;
    median: number;
    std: number;
  };
  area_summary: {
    min: number;
    max: number;
    mean: number;
    median: number;
  };
  bedrooms_distribution: Record<string, number>;
  new_resale_distribution: Record<string, number>;
  amenities_percentage: Record<string, number>;
  top_locations: LocationItem[];
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}
