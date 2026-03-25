# Team Workplan (3 People)

## Guiding Question

How far can personalization go without breaking compliance and brand rules?

## Work Packages

### AP0 - SSOT & Taxonomy (shared)

- Finalize schemas + examples
- Keep taxonomy stable across modules

### AP1 - Synthetic Data Generation (Merlin)

- Generate large synthetic transcript sets
- Maintain reproducible seeds/config

### AP2 - Data Layer & Star Schema (Person B)

- Build operational Postgres tables
- Design analytics star schema (future Snowflake path)

### AP3 - Orchestration (Person C)

- Airflow DAG A: ingest -> normalize -> quality -> inference -> outputs
- Airflow DAG B: train -> eval -> promote (stub/MVP)

### AP4 - Cleaning & EDA (Person B)

- Data quality checks, deduplication, coverage reporting

### AP5 - Signal Extraction & Eval (Person B)

- Topic/objection prediction baselines
- Evaluation metrics and error analysis

### AP6 - Assist Card & Insights Logic (Merlin)

- Build assist card logic with guardrails
- Build aggregated insight and delta logic

### AP7 - Streamlit App (Person C)

- Inbox, detail review, approve/reject/edit, insights dashboard

### AP8 - CRM Activation Layer (Merlin + Person C)

- Outbox consumer + webhook connector
- Connector specs for HubSpot/Salesforce/Dynamics

### AP9 - Final Packaging (Person C)

- Runbook, demo script, final documentation

## Definition of Done (Project)

- End-to-end DAG run from raw transcript to assist card/outbox
- Streamlit demo: inbox -> assist card -> approve -> outbox
- Insights dashboard with trend/delta
- Documented scaling path to Snowflake + star schema
