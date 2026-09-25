// scripts/seed.ts — seed/re-sync MongoDB from the binder files without running the app.
// Usage: npx tsx --env-file=.env.local scripts/seed.ts [--force]
//   (no flag) = seed only if Mongo is empty   |   --force = re-pull from files (files win)

import { syncFromFiles, ensureSeeded } from "../lib/sync";

async function main() {
  const force = process.argv.includes("--force");

  if (force) {
    const report = await syncFromFiles();
    console.log(JSON.stringify(report, null, 2));
  } else {
    await ensureSeeded();
    console.log("seed check done (seeded only if Mongo was empty)");
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("seed failed:", e);
  process.exit(1);
});
