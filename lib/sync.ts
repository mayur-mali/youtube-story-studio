// lib/sync.ts — seeds MongoDB from the binder files (scripts/NNN_*/ + episode_tracker_v2.md).
// Idempotent: a marker doc records the seed; /api/sync (POST) forces a re-pull from files.

import { getDb, collections } from "./mongo";
import { getStories, getTracker } from "./file-source";
import type { LogEntry, EntityEntry } from "./file-source";

// tracker collection holds both the tracker doc and the seed marker; _id is a string
const trackerCol = async () =>
  (await getDb()).collection<
    ({ _id: string; entries?: LogEntry[]; entities?: EntityEntry[] } & { at?: Date; stories?: number; files?: number })
  >(collections.tracker);

export type SyncReport = {
  ok: boolean;
  seeded: boolean; // true when this run actually wrote docs
  stories: number;
  files: number;
  trackerEntries: number;
  entities: number;
  error?: string;
};

type FileDoc = {
  number: string;
  folder: string;
  kind: "script" | "pipeline" | "prompts" | "packaging";
  part?: number;
  file: string;
  content: string;
};

/**
 * Runs once per process (cached promise): if the `stories` collection is empty,
 * pull everything from the markdown binder into Mongo.
 */
export function ensureSeeded(): Promise<void> {
  global.__mayajaalSeed ??= doSeed(false).then(() => undefined);
  return global.__mayajaalSeed;
}

async function doSeed(force: boolean): Promise<SyncReport> {
  const db = await getDb();
  const trackerCollection = await trackerCol();

  if (!force) {
    const existing = await (await getDb()).collection(collections.stories).countDocuments();
    const marker = await (await trackerCol()).findOne({ _id: "seedMarker" });
    if (existing > 0 || marker) {
      return { ok: true, seeded: false, stories: existing, files: 0, trackerEntries: 0, entities: 0 };
    }
  }

  // ---- pull from files (fs-backed lib/file-source) ----
  const stories = getStories();
  const tracker = getTracker();

  const storyDocs = stories.map((s) => ({
    number: s.number,
    slug: s.slug,
    title: s.title,
    folder: s.folder,
    scriptParts: s.scriptParts,
    hasPrompts: s.hasPrompts,
    hasPipeline: s.hasPipeline,
  }));

  const fileDocs: FileDoc[] = stories.flatMap((s) =>
    s.files.map((f) => ({
      number: s.number,
      folder: s.folder,
      kind: f.kind,
      part: f.part,
      file: f.file,
      content: f.content,
    }))
  );

  // packaging files live outside the story parser; include them if present
  const fs = await import("fs");
  const path = await import("path");
  const { SCRIPTS_DIR } = await import("./file-source");
  for (const s of stories) {
    const pk = path.join(SCRIPTS_DIR, s.folder, "004_packaging.md");
    if (fs.existsSync(pk)) {
      fileDocs.push({
        number: s.number, folder: s.folder, kind: "packaging",
        file: "004_packaging.md", content: fs.readFileSync(pk, "utf8"),
      });
    }
  }

  try {
    if (force) {
      // files win: replace everything file-derived
      await db.collection(collections.stories).deleteMany({});
      await db.collection(collections.scripts).deleteMany({});
    }
    if (storyDocs.length) {
      await db.collection(collections.stories).insertMany(storyDocs, { ordered: false });
    }
    if (fileDocs.length) {
      await db.collection(collections.scripts).insertMany(fileDocs, { ordered: false });
    }
    await trackerCollection.replaceOne(
      { _id: "tracker" },
      { entries: tracker.entries, entities: tracker.entities },
      { upsert: true }
    );
    await trackerCollection.replaceOne(
      { _id: "seedMarker" },
      { at: new Date(), stories: storyDocs.length, files: fileDocs.length },
      { upsert: true }
    );
  } catch (e) {
    // E11000 duplicate-key on ordered:false = concurrent/raced seed; harmless
    if ((e as { code?: number }).code !== 11000) throw e;
  }

  return {
    ok: true,
    seeded: true,
    stories: storyDocs.length,
    files: fileDocs.length,
    trackerEntries: tracker.entries.length,
    entities: tracker.entities.length,
  };
}

/** Force a re-pull from the binder files (file wins, Mongo file-derived docs replaced). */
export async function syncFromFiles(): Promise<SyncReport> {
  global.__mayajaalSeed = Promise.resolve(); // reset the once-per-process guard
  const report = await doSeed(true);
  return report;
}
