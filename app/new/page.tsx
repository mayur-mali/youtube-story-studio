"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Finding = { level: "error" | "warning"; line?: number; message: string };

export default function NewScriptPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [runtime, setRuntime] = useState("90s");
  const [lint, setLint] = useState<{ ok: boolean; passed?: boolean; findings?: Finding[]; words?: number; error?: string } | null>(null);
  const [linting, setLinting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  async function runLint() {
    setLinting(true);
    setLint(null);
    try {
      const res = await fetch("/api/lint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, runtime }),
      });
      setLint(await res.json());
    } catch {
      setLint({ ok: false, error: "lint request failed" });
    } finally {
      setLinting(false);
    }
  }

  async function save() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, runtime }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push(`/story/${data.number}`);
      } else {
        setSaveMsg(data.error || "save failed");
      }
    } catch {
      setSaveMsg("save request failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="storyhead">
        <div className="storyhead__kicker">
          <span>paste · lint · save to binder</span>
        </div>
        <h1 className="storyhead__title">नई स्क्रिप्ट</h1>
        <p className="formnote">
          Scripts come from your writing sessions. Paste the Devanagari script body here, run the TTS lint,
          and when it passes, save it into the binder — the dashboard numbers the folder for you.
        </p>
      </div>

      <div className="newform">
        <div>
          <label htmlFor="runtime">Runtime target</label>
          <select id="runtime" value={runtime} onChange={(e) => setRuntime(e.target.value)}>
            {["60s", "90s", "5min", "8min", "10min", "12min"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="script">Script (Devanagari body)</label>
          <textarea
            id="script"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="# शीर्षक…\n\n## दृश्य 1 — कोल्ड ओपन\n\n[SOUND: …]\n\nनैरेशन यहाँ…"
            spellCheck={false}
          />
        </div>

        <div className="lintbar">
          <button className="btn" onClick={runLint} disabled={linting || !content.trim()}>
            {linting ? "Linting…" : "Run TTS lint"}
          </button>
          <button className="btn" onClick={save} disabled={saving || !content.trim()}>
            {saving ? "Saving…" : "Save to binder"}
          </button>
          {lint?.ok && (
            <span className="lintstats">
              <strong>{lint.words}</strong> words ·{" "}
              <strong style={{ color: lint.passed ? "var(--pass)" : "var(--fail)" }}>
                {lint.passed ? "PASS" : "FAIL"}
              </strong>
            </span>
          )}
          {saveMsg && <span style={{ color: "var(--fail)", fontSize: "0.88rem" }}>{saveMsg}</span>}
        </div>

        {lint && !lint.ok && <p style={{ color: "var(--fail)" }}>Lint failed to run: {lint.error}</p>}
        {lint?.ok && lint.findings && lint.findings.length > 0 && (
          <ul className="findings">
            {lint.findings.map((f, i) => (
              <li key={i} className={`f-${f.level}`}>
                {f.line && <span className="fline">L{f.line}</span>}
                {f.message}
              </li>
            ))}
          </ul>
        )}
        {lint?.ok && lint.passed && <p className="allclear">सभी जाँचें पूरी — save करें।</p>}
      </div>
    </>
  );
}
