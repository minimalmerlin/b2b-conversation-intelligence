from __future__ import annotations

import json
import sqlite3
from collections import Counter
from datetime import UTC, datetime
from typing import Any


def build_insights(connection: sqlite3.Connection, window_size: int = 50) -> dict[str, Any]:
    signals_rows = list(
        connection.execute(
            """
            SELECT s.conversation_id, s.topic_pred, s.objections_pred_json, s.outcome_pred,
                   c.channel, c.stage, c.segment, c.created_at
            FROM signals s
            JOIN conversations_normalized c ON c.conversation_id = s.conversation_id
            ORDER BY c.created_at DESC
            """
        ).fetchall()
    )

    topic_counter: Counter[str] = Counter()
    objection_counter: Counter[str] = Counter()
    outcome_counter: Counter[str] = Counter()
    stage_counter: Counter[str] = Counter()
    segment_counter: Counter[str] = Counter()

    for row in signals_rows:
        topic_counter.update([row["topic_pred"]])
        outcome_counter.update([row["outcome_pred"]])
        stage_counter.update([row["stage"]])
        segment_counter.update([row["segment"]])
        objection_counter.update(json.loads(row["objections_pred_json"]))

    current_window = signals_rows[:window_size]
    previous_window = signals_rows[window_size : window_size * 2]
    current_topics = Counter(row["topic_pred"] for row in current_window)
    previous_topics = Counter(row["topic_pred"] for row in previous_window)

    topic_delta = []
    for topic in set(current_topics) | set(previous_topics):
        topic_delta.append(
            {
                "topic": topic,
                "current_count": current_topics.get(topic, 0),
                "previous_count": previous_topics.get(topic, 0),
                "delta_count": current_topics.get(topic, 0) - previous_topics.get(topic, 0),
            }
        )

    topic_delta.sort(key=lambda item: item["delta_count"], reverse=True)

    return {
        "generated_at": datetime.now(tz=UTC).isoformat(),
        "conversation_count": len(signals_rows),
        "top_topics": _counter_to_sorted_list(topic_counter),
        "top_objections": _counter_to_sorted_list(objection_counter),
        "outcomes": _counter_to_sorted_list(outcome_counter),
        "stages": _counter_to_sorted_list(stage_counter),
        "segments": _counter_to_sorted_list(segment_counter),
        "topic_delta": topic_delta,
    }


def _counter_to_sorted_list(counter: Counter[str]) -> list[dict[str, Any]]:
    rows = [{"label": label, "count": count} for label, count in counter.items()]
    rows.sort(key=lambda item: item["count"], reverse=True)
    return rows
