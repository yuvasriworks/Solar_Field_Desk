import os
from starlette.testclient import TestClient
from app.main import app

print("1. Creating TestClient...")
client = TestClient(app)
print("2. TestClient created. Calling /api/health...")
r = client.get("/api/health")
print("3. Response:", r.status_code, r.json())
