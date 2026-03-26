from __future__ import annotations

from typing import Any


def build_crm_payload(
    conversation: dict[str, Any],
    signals: dict[str, Any],
    assist_card: dict[str, Any],
    target_crm: str = "webhook",
) -> dict[str, Any]:
    summary_body = (
        f"Summary: {assist_card['summary']}\n"
        f"Topic: {signals['topic_pred']}\n"
        "Objections: "
        f"{', '.join(signals['objections_pred']) if signals['objections_pred'] else 'none'}\n"
        f"Outcome: {signals['outcome_pred']}"
    )

    return {
        "conversation_id": conversation["conversation_id"],
        "target_crm": target_crm,
        "channel": conversation["channel"],
        "stage": conversation["stage"],
        "segment": conversation["segment"],
        "topic_pred": signals["topic_pred"],
        "objections_pred": signals["objections_pred"],
        "identity": {
            "participant_email": conversation["participant_email"],
            "account_domain": conversation["account_domain"],
        },
        "actions": [
            {
                "type": "create_note",
                "title": "Conversation summary + signals",
                "body": summary_body,
            },
            {
                "type": "create_task",
                "title": "Next best step",
                "body": assist_card["next_best_step"],
            },
            {
                "type": "create_email_draft",
                "subject": "Suggested next steps from our conversation",
                "body": assist_card["followup_email_draft"],
            },
        ],
    }
