from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app

def test_create_custom_metric(client: TestClient, db: Session, auth_headers):
    data = {
        "name": "My Metric",
        "description": "Revenue per click",
        "formula": "revenue / clicks",
        "format": "currency"
    }
    response = client.post(
        "/analytics/custom-metrics",
        headers=auth_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == data["name"]
    assert content["formula"] == data["formula"]
    assert content["id"] is not None

def test_list_custom_metrics(client: TestClient, db: Session, auth_headers):
    response = client.get("/analytics/custom-metrics", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_delete_custom_metric(client: TestClient, db: Session, auth_headers):
    # Create one
    data = {
        "name": "Delete Me Metric",
        "formula": "1+1",
    }
    res = client.post("/analytics/custom-metrics", headers=auth_headers, json=data)
    metric_id = res.json()["id"]
    
    # Delete
    response = client.delete(f"/analytics/custom-metrics/{metric_id}", headers=auth_headers)
    assert response.status_code == 204
    
    # Verify
    list_res = client.get("/analytics/custom-metrics", headers=auth_headers)
    ids = [m["id"] for m in list_res.json()]
    assert metric_id not in ids
