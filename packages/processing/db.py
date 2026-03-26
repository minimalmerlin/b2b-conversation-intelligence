from __future__ import annotations

import json
import sqlite3
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from packages.core.config import get_settings


def _now_iso() -> str:
    return datetime.now(tz=UTC).isoformat()


def get_connection(db_path: Path | None = None) -> sqlite3.Connection:
    settings = get_settings()
    resolved_path = db_path or settings.operational_db_path
    resolved_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(resolved_path)
    connection.row_factory = sqlite3.Row
    return connection


def ensure_schema(connection: sqlite3.Connection) -> None:
    connection.executescript(
        """
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS conversations_normalized (
            conversation_id TEXT PRIMARY KEY,
            run_id TEXT,
            provider TEXT,
            channel TEXT NOT NULL,
            stage TEXT NOT NULL,
            segment TEXT NOT NULL,
            product TEXT NOT NULL,
            account_domain TEXT NOT NULL,
            participant_email TEXT NOT NULL,
            transcript_text TEXT NOT NULL,
            created_at TEXT NOT NULL,
            word_count INTEGER,
            labels_json TEXT NOT NULL,
            inserted_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS signals (
            conversation_id TEXT PRIMARY KEY,
            channel TEXT NOT NULL,
            stage TEXT NOT NULL,
            segment TEXT NOT NULL,
            topic_pred TEXT NOT NULL,
            objections_pred_json TEXT NOT NULL,
            outcome_pred TEXT NOT NULL,
            sentiment_score REAL NOT NULL,
            friction_score REAL NOT NULL,
            confidence REAL NOT NULL,
            notes TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS assist_cards (
            conversation_id TEXT PRIMARY KEY,
            channel TEXT NOT NULL,
            stage TEXT NOT NULL,
            segment TEXT NOT NULL,
            topic_pred TEXT NOT NULL,
            objections_pred_json TEXT NOT NULL,
            summary TEXT NOT NULL,
            next_best_step TEXT NOT NULL,
            followup_email_draft TEXT NOT NULL,
            guardrails_passed INTEGER NOT NULL,
            guardrail_violations_json TEXT NOT NULL,
            review_status TEXT NOT NULL,
            review_notes TEXT,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS activation_outbox (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id TEXT NOT NULL,
            payload_json TEXT NOT NULL,
            status TEXT NOT NULL,
            retry_count INTEGER NOT NULL DEFAULT 0,
            last_error TEXT,
            created_at TEXT NOT NULL,
            delivered_at TEXT
        );

        CREATE TABLE IF NOT EXISTS processed_files (
            file_path TEXT PRIMARY KEY,
            conversation_id TEXT NOT NULL,
            run_id TEXT NOT NULL,
            processed_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS insights_snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            window_size INTEGER NOT NULL,
            payload_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
        """
    )
    connection.commit()


def is_processed_file(connection: sqlite3.Connection, file_path: Path) -> bool:
    row = connection.execute(
        "SELECT 1 FROM processed_files WHERE file_path = ?",
        (str(file_path),),
    ).fetchone()
    return row is not None


def mark_processed_file(
    connection: sqlite3.Connection,
    file_path: Path,
    conversation_id: str,
    run_id: str,
) -> None:
    connection.execute(
        """
        INSERT OR REPLACE INTO processed_files (file_path, conversation_id, run_id, processed_at)
        VALUES (?, ?, ?, ?)
        """,
        (str(file_path), conversation_id, run_id, _now_iso()),
    )
    connection.commit()


def upsert_conversation(connection: sqlite3.Connection, payload: dict[str, Any]) -> None:
    labels_json = json.dumps(payload["labels"], ensure_ascii=False)
    connection.execute(
        """
        INSERT OR REPLACE INTO conversations_normalized (
            conversation_id, run_id, provider, channel, stage, segment, product,
            account_domain, participant_email, transcript_text, created_at,
            word_count, labels_json, inserted_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload["conversation_id"],
            payload.get("run_id"),
            payload.get("provider", "unknown"),
            payload["channel"],
            payload["stage"],
            payload["segment"],
            payload["product"],
            payload["account_domain"],
            payload["participant_email"],
            payload["transcript_text"],
            payload["created_at"],
            payload.get("word_count"),
            labels_json,
            _now_iso(),
        ),
    )
    connection.commit()


def upsert_signals(connection: sqlite3.Connection, payload: dict[str, Any]) -> None:
    connection.execute(
        """
        INSERT OR REPLACE INTO signals (
            conversation_id, channel, stage, segment, topic_pred, objections_pred_json,
            outcome_pred, sentiment_score, friction_score, confidence, notes, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload["conversation_id"],
            payload["channel"],
            payload["stage"],
            payload["segment"],
            payload["topic_pred"],
            json.dumps(payload["objections_pred"], ensure_ascii=False),
            payload["outcome_pred"],
            payload["sentiment_score"],
            payload["friction_score"],
            payload["confidence"],
            payload["notes"],
            _now_iso(),
        ),
    )
    connection.commit()


def upsert_assist_card(
    connection: sqlite3.Connection,
    payload: dict[str, Any],
    review_status: str = "pending_review",
    review_notes: str | None = None,
) -> None:
    connection.execute(
        """
        INSERT OR REPLACE INTO assist_cards (
            conversation_id, channel, stage, segment, topic_pred, objections_pred_json, summary,
            next_best_step, followup_email_draft, guardrails_passed, guardrail_violations_json,
            review_status, review_notes, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload["conversation_id"],
            payload["channel"],
            payload["stage"],
            payload["segment"],
            payload["topic_pred"],
            json.dumps(payload["objections_pred"], ensure_ascii=False),
            payload["summary"],
            payload["next_best_step"],
            payload["followup_email_draft"],
            int(payload["guardrails_passed"]),
            json.dumps(payload.get("guardrail_violations", []), ensure_ascii=False),
            review_status,
            review_notes,
            _now_iso(),
        ),
    )
    connection.commit()


def update_assist_review_status(
    connection: sqlite3.Connection,
    conversation_id: str,
    review_status: str,
    review_notes: str | None = None,
) -> None:
    connection.execute(
        """
        UPDATE assist_cards
        SET review_status = ?, review_notes = ?, updated_at = ?
        WHERE conversation_id = ?
        """,
        (review_status, review_notes, _now_iso(), conversation_id),
    )
    connection.commit()


def enqueue_outbox(
    connection: sqlite3.Connection,
    conversation_id: str,
    payload: dict[str, Any],
) -> int:
    cursor = connection.execute(
        """
        INSERT INTO activation_outbox (conversation_id, payload_json, status, created_at)
        VALUES (?, ?, 'pending', ?)
        """,
        (conversation_id, json.dumps(payload, ensure_ascii=False), _now_iso()),
    )
    connection.commit()
    return int(cursor.lastrowid)


def fetch_outbox_pending(connection: sqlite3.Connection, limit: int = 50) -> list[sqlite3.Row]:
    cursor = connection.execute(
        """
        SELECT id, conversation_id, payload_json, retry_count
        FROM activation_outbox
        WHERE status = 'pending'
        ORDER BY id
        LIMIT ?
        """,
        (limit,),
    )
    return list(cursor.fetchall())


def fetch_outbox_rows(connection: sqlite3.Connection, limit: int = 200) -> list[sqlite3.Row]:
    cursor = connection.execute(
        """
        SELECT id, conversation_id, status, retry_count, last_error, created_at, delivered_at
        FROM activation_outbox
        ORDER BY id DESC
        LIMIT ?
        """,
        (limit,),
    )
    return list(cursor.fetchall())


def fetch_status_counts(connection: sqlite3.Connection) -> dict[str, int]:
    assist_rows = connection.execute(
        """
        SELECT review_status, COUNT(*) AS cnt
        FROM assist_cards
        GROUP BY review_status
        """
    ).fetchall()
    outbox_rows = connection.execute(
        """
        SELECT status, COUNT(*) AS cnt
        FROM activation_outbox
        GROUP BY status
        """
    ).fetchall()

    counts: dict[str, int] = {}
    for row in assist_rows:
        counts[f"assist_{row['review_status']}"] = int(row["cnt"])
    for row in outbox_rows:
        counts[f"outbox_{row['status']}"] = int(row["cnt"])
    return counts


def mark_outbox_delivered(connection: sqlite3.Connection, outbox_id: int) -> None:
    connection.execute(
        """
        UPDATE activation_outbox
        SET status = 'delivered', delivered_at = ?, last_error = NULL
        WHERE id = ?
        """,
        (_now_iso(), outbox_id),
    )
    connection.commit()


def mark_outbox_failed(connection: sqlite3.Connection, outbox_id: int, error_message: str) -> None:
    connection.execute(
        """
        UPDATE activation_outbox
        SET status = 'pending', retry_count = retry_count + 1, last_error = ?
        WHERE id = ?
        """,
        (error_message[:400], outbox_id),
    )
    connection.commit()


def insert_insights_snapshot(
    connection: sqlite3.Connection,
    payload: dict[str, Any],
    window_size: int,
) -> None:
    connection.execute(
        """
        INSERT INTO insights_snapshots (window_size, payload_json, created_at)
        VALUES (?, ?, ?)
        """,
        (window_size, json.dumps(payload, ensure_ascii=False), _now_iso()),
    )
    connection.commit()


def fetch_latest_insights_snapshot(connection: sqlite3.Connection) -> dict[str, Any] | None:
    row = connection.execute(
        """
        SELECT payload_json
        FROM insights_snapshots
        ORDER BY id DESC
        LIMIT 1
        """
    ).fetchone()
    if row is None:
        return None
    return json.loads(row["payload_json"])


def fetch_inbox_rows(
    connection: sqlite3.Connection,
    review_status: str | None = None,
) -> list[sqlite3.Row]:
    if review_status:
        cursor = connection.execute(
            """
            SELECT c.conversation_id, c.channel, c.stage, c.segment, c.created_at, a.review_status
            FROM conversations_normalized c
            JOIN assist_cards a ON a.conversation_id = c.conversation_id
            WHERE a.review_status = ?
            ORDER BY c.created_at DESC
            """,
            (review_status,),
        )
    else:
        cursor = connection.execute(
            """
            SELECT c.conversation_id, c.channel, c.stage, c.segment, c.created_at, a.review_status
            FROM conversations_normalized c
            JOIN assist_cards a ON a.conversation_id = c.conversation_id
            ORDER BY c.created_at DESC
            """
        )
    return list(cursor.fetchall())


def fetch_conversation_bundle(
    connection: sqlite3.Connection,
    conversation_id: str,
) -> dict[str, Any] | None:
    conversation_row = connection.execute(
        "SELECT * FROM conversations_normalized WHERE conversation_id = ?",
        (conversation_id,),
    ).fetchone()
    if conversation_row is None:
        return None

    signals_row = connection.execute(
        "SELECT * FROM signals WHERE conversation_id = ?",
        (conversation_id,),
    ).fetchone()
    assist_row = connection.execute(
        "SELECT * FROM assist_cards WHERE conversation_id = ?",
        (conversation_id,),
    ).fetchone()

    def _row_to_dict(row: sqlite3.Row | None) -> dict[str, Any] | None:
        if row is None:
            return None
        return dict(row)

    payload: dict[str, Any] = {
        "conversation": _row_to_dict(conversation_row),
        "signals": _row_to_dict(signals_row),
        "assist_card": _row_to_dict(assist_row),
    }

    if payload["conversation"] is not None:
        payload["conversation"]["labels"] = json.loads(payload["conversation"]["labels_json"])
    if payload["signals"] is not None:
        payload["signals"]["objections_pred"] = json.loads(
            payload["signals"]["objections_pred_json"]
        )
    if payload["assist_card"] is not None:
        payload["assist_card"]["objections_pred"] = json.loads(
            payload["assist_card"]["objections_pred_json"]
        )
        payload["assist_card"]["guardrail_violations"] = json.loads(
            payload["assist_card"]["guardrail_violations_json"]
        )
    return payload
