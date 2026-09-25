import { getStories, getTracker } from "@/lib/content";
import { getStageFor, readPackaging } from "@/lib/tracker-store";
import BoardClient from "./BoardClient";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const stories = await getStories();
  const tracker = await getTracker();

  const cards = await Promise.all(
    stories.map(async (s) => {
      const entry = tracker.entries.find(
        (e) => e.title.replace(/\s+/g, "").toLowerCase().includes(s.slug.replace(/_/g, "")) || s.title.includes(e.title.split("—")[0].trim())
      );
      return {
        number: s.number,
        title: s.title,
        stage: await getStageFor(s.title),
        type: entry?.type ?? (s.scriptParts > 1 ? "Series" : "Standalone"),
        format: entry?.format ?? "Short",
        hasPackaging: (await readPackaging(s.folder)) !== null,
      };
    })
  );

  return <BoardClient cards={cards} />;
}
