"use client";

import type { Scenario, Waypoint } from "@/types";

const scenarios: Array<{ id: Scenario; title: string; color: string; description: string; expected: string; nodes: string[] }> = [
  { id: "clear", title: "Clear", color: "emerald", description: "No obstacles or noise. Baseline performance.", expected: "~45s direct path", nodes: ["Nav2", "AMCL"] },
  { id: "traffic", title: "Traffic", color: "amber", description: "Dynamic obstacles injected near robot. Nav2 replans around them.", expected: "~90s, 3-8 replans", nodes: ["traffic_injector.py"] },
  { id: "noise", title: "Noise", color: "orange", description: "Gaussian noise on odometry. AMCL uncertainty increases.", expected: "~70s, higher covariance", nodes: ["noise_publisher.py"] },
  { id: "traffic_and_noise", title: "Traffic + Noise", color: "red", description: "Worst case: slowest and most uncertain.", expected: "~120s+", nodes: ["traffic", "noise"] },
];

interface ScenarioPanelProps {
  scenario: Scenario;
  waypointA: Waypoint;
  waypointB: Waypoint;
  active: boolean;
  elapsed: number;
  onScenarioChange: (scenario: Scenario) => void;
  onWaypointAChange: (waypoint: Waypoint) => void;
  onWaypointBChange: (waypoint: Waypoint) => void;
  onStart: () => void;
  onStop: () => void;
}

export default function ScenarioPanel(props: ScenarioPanelProps) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-4 text-lg font-bold">Scenario Control</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {scenarios.map((item) => (
          <button
            className={`rounded-lg border p-3 text-left transition ${props.scenario === item.id ? "border-slate-900 shadow" : "border-slate-200"}`}
            key={item.id}
            onClick={() => props.onScenarioChange(item.id)}
            type="button"
          >
            <div className="flex items-center justify-between gap-2">
              <strong>{item.title}</strong>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{item.expected}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {item.nodes.map((node) => (
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700" key={node}>{node}</span>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3">
        <WaypointInput label="Waypoint A" value={props.waypointA} onChange={props.onWaypointAChange} />
        <WaypointInput label="Waypoint B" value={props.waypointB} onChange={props.onWaypointBChange} />
        <div className="grid grid-cols-2 gap-2">
          <button className="rounded-lg bg-slate-900 px-4 py-3 font-bold text-white" onClick={props.onStart} type="button">Start Run</button>
          <button className="rounded-lg border border-slate-300 px-4 py-3 font-bold" onClick={props.onStop} type="button">Stop Run</button>
        </div>
        <p className="rounded-md bg-slate-100 p-2 text-sm font-semibold">
          {props.active ? `Run in progress - ${Math.floor(props.elapsed)}s elapsed` : "Run idle"}
        </p>
      </div>
    </aside>
  );
}

function WaypointInput({ label, value, onChange }: { label: string; value: Waypoint; onChange: (waypoint: Waypoint) => void }) {
  return (
    <label className="grid gap-1 text-sm font-semibold">
      {label}
      <div className="grid grid-cols-2 gap-2">
        <input className="rounded border border-slate-300 px-3 py-2" value={value.x} onChange={(event) => onChange({ ...value, x: Number(event.target.value) })} />
        <input className="rounded border border-slate-300 px-3 py-2" value={value.y} onChange={(event) => onChange({ ...value, y: Number(event.target.value) })} />
      </div>
    </label>
  );
}
