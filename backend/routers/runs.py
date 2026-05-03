from datetime import datetime, timezone

from fastapi import APIRouter

from models import RunStartRequest, RunState, new_run_id

router = APIRouter(prefix="/runs", tags=["runs"])
state = RunState()


@router.post("/start", response_model=RunState)
async def start_run(request: RunStartRequest) -> RunState:
    state.run_id = new_run_id()
    state.scenario = request.scenario
    state.active = True
    state.started_at = datetime.now(timezone.utc)
    state.waypoint_a = request.waypoint_a
    state.waypoint_b = request.waypoint_b
    return state


@router.post("/stop", response_model=RunState)
async def stop_run() -> RunState:
    state.active = False
    return state


@router.get("/state", response_model=RunState)
async def get_run_state() -> RunState:
    return state
