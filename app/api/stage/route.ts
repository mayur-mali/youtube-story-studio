import { NextResponse } from "next/server";
import { setStage, isValidStage } from "@/lib/tracker-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { title?: string; stage?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON body" }, { status: 400 });
  }

  const { title, stage } = body;
  if (!title || !stage) {
    return NextResponse.json({ ok: false, error: "title and stage required" }, { status: 400 });
  }
  if (!isValidStage(stage)) {
    return NextResponse.json({ ok: false, error: "stage must be scripted|voiced|edited|published" }, { status: 400 });
  }

  const res = await setStage(title, stage);
  if (!res.ok) return NextResponse.json(res, { status: 404 });
  return NextResponse.json(res);
}
