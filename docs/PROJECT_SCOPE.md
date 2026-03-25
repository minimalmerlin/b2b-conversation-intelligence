# Project Scope (Merlin Scope)

## One-Minute Summary

- Simulate B2B sales/support transcripts at scale.
- Turn transcripts into a structured data product.
- Produce:
  - Assist Card per conversation
  - Messaging insights aggregated over all conversations

## MVP Outputs

- Assist card per conversation
- Insights dashboard (topics, objections, outcomes, deltas)
- Activation outbox (webhook mock as CRM proxy)

## Demo Scope

- Input: synthetic transcripts with metadata + labels
- Processing: normalize -> quality -> inference -> assist card -> outbox
- UI: Streamlit inbox/detail/approve-reject/insights

## Guardrails

- No prohibited claims in generated follow-up drafts
- Personalization ceiling: tone adapts, brand core remains stable
- Schema-first enforcement for all produced payloads
