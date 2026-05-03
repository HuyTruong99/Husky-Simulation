"use client";

import type { RobotPose, Scenario } from "@/types";

export default function StatusPanel({ connected, pose, scenario, runId }: { connected: boolean; pose: RobotPose; scenario: Scenario; runId: string | null }) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-4 text-lg font-bold">Live Telemetry</h2>
      <div className="grid gap-3">
        <Metric label="Connection" value={connected ? "ROS2 connected" : "Disconnected"} tone={connected ? "green" : "red"} />
        <Metric label="Scenario" value={scenario.replace(/_/g, " ")} />
        <Metric label="Run ID" value={runId || "No active run"} />
        <Metric label="Pose X" value={`${pose.x.toFixed(2)} m`} />
        <Metric label="Pose Y" value={`${pose.y.toFixed(2)} m`} />
        <Metric label="Yaw" value={`${pose.yaw.toFixed(2)} rad`} />
      </div>
    </aside>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "green" | "red" }) {
  const color = tone === "green" ? "text-emerald-700" : tone === "red" ? "text-red-700" : "text-slate-900";
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <span className="block text-xs font-bold uppercase text-slate-500">{label}</span>
      <strong className={`mt-1 block break-words ${color}`}>{value}</strong>
    </div>
  );
}
