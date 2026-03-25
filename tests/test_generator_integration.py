import json
from pathlib import Path

from apps.generator.generator import generate_transcripts
from packages.core.schema_validation import validate_json


def test_generator_writes_n_files_and_valid_manifest(tmp_path: Path) -> None:
    run_dir = generate_transcripts(n=4, seed=42, outdir=tmp_path, provider="dummy")
    manifest_path = run_dir / "manifest.json"
    assert manifest_path.exists()

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    assert manifest["count_requested"] == 4
    assert manifest["count_written"] == 4
    assert manifest["failed_count"] == 0
    assert len(manifest["files"]) == 4

    for file_entry in manifest["files"]:
        assert file_entry["status"] == "written"
        file_path = run_dir / file_entry["file_name"]
        assert file_path.exists()
        payload = json.loads(file_path.read_text(encoding="utf-8"))
        validate_json(instance=payload, schema_name="transcript_normalized.schema.json")
