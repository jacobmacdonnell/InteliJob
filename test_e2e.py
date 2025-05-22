#!/usr/bin/env python3
"""
End-to-End Test Suite for Job Intelligence Scanner
Tests the complete application stack including backend API and frontend accessibility
"""

import asyncio
import sys
import requests
import time
from pathlib import Path

# Configuration
BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"
TEST_TIMEOUT = 30

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_status(message, status="info"):
    icons = {"success": "✅", "error": "❌", "warning": "⚠️", "info": "🔍"}
    colors = {"success": Colors.GREEN, "error": Colors.RED, "warning": Colors.YELLOW, "info": Colors.BLUE}
    
    icon = icons.get(status, "🔍")
    color = colors.get(status, Colors.BLUE)
    print(f"{color}{icon} {message}{Colors.ENDC}")

def test_backend_health():
    """Test if backend is running and healthy"""
    print_status("Testing backend health...", "info")
    
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_status("Backend is healthy", "success")
            print(f"   - Status: {data.get('status')}")
            print(f"   - spaCy loaded: {data.get('spacy_loaded')}")
            print(f"   - RapidAPI configured: {data.get('rapidapi_configured')}")
            print(f"   - Version: {data.get('version')}")
            return True
        else:
            print_status(f"Backend health check failed: HTTP {response.status_code}", "error")
            return False
    except requests.exceptions.RequestException as e:
        print_status(f"Backend not accessible: {e}", "error")
        return False

def test_frontend_accessibility():
    """Test if frontend is accessible"""
    print_status("Testing frontend accessibility...", "info")
    
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            if "Job Intelligence Scanner" in response.text or "html" in response.text.lower():
                print_status("Frontend is accessible", "success")
                return True
            else:
                print_status("Frontend responded but content unexpected", "warning")
                return False
        else:
            print_status(f"Frontend not accessible: HTTP {response.status_code}", "error")
            return False
    except requests.exceptions.RequestException as e:
        print_status(f"Frontend not accessible: {e}", "error")
        return False

def test_api_endpoints():
    """Test key API endpoints"""
    print_status("Testing API endpoints...", "info")
    
    # Test root endpoint
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=5)
        if response.status_code == 200:
            print_status("Root endpoint working", "success")
        else:
            print_status("Root endpoint failed", "error")
            return False
    except:
        print_status("Root endpoint failed", "error")
        return False
    
    # Test analyze-jobs endpoint
    try:
        test_payload = {
            "job_title": "Software Engineer",
            "location": "San Francisco, CA",
            "time_range": "1d"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/analyze-jobs", 
            json=test_payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_status("Job analysis endpoint working with live data", "success")
                print(f"   - Jobs analyzed: {data.get('jobs_analyzed', 0)}")
                print(f"   - Skills found: {len(data.get('data', {}).get('technical_skills', []))}")
                print(f"   - Certifications found: {len(data.get('data', {}).get('certifications', []))}")
                return True
            else:
                print_status("Job analysis endpoint returned error", "error")
                return False
        else:
            print_status(f"Job analysis endpoint failed: HTTP {response.status_code}", "error")
            return False
    except requests.exceptions.Timeout:
        print_status("Job analysis endpoint timed out", "error")
        return False
    except Exception as e:
        print_status(f"Job analysis endpoint error: {e}", "error")
        return False

def test_cors_configuration():
    """Test CORS configuration"""
    print_status("Testing CORS configuration...", "info")
    
    try:
        headers = {
            'Origin': 'http://localhost:5173',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        
        response = requests.options(f"{BACKEND_URL}/analyze-jobs", headers=headers, timeout=5)
        
        cors_headers = response.headers.get('Access-Control-Allow-Origin', '')
        if 'localhost:5173' in cors_headers or cors_headers == '*':
            print_status("CORS properly configured", "success")
            return True
        else:
            print_status("CORS configuration issue", "warning")
            return False
    except Exception as e:
        print_status(f"CORS test failed: {e}", "error")
        return False

def test_environment_setup():
    """Test environment and dependencies"""
    print_status("Testing environment setup...", "info")
    
    # Check if we're in the right directory
    if not Path("package.json").exists() or not Path("backend/main.py").exists():
        print_status("Not in the correct project directory", "error")
        return False
    
    # Check if backend dependencies are in place
    if not Path("backend/venv").exists():
        print_status("Backend virtual environment not found", "error")
        return False
    
    # Check if frontend dependencies are in place
    if not Path("node_modules").exists():
        print_status("Frontend dependencies not installed", "error")
        return False
    
    print_status("Environment setup looks good", "success")
    return True

def main():
    """Run all tests"""
    print(f"{Colors.BOLD}🧪 Job Intelligence Scanner - End-to-End Test Suite{Colors.ENDC}")
    print("=" * 60)
    
    tests = [
        ("Environment Setup", test_environment_setup),
        ("Backend Health", test_backend_health),
        ("Frontend Accessibility", test_frontend_accessibility),
        ("API Endpoints", test_api_endpoints),
        ("CORS Configuration", test_cors_configuration),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{Colors.BOLD}Testing {test_name}...{Colors.ENDC}")
        try:
            if test_func():
                passed += 1
            time.sleep(1)  # Brief pause between tests
        except Exception as e:
            print_status(f"Test '{test_name}' failed with exception: {e}", "error")
    
    print("\n" + "=" * 60)
    print(f"{Colors.BOLD}🏁 Test Results: {passed}/{total} tests passed{Colors.ENDC}")
    
    if passed == total:
        print_status("🎉 All tests passed! Your Job Intelligence Scanner is fully operational.", "success")
        print("\n🔗 Access your application:")
        print(f"   Frontend: {FRONTEND_URL}")
        print(f"   Backend API: {BACKEND_URL}/docs")
        print(f"   Health Check: {BACKEND_URL}/health")
        return 0
    else:
        print_status(f"⚠️  {total - passed} test(s) failed. Check the output above for details.", "error")
        print("\n🛠️  Troubleshooting:")
        print("   1. Make sure both servers are running:")
        print("      Backend: cd backend && python start.py")
        print("      Frontend: npm run dev")
        print("   2. Check firewall/port accessibility")
        print("   3. Verify environment setup")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code) 