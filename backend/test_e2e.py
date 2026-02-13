#!/usr/bin/env python3
"""Quick smoke test for InteliJob backend API."""

import sys
import requests
import time

BACKEND_URL = "http://localhost:8000"

def test_health():
    """Test backend health endpoint."""
    try:
        r = requests.get(f"{BACKEND_URL}/health", timeout=5)
        data = r.json()
        print(f"  Health: {data.get('status')}")
        print(f"  RapidAPI: {'configured' if data.get('rapidapi_configured') else 'NOT configured'}")
        return r.status_code == 200
    except Exception as e:
        print(f"  FAIL: {e}")
        return False

def test_analyze():
    """Test job analysis endpoint."""
    try:
        r = requests.post(
            f"{BACKEND_URL}/analyze-jobs",
            json={"job_title": "Cybersecurity Analyst", "time_range": "1d"},
            timeout=30,
        )
        if r.status_code == 200 and r.json().get("success"):
            data = r.json()
            certs = len(data.get("data", {}).get("certifications", {}).get("items", []))
            jobs = data.get("jobs_analyzed", 0)
            print(f"  Jobs analyzed: {jobs}")
            print(f"  Certs found: {certs}")
            return True
        else:
            print(f"  FAIL: HTTP {r.status_code}")
            return False
    except requests.exceptions.Timeout:
        print("  FAIL: timeout")
        return False
    except Exception as e:
        print(f"  FAIL: {e}")
        return False

def main():
    print("InteliJob Smoke Test")
    print("=" * 40)

    tests = [
        ("Health Check", test_health),
        ("Job Analysis", test_analyze),
    ]

    passed = 0
    for name, fn in tests:
        print(f"\n{name}:")
        if fn():
            passed += 1
            print(f"  -> PASS")
        else:
            print(f"  -> FAIL")

    print(f"\n{'=' * 40}")
    print(f"Result: {passed}/{len(tests)} passed")
    return 0 if passed == len(tests) else 1

if __name__ == "__main__":
    sys.exit(main())