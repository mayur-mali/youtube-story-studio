// lib/content.ts — Mongo-backed data layer (Phase 2).
// Same shapes as the old file reader, but async: pages/APIs await these.
// The markdown binder remains the seed/backup source (lib/file-source.ts + /api/sync).

import { getDb, collections } from "./mongo";
import { ensureSeeded } from "./sync";
import type { Story, StoryFile, Tracker, LogEntry, EntityEntry, Stage } from "./file-source";

export type { Story, StoryFile, Tracker, LogEntry, EntityEntry, Stage };

type StoryDoc = {
  number: string;
  slug: string;
  title: string;
  folder: string;
  scriptParts: number;
  hasPrompts: boolean;
  hasPipeline: boolean;
};

type FileDoc = {
  number: string;
  folder: string;
  kind: StoryFile["kind"] | "packaging";
  part?: number;
  file: string;
  content: string;
};

export async function getStories(): Promise<Story[]> {
  await ensureSeeded();
  const db = await getDb();

  const [storyDocs, fileDocs] = await Promise.all([
    db.collection<StoryDoc>(collections.stories).find().sort({ number: 1 }).toArray(),
    db
      .collection<FileDoc>(collections.scripts)
      .find({ kind: { $in: ["script", "pipeline", "prompts"] } })
      .sort({ number: 1, file: 1 })
      .toArray(),
  ]);

  const byNumber = new Map<string, StoryFile[]>();
  for (const f of fileDocs) {
    const list = byNumber.get(f.number) ?? [];
    list.push({ kind: f.kind as StoryFile["kind"], part: f.part, file: f.file, content: f.content });
    byNumber.set(f.number, list);
  }

  return storyDocs.map((s) => ({
    ...s,
    files: byNumber.get(s.number) ?? [],
  }));
}

export async function getStory(number: string): Promise<Story | undefined> {
  const stories = await getStories();
  return stories.find((s) => s.number === number);
}

export async function getTracker(): Promise<Tracker> {
  await ensureSeeded();
  const db = await getDb();
  const doc = await db
    .collection<{ entries: LogEntry[]; entities: EntityEntry[] }>(collections.tracker)
    .findOne({ _id: "tracker" as never });
  return { entries: doc?.entries ?? [], entities: doc?.entities ?? [] };
}

// ---------- save (from /new) ----------

export function slugify(input: string): string {
  // take first heading if present, else first line; keep devanagari, spaces -> _
  const heading = input.match(/^#\s+(.+)$/m)?.[1] ?? input.split(/\r?\n/).find((l) => l.trim()) ?? "untitled";
  return (
    heading
      .replace(/[—–-].*$/, "") // drop subtitle after dash
      .trim()
      .replace(/[^\p{L}\p{N} ]/gu, "")
      .trim()
      .replace(/\s+/g, "_")
      .toLowerCase()
      .slice(0, 40) || "untitled"
  );
}

/**
 * Insert a pasted script as the next numbered story. Mongo is primary;
 * the binder file write is best-effort backup (README: files stay the export format).
 */
export async function saveStory(
  content: string
): Promise<{ ok: boolean; number?: string; folder?: string; error?: string; fileBackup?: string }> {
  await ensureSeeded();
  const db = await getDb();

  const all = await db.collection<StoryDoc>(collections.stories).find().toArray();
  const next = String(Math.max(0, ...all.map((s) => parseInt(s.number, 10) || 0)) + 1).padStart(3, "0");
  const folder = `${next}_${slugify(content)}`;
  const number = next;

  const files: FileDoc[] = [{ number, folder, kind: "script", part: 1, file: "001_script.md", content: content + "\n" }];

  await db.collection<StoryDoc>(collections.stories).insertOne({
    number,
    slug: folder.replace(/^\d+_/, ""),
    title:
      content.match(/^#\s+(.+)$/m)?.[1]?.replace(/\s*[—-]\s*Standalone Short.*$|\s*[—-]\s*.*(?:sec|min)\).*$/, "").trim() ||
      folder.replace(/^\d+_/, "").replace(/_/g, " "),
    folder,
    scriptParts: 1,
    hasPrompts: false,
    hasPipeline: false,
  });
  await db.collection<FileDoc>(collections.scripts).insertMany(files);

  // best-effort file backup — never fail the save because of it
  let fileBackup: string | undefined;
  try {
    const { SCRIPTS_DIR } = await import("./file-source");
    const fs = await import("fs");
    const path = await import("path");
    const dir = path.join(SCRIPTS_DIR, folder);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "001_script.md"), content + "\n", "utf8");
    fileBackup = `${folder}/001_script.md`;
  } catch {
    fileBackup = undefined;
  }

  return { ok: true, number, folder, fileBackup };
}
