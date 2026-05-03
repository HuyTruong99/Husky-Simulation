$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"
Set-Location $backend

if (!(Test-Path ".venv")) {
  python -m venv .venv
}

& ".\.venv\Scripts\Activate.ps1"
pip install -r requirements.txt

$env:ROSBRIDGE_URL = "ws://127.0.0.1:9090"
$env:RECORDINGS_PATH = ".\recordings"
$env:CORS_ORIGINS = "http://localhost:3000"
$env:UPLOAD_SECRET = "changeme123"

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
