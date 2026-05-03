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

## ROS2 Recorder Upload

Set:

```bash
export RENDER_BACKEND_URL=https://husky-backend.onrender.com
export UPLOAD_SECRET=changeme123
```

Then run `ros2_nodes/odom_recorder.py` with your ROS2 workspace sourced.
