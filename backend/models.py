from datetime import datetime
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, Field

Scenario = Literal["clear", "traffic", "noise", "traffic_and_noise"]


class Waypoint(BaseModel):
    x: float
    y: float
    label: str | None = None


class RunStartRequest(BaseModel):
    scenario: Scenario
    waypoint_a: Waypoint = Field(default_factory=lambda: Waypoint(x=2.0, y=13.0, label="WP1"))
    waypoint_b: Waypoint = Field(default_factory=lambda: Waypoint(x=1.0, y=21.0, label="WP2"))


class RunState(BaseModel):
    run_id: str | None = None
    scenario: Scenario = "clear"
    active: bool = False
    started_at: datetime | None = None
    waypoint_a: Waypoint = Field(default_factory=lambda: Waypoint(x=2.0, y=13.0, label="WP1"))
    waypoint_b: Waypoint = Field(default_factory=lambda: Waypoint(x=1.0, y=21.0, label="WP2"))


class RecordingMeta(BaseModel):
    id: str
    filename: str
    scenario: Scenario
    uploaded_at: datetime
    duration_sec: float
    distance_m: float
    replans: int


def new_run_id() -> str:
    return str(uuid4())
