from __future__ import annotations

import streamlit as st

from packages.core.schema_validation import validate_json
from packages.processing.activation import build_crm_payload
from packages.processing.db import (
    enqueue_outbox,
    ensure_schema,
    fetch_conversation_bundle,
    fetch_inbox_rows,
    fetch_outbox_rows,
    fetch_status_counts,
    get_connection,
    insert_insights_snapshot,
    update_assist_review_status,
)
from packages.processing.insights import build_insights


def _get_connection():
    connection = get_connection()
    ensure_schema(connection)
    return connection


def render_inbox(connection) -> None:
    st.subheader("Transcript Inbox")
    filter_status = st.selectbox(
        "Filter status",
        options=["all", "pending_review", "approved", "rejected", "auto_applied"],
        index=0,
    )

    rows = fetch_inbox_rows(connection, None if filter_status == "all" else filter_status)
    if not rows:
        st.info("No conversations found.")
        return

    table_rows = [dict(row) for row in rows]
    st.dataframe(table_rows, use_container_width=True)


def render_detail(connection) -> None:
    st.subheader("Conversation Detail")
    inbox_rows = fetch_inbox_rows(connection)
    if not inbox_rows:
        st.info("No conversations available.")
        return

    ids = [row["conversation_id"] for row in inbox_rows]
    selected_id = st.selectbox("Select conversation", options=ids)
    bundle = fetch_conversation_bundle(connection, selected_id)
    if bundle is None:
        st.warning("Conversation not found.")
        return

    st.markdown("### Transcript")
    st.text(bundle["conversation"]["transcript_text"])

    st.markdown("### Signals")
    st.json(bundle["signals"])

    st.markdown("### Assist Card")
    st.json(bundle["assist_card"])

    review_notes = st.text_input("Review notes", value="")
    col1, col2 = st.columns(2)
    with col1:
        if st.button("Approve", type="primary"):
            update_assist_review_status(
                connection=connection,
                conversation_id=selected_id,
                review_status="approved",
                review_notes=review_notes or None,
            )
            crm_payload = build_crm_payload(
                conversation=bundle["conversation"],
                signals=bundle["signals"],
                assist_card=bundle["assist_card"],
                target_crm="webhook",
            )
            validate_json(instance=crm_payload, schema_name="crm_payload.schema.json")
            enqueue_outbox(connection=connection, conversation_id=selected_id, payload=crm_payload)
            st.success("Approved and queued in activation outbox.")
            st.rerun()

    with col2:
        if st.button("Reject"):
            update_assist_review_status(
                connection=connection,
                conversation_id=selected_id,
                review_status="rejected",
                review_notes=review_notes or None,
            )
            st.warning("Marked as rejected.")
            st.rerun()


def render_insights(connection) -> None:
    st.subheader("Insights Dashboard")
    window_size = st.slider("Window size for delta", min_value=20, max_value=200, value=50, step=10)

    if st.button("Refresh insights"):
        insights = build_insights(connection=connection, window_size=window_size)
        insert_insights_snapshot(connection=connection, payload=insights, window_size=window_size)
    else:
        insights = build_insights(connection=connection, window_size=window_size)

    metrics = st.columns(3)
    metrics[0].metric("Conversations", insights["conversation_count"])
    metrics[1].metric(
        "Top Topic",
        insights["top_topics"][0]["label"] if insights["top_topics"] else "-",
    )
    metrics[2].metric(
        "Top Objection",
        insights["top_objections"][0]["label"] if insights["top_objections"] else "-",
    )

    st.markdown("### Topic Delta")
    st.dataframe(insights["topic_delta"], use_container_width=True)
    st.markdown("### Top Topics")
    st.dataframe(insights["top_topics"], use_container_width=True)
    st.markdown("### Top Objections")
    st.dataframe(insights["top_objections"], use_container_width=True)
    st.markdown("### Outcomes")
    st.dataframe(insights["outcomes"], use_container_width=True)


def render_outbox(connection) -> None:
    st.subheader("Activation Outbox")
    counts = fetch_status_counts(connection)
    col1, col2, col3 = st.columns(3)
    col1.metric("Outbox pending", counts.get("outbox_pending", 0))
    col2.metric("Outbox delivered", counts.get("outbox_delivered", 0))
    col3.metric("Assist pending review", counts.get("assist_pending_review", 0))

    rows = fetch_outbox_rows(connection, limit=200)
    st.dataframe([dict(row) for row in rows], use_container_width=True)


def main() -> None:
    st.set_page_config(page_title="Conversation Intelligence MVP", layout="wide")
    st.title("Conversation Intelligence MVP")
    st.caption("Inbox -> Assist Card -> Approve/Reject -> Activation Outbox + Insights")

    connection = _get_connection()
    try:
        tabs = st.tabs(["Inbox", "Detail", "Insights", "Outbox"])
        with tabs[0]:
            render_inbox(connection)
        with tabs[1]:
            render_detail(connection)
        with tabs[2]:
            render_insights(connection)
        with tabs[3]:
            render_outbox(connection)
    finally:
        connection.close()


if __name__ == "__main__":
    main()
