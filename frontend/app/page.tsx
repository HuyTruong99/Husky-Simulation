"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import ConnectionSettings from "@/components/ConnectionSettings";
import RecordingTable from "@/components/RecordingTable";
import ScenarioPanel from "@/components/ScenarioPanel";
import StatusPanel from "@/components/StatusPanel";
import { getRosbridgeUrl, getStoredApiUrl } from "@/lib/runtimeConfig";
import { rosClient } from "@/lib/ros";
import type { RecordingRow, RobotPose, Scenario, Waypoint } from "@/types";

const HuskyViewer3D = dynamic(() => import("@/components/HuskyViewer3D"), { ssr: false });
const MapViewer = dynamic(() => import("@/components/MapViewer"), { ssr: false });
const ComparisonChart = dynamic(() => import("@/components/ComparisonChart"), { ssr: false });

export default function DashboardPage() {
  const [apiUrl, setApiUrl] = useState("http://localhost:8000");
  const [connected, setConnected] = useState(false);
  const [pose, setPose] = useState<RobotPose>({ x: 0, y: 0, z: 0, yaw: 0 });
  const [scenario, setScenario] = useState<Scenario>("clear");
  const [active, setActive] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [waypointA, setWaypointA] = useState<Waypoint>({ x: 2, y: 13, label: "WP1" });
  const [waypointB, setWaypointB] = useState<Waypoint>({ x: 1, y: 21, label: "WP2" });
  const [comparisonRuns, setComparisonRuns] = useState<RecordingRow[][]>([]);

  useEffect(() => {
    const initial = getStoredApiUrl();
    setApiUrl(initial);
  }, []);

  useEffect(() => {
    rosClient.connect(setConnected);
    const timer = setInterval(() => fetch(`${apiUrl}/health`).catch(() => undefined), 14 * 60 * 1000);
    return () => clearInterval(timer);
  }, [apiUrl]);

  useEffect(() => {
    if (!active || !startedAt) return;
    const timer = setInterval(() => setElapsed((Date.now() - startedAt) / 1000), 1000);
    return () => clearInterval(timer);
  }, [active, startedAt]);

  const onPoseUpdate = useCallback((nextPose: RobotPose) => setPose(nextPose), []);

  async function startRun() {
    const response = await fetch(`${apiUrl}/runs/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario, waypoint_a: waypointA, waypoint_b: waypointB }),
    });
    const data = await response.json();
    setRunId(data.run_id);
    setActive(true);
    setStartedAt(Date.now());
  }

  async function stopRun() {
    await fetch(`${apiUrl}/runs/stop`, { method: "POST" });
    setActive(false);
  }

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-blue-700">Husky Simulation Dashboard</p>
            <h1 className="text-3xl font-black tracking-tight">URDF-driven ROS2 operations console</h1>
          </div>
          <div className={`rounded-full px-4 py-2 text-sm font-bold ${connected ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            ROS2: {connected ? "CONNECTED" : "DISCONNECTED"} {getRosbridgeUrl()}
          </div>
        </header>

        <div className="mb-4">
          <ConnectionSettings apiUrl={apiUrl} connected={connected} onApiUrlChange={setApiUrl} />
        </div>

        <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)_300px]">
          <div className="order-2 xl:order-1">
            <ScenarioPanel
              active={active}
              elapsed={elapsed}
              onScenarioChange={setScenario}
              onStart={startRun}
              onStop={stopRun}
              onWaypointAChange={setWaypointA}
              onWaypointBChange={setWaypointB}
              scenario={scenario}
              waypointA={waypointA}
              waypointB={waypointB}
            />
          </div>
          <div className="order-1 xl:order-2">
            <HuskyViewer3D rosConnected={connected} scenario={scenario} onPoseUpdate={onPoseUpdate} />
          </div>
          <div className="order-3">
            <StatusPanel connected={connected} pose={pose} runId={runId} scenario={scenario} />
          </div>
        </section>

        <div className="mt-4 grid gap-4">
          <MapViewer pose={pose} waypointA={waypointA} waypointB={waypointB} />
          <RecordingTable apiUrl={apiUrl} onCompare={(rows) => setComparisonRuns((current) => [...current.slice(-3), rows])} />
          <ComparisonChart runs={comparisonRuns} metric="distance_to_goal" />
        </div>
      </div>
    </main>
  );
}
