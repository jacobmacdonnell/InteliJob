import os
from typing import Optional

class Settings:
    """Application settings and configuration"""
    
    def __init__(self):
        self.rapidapi_key: Optional[str] = os.getenv("RAPIDAPI_KEY")
        self.port: int = int(os.getenv("PORT", "8000"))
        self.host: str = os.getenv("HOST", "0.0.0.0")
        self.environment: str = os.getenv("ENVIRONMENT", "development")
        
        # JSearch API Configuration
        self.jsearch_api_url: str = "https://jsearch.p.rapidapi.com/search"
        self.jsearch_api_host: str = "jsearch.p.rapidapi.com"
        
        # CORS Configuration
        self.cors_origins: list = [
            "http://localhost:3000",  # React default
            "http://localhost:5173",  # Vite default
            "http://localhost:3001",  # Alternative React port
        ]
        
        # API Rate Limiting
        self.api_timeout: int = 30
        self.max_jobs_per_request: int = 50
        
    def is_production(self) -> bool:
        return self.environment.lower() == "production"
    
    def is_rapidapi_configured(self) -> bool:
        return bool(self.rapidapi_key and self.rapidapi_key != "your_rapidapi_key_here")

# Global settings instance
settings = Settings() 