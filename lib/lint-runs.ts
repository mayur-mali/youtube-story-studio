// lib/lint-runs.ts — appends each TTS lint run to the `lintRuns` collection.
// Best-effort: a Mongo outage must never fail a lint.

import { getDb, collections } from "./mongo";

export type LintFinding = { level: "error" | "warning"; line?: number; message: string };

export type LintRunDoc = {
  at: Date;
  folder: string | null;
  runtime: string;
  passed: boolean;
  words: number;
  narration: number;
  dialogue: number;
  findings: LintFinding[];
};

export async function logLintRun(run: Omit<LintRunDoc, "at">): Promise<void> {
  try {
    await getDb().then((db) =>
      db.collection<LintRunDoc>(collections.lintRuns).insertOne({ ...run, at: new Date() })
    );
  } catch {
    // swallow — logging must not break linting
  }
}

export async function getLintRuns(limit = 50): Promise<LintRunDoc[]> {
  const db = await getDb();
  return db.collection<LintRunDoc>(collections.lintRuns).find().sort({ at: -1 }).limit(limit).toArray();
}
