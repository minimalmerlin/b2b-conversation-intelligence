# Transcript Generator + SSOT Contracts (Merlin Scope)

Synthetisches Conversation-Intelligence-System fuer B2B Sales und Support.

Ziel: Aus Transkripten ein standardisiertes Datenprodukt erzeugen, das zwei Ebenen bedient:

- Layer 1: Messaging- und Positionierungs-Insights auf Populationsebene
- Layer 2: Assist Outputs pro einzelner Conversation (Assist Card + CRM Activation)

## Setup

```bash
uv sync --all-groups
```

Hinweise:

- Python wird ueber `pyproject.toml` mit `>=3.11` gefuehrt.
- `.env` ist optional und wird nicht committed.
- Alle Kommandos laufen mit `uv run ...`.

## Run Generator

```bash
uv run python -m apps.generator.generator --n 10 --seed 42 --provider dummy
```

Beispiel fuer groesseren Trainingsbatch:

```bash
uv run python -m apps.generator.generator --n 1000 --seed 2026 --provider dummy
```

Output:

- Zielordner: `data/transcripts/raw/<run_id>/`
- Dateien: `transcript_001.json` ... `transcript_<n>.json`
- `manifest.json` mit:
  - `run_id`
  - `count_requested`
  - `count_written`
  - `failed_count`
  - `files[]` (inkl. status/attempt/error)

## Run Conveyor Pipeline (Normalize → Signals → Assist → Outbox)

- Letzten Run verarbeiten (auto-apply = Assist sofort in Outbox):

```bash
uv run python -m apps.pipeline.run_pipeline --auto-apply
```

- Bestimmten Run verarbeiten:

```bash
uv run python -m apps.pipeline.run_pipeline --run-id 20260325T154741Z --auto-apply
```

## Build Insights

```bash
uv run python -m apps.insights.build_insights --window-size 50
```

Speichert Snapshot in `data/insights/latest_insights.json` und DB.

## Dispatch Outbox

```bash
uv run python -m apps.activation.dispatch_outbox --limit 50 --dry-run
```

Ohne `--dry-run` wird per POST an `WEBHOOK_URL` (Default: http://127.0.0.1:8089/webhook) gesendet.

## Streamlit UI (Inbox/Detail/Insights/Outbox)

```bash
uv run streamlit run apps/streamlit_app/app.py
```

## Airflow DAGs (Assets)

- `dags/conveyor_pipeline_dag.py` (daily dummy gen + pipeline + insights + outbox dry-run)
- `dags/batch_training_stub_dag.py` (weekly training stub)

## Run Tests

```bash
uv run ruff check .
uv run pytest -q
```

## Projektfluss (MVP Conveyor)

1. Ingest transcript
2. Normalize auf SSOT Contract
3. Quality Gate (Schema + Vollstaendigkeit)
4. Inference auf Signals
5. Assist Card Erstellung
6. Activation in Outbox/CRM Payload

Inference laeuft pro Transcript. Training laeuft getrennt in Batches mit Eval-Gate.

## SSOT Contracts

Schemas:

- `packages/contracts/schemas/transcript_normalized.schema.json`
- `packages/contracts/schemas/labels.schema.json`
- `packages/contracts/schemas/signals.schema.json`
- `packages/contracts/schemas/assist_card.schema.json`
- `packages/contracts/schemas/crm_payload.schema.json`

Beispiele:

- `packages/contracts/examples/transcript_normalized.example.json`
- `packages/contracts/examples/labels.example.json`
- `packages/contracts/examples/signals.example.json`
- `packages/contracts/examples/assist_card.example.json`
- `packages/contracts/examples/crm_payload.example.json`

## Taxonomie (verbindlich)

- `channel`: `sales|support`
- `stage`: `discovery|qualification|closing|onboarding|after_sales|support`
- `segment`: `smb|midmarket|enterprise|agency`
- `topics`: `integration, pricing, security, rollout, sla, onboarding, reporting, api, data_migration, procurement, compliance, training, customization, support_process, analytics`
- `objections`: `price, timing, competitor, trust, compliance, resources, feature_gap, risk, internal_buy_in, legal_procurement`

## Repository Struktur

```text
apps/generator/             # CLI Generator (dummy + gemini stub)
packages/contracts/         # SSOT schemas + examples
packages/core/              # config, logging, schema validation
tests/                      # unit + integration + contract example tests
docs/                       # scope, architecture, team workplan
.github/workflows/ci.yml    # ruff + pytest
```

## Team Workflow

Arbeitsregeln:

- Contract-first: Jede Payload-Aenderung braucht Schema + Example + Tests.
- CI muss gruen sein (`ruff`, `pytest`).
- Kleine, fokussierte PRs pro Arbeitspaket.

Siehe:

- `CONTRIBUTING.md`
- `.github/pull_request_template.md`
- `.github/CODEOWNERS`

## Team Dokumentation

- `docs/PROJECT_SCOPE.md`
- `docs/ARCHITECTURE.md`
- `docs/TEAM_WORKPLAN.md`

## Aktueller Stand

Bereits erzeugter Trainingsbatch:

- `data/transcripts/raw/20260325T154741Z`
- `count_written=1000`
- `failed_count=0`

Fuer schnellen Handover an Training/EDA:

- `data/transcripts/for_training/README.txt`
