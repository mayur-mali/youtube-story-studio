// lib/lint-availability.ts — can the Python TTS linter run in this environment?
// On the local machine the binder folder + python.exe exist; on Vercel they don't,
// so the lint button renders disabled with a "local-only" badge instead of failing.

import fs from "fs";
import { LINT_SCRIPT, PY_EXE, SCRIPTS_DIR } from "./file-source";

export function lintAvailable(): boolean {
  try {
    return fs.existsSync(SCRIPTS_DIR) && fs.existsSync(LINT_SCRIPT) && fs.existsSync(PY_EXE);
  } catch {
    return false;
  }
}
