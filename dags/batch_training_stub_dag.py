from __future__ import annotations

from datetime import datetime

try:
    from airflow import DAG
    from airflow.operators.bash import BashOperator
except ImportError:  # pragma: no cover - module is optional for local MVP
    DAG = None


if DAG:
    with DAG(
        dag_id="batch_training_stub",
        start_date=datetime(2026, 1, 1),
        schedule="@weekly",
        catchup=False,
        tags=["conversation-intelligence", "training"],
    ) as dag:
        build_training_dataset = BashOperator(
            task_id="build_training_dataset_stub",
            bash_command="echo 'Build training dataset from approved/rejected feedback (stub)'",
        )

        run_training = BashOperator(
            task_id="run_training_stub",
            bash_command="echo 'Run training + eval + promotion gate (stub)'",
        )

        build_training_dataset >> run_training
