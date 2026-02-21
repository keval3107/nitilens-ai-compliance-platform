#!/usr/bin/env python3
"""
Quick validation script to test the dashboard API endpoints.
Run this after starting the backend server to verify all endpoints work correctly.
"""
import requests
import json
from typing import Dict, Any

API_BASE = "http://localhost:8000/api"

def test_endpoint(name: str, method: str, endpoint: str, expected_keys: list) -> bool:
    """Test a single API endpoint."""
    url = f"{API_BASE}{endpoint}"
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print(f"URL: {url}")
    print(f"Method: {method}")
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, timeout=30)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
        
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ Success!")
        
        # Check for expected keys
        missing_keys = [key for key in expected_keys if key not in data]
        if missing_keys:
            print(f"⚠️  Missing keys: {missing_keys}")
        
        # Print sample data
        print(f"\nSample Response:")
        print(json.dumps(data, indent=2)[:500] + "..." if len(json.dumps(data)) > 500 else json.dumps(data, indent=2))
        
        return True
        
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection failed. Is the backend running at {API_BASE}?")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    print("="*60)
    print("NitiLens Dashboard API Validation")
    print("="*60)
    
    tests = [
        {
            "name": "Compliance Summary",
            "method": "GET",
            "endpoint": "/compliance/summary",
            "expected_keys": [
                "total_transactions",
                "total_scanned",
                "total_violations",
                "open_violations",
                "resolved_violations",
                "compliance_rate",
                "active_rules",
                "severity_breakdown",
                "most_violated_rules",
                "trend_data",
                "last_scan_time",
                "dataset_connected"
            ]
        },
        {
            "name": "Compliance Activity",
            "method": "GET",
            "endpoint": "/compliance/activity?limit=5",
            "expected_keys": ["total", "items"]
        },
        {
            "name": "Dataset Stats",
            "method": "GET",
            "endpoint": "/datasets/aml/stats",
            "expected_keys": [
                "total_transactions",
                "confirmed_laundering",
                "laundering_percentage",
                "avg_amount_paid",
                "max_amount_paid"
            ]
        },
        {
            "name": "List Violations",
            "method": "GET",
            "endpoint": "/compliance/violations?limit=5",
            "expected_keys": ["total", "violations"]
        }
    ]
    
    results = []
    for test in tests:
        success = test_endpoint(
            test["name"],
            test["method"],
            test["endpoint"],
            test["expected_keys"]
        )
        results.append((test["name"], success))
    
    # Summary
    print(f"\n{'='*60}")
    print("Test Summary")
    print(f"{'='*60}")
    
    for name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
    
    total = len(results)
    passed = sum(1 for _, success in results if success)
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Dashboard API is working correctly.")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please check the backend.")


if __name__ == "__main__":
    main()
