from __future__ import annotations

import json
from pathlib import Path

from apps.activation.dispatch_outbox import main as dispatch_outbox_main
from apps.generator.generator import generate_transcripts
from apps.insights.build_insights import main as build_insights_main
from packages.processing.pipeline import process_run


def main() -> int:
    run_dir = generate_transcripts(
        n=10,
        seed=42,
        outdir=Path("data/transcripts/raw"),
        provider="dummy",
    )
    summary = process_run(run_dir=run_dir, auto_apply=True, target_crm="webhook")
    print(json.dumps(summary, indent=2, ensure_ascii=False))
    build_insights_main()
    dispatch_outbox_main()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
