$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"
$ngrok = Get-Command ngrok -ErrorAction SilentlyContinue

if (!$ngrok) {
  Write-Host "ngrok is not installed or not on PATH."
  Write-Host "Install it from https://ngrok.com/downloads/windows, then run:"
  Write-Host "ngrok config add-authtoken <YOUR_NGROK_TOKEN>"
  exit 1
}

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd `"$backend`"; if (!(Test-Path '.venv')) { python -m venv .venv }; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt; `$env:ROSBRIDGE_URL='ws://127.0.0.1:9090'; `$env:RECORDINGS_PATH='.\recordings'; `$env:CORS_ORIGINS='http://localhost:3000,https://*.vercel.app'; `$env:UPLOAD_SECRET='changeme123'; uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
)

Start-Sleep -Seconds 4
Write-Host "Starting ngrok for backend http://localhost:8000"
Write-Host "Copy the https://... ngrok URL into the Vercel dashboard app's Backend URL field."
ngrok http 8000
