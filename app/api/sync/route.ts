import { NextResponse } from "next/server";
import { syncFromFiles, ensureSeeded } from "@/lib/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/sync — status-only check (runs the idempotent seed if needed).
 * POST /api/sync — force re-pull from the binder files (files win).
 */
export async function GET() {
  try {
    await ensureSeeded();
    return NextResponse.json({ ok: true, mode: "ensure" });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST() {
  try {
    const report = await syncFromFiles();
    return NextResponse.json(report);
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
