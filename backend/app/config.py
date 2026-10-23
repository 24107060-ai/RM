import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "Mumbai Estate AI API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Base directories
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ARTIFACTS_DIR: str = os.path.join(BASE_DIR, "ml", "artifacts")
    MODEL_PATH: str = os.path.join(ARTIFACTS_DIR, "model_pipeline.joblib")
    METADATA_PATH: str = os.path.join(ARTIFACTS_DIR, "metadata.json")
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
