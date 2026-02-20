import os


class Settings:
    """App configuration — reads from env vars with sensible defaults."""

    def __init__(self):
        self.rapidapi_key = os.getenv("RAPIDAPI_KEY")
        self.port = int(os.getenv("PORT", "8000"))
        self.host = os.getenv("HOST", "0.0.0.0")
        self.environment = os.getenv("ENVIRONMENT", "development")

        # JSearch API
        self.jsearch_api_url = "https://jsearch.p.rapidapi.com/search"
        self.jsearch_api_host = "jsearch.p.rapidapi.com"

        # Admin/auth for protected endpoints (Removed for personal usetool)

        # Scan retention limits
        self.scan_retention_days = int(os.getenv("SCAN_RETENTION_DAYS", "0"))
        self.max_scan_rows = int(os.getenv("MAX_SCAN_ROWS", "0"))

    def is_rapidapi_configured(self) -> bool:
        return bool(
            self.rapidapi_key
            and self.rapidapi_key
            not in ("your_rapidapi_key_here", "your_actual_rapidapi_key_here")
        )

    def is_production(self) -> bool:
        """Whether the app is running in production mode."""
        return self.environment.lower() == "production"


settings = Settings()
