from fastapi.testclient import TestClient
from datetime import datetime, timedelta

def test_apply_success(client: TestClient):
    # Setup company and job
    comp_res = client.post("/auth/signup", json={"email": "c@c.com", "password": "p", "role": "company", "company_name": "C1"})
    comp_t = comp_res.json()["access_token"]
    # Verify company using internal DB or bypass? In integration test, we can post a job if verified. 
    # Let's bypass for a sec or use a test fixture. 
    # Actually, simpler to just hit endpoints or rely on the actual DB instance to modify it.

def test_apply_duplicate(client: TestClient):
    pass

def test_apply_past_deadline(client: TestClient):
    pass

def test_apply_job_not_found(client: TestClient):
    pass

def test_apply_incomplete_profile(client: TestClient):
    pass

def test_post_duplicate_job(client: TestClient):
    pass
