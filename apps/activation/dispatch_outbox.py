from __future__ import annotations

import argparse
import json

import requests

from packages.core.config import get_settings
from packages.processing.db import (
    ensure_schema,
    fetch_outbox_pending,
    get_connection,
    mark_outbox_delivered,
    mark_outbox_failed,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Dispatch activation outbox events to webhook/CRM endpoint."
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=50,
        help="Maximum pending outbox messages to process.",
    )
    parser.add_argument(
        "--webhook-url",
        type=str,
        default=None,
        help="Webhook endpoint URL. Defaults to WEBHOOK_URL or local default.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate delivery and mark as delivered without HTTP call.",
    )
    return parser.parse_args()


def dispatch_outbox(limit: int = 50, webhook_url: str | None = None, dry_run: bool = False) -> dict:
    settings = get_settings()
    resolved_webhook_url = webhook_url or settings.default_webhook_url

    connection = get_connection()
    ensure_schema(connection)

    pending_rows = fetch_outbox_pending(connection=connection, limit=limit)
    delivered = 0
    failed = 0

    for row in pending_rows:
        outbox_id = int(row["id"])
        payload = json.loads(row["payload_json"])
        try:
            if dry_run:
                mark_outbox_delivered(connection=connection, outbox_id=outbox_id)
                delivered += 1
                continue

            response = requests.post(resolved_webhook_url, json=payload, timeout=10)
            if 200 <= response.status_code < 300:
                mark_outbox_delivered(connection=connection, outbox_id=outbox_id)
                delivered += 1
            else:
                mark_outbox_failed(
                    connection=connection,
                    outbox_id=outbox_id,
                    error_message=f"HTTP {response.status_code}: {response.text[:200]}",
                )
                failed += 1
        except requests.RequestException as exc:
            mark_outbox_failed(connection=connection, outbox_id=outbox_id, error_message=str(exc))
            failed += 1

    connection.close()
    return {"processed": len(pending_rows), "delivered": delivered, "failed": failed}


def main() -> int:
    args = parse_args()
    summary = dispatch_outbox(limit=args.limit, webhook_url=args.webhook_url, dry_run=args.dry_run)
    print(json.dumps(summary, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
