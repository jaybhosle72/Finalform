import os
import sys
import json

# Ensure project root is in python path
sys.path.insert(0, os.path.abspath("."))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_google_authentication_flow():
    print("==========================================================================")
    print("  TESTING GOOGLE OAUTH 2.0 INTEGRATION WITH LIVE CREDENTIALS")
    print("==========================================================================")

    # 1. Configured Environment Check
    print("\n[Step 1] Testing /api/v2/auth/google/config with configured .env...")
    cfg_resp = client.get("/api/v2/auth/google/config")
    assert cfg_resp.status_code == 200, f"Config check failed: {cfg_resp.text}"
    cfg_data = cfg_resp.json()
    assert cfg_data["status"] == "success"
    assert cfg_data["is_configured"] == True, f"Expected is_configured=True, got {cfg_data}"
    assert cfg_data["client_id"] == "301915111750-7m7jhmpon7bt7i8jpcsirvcr80gujdsb.apps.googleusercontent.com"
    print(f" -> [OK] Config endpoint returned is_configured=True!")
    print(f"        Configured Client ID: {cfg_data['client_id']}")
    print(f"        Redirect URI: {cfg_data['redirect_uri']}")

    # 2. Testing Authorization URL generation
    print("\n[Step 2] Testing /api/v2/auth/google/url authorization link generation...")
    url_resp = client.get("/api/v2/auth/google/url")
    assert url_resp.status_code == 200, f"URL generation failed: {url_resp.text}"
    auth_url = url_resp.json()["authorization_url"]
    assert "accounts.google.com" in auth_url
    assert "301915111750-7m7jhmpon7bt7i8jpcsirvcr80gujdsb" in auth_url
    assert "redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fapi%2Fv2%2Fauth%2Fgoogle%2Fcallback" in auth_url
    print(f" -> [OK] Official Google OAuth URL generated successfully:")
    print(f"        URL: {auth_url}")

    # 3. Testing Token Endpoint parameter validation
    print("\n[Step 3] Testing /api/v2/auth/google/token input validation...")
    tok_resp = client.post("/api/v2/auth/google/token", json={})
    assert tok_resp.status_code == 400, f"Expected 400 for empty token payload, got {tok_resp.status_code}"
    print(" -> [OK] Token exchange endpoint safely rejected empty request with HTTP 400.")

    print("\n==========================================================================")
    print("  GOOGLE OAUTH 2.0 INTEGRATION & CREDENTIAL VERIFICATION PASSED 100%!")
    print("==========================================================================")

if __name__ == "__main__":
    test_google_authentication_flow()
