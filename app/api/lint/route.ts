import { NextResponse } from "next/server";
import { spawnSync } from "child_process";
import path from "path";
import fs from "fs";
import { LINT_SCRIPT, PY_EXE, SCRIPTS_DIR } from "@/lib/file-source";
import { lintAvailable } from "@/lib/lint-availability";
import { logLintRun } from "@/lib/lint-runs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_RUNTIMES = ["60s", "90s", "180s", "5min", "8min", "10min", "12min"];

export type LintFinding = { level: "error" | "warning"; line?: number; message: string };

function parseReport(stdout: string) {
  const findings: LintFinding[] = [];
  let passed = false;
  let words = 0;
  let narration = 0;
  let dialogue = 0;

  for (const raw of stdout.split(/\r?\n/)) {
    const line = raw.trim();
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^❌\s*Line (\d+):\s*(.+)$/))) {
      findings.push({ level: "error", line: parseInt(m[1], 10), message: m[2] });
    } else if ((m = line.match(/^❌\s*(.+)$/))) {
      findings.push({ level: "error", message: m[1] });
    } else if ((m = line.match(/^⚠️?\s*Line (\d+):\s*(.+)$/))) {
      findings.push({ level: "warning", line: parseInt(m[1], 10), message: m[2] });
    } else if ((m = line.match(/^⚠+\s*(.+)$/))) {
      findings.push({ level: "warning", message: m[1] });
    } else if ((m = line.match(/Words:\s*(\d+)\s+Narration:\s*(\d+)\s+Dialogue:\s*(\d+)/))) {
      words = parseInt(m[1], 10);
      narration = parseInt(m[2], 10);
      dialogue = parseInt(m[3], 10);
    } else if (line.startsWith("RESULT:")) {
      passed = line.includes("PASS");
    }
  }
  return { passed, words, narration, dialogue, findings };
}

/**
 * All script parts of a story folder, in file order — either the single
 * `001_script.md` or every `001_script_partN.md` of a multi-part story.
 * Linting them together mirrors what TTS will actually read.
 */
function resolveScriptFiles(folder: string): string[] {
  const dir = path.join(SCRIPTS_DIR, folder);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /^001_script(_part\d+)?\.md$/.test(f))
    .sort()
    .map((f) => path.join(dir, f));
}

export async function POST(req: Request) {
  let body: { content?: string; runtime?: string; folder?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON body" }, { status: 400 });
  }

  const runtime = body.runtime && VALID_RUNTIMES.includes(body.runtime) ? body.runtime : undefined;
  if (!runtime) {
    return NextResponse.json(
      { ok: false, error: "runtime required: 60s|90s|180s|5min|8min|10min|12min" },
      { status: 400 }
    );
  }

  // deployed environments have no Python linter — refuse clearly instead of a confusing 500
  if (!lintAvailable()) {
    return NextResponse.json(
      { ok: false, error: "TTS lint is local-only — run the studio locally where the binder and Python linter exist." },
      { status: 409 }
    );
  }

  const filesToLint: string[] = [];
  let tmpFile: string | null = null;

  try {
    if (body.folder && !body.content) {
      const safe = path.basename(body.folder); // no path traversal
      filesToLint.push(...resolveScriptFiles(safe));
      if (filesToLint.length === 0) {
        return NextResponse.json({ ok: false, error: `script not found for ${safe}` }, { status: 404 });
      }
    } else if (body.content) {
      tmpFile = path.join(path.dirname(LINT_SCRIPT), `.tmp_lint_${Date.now()}.md`);
      fs.writeFileSync(tmpFile, body.content, "utf8");
      filesToLint.push(tmpFile);
    } else {
      return NextResponse.json({ ok: false, error: "provide content or folder" }, { status: 400 });
    }

    // lint each script part separately, then aggregate:
    // counts sum across parts, pass = every part passes, findings carry a part label
    const multi = filesToLint.length > 1;
    let passed = true;
    let words = 0;
    let narration = 0;
    let dialogue = 0;
    let findings: LintFinding[] = [];

    for (const f of filesToLint) {
      const res = spawnSync(PY_EXE, [LINT_SCRIPT, f, runtime], { encoding: "utf8", windowsHide: true });
      const out = (res.stdout || "") + (res.stderr || "");
      if (!out.trim()) {
        return NextResponse.json({ ok: false, error: "linter produced no output" }, { status: 500 });
      }
      const report = parseReport(out);
      passed = passed && report.passed;
      words += report.words;
      narration += report.narration;
      dialogue += report.dialogue;
      const label = multi
        ? path.basename(f).replace(/^001_script_?/, "").replace(/\.md$/, "")
        : null;
      findings = findings.concat(
        report.findings.map((x) => (label ? { ...x, message: `[${label}] ${x.message}` } : x))
      );
    }

    // log the run to Mongo (best-effort — never fail the lint over logging)
    await logLintRun({
      folder: body.folder ? path.basename(body.folder) : null,
      runtime,
      passed,
      words,
      narration,
      dialogue,
      findings,
    });

    return NextResponse.json({ ok: true, runtime, passed, words, narration, dialogue, findings });
  } finally {
    if (tmpFile) {
      try { fs.unlinkSync(tmpFile); } catch {}
    }
  }
}
