from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

CHANNELS = ("sales", "support")
STAGES = (
    "discovery",
    "qualification",
    "closing",
    "onboarding",
    "after_sales",
    "support",
)
SEGMENTS = ("smb", "midmarket", "enterprise", "agency")
OUTCOMES = (
    "next_step_scheduled",
    "resolved",
    "escalated",
    "won",
    "lost",
    "no_decision",
)
TOPICS = (
    "integration",
    "pricing",
    "security",
    "rollout",
    "sla",
    "onboarding",
    "reporting",
    "api",
    "data_migration",
    "procurement",
    "compliance",
    "training",
    "customization",
    "support_process",
    "analytics",
)
OBJECTIONS = (
    "price",
    "timing",
    "competitor",
    "trust",
    "compliance",
    "resources",
    "feature_gap",
    "risk",
    "internal_buy_in",
    "legal_procurement",
)
DEFAULT_PRODUCT = "B2B SaaS Data & Marketing Platform"


@dataclass(frozen=True)
class Settings:
    project_root: Path
    data_dir: Path
    raw_transcripts_dir: Path
    schemas_dir: Path


def get_settings() -> Settings:
    project_root = Path(__file__).resolve().parents[2]
    data_dir = project_root / "data"
    raw_transcripts_dir = data_dir / "transcripts" / "raw"
    schemas_dir = project_root / "packages" / "contracts" / "schemas"

    return Settings(
        project_root=project_root,
        data_dir=data_dir,
        raw_transcripts_dir=raw_transcripts_dir,
        schemas_dir=schemas_dir,
    )
