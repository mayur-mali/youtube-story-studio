"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { CheckCircle2, Laptop, Save, ScanSearch } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label, Select, Textarea } from "@/components/ui/input";

type Finding = { level: "error" | "warning"; line?: number; message: string };

export default function NewScriptClient({ canLint }: { canLint: boolean }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [runtime, setRuntime] = useState("90s");
  const [lint, setLint] = useState<{ ok: boolean; passed?: boolean; findings?: Finding[]; words?: number; error?: string } | null>(null);
  const [linting, setLinting] = useState(false);
  const [saving, setSaving] = useState(false);

  async function runLint() {
    setLinting(true);
    setLint(null);
    try {
      const res = await fetch("/api/lint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, runtime }),
      });
      const data = await res.json();
      setLint(data);
      if (data.ok) {
        if (data.passed) toast.success("Lint PASS", { description: `${data.words} words — script TTS-ready है।` });
        else toast.warning("Lint FAIL", { description: "नीचे findings देखो।" });
      } else {
        toast.error("Lint failed", { description: data.error });
      }
    } catch {
      setLint({ ok: false, error: "lint request failed" });
      toast.error("Lint request failed");
    } finally {
      setLinting(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, runtime }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Binder mein save ho gaya", { description: `Folder ${data.folder}` });
        router.push(`/story/${data.number}`);
      } else {
        toast.error("Save failed", { description: data.error });
      }
    } catch {
      toast.error("Save request failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mx-auto max-w-3xl space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.22em] text-night-400">paste · lint · save to binder</div>
        <h1 className="mt-1 font-deva text-4xl text-night-100">नई स्क्रिप्ट</h1>
        <p className="mt-2 max-w-xl text-sm text-night-300">
          Scripts come from your writing sessions. Paste the Devanagari script body here, run the TTS lint, and when it
          passes, save it into the binder — the dashboard numbers the folder for you.
        </p>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-5">
          <div className="grid gap-2">
            <Label htmlFor="runtime">Runtime target</Label>
            <Select id="runtime" value={runtime} onChange={(e) => setRuntime(e.target.value)}>
              {["60s", "90s", "180s", "5min", "8min", "10min", "12min"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="script">Script (Devanagari body)</Label>
            <Textarea
              id="script"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={"# शीर्षक…\n\n## दृश्य 1 — कोल्ड ओपन\n\n[SOUND: …]\n\nनैरेशन यहाँ…"}
              spellCheck={false}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={runLint} disabled={linting || !canLint || !content.trim()}
              title={canLint ? undefined : "TTS lint sirf local machine pe chalta hai"}>
              <ScanSearch /> {linting ? "Linting…" : "Run TTS lint"}
            </Button>
            {!canLint && (
              <Badge variant="scripted" className="gap-1.5 normal-case tracking-normal">
                <Laptop className="size-3.5" /> local-only
              </Badge>
            )}
            <Button onClick={save} disabled={saving || !content.trim()}>
              <Save /> {saving ? "Saving…" : "Save to binder"}
            </Button>
            {lint?.ok && (
              <span className="text-sm text-night-300">
                <strong className="text-night-100">{lint.words}</strong> words ·{" "}
                <strong className={lint.passed ? "text-jade-400" : "text-blood-400"}>
                  {lint.passed ? "PASS" : "FAIL"}
                </strong>
              </span>
            )}
          </div>

          {lint && !lint.ok && <p className="text-sm text-blood-400">Lint failed to run: {lint.error}</p>}

          {lint?.ok && lint.findings && lint.findings.length > 0 && (
            <ul className="space-y-1.5">
              {lint.findings.map((f, i) => (
                <li
                  key={i}
                  className={`rounded-r-lg border-l-[3px] bg-night-900/70 px-3 py-2 text-sm ${
                    f.level === "error" ? "border-blood-500" : "border-brass-400"
                  }`}
                >
                  {f.line && <span className="mr-2 font-mono font-bold">L{f.line}</span>}
                  {f.message}
                </li>
              ))}
            </ul>
          )}

          {lint?.ok && lint.passed && (
            <p className="flex items-center gap-2 font-deva text-jade-300">
              <CheckCircle2 className="size-4" /> सभी जाँचें पूरी — save करें।
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
