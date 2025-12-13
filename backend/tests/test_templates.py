from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app

def test_create_template(client: TestClient, db: Session, auth_headers):
    data = {
        "name": "My Template",
        "description": "A test template",
        "config_json": {"metrics": ["revenue"], "filters": {}},
        "is_public": True
    }
    response = client.post(
        "/analytics/templates",
        headers=auth_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == data["name"]
    assert content["id"] is not None

def test_list_templates(client: TestClient, db: Session, auth_headers):
    # Ensure at least one exists
    data = {
        "name": "List Test",
        "config_json": {},
    }
    client.post("/analytics/templates", headers=auth_headers, json=data)
    
    response = client.get("/analytics/templates", headers=auth_headers)
    assert response.status_code == 200
    content = response.json()
    assert len(content) >= 1

def test_delete_template(client: TestClient, db: Session, auth_headers):
    # Create one to delete
    data = {
        "name": "Delete Me",
        "config_json": {},
    }
    res = client.post("/analytics/templates", headers=auth_headers, json=data)
    template_id = res.json()["id"]
    
    # Delete it
    response = client.delete(f"/analytics/templates/{template_id}", headers=auth_headers)
    assert response.status_code == 204
    
    # Verify gone
    list_res = client.get("/analytics/templates", headers=auth_headers)
    ids = [t["id"] for t in list_res.json()]
    assert template_id not in ids
