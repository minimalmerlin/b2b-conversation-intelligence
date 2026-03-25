# Architecture Overview

## Purpose

Conversation Intelligence for synthetic B2B sales/support transcripts with two output layers:

- Layer 1: Population messaging insights
- Layer 2: Individual assist outputs (assist card + CRM activation)

## Core Flow (Conveyor)

1. Ingest transcript
2. Normalize to SSOT (`transcript_normalized`)
3. Quality checks (schema + completeness)
4. Inference (`signals`)
5. Assist generation (`assist_card`)
6. Activation write (`crm_payload` to outbox)

## Training vs Inference

- Inference runs on every transcript.
- Training runs batch-wise and versioned with eval gates.
- Only promoted models are used by production inference.

## Data Layers

- Operational: Postgres (conversations, features, assist_cards, outbox, processed_files)
- Analytics path: Snowflake/Lakehouse (future scaling)

## Contracts (SSOT)

- `transcript_normalized.schema.json`
- `labels.schema.json`
- `signals.schema.json`
- `assist_card.schema.json`
- `crm_payload.schema.json`

These contracts are the integration boundary between generator, inference, UI and activation.
