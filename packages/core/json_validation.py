from __future__ import annotations

from typing import Any

from packages.core.schema_validation import SchemaValidationError, validate_json

JsonValidationException = SchemaValidationError


def validate_payload(payload: dict[str, Any], schema_file_name: str) -> None:
    validate_json(instance=payload, schema_name=schema_file_name)
