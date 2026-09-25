import { NextResponse } from "next/server";
import { getStories, getTracker } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const stories = await getStories();
  const tracker = await getTracker();
  return NextResponse.json({
    stories: stories.map(({ files, ...rest }) => ({
      ...rest,
      fileKinds: files.map((f) => f.kind),
    })),
    tracker,
  });
}
