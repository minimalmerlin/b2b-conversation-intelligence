from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from jsonschema import Draft7Validator, FormatChecker
from jsonschema.exceptions import SchemaError, ValidationError

from packages.core.config import get_settings


class SchemaValidationError(Exception):
    """Raised when JSON schema validation fails."""


def load_schema(schema_name: str, schemas_dir: Path | None = None) -> dict[str, Any]:
    resolved_dir = schemas_dir or get_settings().schemas_dir
    schema_path = resolved_dir / schema_name
    if not schema_path.exists():
        raise FileNotFoundError(f"Schema file not found: {schema_path}")

    with schema_path.open("r", encoding="utf-8") as file_handle:
        schema = json.load(file_handle)
    return schema


def validate_json(
    instance: dict[str, Any],
    schema_name: str,
    schemas_dir: Path | None = None,
) -> None:
    schema = load_schema(schema_name=schema_name, schemas_dir=schemas_dir)
    try:
        Draft7Validator.check_schema(schema)
        validator = Draft7Validator(schema, format_checker=FormatChecker())
        errors = sorted(validator.iter_errors(instance), key=lambda err: list(err.path))
    except SchemaError as exc:
        raise SchemaValidationError(
            f"Invalid draft-07 schema '{schema_name}': {exc.message}"
        ) from exc

    if not errors:
        return

    details = "; ".join(_format_error(error) for error in errors)
    raise SchemaValidationError(f"Instance failed schema '{schema_name}': {details}")


def _format_error(error: ValidationError) -> str:
    path = ".".join(str(part) for part in error.path) or "$"
    return f"{path}: {error.message}"
