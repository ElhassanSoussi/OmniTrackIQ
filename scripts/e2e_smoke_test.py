
import httpx
import os
import sys
import logging
from typing import Dict, Any

# Config
import time
timestamp = int(time.time())
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
# Dynamic default email to prevent collisions if not provided
DEFAULT_EMAIL = f"test+{timestamp}@example.com"
EMAIL = os.getenv("TEST_EMAIL", DEFAULT_EMAIL)
PASSWORD = os.getenv("TEST_PASSWORD", "password123")
ACCOUNT_NAME = "Test Workspace"

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("e2e_smoke")

class E2EClient:
    def __init__(self):
        self.client = httpx.Client(base_url=BACKEND_URL, timeout=10.0)
        self.token = None
        self.headers = {}

    def login_or_signup(self):
        logger.info(f"Account: {EMAIL} / {PASSWORD}")
        
        # 1. Try Login first
        try:
            resp = self.client.post("/auth/login", json={"email": EMAIL, "password": PASSWORD})
            if resp.status_code == 200:
                data = resp.json()
                self.token = data["access_token"]
                logger.info(f"✅ Login successful for {EMAIL}")
            else:
                # 2. If Login failed, try Signup
                logger.info(f"Login failed ({resp.status_code}). Attempting signup...")
                resp = self.client.post("/auth/signup", json={"email": EMAIL, "password": PASSWORD, "account_name": ACCOUNT_NAME})
                
                if resp.status_code == 200:
                    data = resp.json()
                    self.token = data["access_token"]
                    logger.info(f"✅ Signup successful for {EMAIL}")
                elif resp.status_code == 409:
                    # 3. If Signup says "Already Exists", try Login again (race condition or previous run)
                     logger.warning("User already exists (409). Retrying login...")
                     resp = self.client.post("/auth/login", json={"email": EMAIL, "password": PASSWORD})
                     if resp.status_code == 200:
                        data = resp.json()
                        self.token = data["access_token"]
                        logger.info(f"✅ Login successful after 409.")
                     else:
                        logger.error(f"❌ Login retry failed: {resp.status_code} {resp.text}")
                        sys.exit(1)
                else:
                    logger.error(f"❌ Signup failed: {resp.status_code} {resp.text}")
                    sys.exit(1)
            
            self.headers = {"Authorization": f"Bearer {self.token}"}
        except Exception as e:
            logger.error(f"❌ Connection/Auth failed: {e}")
            sys.exit(1)

    def verify_profile(self):
        logger.info("Verifying /auth/me...")
        resp = self.client.get("/auth/me", headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == EMAIL
        logger.info("Profile verified.")

    def verify_templates(self):
        logger.info("Verifying Templates CRUD...")
        # Create
        template_payload = {"name": "Smoke Test Template", "description": "Auto created", "config_json": {}}
        resp = self.client.post("/analytics/templates", json=template_payload, headers=self.headers)
        assert resp.status_code == 200, f"Create template failed: {resp.text}"
        data = resp.json()
        tmpl_id = data["id"]
        logger.info(f"Created template {tmpl_id}")

        # List
        resp = self.client.get("/analytics/templates", headers=self.headers)
        assert resp.status_code == 200
        items = resp.json()
        assert any(i["id"] == tmpl_id for i in items)
        logger.info("List templates verified.")
        
        # Delete
        resp = self.client.delete(f"/analytics/templates/{tmpl_id}", headers=self.headers)
        assert resp.status_code == 204
        logger.info("Delete template verified.")

    def verify_custom_metrics(self):
        logger.info("Verifying Custom Metrics CRUD...")
        # Create
        metric_payload = {
            "name": "Smoke Test Metric",
            "formula": "spend / conversions",
            "format": "currency",
            "description": "Auto created metric"
        }
        resp = self.client.post("/analytics/custom-metrics", json=metric_payload, headers=self.headers)
        assert resp.status_code == 200, f"Create metric failed: {resp.text}"
        data = resp.json()
        metric_id = data["id"]
        logger.info(f"Created custom metric {metric_id}")

        # List
        resp = self.client.get("/analytics/custom-metrics", headers=self.headers)
        assert resp.status_code == 200
        items = resp.json()
        assert any(i["id"] == metric_id for i in items)
        logger.info("List metrics verified.")

        # Delete
        resp = self.client.delete(f"/analytics/custom-metrics/{metric_id}", headers=self.headers)
        assert resp.status_code == 204
        logger.info("Delete metric verified.")

    def run(self):
        logger.info(f"Starting E2E Smoke Test against {BACKEND_URL}")
        # Health check
        resp = self.client.get("/health")
        if resp.status_code != 200:
            logger.warning(f"Health check warning: {resp.status_code} {resp.text}")
        
        self.login_or_signup()
        self.verify_profile()
        self.verify_templates()
        self.verify_custom_metrics()
        
        logger.info("✅ ALL TESTS PASSED")

if __name__ == "__main__":
    E2EClient().run()
