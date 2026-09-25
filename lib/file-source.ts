// lib/file-source.ts — reads the original binder files (scripts/NNN_*/ + episode_tracker_v2.md).
// Since the Mongo migration this is the SEED/BACKUP source only: /api/sync pulls from here
// into MongoDB; the live app reads Mongo (see lib/content.ts).

import fs from "fs";
import path from "path";

const ROOT = path.resolve(process.cwd(), "..");
export const SCRIPTS_DIR = path.join(ROOT, "scripts");
const TRACKER_FILE = path.join(ROOT, "episode_tracker_v2.md");
export const LINT_SCRIPT = path.join(ROOT, "tts_linter.py");
export const PY_EXE = process.env.PY_EXE || "C:\\Users\\Computer Lab\\AppData\\Local\\Programs\\Python\\Python312\\python.exe";

export type Stage = "scripted" | "voiced" | "edited" | "published";

export type StoryFile = {
  kind: "script" | "pipeline" | "prompts";
  part?: number; // for scripts: part number (1,2,3...)
  file: string;
  content: string;
};

export type Story = {
  number: string; // "001"
  slug: string; // "aam_ka_ped"
  title: string; // human title from folder name or first heading
  folder: string; // relative folder name
  files: StoryFile[];
  scriptParts: number;
  hasPrompts: boolean;
  hasPipeline: boolean;
};

export type LogEntry = {
  date: string;
  title: string;
  type: string;
  format: string;
  stage: string;
  parts: string;
  runtime: string;
  drive: string;
  context: string;
};

export type EntityEntry = {
  name: string;
  episode: string;
  origin: string;
  powers: string;
  resolved: string;
};

export type Tracker = {
  entries: LogEntry[];
  entities: EntityEntry[];
};

function readText(p: string): string {
  return fs.readFileSync(p, "utf8");
}

function listStoryFolders(): string[] {
  if (!fs.existsSync(SCRIPTS_DIR)) return [];
  return fs
    .readdirSync(SCRIPTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

function classifyFile(name: string): StoryFile["kind"] | null {
  if (/^001_script(_part\d+)?\.md$/.test(name)) return "script";
  if (/^002_pipeline\.md$/.test(name)) return "pipeline";
  if (/^003_prompts\.md$/.test(name)) return "prompts";
  return null;
}

export function getStories(): Story[] {
  return listStoryFolders().map((folder) => {
    const dir = path.join(SCRIPTS_DIR, folder);
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .sort()
      .map((f): StoryFile | null => {
        const kind = classifyFile(f);
        if (!kind) return null;
        const partMatch = f.match(/^001_script_part(\d+)\.md$/);
        return {
          kind,
          part: partMatch ? parseInt(partMatch[1], 10) : f === "001_script.md" ? 1 : undefined,
          file: f,
          content: readText(path.join(dir, f)),
        };
      })
      .filter((x): x is StoryFile => x !== null);

    const number = folder.match(/^(\d+)_/)?.[1] ?? "000";
    const slug = folder.replace(/^\d+_/, "");
    const scriptHeading = files.find((f) => f.kind === "script")?.content.match(/^#\s+(.+)$/m)?.[1];
    const title = scriptHeading
      ? scriptHeading.replace(/\s*[—-]\s*Standalone Short.*$|\s*[—-]\s*.*(?:sec|min)\).*$/, "").trim()
      : slug.replace(/_/g, " ");

    return {
      number,
      slug,
      title,
      folder,
      files,
      scriptParts: files.filter((f) => f.kind === "script").length,
      hasPrompts: files.some((f) => f.kind === "prompts"),
      hasPipeline: files.some((f) => f.kind === "pipeline"),
    };
  });
}

export function getStory(number: string): Story | undefined {
  return getStories().find((s) => s.number === number);
}

// ---------- tracker parsing ----------

function splitRow(line: string): string[] {
  return line
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());
}

function isSeparator(line: string): boolean {
  return /^\|[\s:|-]+\|?$/.test(line.trim());
}

export function getTracker(): Tracker {
  const tracker: Tracker = { entries: [], entities: [] };
  if (!fs.existsSync(TRACKER_FILE)) return tracker;
  const lines = readText(TRACKER_FILE).split(/\r?\n/);

  let section: "log" | "entity" | null = null;
  for (const line of lines) {
    if (/^## EPISODE LOG/i.test(line)) section = "log";
    else if (/^## ENTITY/i.test(line)) section = "entity";
    else if (/^## /i.test(line)) section = null;

    if (!section || !line.trim().startsWith("|") || isSeparator(line)) continue;
    const cells = splitRow(line);
    if (section === "log" && cells.length >= 9 && cells[0] !== "Date" && cells[0] !== "—") {
      tracker.entries.push({
        date: cells[0], title: cells[1], type: cells[2], format: cells[3],
        stage: cells[4], parts: cells[5], runtime: cells[6], drive: cells[7], context: cells[8],
      });
    }
    if (section === "entity" && cells.length >= 5 && cells[0] !== "Entity Name" && cells[0] !== "—") {
      tracker.entities.push({
        name: cells[0], episode: cells[1], origin: cells[2], powers: cells[3], resolved: cells[4],
      });
    }
  }
  return tracker;
}
