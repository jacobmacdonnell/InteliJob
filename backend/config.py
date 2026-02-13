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

        # Rate limiting
        self.rate_limit_default = os.getenv("RATE_LIMIT_DEFAULT", "100/minute")
        self.rate_limit_strategy = os.getenv("RATE_LIMIT_STRATEGY", "moving-window")

    def is_rapidapi_configured(self) -> bool:
        return bool(self.rapidapi_key and self.rapidapi_key not in (
            "your_rapidapi_key_here", "your_actual_rapidapi_key_here"
        ))

settings = Settings()