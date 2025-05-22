#!/usr/bin/env python3
"""
Simple test script for the Job Intelligence Scanner API
Tests the backend without requiring a RapidAPI key
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from main import app
from fastapi.testclient import TestClient

def test_health_endpoint():
    """Test the health check endpoint"""
    client = TestClient(app)
    
    print("🔍 Testing health endpoint...")
    response = client.get("/health")
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        print("✅ Health endpoint working correctly")
        return True
    else:
        print("❌ Health endpoint failed")
        return False

def test_analyze_jobs_endpoint():
    """Test the analyze jobs endpoint with mock data (without RapidAPI)"""
    client = TestClient(app)
    
    print("\n🔍 Testing analyze jobs endpoint...")
    
    test_payload = {
        "job_title": "Software Engineer",
        "location": "San Francisco, CA",
        "time_range": "1w"
    }
    
    response = client.post("/analyze-jobs", json=test_payload)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 500:
        # Expected if RapidAPI key is not configured
        data = response.json()
        if "RAPIDAPI_KEY not configured" in str(data.get("detail", "")):
            print("✅ Endpoint correctly reports missing RapidAPI key")
            return True
    elif response.status_code == 200:
        print("✅ Endpoint working with live data")
        return True
    
    print("❌ Unexpected response from analyze jobs endpoint")
    return False

def test_root_endpoint():
    """Test the root endpoint"""
    client = TestClient(app)
    
    print("\n🔍 Testing root endpoint...")
    response = client.get("/")
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        print("✅ Root endpoint working correctly")
        return True
    else:
        print("❌ Root endpoint failed")
        return False

def main():
    """Run all tests"""
    print("🧪 Job Intelligence Scanner API Tests")
    print("=" * 50)
    
    tests = [
        test_root_endpoint,
        test_health_endpoint,
        test_analyze_jobs_endpoint,
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"🏁 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The API is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code) 