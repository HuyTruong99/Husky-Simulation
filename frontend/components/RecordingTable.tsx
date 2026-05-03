"use client";

import { useEffect, useState } from "react";
import { parseRecordingCsv } from "@/lib/csvParser";
import type { RecordingMeta, RecordingRow } from "@/types";
import HuskyReplay3D from "./HuskyReplay3D";

export default function RecordingTable({ apiUrl, onCompare }: { apiUrl: string; onCompare: (rows: RecordingRow[]) => void }) {
  const [recordings, setRecordings] = useState<RecordingMeta[]>([]);
  const [replayRows, setReplayRows] = useState<RecordingRow[] | null>(null);

  useEffect(() => {
    fetch(`${apiUrl}/recordings`).then((res) => res.json()).then(setRecordings).catch(() => setRecordings([]));
  }, [apiUrl]);

  async function loadRows(id: string) {
    const text = await fetch(`${apiUrl}/recordings/${id}/download`).then((res) => res.text());
    return parseRecordingCsv(text);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-bold">Recordings</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-slate-500">
            <tr><th>Scenario</th><th>Date</th><th>Duration</th><th>Distance</th><th>Replans</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {recordings.map((row) => (
              <tr className="border-t" key={row.id}>
                <td className="py-3"><span className="rounded-full bg-slate-100 px-2 py-1 font-semibold">{row.scenario}</span></td>
                <td>{new Date(row.uploaded_at).toLocaleString()}</td>
                <td>{row.duration_sec.toFixed(1)}s</td>
                <td>{row.distance_m.toFixed(1)}m</td>
                <td>{row.replans}</td>
                <td className="flex gap-2 py-2">
                  <a className="rounded border px-2 py-1" href={`${apiUrl}/recordings/${row.id}/download`}>Download CSV</a>
                  <button className="rounded border px-2 py-1" onClick={async () => setReplayRows(await loadRows(row.id))} type="button">Replay</button>
                  <button className="rounded border px-2 py-1" onClick={async () => onCompare(await loadRows(row.id))} type="button">Compare</button>
                </td>
              </tr>
            ))}
            {recordings.length === 0 && <tr><td className="py-6 text-slate-500" colSpan={6}>No recordings uploaded yet.</td></tr>}
          </tbody>
        </table>
      </div>
      {replayRows && (
        <div className="fixed inset-0 z-50 overflow-auto bg-slate-950/70 p-4">
          <div className="mx-auto max-w-5xl rounded-lg bg-white p-4">
            <button className="mb-3 rounded border px-3 py-2 font-bold" onClick={() => setReplayRows(null)} type="button">Close Replay</button>
            <HuskyReplay3D csvData={replayRows} isPlaying speed={1} />
          </div>
        </div>
      )}
    </section>
  );
}
