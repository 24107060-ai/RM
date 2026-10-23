import os
import json
import logging
from typing import Dict, Any
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer, TransformedTargetRegressor
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import Ridge, LinearRegression
from sklearn.ensemble import RandomForestRegressor, ExtraTreesRegressor, HistGradientBoostingRegressor
import joblib

NUMERICAL_FEATURES = ["Area", "No. of Bedrooms"]
CATEGORICAL_FEATURES = ["Location"]
BINARY_FEATURES = [
    "New/Resale",
    "Gymnasium",
    "Lift Available",
    "Car Parking",
    "Maintenance Staff",
    "24x7 Security",
    "Children's Play Area",
    "Clubhouse",
    "Intercom",
    "Landscaped Gardens",
    "Indoor Games",
    "Gas Connection",
    "Jogging Track",
    "Swimming Pool"
]

ALL_FEATURE_COLUMNS = NUMERICAL_FEATURES + CATEGORICAL_FEATURES + BINARY_FEATURES
TARGET_COLUMN = "Price"

def load_and_validate_data(csv_path: str) -> pd.DataFrame:
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}")

    df = pd.read_csv(csv_path)
    if df.columns[0] == "" or df.columns[0].startswith("Unnamed"):
        df = df.iloc[:, 1:]

    df.columns = [c.strip() for c in df.columns]
    required_cols = [TARGET_COLUMN] + ALL_FEATURE_COLUMNS
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required columns in dataset: {missing_cols}")

    df["Location"] = df["Location"].astype(str).str.strip()
    # Filter non-positive impossible values
    df = df[(df["Price"] > 100000) & (df["Area"] >= 100) & (df["No. of Bedrooms"] >= 1)].copy()
    print(f"Loaded {len(df)} validated records from {csv_path}", flush=True)
    return df

def build_preprocessor() -> ColumnTransformer:
    numeric_transformer = Pipeline(steps=[
        ("scaler", StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ("onehot", OneHotEncoder(handle_unknown="ignore", min_frequency=5, sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERICAL_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
            ("bin", "passthrough", BINARY_FEATURES)
        ],
        remainder="drop"
    )
    return preprocessor

def evaluate_models(X_train: pd.DataFrame, y_train: pd.Series, X_test: pd.DataFrame, y_test: pd.Series) -> Dict[str, Any]:
    models = {
        "Dummy (Median)": DummyRegressor(strategy="median"),
        "Ridge Regression": Ridge(alpha=10.0),
        "Random Forest": RandomForestRegressor(n_estimators=100, max_depth=16, random_state=42, n_jobs=2),
        "Extra Trees": ExtraTreesRegressor(n_estimators=100, max_depth=16, random_state=42, n_jobs=2),
        "HistGradientBoosting": HistGradientBoostingRegressor(max_iter=100, max_depth=8, random_state=42)
    }

    results = {}
    best_model_name = None
    best_test_r2 = -float("inf")
    fitted_pipelines = {}

    preprocessor = build_preprocessor()
    kf = KFold(n_splits=5, shuffle=True, random_state=42)

    for name, reg in models.items():
        print(f"Evaluating {name}...", flush=True)
        if name == "Dummy (Median)":
            pipe = Pipeline(steps=[
                ("preprocessor", preprocessor),
                ("regressor", reg)
            ])
        else:
            pipe = Pipeline(steps=[
                ("preprocessor", preprocessor),
                ("regressor", TransformedTargetRegressor(regressor=reg, func=np.log1p, inverse_func=np.expm1))
            ])

        # Cross-validation on train set (sequential to avoid multiprocessing overhead on Windows)
        cv_scores = cross_val_score(pipe, X_train, y_train, cv=kf, scoring="r2", n_jobs=1)

        # Fit on full train set
        pipe.fit(X_train, y_train)
        fitted_pipelines[name] = pipe

        y_train_pred = np.maximum(pipe.predict(X_train), 100000)
        y_test_pred = np.maximum(pipe.predict(X_test), 100000)

        train_mae = float(mean_absolute_error(y_train, y_train_pred))
        train_rmse = float(np.sqrt(mean_squared_error(y_train, y_train_pred)))
        train_r2 = float(r2_score(y_train, y_train_pred))

        test_mae = float(mean_absolute_error(y_test, y_test_pred))
        test_rmse = float(np.sqrt(mean_squared_error(y_test, y_test_pred)))
        test_r2 = float(r2_score(y_test, y_test_pred))

        results[name] = {
            "cv_r2_mean": float(np.mean(cv_scores)),
            "cv_r2_std": float(np.std(cv_scores)),
            "train_mae": round(train_mae, 2),
            "train_rmse": round(train_rmse, 2),
            "train_r2": round(train_r2, 4),
            "test_mae": round(test_mae, 2),
            "test_rmse": round(test_rmse, 2),
            "test_r2": round(test_r2, 4)
        }
        print(f"[{name}] CV R2: {np.mean(cv_scores):.4f} +/- {np.std(cv_scores):.4f} | Test R2: {test_r2:.4f} | Test MAE: INR {test_mae:,.0f} | Test RMSE: INR {test_rmse:,.0f}", flush=True)

        if test_r2 > best_test_r2:
            best_test_r2 = test_r2
            best_model_name = name

    print(f"\n>>> Selected Best Model: {best_model_name} (Test R2: {best_test_r2:.4f})", flush=True)
    return {
        "results": results,
        "best_model_name": best_model_name,
        "best_pipeline": fitted_pipelines[best_model_name],
        "fitted_pipelines": fitted_pipelines
    }

def train_and_export(csv_path: str, output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    df = load_and_validate_data(csv_path)

    X = df[ALL_FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    eval_output = evaluate_models(X_train, y_train, X_test, y_test)
    best_name = eval_output["best_model_name"]
    best_pipeline = eval_output["best_pipeline"]
    metrics_summary = eval_output["results"]

    y_test_pred = np.maximum(best_pipeline.predict(X_test), 100000)
    log_residuals = np.log(y_test) - np.log(y_test_pred)
    residual_std_log = float(np.std(log_residuals))

    # Calculate Feature Importances if available on best model
    feature_importances = []
    try:
        regressor_obj = best_pipeline.named_steps["regressor"].regressor_
        if hasattr(regressor_obj, "feature_importances_"):
            preproc = best_pipeline.named_steps["preprocessor"]
            feature_names = preproc.get_feature_names_out()
            raw_importances = regressor_obj.feature_importances_
            # Group or take top 15
            for fn, imp in sorted(zip(feature_names, raw_importances), key=lambda x: x[1], reverse=True)[:15]:
                clean_name = fn.replace("num__", "").replace("cat__Location_", "Location: ").replace("bin__", "")
                feature_importances.append({"feature": clean_name, "importance": round(float(imp), 4)})
    except Exception as e:
        print(f"Could not extract feature importances: {e}", flush=True)

    location_counts = df["Location"].value_counts().to_dict()
    location_price_stats = {}
    for loc, group in df.groupby("Location"):
        location_price_stats[loc] = {
            "count": int(len(group)),
            "avg_price": round(float(group["Price"].mean()), 2),
            "median_price": round(float(group["Price"].median()), 2),
            "avg_price_per_sqft": round(float((group["Price"] / group["Area"]).mean()), 2),
            "median_price_per_sqft": round(float((group["Price"] / group["Area"]).median()), 2),
            "min_area": float(group["Area"].min()),
            "max_area": float(group["Area"].max())
        }

    dataset_summary = {
        "total_records": int(len(df)),
        "train_records": int(len(X_train)),
        "test_records": int(len(X_test)),
        "num_locations": int(df["Location"].nunique()),
        "target_col": TARGET_COLUMN,
        "target_units": "INR (₹)",
        "price_min": float(df["Price"].min()),
        "price_max": float(df["Price"].max()),
        "price_mean": round(float(df["Price"].mean()), 2),
        "price_median": round(float(df["Price"].median()), 2),
        "price_std": round(float(df["Price"].std()), 2),
        "area_min": float(df["Area"].min()),
        "area_max": float(df["Area"].max()),
        "area_mean": round(float(df["Area"].mean()), 2),
        "area_median": round(float(df["Area"].median()), 2),
        "bedrooms_dist": {str(k): int(v) for k, v in df["No. of Bedrooms"].value_counts().sort_index().items()},
        "new_resale_dist": {str(k): int(v) for k, v in df["New/Resale"].value_counts().items()},
        "amenities_pct": {a: round(float(df[a].mean() * 100), 1) for a in BINARY_FEATURES if a != "New/Resale"}
    }

    model_path = os.path.join(output_dir, "model_pipeline.joblib")
    joblib.dump(best_pipeline, model_path)
    print(f"Saved trained pipeline to {model_path}", flush=True)

    metadata = {
        "model_version": "1.0.0",
        "model_name": best_name,
        "dataset_source": "Mumbai Residential Property Dataset (Mumbai1.csv)",
        "features": {
            "numerical": NUMERICAL_FEATURES,
            "categorical": CATEGORICAL_FEATURES,
            "binary": BINARY_FEATURES,
            "all": ALL_FEATURE_COLUMNS
        },
        "target": {
            "name": TARGET_COLUMN,
            "units": "INR (₹)",
            "description": "Total property price in Indian Rupees"
        },
        "metrics": metrics_summary,
        "feature_importances": feature_importances,
        "residual_std_log": round(residual_std_log, 4),
        "dataset_summary": dataset_summary,
        "supported_locations": sorted(list(location_counts.keys())),
        "location_stats": location_price_stats
    }

    metadata_path = os.path.join(output_dir, "metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved metadata to {metadata_path}", flush=True)
    return metadata

if __name__ == "__main__":
    import sys
    csv_file = sys.argv[1] if len(sys.argv) > 1 else "Mumbai1.csv"
    out_dir = sys.argv[2] if len(sys.argv) > 2 else "backend/ml/artifacts"
    train_and_export(csv_file, out_dir)
