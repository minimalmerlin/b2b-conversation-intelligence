from __future__ import annotations

import argparse
import json
from pathlib import Path

from packages.core.config import get_settings
from packages.processing.pipeline import process_run


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Process a transcript run through the MVP conveyor."
    )
    parser.add_argument(
        "--run-id",
        type=str,
        default=None,
        help="Run id under data/transcripts/raw/ (e.g. 20260325T154741Z).",
    )
    parser.add_argument(
        "--run-dir",
        type=Path,
        default=None,
        help="Absolute or relative run directory. Overrides --run-id.",
    )
    parser.add_argument(
        "--auto-apply",
        action="store_true",
        help="If set, auto-approve assist cards and enqueue CRM payloads.",
    )
    parser.add_argument(
        "--target-crm",
        type=str,
        default="webhook",
        choices=("webhook", "hubspot", "salesforce", "dynamics365"),
        help="Target CRM identifier for outbox payloads.",
    )
    return parser.parse_args()


def _resolve_run_dir(args: argparse.Namespace) -> Path:
    settings = get_settings()
    if args.run_dir:
        return args.run_dir

    if args.run_id:
        return settings.raw_transcripts_dir / args.run_id

    candidates = sorted(path for path in settings.raw_transcripts_dir.iterdir() if path.is_dir())
    if not candidates:
        raise FileNotFoundError("No run directories found in data/transcripts/raw.")
    return candidates[-1]


def main() -> int:
    args = parse_args()
    run_dir = _resolve_run_dir(args)
    summary = process_run(run_dir=run_dir, auto_apply=args.auto_apply, target_crm=args.target_crm)
    print(json.dumps(summary, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
