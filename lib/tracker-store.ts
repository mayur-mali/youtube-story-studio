// lib/tracker-store.ts — Mongo-backed (Phase 2).
// setStage updates the `tracker` doc in Mongo AND the binder markdown (best-effort backup).
// Packaging kits are stored in the `scripts` collection (kind: "packaging").

import path from "path";
import fs from "fs";
import { getDb, collections } from "./mongo";
import { ensureSeeded } from "./sync";
import type { Stage, LogEntry } from "./file-source";

const ROOT = path.resolve(process.cwd(), "..");
const TRACKER_FILE = path.join(ROOT, "episode_tracker_v2.md");
const SCRIPTS_DIR = path.join(ROOT, "scripts");

export type { Stage };

// ---------- stage (tracker-backed) ----------

const STAGES: Stage[] = ["scripted", "voiced", "edited", "published"];

export function isValidStage(s: string): s is Stage {
  return (STAGES as string[]).includes(s);
}

/** Best-effort markdown backup of the episode-log stage cell. Never throws. */
function setStageInFile(titleMatch: string, stage: Stage): { ok: boolean; error?: string } {
  try {
    if (!fs.existsSync(TRACKER_FILE)) return { ok: false, error: "tracker file not found" };
    const lines = fs.readFileSync(TRACKER_FILE, "utf8").split(/\r?\n/);

    let inLog = false;
    let hit = false;
    const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();

    const out = lines.map((line) => {
      if (/^## EPISODE LOG/i.test(line)) {
        inLog = true;
        return line;
      }
      if (/^## /.test(line) && !/^## EPISODE LOG/i.test(line)) {
        inLog = false;
        return line;
      }
      if (!inLog || !line.trim().startsWith("|")) return line;

      const cells = line.split("|");
      if (cells.length < 10) return line; // header/separator
      const titleCell = cells[2]?.trim() ?? "";
      if (titleCell === "Title" || /^[-: ]*$/.test(titleCell)) return line;

      if (norm(titleCell).includes(norm(titleMatch)) || norm(titleMatch).includes(norm(titleCell.split("—")[0].trim()))) {
        cells[5] = ` ${stage} `; // stage is the 5th column (index 5) in |Date|Title|Type|Format|Stage|...
        hit = true;
        return cells.join("|");
      }
      return line;
    });

    if (!hit) return { ok: false, error: `no tracker row matches "${titleMatch}"` };
    fs.writeFileSync(TRACKER_FILE, out.join("\n"), "utf8");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function getStageFor(title: string): Promise<Stage> {
  const { getTracker } = await import("./content");
  const t = await getTracker();
  const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();
  const hit = t.entries.find(
    (e) => norm(e.title).includes(norm(title)) || norm(title).includes(norm(e.title.split("—")[0].trim()))
  );
  const s = hit?.stage?.toLowerCase().replace(/[^a-z]/g, "");
  return isValidStage(s ?? "") ? (s as Stage) : "scripted";
}

/**
 * Move a story's stage. Mongo `tracker` doc is primary; markdown is best-effort backup.
 */
export async function setStage(titleMatch: string, stage: Stage): Promise<{ ok: boolean; error?: string }> {
  await ensureSeeded();
  const db = await getDb();
  const tracker = db.collection<{ _id: string; entries: LogEntry[]; entities: unknown[] }>(collections.tracker);

  const doc = await tracker.findOne({ _id: "tracker" });
  if (!doc) return { ok: false, error: "tracker not initialized in Mongo" };

  const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();
  const idx = doc.entries.findIndex(
    (e) => norm(e.title).includes(norm(titleMatch)) || norm(titleMatch).includes(norm(e.title.split("—")[0].trim()))
  );
  if (idx === -1) return { ok: false, error: `no tracker entry matches "${titleMatch}"` };

  const entries = doc.entries.map((e, i) => (i === idx ? { ...e, stage } : e));
  await tracker.updateOne({ _id: "tracker" }, { $set: { entries } });

  // markdown backup, best-effort
  const fileRes = setStageInFile(titleMatch, stage);

  return fileRes.ok ? { ok: true } : { ok: true, error: `mongo updated; file backup skipped: ${fileRes.error}` };
}

// ---------- packaging files ----------

function packagingBackupPath(folder: string): string {
  return path.join(SCRIPTS_DIR, path.basename(folder), "004_packaging.md");
}

export async function readPackaging(folder: string): Promise<string | null> {
  await ensureSeeded();
  const db = await getDb();
  const doc = await db
    .collection<{ kind: string; folder: string; content: string }>(collections.scripts)
    .findOne({ kind: "packaging", folder: path.basename(folder) });
  if (doc) return doc.content;

  // fall back to the binder file if not yet in Mongo
  try {
    const p = packagingBackupPath(folder);
    return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
  } catch {
    return null;
  }
}

export async function writePackaging(folder: string, content: string): Promise<{ ok: boolean; error?: string }> {
  await ensureSeeded();
  const db = await getDb();
  try {
    await db.collection(collections.scripts).updateOne(
      { kind: "packaging", folder: path.basename(folder) },
      { $set: { content, file: "004_packaging.md", number: folder.match(/^(\d+)_/)?.[1] ?? "000" } },
      { upsert: true }
    );
  } catch (e) {
    return { ok: false, error: String(e) };
  }

  // binder backup, best-effort
  try {
    const dir = path.join(SCRIPTS_DIR, path.basename(folder));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(packagingBackupPath(folder), content, "utf8");
  } catch {
    // ignore
  }
  return { ok: true };
}
