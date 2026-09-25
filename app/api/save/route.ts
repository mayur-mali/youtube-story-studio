import { NextResponse } from "next/server";
import { saveStory } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { content?: string; runtime?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON body" }, { status: 400 });
  }

  const content = (body.content || "").trim();
  if (!content) {
    return NextResponse.json({ ok: false, error: "content is empty" }, { status: 400 });
  }

  const res = await saveStory(content);
  if (!res.ok) return NextResponse.json(res, { status: 500 });
  return NextResponse.json({ ok: true, number: res.number, folder: res.folder });
}
