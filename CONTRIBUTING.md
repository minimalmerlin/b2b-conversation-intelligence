# Contributing

## Branching

- Create feature branches from `main` using `feat/<short-name>` or `fix/<short-name>`.
- Keep PRs focused and small (one work package per PR).

## Local Workflow

```bash
uv sync --all-groups
uv run ruff check .
uv run pytest -q
```

## Contracts First

- Any payload change must update:
  - schema in `packages/contracts/schemas/`
  - matching example in `packages/contracts/examples/`
  - tests in `tests/`
- No pipeline/component may write payloads that violate schema contracts.

## Review Rules

- At least 1 teammate review required before merge.
- CI (`ruff` + `pytest`) must be green.
- Breaking contract changes require migration notes in PR description.
