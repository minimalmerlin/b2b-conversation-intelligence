import pytest

from packages.core.schema_validation import SchemaValidationError, validate_json


def test_validate_json_accepts_valid_example() -> None:
    payload = {
        "conversation_id": "c-20260325t153000z-001",
        "run_id": "20260325T153000Z",
        "provider": "dummy",
        "channel": "sales",
        "stage": "qualification",
        "segment": "midmarket",
        "product": "B2B SaaS Data & Marketing Platform",
        "account_domain": "acme-example.com",
        "participant_email": "alex@acme-example.com",
        "transcript_text": "Customer: " + ("word " * 260) + "\nAgent: " + ("word " * 30),
        "created_at": "2026-03-25T15:30:00Z",
        "word_count": 292,
        "labels": {
            "topic_gt": "integration",
            "objections_gt": ["price"],
            "outcome_gt": "next_step_scheduled",
        },
    }

    validate_json(instance=payload, schema_name="transcript_normalized.schema.json")


def test_validate_json_rejects_invalid_payload() -> None:
    payload = {
        "conversation_id": "invalid",
        "channel": "sales",
    }

    with pytest.raises(SchemaValidationError):
        validate_json(instance=payload, schema_name="transcript_normalized.schema.json")
