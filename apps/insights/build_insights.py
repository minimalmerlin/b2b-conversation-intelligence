from __future__ import annotations

import argparse
import json
from pathlib import Path

from packages.core.config import get_settings
from packages.processing.db import ensure_schema, get_connection, insert_insights_snapshot
from packages.processing.insights import build_insights


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build aggregate messaging insights from processed data."
    )
    parser.add_argument(
        "--window-size",
        type=int,
        default=50,
        help="Window size for delta comparison (current vs previous).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Optional output JSON path for latest insights.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    settings = get_settings()
    output_path = args.output or (settings.insights_dir / "latest_insights.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    connection = get_connection()
    ensure_schema(connection)
    insights = build_insights(connection=connection, window_size=args.window_size)
    insert_insights_snapshot(connection=connection, payload=insights, window_size=args.window_size)
    connection.close()

    output_path.write_text(json.dumps(insights, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        json.dumps(
            {"output": str(output_path), "conversation_count": insights["conversation_count"]},
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
