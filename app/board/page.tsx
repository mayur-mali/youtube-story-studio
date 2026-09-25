import { getStories, getTracker } from "@/lib/content";
import { getStageFor, readPackaging } from "@/lib/tracker-store";
import { MDiv as Reveal } from "@/components/ui/motion";
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

  return (
    <div className="space-y-6">
      <Reveal initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="text-xs uppercase tracking-[0.22em] text-night-400">
          episode_tracker_v2.md · moving a card writes the tracker row
        </div>
        <h1 className="mt-1 font-deva text-4xl text-night-100">प्रोडक्शन बोर्ड</h1>
      </Reveal>
      <BoardClient cards={cards} />
    </div>
  );
}
