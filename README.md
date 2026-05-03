# Husky Simulation Dashboard

Full-stack dashboard for a local Husky A200 ROS2 + Gazebo simulation.

## Architecture

- Gazebo Harmonic, ROS2 Jazzy, Nav2, and `rosbridge_server` run on the user's local machine.
- The Render backend exposes REST APIs and a `/ws` WebSocket relay.
- The browser connects to the Render WebSocket endpoint, which relays JSON messages to `ROSBRIDGE_URL` such as `ws://192.168.1.50:9090`.
- The frontend renders a URDF-driven Three.js Husky model from `/tf` and `/a200_0000/joint_states`.
- CSV recordings are uploaded by `ros2_nodes/odom_recorder.py` to the backend and stored on the Render disk at `/data/recordings`.

## Render

The root `render.yaml` defines:

- `husky-backend`: FastAPI service with disk-backed recording storage.
- `husky-frontend`: Next.js 14 dashboard.

Before deploying, update `ROSBRIDGE_URL` in Render to your reachable rosbridge URL.

## Local Frontend

```bash
cd frontend
npm install
npm run dev
```

## Local Backend

```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Localhost Setup On Windows

Open three PowerShell windows.

Terminal 1, start rosbridge after ROS2 Jazzy is sourced:

```powershell
cd "C:\Users\HuyTr\Documents\Codex\2026-05-03\files-mentioned-by-the-user-husky\fullstack-publish"
.\scripts\start-rosbridge-local.ps1
```

Terminal 2, start the FastAPI relay:

```powershell
cd "C:\Users\HuyTr\Documents\Codex\2026-05-03\files-mentioned-by-the-user-husky\fullstack-publish"
.\scripts\start-backend-local.ps1
```

Terminal 3, start the Next.js dashboard:

```powershell
cd "C:\Users\HuyTr\Documents\Codex\2026-05-03\files-mentioned-by-the-user-husky\fullstack-publish"
.\scripts\start-frontend-local.ps1
```

Then open:

```text
http://localhost:3000
```

Local ports:

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:8000/health`
- WebSocket relay: `ws://localhost:8000/ws`
- Local rosbridge: `ws://127.0.0.1:9090`

## Vercel Frontend + ngrok Local Backend

Use this when you want the dashboard UI hosted by Vercel, while FastAPI and rosbridge stay on your computer.

1. Start ROS2 and rosbridge locally:

```powershell
.\scripts\start-rosbridge-local.ps1
```

2. Start the backend and expose it with ngrok:

```powershell
.\scripts\start-backend-ngrok-local.ps1
```

3. Copy the public `https://...ngrok...` URL from ngrok.

4. Deploy the frontend on Vercel with root directory `frontend`.

5. Open the Vercel URL, paste the ngrok backend URL into the "Backend URL from ngrok" field, then click Connect.

This works even if ngrok gives you a new URL later. Paste the new URL in the dashboard instead of rebuilding the Vercel app.

## ROS2 Recorder Upload

Set:

```bash
export RENDER_BACKEND_URL=https://husky-backend.onrender.com
export UPLOAD_SECRET=changeme123
```

Then run `ros2_nodes/odom_recorder.py` with your ROS2 workspace sourced.
