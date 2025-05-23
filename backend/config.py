import os
from typing import Optional, List

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
        # For production, set this environment variable to a comma-separated list of allowed origins
        # e.g., "https://your-frontend.com,https://another-domain.com"
        cors_origins_env = os.getenv("CORS_ALLOWED_ORIGINS")
        if cors_origins_env:
            self.cors_origins: List[str] = [origin.strip() for origin in cors_origins_env.split(',')]
        else:
            self.cors_origins: List[str] = [
                "http://localhost:3000",  # React default
                "http://localhost:5173",  # Vite default
                "http://localhost:3001",  # Alternative React port
                # "https://your-production-frontend-url.com" # TODO: Add your production frontend URL here
            ]
        
        # API Rate Limiting (example, not implemented in current API)
        self.api_timeout: int = 30 # For httpx client calls
        # self.max_jobs_per_request: int = 50 # Example if you were to implement rate limits

        # Rate Limiting Configuration
        self.rate_limit_default: str = os.getenv("RATE_LIMIT_DEFAULT", "100/minute")
        self.rate_limit_strategy: str = os.getenv("RATE_LIMIT_STRATEGY", "moving-window") # or "fixed-window", "fixed-window-elastic-expiry"
        
    def is_production(self) -> bool:
        return self.environment.lower() == "production"
    
    def is_rapidapi_configured(self) -> bool:
        return bool(self.rapidapi_key and self.rapidapi_key != "your_rapidapi_key_here" and self.rapidapi_key != "your_actual_rapidapi_key_here")

# Global settings instance
settings = Settings() 