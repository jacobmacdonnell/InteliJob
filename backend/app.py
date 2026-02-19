#!/usr/bin/env python3
"""InteliJob — single entry point for both dev and standalone .exe modes."""

import sys
import os
import time
import threading
import webbrowser
from pathlib import Path

# Ensure the backend directory is on sys.path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))
os.chdir(backend_dir)

import uvicorn  # noqa: E402
from main import app  # noqa: E402


def open_browser(port: int):
    """Wait for the server to boot, then open the browser."""
    time.sleep(1.5)
    url = f"http://localhost:{port}"
    print(f"Opening browser to {url}")
    webbrowser.open(url)


def main():
    from config import settings

    frozen = getattr(sys, "frozen", False)
    port = settings.port if not frozen else 8000
    host = settings.host if not frozen else "127.0.0.1"

    print("InteliJob")
    print("=" * 40)

    if not settings.is_rapidapi_configured():
        print("  ⚠  RAPIDAPI_KEY not set — live scans disabled")
    else:
        print("  ✓  RapidAPI key configured")

    print(f"  Server: http://{host}:{port}")

    if frozen:
        # Standalone .exe — open browser automatically
        threading.Thread(target=open_browser, args=(port,), daemon=True).start()
        print("=" * 40)
        uvicorn.run(app, host=host, port=port, log_level="warning")
    else:
        # Dev mode — hot reload
        reload = not settings.is_production()
        print(f"  Docs:   http://{host}:{port}/docs")
        print(f"  Reload: {'on' if reload else 'off'}")
        print("=" * 40)
        uvicorn.run("main:app", host=host, port=port, reload=reload)


if __name__ == "__main__":
    main()
