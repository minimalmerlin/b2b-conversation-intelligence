from pathlib import Path

from apps.activation.dispatch_outbox import dispatch_outbox
from apps.generator.generator import generate_transcripts
from apps.pipeline.run_pipeline import process_run
from packages.processing.db import ensure_schema, get_connection


def test_process_run_auto_apply_and_outbox(tmp_path: Path, monkeypatch) -> None:
    # isolate operational DB in temp
    db_path = tmp_path / "ops.db"
    monkeypatch.setenv("OPERATIONAL_DB_PATH", str(db_path))

    # generate small run into temp directory
    run_dir = generate_transcripts(n=3, seed=123, outdir=tmp_path, provider="dummy")

    summary = process_run(run_dir=run_dir, auto_apply=True, target_crm="webhook", db_path=db_path)
    assert summary["processed_files"] == 3
    assert summary["failed_files"] == 0
    assert summary["outbox_queued"] == 3

    conn = get_connection(db_path)
    ensure_schema(conn)

    # verify conversations stored
    conv_count = conn.execute("SELECT COUNT(*) FROM conversations_normalized").fetchone()[0]
    assert conv_count == 3

    # verify outbox pending
    outbox_count = conn.execute("SELECT COUNT(*) FROM activation_outbox").fetchone()[0]
    assert outbox_count == 3

    # dry-run dispatch should mark as delivered without HTTP call
    result = dispatch_outbox(limit=10, webhook_url="http://127.0.0.1:9/unreachable", dry_run=True)
    assert result["processed"] == 3
    assert result["delivered"] == 3
    conn.close()
