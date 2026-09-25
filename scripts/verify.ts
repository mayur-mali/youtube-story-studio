// scripts/verify.ts — quick check that Mongo has the seeded data.
// Usage: npx tsx --env-file=.env.local scripts/verify.ts
import { getDb } from "../lib/mongo";

async function main() {
  const db = await getDb();
  const cols = await db.listCollections().toArray();
  console.log("collections:", cols.map((c) => c.name).join(", "));

  const stories = await db.collection("stories").find().toArray();
  console.log("stories:", stories.map((s) => `${s.number} ${s.title}`).join(" | ") || "(none)");

  const scripts = await db.collection("scripts").find().toArray();
  console.log("scripts docs:", scripts.map((s) => `${s.kind}:${s.file}`).join(" | ") || "(none)");

  const tracker = await db
    .collection<{ _id: string; entries?: { stage?: string }[]; entities?: unknown[] }>("tracker")
    .findOne({ _id: "tracker" });
  console.log("tracker entries:", tracker?.entries?.length ?? 0, "| entities:", tracker?.entities?.length ?? 0);
  console.log("episode 001 stage:", tracker?.entries?.[0]?.stage);
  process.exit(0);
}

main().catch((e) => {
  console.error("verify failed:", e);
  process.exit(1);
});
