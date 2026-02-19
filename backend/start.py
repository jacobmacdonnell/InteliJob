#!/usr/bin/env python3
"""Startup script for InteliJob Backend."""

import sys
import os
from pathlib import Path


def main():
    """Start the FastAPI server."""
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)

    # Import settings after chdir so .env is found
    from config import settings

    print("InteliJob Backend")
    print("=" * 40)
    print(f"  Environment: {settings.environment}")

    if not settings.is_rapidapi_configured():
        print("  WARNING: RAPIDAPI_KEY not set. Live data unavailable.")
    else:
        print("  RapidAPI key: configured")

    try:
        import uvicorn
    except ImportError:
        print("ERROR: uvicorn not installed. Run: pip install -r requirements.txt")
        sys.exit(1)

    host = settings.host
    port = settings.port
    reload = not settings.is_production()

    print(f"  Server: http://{host}:{port}")
    print(f"  Docs:   http://{host}:{port}/docs")
    print(f"  Reload: {'on' if reload else 'off'}")
    print("=" * 40)

    uvicorn.run("main:app", host=host, port=port, reload=reload)


if __name__ == "__main__":
    main()
