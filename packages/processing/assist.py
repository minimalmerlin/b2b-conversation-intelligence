from __future__ import annotations

from typing import Any

BANNED_PHRASES = ("guaranteed", "100%", "fully compliant")


def build_assist_card(conversation: dict[str, Any], signals: dict[str, Any]) -> dict[str, Any]:
    topic = signals["topic_pred"]
    objections = signals["objections_pred"]
    outcome = signals["outcome_pred"]

    summary = (
        f"Conversation focuses on {topic} in {conversation['stage']} stage. "
        f"Primary objections: {', '.join(objections) if objections else 'none'}. "
        f"Outcome trend: {outcome}."
    )

    next_best_step = _build_next_step(topic=topic, outcome=outcome, stage=conversation["stage"])
    followup_email_draft = _build_followup_email(
        conversation=conversation,
        topic=topic,
        next_step=next_best_step,
    )

    violations = [phrase for phrase in BANNED_PHRASES if phrase in followup_email_draft.lower()]
    guardrails_passed = len(violations) == 0

    if not guardrails_passed:
        followup_email_draft = _sanitize_followup_text(followup_email_draft)
        violations = [phrase for phrase in BANNED_PHRASES if phrase in followup_email_draft.lower()]
        guardrails_passed = len(violations) == 0

    return {
        "conversation_id": conversation["conversation_id"],
        "channel": conversation["channel"],
        "stage": conversation["stage"],
        "segment": conversation["segment"],
        "topic_pred": topic,
        "objections_pred": objections,
        "summary": summary,
        "next_best_step": next_best_step,
        "followup_email_draft": followup_email_draft,
        "guardrails_passed": guardrails_passed,
        "guardrail_violations": violations,
    }


def _build_next_step(topic: str, outcome: str, stage: str) -> str:
    if outcome == "next_step_scheduled":
        return f"Run a focused 30-minute call to finalize {topic} scope and owners."
    if outcome == "resolved":
        return f"Send a short recap and confirm rollout checkpoints for {topic}."
    if outcome == "escalated":
        return (
            "Escalate to technical and compliance stakeholders with a structured "
            f"{topic} checklist."
        )
    if outcome == "won":
        return f"Move into onboarding and define first-week milestones for {topic}."
    if outcome == "lost":
        return f"Capture loss reasons in CRM and create a re-engagement play for {stage} accounts."
    return f"Share a concise decision memo and schedule a follow-up on {topic}."


def _build_followup_email(conversation: dict[str, Any], topic: str, next_step: str) -> str:
    return (
        f"Hi, thanks for the conversation about {topic}. "
        f"Based on your current {conversation['stage']} priorities, "
        f"we suggest the following next action: {next_step} "
        "If useful, we can send a one-page summary for your internal alignment."
    )


def _sanitize_followup_text(text: str) -> str:
    sanitized = text
    for phrase in BANNED_PHRASES:
        sanitized = sanitized.replace(phrase, "validated")
        sanitized = sanitized.replace(phrase.capitalize(), "Validated")
    return sanitized
