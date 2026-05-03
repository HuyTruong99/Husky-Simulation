"use client";

import dynamic from "next/dynamic";
import type { RecordingRow } from "@/types";

const LineChart = dynamic(async () => {
  const [chart, reactChart] = await Promise.all([import("chart.js"), import("react-chartjs-2")]);
  chart.Chart.register(chart.CategoryScale, chart.LinearScale, chart.PointElement, chart.LineElement, chart.Title, chart.Tooltip, chart.Legend);
  return reactChart.Line;
}, { ssr: false });

export default function ComparisonChart({ runs, metric }: { runs: RecordingRow[][]; metric: "distance_to_goal" | "vel_linear_x" }) {
  const labels = runs[0]?.map((row) => row.timestamp_sec.toFixed(1)) ?? [];
  const colors = ["#2563eb", "#d97706", "#ea580c", "#dc2626"];
  const data = {
    labels,
    datasets: runs.map((rows, index) => ({
      label: rows[0]?.scenario ?? `Run ${index + 1}`,
      data: rows.map((row) => row[metric]),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length],
      tension: 0.2,
    })),
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 font-bold">Scenario Comparison</h2>
      <LineChart data={data} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
    </div>
  );
}
