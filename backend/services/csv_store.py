import csv
from datetime import datetime, timezone
from pathlib import Path

from fastapi import UploadFile

from config import get_settings
from models import RecordingMeta, Scenario


class CsvStore:
    def __init__(self) -> None:
        self.path = get_settings().recordings_path
        self.path.mkdir(parents=True, exist_ok=True)

    async def save_upload(self, file: UploadFile, run_id: str, scenario: Scenario) -> RecordingMeta:
        suffix = run_id.split("-")[0]
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        filename = f"{scenario}_{timestamp}_run_{suffix}.csv"
        target = self.path / filename
        content = await file.read()
        target.write_bytes(content)
        return self._summarize(target)

    def list_recordings(self) -> list[RecordingMeta]:
        return sorted((self._summarize(path) for path in self.path.glob("*.csv")), key=lambda item: item.uploaded_at, reverse=True)

    def get_path(self, recording_id: str) -> Path:
        matches = list(self.path.glob(f"*run_{recording_id}.csv")) + list(self.path.glob(f"{recording_id}.csv"))
        if matches:
            return matches[0]
        direct = self.path / recording_id
        if direct.exists():
            return direct
        raise FileNotFoundError(recording_id)

    def _summarize(self, path: Path) -> RecordingMeta:
        rows = list(csv.DictReader(path.open(newline="", encoding="utf-8")))
        first = rows[0] if rows else {}
        last = rows[-1] if rows else {}
        scenario = (first.get("scenario") or path.name.split("_")[0])  # type: ignore[assignment]
        duration = float(last.get("timestamp_sec") or 0)
        replans = int(float(last.get("replanning_count") or 0))
        distance_m = 0.0
        previous = None
        for row in rows:
            point = (float(row.get("pos_x") or 0), float(row.get("pos_y") or 0))
            if previous:
                distance_m += ((point[0] - previous[0]) ** 2 + (point[1] - previous[1]) ** 2) ** 0.5
            previous = point
        return RecordingMeta(
            id=path.stem.split("run_")[-1],
            filename=path.name,
            scenario=scenario,  # type: ignore[arg-type]
            uploaded_at=datetime.fromtimestamp(path.stat().st_mtime, timezone.utc),
            duration_sec=duration,
            distance_m=distance_m,
            replans=replans,
        )


csv_store = CsvStore()
