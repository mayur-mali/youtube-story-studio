"use client";

// SyncButton — masthead button that force re-pulls the binder files
// (scripts/NNN_*/ + episode_tracker_v2.md) into Mongo via POST /api/sync.
// Use after adding/editing story folders on disk: files win, Mongo is refreshed.

import { useRouter } from "next/navigation";
import { useState } from "react";

type SyncReport = {
  ok: boolean;
  seeded?: boolean;
  stories?: number;
  files?: number;
  trackerEntries?: number;
  entities?: number;
  error?: string;
};

type SyncState = "idle" | "busy" | "done" | "error";

export default function SyncButton() {
  const router = useRouter();
  const [state, setState] = useState<SyncState>("idle");
  const [report, setReport] = useState<SyncReport | null>(null);

  async function sync() {
    setState("busy");
    setReport(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data: SyncReport = await res.json();
      if (data.ok) {
        setReport(data);
        setState("done");
        router.refresh(); // re-render server components with the fresh Mongo data
        window.setTimeout(() => setState("idle"), 5000);
      } else {
        setReport(data);
        setState("error");
      }
    } catch (e) {
      setReport({ ok: false, error: String(e) });
      setState("error");
    }
  }

  const label =
    state === "busy" ? "सिंक हो रहा है…" : state === "done" ? "सिंक पूरा" : state === "error" ? "सिंक फेल" : "फ़ाइलों से सिंक";

  const glyph = state === "busy" ? "⟳" : state === "done" ? "✓" : state === "error" ? "✕" : "↻";

  return (
    <div className="syncbtn">
      <button
        className={`btn btn--small${state === "done" ? " syncbtn__ok" : ""}`}
        onClick={sync}
        disabled={state === "busy"}
        title="Binder files (scripts/ + tracker) se studio data re-sync karo — files win"
      >
        <span className={`syncbtn__glyph${state === "busy" ? " syncbtn__glyph--spin" : ""}`}>{glyph}</span> {label}
      </button>
      {state === "done" && report && (
        <span className="syncbtn__report">
          {report.stories} stories · {report.files} files · {report.trackerEntries} tracker rows
        </span>
      )}
      {state === "error" && report?.error && (
        <span className="syncbtn__report syncbtn__report--error">{report.error}</span>
      )}
    </div>
  );
}
