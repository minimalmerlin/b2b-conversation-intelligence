import json
from pathlib import Path

from packages.core.schema_validation import validate_json

EXAMPLE_TO_SCHEMA = {
    "transcript_normalized.example.json": "transcript_normalized.schema.json",
    "labels.example.json": "labels.schema.json",
    "signals.example.json": "signals.schema.json",
    "assist_card.example.json": "assist_card.schema.json",
    "crm_payload.example.json": "crm_payload.schema.json",
}


def test_all_contract_examples_validate() -> None:
    examples_dir = Path("packages/contracts/examples")

    for example_file, schema_file in EXAMPLE_TO_SCHEMA.items():
        payload = json.loads((examples_dir / example_file).read_text(encoding="utf-8"))
        validate_json(instance=payload, schema_name=schema_file)
