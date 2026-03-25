import pytest

from packages.core.schema_validation import SchemaValidationError, validate_json


def test_validate_json_accepts_valid_example() -> None:
    payload = {
        "transcript_id": "tr_20260325t153000z_001",
        "run_id": "20260325T153000Z",
        "created_at": "2026-03-25T15:30:00Z",
        "provider": "dummy",
        "channel": "sales",
        "stage": "qualification",
        "segment": "midmarket",
        "topics": ["integration", "pricing"],
        "objections": ["price"],
        "account_domain": "acct-1032.example",
        "customer_email": "contact_001@acct-1032.example",
        "agent_email": "agent_001@vendor-suite.example",
        "language": "en",
        "transcript_text": "Customer: " + ("word " * 260) + "\nAgent: " + ("word " * 30),
        "word_count": 292,
    }

    validate_json(instance=payload, schema_name="transcript_normalized.schema.json")


def test_validate_json_rejects_invalid_payload() -> None:
    payload = {
        "transcript_id": "invalid",
        "channel": "sales",
    }

    with pytest.raises(SchemaValidationError):
        validate_json(instance=payload, schema_name="transcript_normalized.schema.json")
