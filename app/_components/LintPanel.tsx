"use client";

import { useState } from "react";
import { Laptop, ScanSearch } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Finding = { level: "error" | "warning"; line?: number; message: string };
type LintResponse = {
  ok: boolean;
  passed?: boolean;
  words?: number;
  narration?: number;
  dialogue?: number;
  findings?: Finding[];
  error?: string;
};

const RUNTIMES = ["60s", "90s", "180s", "5min", "8min", "10min", "12min"];

export default function LintPanel({
  folder,
  defaultRuntime = "90s",
  available = true,
}: {
  folder: string;
  defaultRuntime?: string;
  available?: boolean;
}) {
  const [runtime, setRuntime] = useState(defaultRuntime);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LintResponse | null>(null);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/lint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder, runtime }),
      });
      setResult(await res.json());
    } catch {
      setResult({ ok: false, error: "lint request failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: "2rem", borderTop: "1px solid var(--rule-strong)", paddingTop: "1rem" }}>
      <div className="lintbar">
        {available ? (
          <>
            <label htmlFor="runtime" style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>
              Runtime
            </label>
            <select id="runtime" value={runtime} onChange={(e) => setRuntime(e.target.value)}>
              {RUNTIMES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={run} disabled={loading}>
              <ScanSearch /> {loading ? "Linting…" : "Run TTS lint"}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" disabled title="TTS lint sirf local machine pe chalta hai — Python linter aur binder files server pe nahi hote">
              <ScanSearch /> Run TTS lint
            </Button>
            <Badge variant="scripted" className="gap-1.5 normal-case tracking-normal">
              <Laptop className="size-3.5" /> local-only
            </Badge>
            <span className="text-xs text-night-400">
              Lint apne local studio pe chalao — yahan database ka data read-only features se manage hota hai.
            </span>
          </>
        )}
        <span className="lintstats">
          {result?.ok && (
            <>
              <strong>{result.words}</strong> words · narration <strong>{result.narration}</strong> · dialogue{" "}
              <strong>{result.dialogue}</strong>
            </>
          )}
        </span>
      </div>

      {result && !result.ok && <p style={{ color: "var(--fail)" }}>Lint failed to run: {result.error}</p>}

      {result?.ok && (
        <>
          <div style={{ margin: "0.8rem 0" }}>
            <span className={`verdict ${result.passed ? "verdict--pass" : "verdict--fail"}`}>
              {result.passed ? "Pass" : "Fail"}
            </span>
          </div>
          {result.findings && result.findings.length > 0 ? (
            <ul className="findings">
              {result.findings.map((f, i) => (
                <li key={i} className={`f-${f.level}`}>
                  {f.line && <span className="fline">L{f.line}</span>}
                  {f.message}
                </li>
              ))}
            </ul>
          ) : (
            <p className="allclear">सभी जाँचें पूरी — script TTS के लिए तैयार है।</p>
          )}
        </>
      )}
    </div>
  );
}
