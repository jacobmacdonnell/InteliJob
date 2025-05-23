import os
import json # Added for robust CORS parsing
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
        cors_origins_env_str: Optional[str] = os.getenv("CORS_ALLOWED_ORIGINS")
        default_cors_origins: List[str] = [
            "http://localhost:3000",  # React default
            "http://localhost:5173",  # Vite default
            "http://localhost:3001",  # Alternative React port
            # "https://your-production-frontend-url.com" # TODO: Add your production frontend URL here
        ]

        if cors_origins_env_str:
            try:
                # Attempt to parse as JSON list first (e.g., ["url1", "url2"])
                parsed_origins = json.loads(cors_origins_env_str)
                if isinstance(parsed_origins, list) and all(isinstance(origin, str) for origin in parsed_origins):
                    self.cors_origins: List[str] = [origin.strip() for origin in parsed_origins]
                else:
                    # If not a list of strings after JSON parsing, try comma-separated
                    print(f"Warning: CORS_ALLOWED_ORIGINS was valid JSON but not a list of strings. Trying as comma-separated: {cors_origins_env_str[:100]}...")
                    self.cors_origins: List[str] = [origin.strip() for origin in cors_origins_env_str.split(',')]
            except json.JSONDecodeError:
                # If JSON parsing fails, assume it's a comma-separated string (e.g., url1,url2)
                print(f"Warning: CORS_ALLOWED_ORIGINS was not valid JSON. Treating as comma-separated: {cors_origins_env_str[:100]}...")
                self.cors_origins: List[str] = [origin.strip() for origin in cors_origins_env_str.split(',')]
            except Exception as e:
                print(f"Error parsing CORS_ALLOWED_ORIGINS: {e}. Using default origins.")
                self.cors_origins: List[str] = default_cors_origins
        else:
            self.cors_origins: List[str] = default_cors_origins
        
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