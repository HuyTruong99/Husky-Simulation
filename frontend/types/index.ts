export type Scenario = "clear" | "traffic" | "noise" | "traffic_and_noise";

export interface RobotPose {
  x: number;
  y: number;
  z: number;
  yaw: number;
}

export interface Waypoint {
  x: number;
  y: number;
  label?: string;
}

export interface RecordingRow {
  timestamp_sec: number;
  pos_x: number;
  pos_y: number;
  orientation_yaw: number;
  vel_linear_x: number;
  vel_angular_z: number;
  distance_to_goal: number;
  scenario: Scenario;
  run_id: string;
  nav_status: "IDLE" | "NAVIGATING" | "SUCCEEDED" | "FAILED" | string;
  replanning_count: number;
  avg_costmap_cost: number;
  joint_fl: number;
  joint_fr: number;
  joint_rl: number;
  joint_rr: number;
}

export interface RecordingMeta {
  id: string;
  filename: string;
  scenario: Scenario;
  uploaded_at: string;
  duration_sec: number;
  distance_m: number;
  replans: number;
}

export interface RunState {
  run_id: string | null;
  scenario: Scenario;
  active: boolean;
  started_at: string | null;
  waypoint_a: Waypoint;
  waypoint_b: Waypoint;
}
