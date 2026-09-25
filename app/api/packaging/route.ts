import { NextResponse } from "next/server";
import { readPackaging, writePackaging } from "@/lib/tracker-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const folder = new URL(req.url).searchParams.get("folder");
  if (!folder) return NextResponse.json({ ok: false, error: "folder required" }, { status: 400 });
  const content = await readPackaging(folder);
  return NextResponse.json({ ok: true, content });
}

export async function POST(req: Request) {
  let body: { folder?: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON body" }, { status: 400 });
  }
  const { folder, content } = body;
  if (!folder || !content?.trim()) {
    return NextResponse.json({ ok: false, error: "folder and content required" }, { status: 400 });
  }
  const res = await writePackaging(folder, content);
  if (!res.ok) return NextResponse.json(res, { status: 500 });
  return NextResponse.json(res);
}
