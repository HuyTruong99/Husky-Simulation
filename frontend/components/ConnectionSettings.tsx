"use client";

import { useState } from "react";
import { apiToWsUrl, setStoredApiUrl } from "@/lib/runtimeConfig";

interface ConnectionSettingsProps {
  apiUrl: string;
  connected: boolean;
  onApiUrlChange: (url: string) => void;
}

export default function ConnectionSettings({ apiUrl, connected, onApiUrlChange }: ConnectionSettingsProps) {
  const [draft, setDraft] = useState(apiUrl);

  function save() {
    const next = setStoredApiUrl(draft);
    onApiUrlChange(next);
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <label className="grid flex-1 gap-1 text-sm font-semibold">
          Backend URL from ngrok
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            onChange={(event) => setDraft(event.target.value)}
            placeholder="https://your-ngrok-url.ngrok-free.app"
            value={draft}
          />
        </label>
        <button className="rounded-md bg-slate-900 px-4 py-2 font-bold text-white" onClick={save} type="button">
          Connect
        </button>
      </div>
      <p className={`mt-2 text-sm font-semibold ${connected ? "text-emerald-700" : "text-red-700"}`}>
        ROS2 relay: {connected ? "connected" : "disconnected"} | {apiToWsUrl(apiUrl)}
      </p>
    </div>
  );
}
