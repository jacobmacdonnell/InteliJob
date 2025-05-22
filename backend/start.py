#!/usr/bin/env python3
"""
Startup script for Job Intelligence Scanner Backend
Optimized for both development and production deployment.
"""

import sys
import subprocess
import os
from pathlib import Path
from config import settings # Import settings

def ensure_dependencies_and_model(install_if_missing: bool = False):
    """
    Check if dependencies and spaCy model are present.
    Optionally install them if install_if_missing is True (for local dev).
    """
    print("🔍 Checking dependencies and spaCy model...")
    
    # Check for a key dependency to infer if requirements are met
    try:
        import fastapi
    except ImportError:
        if install_if_missing:
            print("📦 FastAPI not found. Installing Python dependencies...")
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
                print("✅ Dependencies installed successfully.")
            except subprocess.CalledProcessError as e:
                print(f"❌ Failed to install dependencies: {e}")
                sys.exit(1)
        else:
            print("⚠️ Key dependency (FastAPI) not found. Run with --install-deps or ensure requirements.txt is processed by your deployment platform.")
            # In a production environment, we might not want to exit here if the platform handles it
            # For now, we'll allow it to proceed, Uvicorn will fail if FastAPI isn't there.

    # Check for spaCy model
    try:
        import spacy
        spacy.load("en_core_web_sm")
        print("✅ spaCy model 'en_core_web_sm' found.")
    except (ImportError, IOError):
        if install_if_missing:
            print("🧠 spaCy model 'en_core_web_sm' not found. Downloading...")
            try:
                subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
                print("✅ spaCy model downloaded successfully.")
            except subprocess.CalledProcessError as e:
                print(f"⚠️ Failed to download spaCy model: {e}. NLP features might be limited.")
        else:
            print("⚠️ spaCy model 'en_core_web_sm' not found. Ensure it's part of your deployment build process. NLP features might be limited.")

def check_environment_variables():
    """Check if essential environment variables are configured."""
    print("🔍 Checking environment variables...")
    if not settings.is_rapidapi_configured():
        print("⚠️  RAPIDAPI_KEY environment variable not set or is a placeholder.")
        print("   JSearch API integration will be disabled. Live job data will not be available.")
        print("   To enable, set RAPIDAPI_KEY in your environment or .env file.")
    else:
        print("✅ RAPIDAPI_KEY is configured.")
    return True # Continue regardless for now

def start_server():
    """Start the FastAPI server using Uvicorn, configured for the environment."""
    print("🚀 Starting Job Intelligence Scanner API...")
    
    host = settings.host
    port = settings.port
    
    uvicorn_args = [
        "main:app",
        "--host", host,
        "--port", str(port)
    ]

    if settings.is_production():
        print("   Running in PRODUCTION mode.")
        # Add production-specific Uvicorn settings
        workers = os.getenv("WEB_CONCURRENCY", None) # Standard for Heroku, Render etc.
        if workers:
             uvicorn_args.extend(["--workers", str(workers)])
        else:
            # Default to a sensible number if not specified, e.g., based on CPU cores
            # For simplicity, we'll let Uvicorn use its default (1 worker) if not set
            print("   WEB_CONCURRENCY not set, Uvicorn will use its default worker count (usually 1).")
        # Ensure reload is OFF for production
        # uvicorn_args.append("--no-reload") # Uvicorn's default is no-reload
    else:
        print("   Running in DEVELOPMENT mode with reload enabled.")
        uvicorn_args.append("--reload")

    try:
        import uvicorn
        print(f"   Uvicorn command: uvicorn {' '.join(uvicorn_args)}")
        uvicorn.run(*uvicorn_args)
    except ImportError:
        print("❌ uvicorn not found. Please ensure it's in requirements.txt and installed.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Failed to start Uvicorn server: {e}")
        sys.exit(1)

def main():
    """Main startup function."""
    print("✨ Job Intelligence Scanner Backend Startup ✨")
    print("=" * 45)
    
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir) # Ensure we are in the backend directory
    
    # Handle command-line arguments for local development
    install_deps_locally = "--install-deps" in sys.argv
    
    ensure_dependencies_and_model(install_if_missing=install_deps_locally)
    check_environment_variables()
    
    print("\n" + "=" * 45)
    print(f"🎉 Setup checks complete. Starting API server...")
    print(f"   Environment: {settings.environment}")
    print(f"   API will be available at: http://{settings.host}:{settings.port}")
    print(f"   API docs (if not disabled in prod): http://{settings.host}:{settings.port}/docs")
    print("=" * 45)
    
    start_server()

if __name__ == "__main__":
    main() 