# Transcript Generator + SSOT Contracts (Merlin-Scope)

## Setup

```bash
uv sync --all-groups
```

`.env` ist optional und wird nicht ins Repo committed.

## Run Generator

```bash
uv run python -m apps.generator.generator --n 10 --seed 42 --provider dummy
```

Standard-Output: `data/transcripts/raw/<run_id>/` mit `transcript_*.json` und `manifest.json`.

## Run Tests

```bash
uv run ruff check .
uv run pytest -q
```

## SSOT Contracts

- `packages/contracts/schemas/transcript_normalized.schema.json`
- `packages/contracts/schemas/labels.schema.json`
- `packages/contracts/schemas/signals.schema.json`
- `packages/contracts/schemas/assist_card.schema.json`
- `packages/contracts/schemas/crm_payload.schema.json`

## Team Docs

- `docs/PROJECT_SCOPE.md`
- `docs/ARCHITECTURE.md`
- `docs/TEAM_WORKPLAN.md`
- `CONTRIBUTING.md`
