import os

class Settings:
    """App configuration — reads from env vars with sensible defaults."""

    def __init__(self):
        self.rapidapi_key = os.getenv("RAPIDAPI_KEY")
        self.port = int(os.getenv("PORT", "8000"))
        # Local-safe default: bind loopback unless explicitly overridden
        self.host = os.getenv("HOST", "127.0.0.1")
        self.environment = os.getenv("ENVIRONMENT", "development")

        # CORS
        default_origins = "http://localhost:5173,http://localhost:3000"
        raw_origins = os.getenv("CORS_ORIGINS", default_origins)
        self.cors_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

        # JSearch API
        self.jsearch_api_url = "https://jsearch.p.rapidapi.com/search"
        self.jsearch_api_host = "jsearch.p.rapidapi.com"

        # Rate limiting
        self.rate_limit_default = os.getenv("RATE_LIMIT_DEFAULT", "100/minute")
        self.rate_limit_strategy = os.getenv("RATE_LIMIT_STRATEGY", "moving-window")

        # Admin/auth for protected endpoints
        self.admin_api_key = os.getenv("ADMIN_API_KEY")

        # Scan retention limits
        self.scan_retention_days = int(os.getenv("SCAN_RETENTION_DAYS", "0"))
        self.max_scan_rows = int(os.getenv("MAX_SCAN_ROWS", "0"))

    def is_rapidapi_configured(self) -> bool:
        return bool(self.rapidapi_key and self.rapidapi_key not in (
            "your_rapidapi_key_here", "your_actual_rapidapi_key_here"
        ))

    def is_production(self) -> bool:
        """Whether the app is running in production mode."""
        return self.environment.lower() == "production"

settings = Settings()
