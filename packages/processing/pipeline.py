from __future__ import annotations

import json
import sqlite3
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from packages.core.config import get_settings
from packages.core.schema_validation import validate_json
from packages.processing.activation import build_crm_payload
from packages.processing.assist import build_assist_card
from packages.processing.db import (
    enqueue_outbox,
    ensure_schema,
    get_connection,
    is_processed_file,
    mark_processed_file,
    upsert_assist_card,
    upsert_conversation,
    upsert_signals,
)
from packages.processing.inference import infer_signals


def process_run(
    run_dir: Path,
    auto_apply: bool = False,
    db_path: Path | None = None,
    target_crm: str = "webhook",
) -> dict[str, Any]:
    settings = get_settings()
    if not run_dir.exists():
        raise FileNotFoundError(f"Run directory not found: {run_dir}")

    run_id = run_dir.name
    output_dir = settings.processed_transcripts_dir / run_id
    (output_dir / "signals").mkdir(parents=True, exist_ok=True)
    (output_dir / "assist_cards").mkdir(parents=True, exist_ok=True)
    (output_dir / "crm_payloads").mkdir(parents=True, exist_ok=True)

    connection = get_connection(db_path=db_path)
    ensure_schema(connection)

    summary: dict[str, Any] = {
        "run_id": run_id,
        "run_dir": str(run_dir),
        "processed_at": datetime.now(tz=UTC).isoformat(),
        "requested_files": 0,
        "processed_files": 0,
        "skipped_files": 0,
        "failed_files": 0,
        "outbox_queued": 0,
        "errors": [],
    }

    transcript_files = sorted(run_dir.glob("transcript_*.json"))
    summary["requested_files"] = len(transcript_files)

    for transcript_path in transcript_files:
        try:
            if is_processed_file(connection, transcript_path):
                summary["skipped_files"] += 1
                continue

            conversation = _read_json(transcript_path)
            validate_json(instance=conversation, schema_name="transcript_normalized.schema.json")
            validate_json(instance=conversation["labels"], schema_name="labels.schema.json")

            upsert_conversation(connection, conversation)

            signals = infer_signals(conversation)
            validate_json(instance=signals, schema_name="signals.schema.json")
            upsert_signals(connection, signals)
            _write_json(output_dir / "signals" / transcript_path.name, signals)

            assist_card = build_assist_card(conversation, signals)
            validate_json(instance=assist_card, schema_name="assist_card.schema.json")

            review_status = "auto_applied" if auto_apply else "pending_review"
            upsert_assist_card(connection, assist_card, review_status=review_status)
            _write_json(output_dir / "assist_cards" / transcript_path.name, assist_card)

            if auto_apply:
                crm_payload = build_crm_payload(
                    conversation=conversation,
                    signals=signals,
                    assist_card=assist_card,
                    target_crm=target_crm,
                )
                validate_json(instance=crm_payload, schema_name="crm_payload.schema.json")
                enqueue_outbox(
                    connection=connection,
                    conversation_id=conversation["conversation_id"],
                    payload=crm_payload,
                )
                _write_json(output_dir / "crm_payloads" / transcript_path.name, crm_payload)
                summary["outbox_queued"] += 1

            mark_processed_file(
                connection=connection,
                file_path=transcript_path,
                conversation_id=conversation["conversation_id"],
                run_id=run_id,
            )
            summary["processed_files"] += 1
        except (sqlite3.DatabaseError, ValueError, KeyError, TypeError) as exc:
            summary["failed_files"] += 1
            summary["errors"].append({"file": str(transcript_path), "error": str(exc)})
        except Exception as exc:  # pragma: no cover - safety net for unexpected runtime issues
            summary["failed_files"] += 1
            summary["errors"].append({"file": str(transcript_path), "error": f"Unexpected: {exc}"})

    _write_json(output_dir / "processing_manifest.json", summary)
    connection.close()
    return summary


def _read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
