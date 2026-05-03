$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $root "frontend"
Set-Location $frontend

if (!(Test-Path ".env.local")) {
  Copy-Item ".env.local.example" ".env.local"
}

npm install
npm run dev
