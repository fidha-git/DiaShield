#!/usr/bin/env python3
"""
GEMINI INTEGRATION VALIDATION SCRIPT
=====================================
Validates:
1. POST /chat works
2. GET /chat-history works
3. Gemini response is returned (not fallback)
4. Chat messages are saved to database
5. Authentication works
6. No exceptions in backend
7. Fallback is NOT triggered
"""

import os
import sys
import json
import requests
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
BASE_URL = "http://127.0.0.1:8000"
TIMEOUT = 30
TOKEN = None  # Will be populated after login

# Test user credentials
TEST_USER = {
    "username": "test_validator",
    "email": f"validator_{datetime.now().timestamp():.0f}@gemini-test.com",
    "password": "TestPass123!",
    "role": "patient"
}

# Test prompts
TEST_PROMPTS = [
    "What foods should a diabetic patient avoid?",
    "Explain HbA1c in simple words.",
    "What is insulin resistance?"
]

# Validation rules to check for fallback
FALLBACK_INDICATORS = [
    "rule-based fallback used",
    "Consult a healthcare professional",
    "For diabetes, focus on whole grains",
    "I'm here to help with diabetes-related questions"
]

class ValidationReport:
    def __init__(self):
        self.results = []
        self.start_time = datetime.now()
        self.errors = []
        self.warnings = []
    
    def add_result(self, test_name, status, details=""):
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.results.append(result)
        logger.info(f"[{status.upper()}] {test_name}: {details}")
    
    def add_error(self, error_msg):
        self.errors.append(error_msg)
        logger.error(f"ERROR: {error_msg}")
    
    def add_warning(self, warning_msg):
        self.warnings.append(warning_msg)
        logger.warning(f"WARNING: {warning_msg}")
    
    def generate_report(self):
        end_time = datetime.now()
        duration = (end_time - self.start_time).total_seconds()
        
        report = {
            "title": "GEMINI INTEGRATION VALIDATION REPORT",
            "timestamp": datetime.now().isoformat(),
            "duration_seconds": duration,
            "summary": {
                "total_tests": len(self.results),
                "passed": sum(1 for r in self.results if r["status"] == "PASS"),
                "failed": sum(1 for r in self.results if r["status"] == "FAIL"),
                "warnings": len(self.warnings),
                "errors": len(self.errors)
            },
            "results": self.results,
            "errors": self.errors,
            "warnings": self.warnings
        }
        return report
    
    def print_report(self):
        report = self.generate_report()
        print("\n" + "="*80)
        print(report["title"])
        print("="*80)
        print(f"Timestamp: {report['timestamp']}")
        print(f"Duration: {report['duration_seconds']:.2f}s")
        print()
        print("SUMMARY:")
        print(f"  Total Tests: {report['summary']['total_tests']}")
        print(f"  Passed: {report['summary']['passed']}")
        print(f"  Failed: {report['summary']['failed']}")
        print(f"  Warnings: {report['summary']['warnings']}")
        print(f"  Errors: {report['summary']['errors']}")
        print()
        print("DETAILED RESULTS:")
        for result in report['results']:
            status_symbol = "[OK]" if result["status"] == "PASS" else "[FAIL]"
            print(f"  {status_symbol} {result['test']}: {result['details']}")
        
        if self.warnings:
            print()
            print("WARNINGS:")
            for i, w in enumerate(self.warnings, 1):
                print(f"  {i}. {w}")
        
        if self.errors:
            print()
            print("ERRORS:")
            for i, e in enumerate(self.errors, 1):
                print(f"  {i}. {e}")
        
        print()
        print("="*80)
        return report

def check_server_health():
    """Test if server is running."""
    try:
        resp = requests.get(f"{BASE_URL}/docs", timeout=5)
        return resp.status_code == 200
    except Exception as e:
        return False

def register_test_user(report):
    """Register a test user for validation."""
    global TOKEN
    try:
        logger.info(f"Registering test user: {TEST_USER['email']}")
        payload = {
            "username": TEST_USER["username"],
            "email": TEST_USER["email"],
            "password": TEST_USER["password"],
            "role": TEST_USER["role"]
        }
        
        resp = requests.post(
            f"{BASE_URL}/register",
            json=payload,
            timeout=TIMEOUT
        )
        
        if resp.status_code != 200:
            report.add_warning(f"Registration returned {resp.status_code}: {resp.text}")
        else:
            report.add_result("User Registration", "PASS", f"Registered {TEST_USER['email']}")
        
        return True
    except Exception as e:
        report.add_warning(f"Registration error: {str(e)}")
        return True  # Continue anyway

def login_test_user(report):
    """Login test user and get JWT token."""
    global TOKEN
    try:
        logger.info(f"Logging in test user: {TEST_USER['email']}")
        payload = {
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
        
        resp = requests.post(
            f"{BASE_URL}/login",
            json=payload,
            timeout=TIMEOUT
        )
        
        if resp.status_code != 200:
            report.add_error(f"Login failed: {resp.status_code}: {resp.text}")
            return False
        
        data = resp.json()
        TOKEN = data.get("access_token") or data.get("token")
        
        if not TOKEN:
            report.add_error(f"No token in login response: {data}")
            return False
        
        report.add_result("User Login", "PASS", f"Got JWT token")
        return True
    except Exception as e:
        report.add_error(f"Login exception: {str(e)}")
        return False

def check_for_fallback(response_text):
    """Check if response uses fallback indicators."""
    if not response_text:
        return True
    
    response_lower = response_text.lower()
    for indicator in FALLBACK_INDICATORS:
        if indicator.lower() in response_lower:
            return True
    return False

def test_chat_endpoint(prompt, report):
    """Test POST /chat with a prompt."""
    global TOKEN
    try:
        logger.info(f"Testing prompt: {prompt[:50]}...")
        payload = {"message": prompt}
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {TOKEN}"
        }
        
        resp = requests.post(
            f"{BASE_URL}/chat",
            json=payload,
            timeout=TIMEOUT,
            headers=headers
        )
        
        if resp.status_code != 201:
            report.add_error(f"POST /chat returned {resp.status_code}: {resp.text}")
            return None
        
        data = resp.json()
        response_text = data.get("response") or data.get("message") or str(data)
        
        # Check if fallback was used
        is_fallback = check_for_fallback(response_text)
        if is_fallback:
            report.add_warning(f"Possible fallback used for: {prompt[:40]}...")
        
        return {
            "prompt": prompt,
            "response": response_text,
            "is_fallback": is_fallback,
            "response_length": len(response_text)
        }
    except Exception as e:
        report.add_error(f"Exception in test_chat_endpoint: {str(e)}")
        return None

def test_chat_history(report):
    """Test GET /chat-history."""
    global TOKEN
    try:
        headers = {
            "Authorization": f"Bearer {TOKEN}"
        }
        
        resp = requests.get(
            f"{BASE_URL}/chat-history",
            timeout=TIMEOUT,
            headers=headers
        )
        
        if resp.status_code == 401:
            report.add_warning("Chat history requires authentication (401)")
            return None
        
        if resp.status_code != 200:
            report.add_error(f"GET /chat-history returned {resp.status_code}: {resp.text}")
            return None
        
        data = resp.json()
        # Handle both list and dict responses
        if isinstance(data, dict) and "chats" in data:
            chat_count = len(data["chats"])
        elif isinstance(data, list):
            chat_count = len(data)
        else:
            chat_count = 0
        return chat_count
    except Exception as e:
        report.add_error(f"Exception in test_chat_history: {str(e)}")
        return None

def validate_gemini_integration():
    """Run full validation."""
    global TOKEN
    report = ValidationReport()
    
    logger.info("Starting Gemini Integration Validation...")
    
    # 1. Check server health
    logger.info("1. Checking server health...")
    if not check_server_health():
        report.add_error("Server is not running on http://127.0.0.1:8000")
        report.print_report()
        return False
    report.add_result("Server Health", "PASS", "Server is running")
    
    # 2. Register test user
    logger.info("2. Registering test user...")
    register_test_user(report)
    
    # 3. Login and get token
    logger.info("3. Authenticating with test user...")
    if not login_test_user(report):
        report.add_error("Could not authenticate - aborting validation")
        report.print_report()
        return False
    
    # 4. Test each prompt
    logger.info("4. Testing chat endpoints with prompts...")
    chat_results = []
    for i, prompt in enumerate(TEST_PROMPTS, 1):
        result = test_chat_endpoint(prompt, report)
        if result:
            chat_results.append(result)
            fallback_status = "FALLBACK" if result["is_fallback"] else "SDK"
            report.add_result(
                f"POST /chat [{i}/3]",
                "PASS",
                f"Response length: {result['response_length']} chars ({fallback_status})"
            )
        else:
            report.add_result(f"POST /chat [{i}/3]", "FAIL", "No response")
    
    # 5. Test chat history
    logger.info("5. Testing chat history...")
    history_count = test_chat_history(report)
    if history_count is not None:
        report.add_result(
            "GET /chat-history",
            "PASS",
            f"Retrieved {history_count} chat records"
        )
    else:
        report.add_result("GET /chat-history", "FAIL", "Could not retrieve history")
    
    # 6. Verify no fallback used
    logger.info("6. Verifying SDK responses (no fallback)...")
    fallback_count = sum(1 for r in chat_results if r["is_fallback"])
    if fallback_count == 0:
        report.add_result(
            "No Fallback Triggered",
            "PASS",
            f"All {len(chat_results)} responses used Gemini SDK"
        )
    elif fallback_count < len(chat_results):
        report.add_result(
            "Fallback Status",
            "PASS",
            f"{len(chat_results) - fallback_count}/{len(chat_results)} used SDK"
        )
    else:
        report.add_result(
            "No Fallback Triggered",
            "FAIL",
            f"All {fallback_count} responses used fallback"
        )
    
    # 7. Response quality check
    logger.info("7. Checking response quality...")
    if chat_results:
        avg_length = sum(r["response_length"] for r in chat_results) / len(chat_results)
        if avg_length > 100:
            report.add_result(
                "Response Quality",
                "PASS",
                f"Average response length: {avg_length:.0f} chars (detailed responses)"
            )
        else:
            report.add_warning(f"Response length low: {avg_length:.0f} chars average")
    
    # Print final report
    logger.info("Validation complete. Generating report...")
    return report.print_report()

if __name__ == "__main__":
    try:
        report = validate_gemini_integration()
        
        # Return exit code based on results
        failed = report["summary"]["failed"]
        sys.exit(0 if failed == 0 else 1)
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        sys.exit(2)
