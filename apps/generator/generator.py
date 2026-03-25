from __future__ import annotations

import argparse
import json
import random
from datetime import UTC, datetime
from pathlib import Path

from packages.core.config import (
    CHANNELS,
    OBJECTIONS,
    SEGMENTS,
    STAGES,
    TOPICS,
    get_settings,
)
from packages.core.logging import get_logger
from packages.core.schema_validation import SchemaValidationError, validate_json

logger = get_logger("generator")

MAX_RETRIES = 2
DEFAULT_OUTDIR = "data/transcripts/raw"


def _to_iso8601(dt: datetime) -> str:
    return dt.astimezone(UTC).isoformat().replace("+00:00", "Z")


def _word_count(text: str) -> int:
    return len(text.split())


def _dummy_transcript_text(
    rng: random.Random,
    channel: str,
    stage: str,
    segment: str,
    account_domain: str,
    topics: list[str],
    objections: list[str],
) -> str:
    lines: list[str] = []
    for turn in range(14):
        topic = topics[turn % len(topics)]
        objection = objections[turn % len(objections)] if objections else "risk"

        if turn % 2 == 0:
            lines.append(
                "Customer: We are evaluating a "
                f"{channel} workflow for the {segment} program at {account_domain}, "
                "and we need clear coverage for "
                f"{topic} while reducing {objection} concerns before "
                "the next procurement review "
                f"in the {stage} stage."
            )
        else:
            lines.append(
                "Agent: We can structure a phased rollout with documented "
                "controls, practical onboarding steps, and weekly checkpoints "
                f"so your team can verify {topic} outcomes and unblock "
                f"stakeholders who flagged {objection} during qualification."
            )

    transcript_text = "\n".join(lines)
    minimum_words = 250
    while _word_count(transcript_text) < minimum_words:
        extra_topic = rng.choice(topics)
        lines.extend(
            [
                "Customer: We also require measurable milestones and practical "
                "adoption guidance for "
                f"{extra_topic} so the internal review board can sign off without further delays.",
                "Agent: Understood, we will deliver a concise plan with "
                "owners, timelines, and validation "
                "criteria that your operations and compliance teams can review in one pass.",
            ]
        )
        transcript_text = "\n".join(lines)
    return transcript_text


def _generate_dummy_transcript(
    rng: random.Random,
    run_id: str,
    index: int,
) -> dict:
    channel = rng.choice(CHANNELS)
    stage = rng.choice(STAGES)
    segment = rng.choice(SEGMENTS)
    topics = sorted(rng.sample(TOPICS, k=rng.randint(2, 4)))
    objections = sorted(rng.sample(OBJECTIONS, k=rng.randint(1, 3)))
    account_domain = f"acct-{rng.randint(1000, 9999)}.example"

    transcript_text = _dummy_transcript_text(
        rng=rng,
        channel=channel,
        stage=stage,
        segment=segment,
        account_domain=account_domain,
        topics=topics,
        objections=objections,
    )

    payload = {
        "transcript_id": f"tr_{run_id.lower()}_{index:03d}",
        "run_id": run_id,
        "created_at": _to_iso8601(datetime.now(tz=UTC)),
        "provider": "dummy",
        "channel": channel,
        "stage": stage,
        "segment": segment,
        "topics": topics,
        "objections": objections,
        "account_domain": account_domain,
        "customer_email": f"contact_{index:03d}@{account_domain}",
        "agent_email": f"agent_{index:03d}@vendor-suite.example",
        "language": "en",
        "transcript_text": transcript_text,
        "word_count": _word_count(transcript_text),
    }
    return payload


def _write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file_handle:
        json.dump(payload, file_handle, ensure_ascii=False, indent=2)


def _generate_payload(provider: str, rng: random.Random, run_id: str, index: int) -> dict:
    if provider == "dummy":
        return _generate_dummy_transcript(rng=rng, run_id=run_id, index=index)
    if provider == "gemini":
        raise NotImplementedError("Provider 'gemini' is not implemented yet.")
    raise ValueError(f"Unsupported provider: {provider}")


def generate_transcripts(
    n: int = 10,
    seed: int = 42,
    outdir: Path | None = None,
    provider: str = "dummy",
) -> Path:
    settings = get_settings()
    base_outdir = Path(outdir) if outdir else settings.raw_transcripts_dir
    run_id = datetime.now(tz=UTC).strftime("%Y%m%dT%H%M%SZ")
    run_dir = base_outdir / run_id
    run_dir.mkdir(parents=True, exist_ok=True)

    rng = random.Random(seed)
    manifest: dict = {
        "run_id": run_id,
        "count_requested": n,
        "count_written": 0,
        "failed_count": 0,
        "files": [],
    }

    for index in range(1, n + 1):
        file_name = f"transcript_{index:03d}.json"
        file_path = run_dir / file_name
        success = False
        last_error = ""

        for attempt in range(1, MAX_RETRIES + 2):
            try:
                payload = _generate_payload(provider=provider, rng=rng, run_id=run_id, index=index)
                validate_json(instance=payload, schema_name="transcript_normalized.schema.json")
                _write_json(file_path, payload)
                manifest["count_written"] += 1
                manifest["files"].append(
                    {
                        "file_name": file_name,
                        "transcript_id": payload["transcript_id"],
                        "status": "written",
                        "attempt": attempt,
                    }
                )
                success = True
                break
            except SchemaValidationError as exc:
                last_error = str(exc)
                logger.warning(
                    "Validation failed for %s on attempt %s/%s",
                    file_name,
                    attempt,
                    MAX_RETRIES + 1,
                )

        if not success:
            manifest["failed_count"] += 1
            manifest["files"].append(
                {
                    "file_name": file_name,
                    "transcript_id": None,
                    "status": "failed",
                    "error": last_error,
                }
            )

    _write_json(run_dir / "manifest.json", manifest)
    logger.info(
        "Run completed: %s (requested=%s, written=%s, failed=%s)",
        run_dir,
        manifest["count_requested"],
        manifest["count_written"],
        manifest["failed_count"],
    )
    return run_dir


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate synthetic B2B transcripts.")
    parser.add_argument(
        "--n",
        type=int,
        default=10,
        help="Number of transcript JSON files to generate.",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for deterministic dummy output.",
    )
    parser.add_argument(
        "--outdir",
        type=Path,
        default=Path(DEFAULT_OUTDIR),
        help="Output base directory (run_id folder will be created inside).",
    )
    parser.add_argument(
        "--provider",
        choices=("dummy", "gemini"),
        default="dummy",
        help="Content provider backend.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.n <= 0:
        msg = "--n must be greater than 0"
        raise ValueError(msg)
    generate_transcripts(n=args.n, seed=args.seed, outdir=args.outdir, provider=args.provider)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
