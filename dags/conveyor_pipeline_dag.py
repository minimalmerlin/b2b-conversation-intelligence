from __future__ import annotations

from datetime import datetime

try:
    from airflow import DAG
    from airflow.operators.bash import BashOperator
except ImportError:  # pragma: no cover - module is optional for local MVP
    DAG = None


if DAG:
    with DAG(
        dag_id="conversation_conveyor_pipeline",
        start_date=datetime(2026, 1, 1),
        schedule="@daily",
        catchup=False,
        tags=["conversation-intelligence", "mvp"],
    ) as dag:
        generate_transcripts = BashOperator(
            task_id="generate_transcripts_dummy",
            bash_command="uv run python -m apps.generator.generator --n 10 --provider dummy",
        )

        process_latest_run = BashOperator(
            task_id="process_latest_run",
            bash_command="uv run python -m apps.pipeline.run_pipeline --auto-apply",
        )

        build_insights = BashOperator(
            task_id="build_insights",
            bash_command="uv run python -m apps.insights.build_insights --window-size 50",
        )

        dispatch_outbox = BashOperator(
            task_id="dispatch_outbox_dry_run",
            bash_command="uv run python -m apps.activation.dispatch_outbox --dry-run --limit 100",
        )

        generate_transcripts >> process_latest_run >> build_insights >> dispatch_outbox
