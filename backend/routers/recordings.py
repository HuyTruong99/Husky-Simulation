from fastapi import APIRouter, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse

from config import get_settings
from models import RecordingMeta, Scenario
from services.csv_store import csv_store

router = APIRouter(prefix="/recordings", tags=["recordings"])


@router.get("", response_model=list[RecordingMeta])
async def list_recordings() -> list[RecordingMeta]:
    return csv_store.list_recordings()


@router.get("/{recording_id}/download")
async def download_recording(recording_id: str) -> FileResponse:
    try:
        path = csv_store.get_path(recording_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Recording not found") from exc
    return FileResponse(path, filename=path.name, media_type="text/csv")


@router.post("/upload", response_model=RecordingMeta)
async def upload_recording(
    run_id: str = Form(...),
    scenario: Scenario = Form(...),
    file: UploadFile = File(...),
    x_upload_secret: str | None = Header(default=None),
) -> RecordingMeta:
    expected = get_settings().upload_secret
    if expected and x_upload_secret != expected:
        raise HTTPException(status_code=401, detail="Invalid upload secret")
    return await csv_store.save_upload(file, run_id, scenario)
