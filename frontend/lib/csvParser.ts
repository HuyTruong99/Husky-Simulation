import type { RecordingRow, Scenario } from "@/types";

const numericFields = new Set([
  "timestamp_sec",
  "pos_x",
  "pos_y",
  "orientation_yaw",
  "vel_linear_x",
  "vel_angular_z",
  "distance_to_goal",
  "replanning_count",
  "avg_costmap_cost",
  "joint_fl",
  "joint_fr",
  "joint_rl",
  "joint_rr",
]);

export function parseRecordingCsv(csv: string): RecordingRow[] {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const record: Record<string, string | number> = {};
    headers.forEach((header, index) => {
      const value = values[index] ?? "";
      record[header] = numericFields.has(header) ? Number(value || 0) : value;
    });

    return {
      timestamp_sec: Number(record.timestamp_sec || 0),
      pos_x: Number(record.pos_x || 0),
      pos_y: Number(record.pos_y || 0),
      orientation_yaw: Number(record.orientation_yaw || 0),
      vel_linear_x: Number(record.vel_linear_x || 0),
      vel_angular_z: Number(record.vel_angular_z || 0),
      distance_to_goal: Number(record.distance_to_goal || 0),
      scenario: (record.scenario || "clear") as Scenario,
      run_id: String(record.run_id || ""),
      nav_status: String(record.nav_status || "IDLE"),
      replanning_count: Number(record.replanning_count || 0),
      avg_costmap_cost: Number(record.avg_costmap_cost || 0),
      joint_fl: Number(record.joint_fl || 0),
      joint_fr: Number(record.joint_fr || 0),
      joint_rl: Number(record.joint_rl || 0),
      joint_rr: Number(record.joint_rr || 0),
    };
  });
}

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (const char of line) {
    if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else current += char;
  }
  values.push(current);
  return values.map((value) => value.trim());
}
