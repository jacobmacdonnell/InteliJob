#!/usr/bin/env python3
"""
Startup script for Job Intelligence Scanner Backend
Handles dependency installation and server startup
"""

import sys
import subprocess
import os
from pathlib import Path

def install_dependencies():
    """Install required Python packages"""
    print("📦 Installing Python dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False
    return True

def install_spacy_model():
    """Install spaCy English model"""
    print("🧠 Installing spaCy English model...")
    try:
        subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
        print("✅ spaCy model installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"⚠️  Failed to install spaCy model: {e}")
        print("The API will work without spaCy but with reduced NLP capabilities")
        return False
    return True

def check_environment():
    """Check if environment is properly configured"""
    rapidapi_key = os.getenv("RAPIDAPI_KEY")
    
    if not rapidapi_key:
        print("⚠️  RAPIDAPI_KEY environment variable not set")
        print("📝 To use the JSearch API, you need to:")
        print("   1. Get a free API key from: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch/")
        print("   2. Set the environment variable: export RAPIDAPI_KEY=your_key_here")
        print("   3. Or create a .env file with: RAPIDAPI_KEY=your_key_here")
        return False
    
    print("✅ Environment configuration looks good")
    return True

def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting Job Intelligence Scanner API...")
    try:
        import uvicorn
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    except ImportError:
        print("❌ uvicorn not found. Installing...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "uvicorn[standard]"])
        import uvicorn
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

def main():
    """Main startup function"""
    print("🔍 Job Intelligence Scanner Backend Setup")
    print("=" * 45)
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Install dependencies
    if not install_dependencies():
        sys.exit(1)
    
    # Install spaCy model (optional)
    install_spacy_model()
    
    # Check environment
    env_ok = check_environment()
    if not env_ok:
        print("\n⚠️  API will run with limited functionality without RapidAPI key")
        response = input("Continue anyway? (y/N): ").strip().lower()
        if response != 'y':
            print("Setup cancelled. Please configure your environment and try again.")
            sys.exit(1)
    
    print("\n" + "=" * 45)
    print("🎉 Setup complete! Starting server...")
    print("📡 API will be available at: http://localhost:8000")
    print("📖 API docs will be available at: http://localhost:8000/docs")
    print("=" * 45)
    
    # Start the server
    start_server()

if __name__ == "__main__":
    main() 