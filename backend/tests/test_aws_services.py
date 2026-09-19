import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_aws_status_endpoint():
    response = client.get("/api/v1/aws/status")
    assert response.status_code == 200
    data = response.json()
    assert data["cloud_provider"] == "Amazon Web Services (AWS)"
    assert data["status"] == "healthy"
    assert len(data["services"]) >= 5
    # Check that S3 and KMS are present
    codes = [s["code"] for s in data["services"]]
    assert "S3-SSE-KMS" in codes
    assert "KMS-HSM-TIER4" in codes

def test_aws_s3_presigned_url_generation():
    payload = {
        "document_id": "doc_test_123",
        "citizen_id": "cit_raghavendra_001",
        "action": "upload",
        "content_type": "application/pdf",
    }
    response = client.post("/api/v1/aws/s3-presigned-url", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "civiqone-sovereign-vault" in data["bucket"]
    assert data["server_side_encryption"] == "aws:kms"
    assert "kms" in data["kms_key_arn"]
    assert "X-Amz-Signature" in data["presigned_url"]

def test_aws_textract_ocr_extraction():
    payload = {
        "document_name": "pan_card_permanent.jpg",
        "document_type_hint": "PAN"
    }
    response = client.post("/api/v1/aws/textract-ocr", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["document_type"] == "PAN"
    assert data["confidence_score"] > 95
    assert "Permanent Account Number (PAN)" in data["extracted_fields"]

def test_aws_credits_telemetry():
    response = client.get("/api/v1/aws/credits-telemetry")
    assert response.status_code == 200
    data = response.json()
    assert "AWS Activate" in data["program"]
    assert data["total_credits_granted"] == 10000.00
    assert data["remaining_credits"] > 0
    assert len(data["active_services_utilizing_credits"]) >= 4
