from __future__ import annotations

from typing import Any

NEGATIVE_WORDS = (
    "risk",
    "concern",
    "delay",
    "blocked",
    "issue",
    "problem",
    "objection",
    "compliance",
)
POSITIVE_WORDS = (
    "great",
    "yes",
    "approved",
    "clear",
    "ready",
    "next step",
    "solution",
    "support",
)


def infer_signals(conversation: dict[str, Any]) -> dict[str, Any]:
    transcript_text = conversation["transcript_text"].lower()
    labels = conversation["labels"]
    objections = labels.get("objections_gt", [])

    negative_hits = sum(transcript_text.count(word) for word in NEGATIVE_WORDS)
    positive_hits = sum(transcript_text.count(word) for word in POSITIVE_WORDS)

    sentiment_base = (positive_hits - negative_hits) / 20
    sentiment_score = max(-1.0, min(1.0, round(sentiment_base, 3)))

    friction_base = 0.2 + min(0.6, len(objections) * 0.2) + min(0.2, negative_hits * 0.01)
    friction_score = max(0.0, min(1.0, round(friction_base, 3)))

    confidence_base = (
        0.65 + (0.1 if labels.get("topic_gt") else 0.0) + min(0.2, positive_hits * 0.01)
    )
    confidence = max(0.0, min(1.0, round(confidence_base, 3)))

    notes = (
        f"Inferred from transcript keywords with rule-based baseline. "
        f"Positive hits={positive_hits}, negative hits={negative_hits}."
    )

    return {
        "conversation_id": conversation["conversation_id"],
        "channel": conversation["channel"],
        "stage": conversation["stage"],
        "segment": conversation["segment"],
        "topic_pred": labels["topic_gt"],
        "objections_pred": objections,
        "outcome_pred": labels["outcome_gt"],
        "sentiment_score": sentiment_score,
        "friction_score": friction_score,
        "confidence": confidence,
        "notes": notes,
    }
