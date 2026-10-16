from datetime import datetime, timezone


def _payload(**overrides):
    data = {
        "patient_name": "Asha Patel",
        "doctor_name": "Dr. Mehta",
        "reason": "Annual checkup",
        "status": "scheduled",
        "priority": "routine",
        "scheduled_at": datetime(2026, 10, 20, 9, 30, tzinfo=timezone.utc).isoformat(),
    }
    data.update(overrides)
    return data


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_create_appointment(client):
    response = client.post("/api/appointments", json=_payload())
    assert response.status_code == 201
    body = response.json()
    assert body["patient_name"] == "Asha Patel"
    assert body["id"] >= 1


def test_list_appointments(client):
    client.post("/api/appointments", json=_payload())
    client.post(
        "/api/appointments",
        json=_payload(patient_name="Rohan Shah", priority="urgent", status="checked_in"),
    )
    response = client.get("/api/appointments")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_appointment(client):
    created = client.post("/api/appointments", json=_payload()).json()
    response = client.get(f"/api/appointments/{created['id']}")
    assert response.status_code == 200
    assert response.json()["doctor_name"] == "Dr. Mehta"


def test_update_appointment(client):
    created = client.post("/api/appointments", json=_payload()).json()
    response = client.put(
        f"/api/appointments/{created['id']}",
        json={"status": "in_progress", "priority": "urgent"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "in_progress"
    assert body["priority"] == "urgent"


def test_delete_appointment(client):
    created = client.post("/api/appointments", json=_payload()).json()
    delete_response = client.delete(f"/api/appointments/{created['id']}")
    assert delete_response.status_code == 204
    get_response = client.get(f"/api/appointments/{created['id']}")
    assert get_response.status_code == 404


def test_appointment_stats(client):
    client.post("/api/appointments", json=_payload())
    client.post(
        "/api/appointments",
        json=_payload(patient_name="Neha", priority="emergency", status="checked_in"),
    )
    response = client.get("/api/appointments/stats")
    assert response.status_code == 200
    stats = response.json()
    assert stats["total"] == 2
    assert stats["scheduled"] == 1
    assert stats["checked_in"] == 1
    assert stats["urgent_or_emergency"] == 1
