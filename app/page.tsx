import Link from "next/link";
import { Clapperboard, FileText, Film, Ghost, Sparkles } from "lucide-react";

import { getStories, getTracker } from "@/lib/content";
import { getStageFor } from "@/lib/tracker-store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MDiv as Reveal } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

const STAGE_ORDER = ["scripted", "voiced", "edited", "published"] as const;

function StageBadge({ stage }: { stage: string }) {
  const key = (STAGE_ORDER.includes(stage as (typeof STAGE_ORDER)[number]) ? stage : "scripted") as
    | "scripted"
    | "voiced"
    | "edited"
    | "published";
  return <Badge variant={key}>{stage}</Badge>;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
};

export default async function Home() {
  const stories = await getStories();
  const tracker = await getTracker();

  const stages = await Promise.all(stories.map((s) => getStageFor(s.title)));
  const stageMap = new Map(stories.map((s, i) => [s.number, stages[i]]));

  return (
    <div className="space-y-7">
      <Reveal initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: "easeOut" }}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-night-400">
          <Sparkles className="size-3.5 text-brass-400" />
          Production binder · {stories.length} {stories.length === 1 ? "story" : "stories"} on the desk
        </div>
        <h1 className="mt-1 font-deva text-4xl tracking-tight text-night-100">
          कहानियाँ <span className="text-night-400">/ Stories</span>
        </h1>
      </Reveal>

      {stories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-night-800 text-spectre-400 shadow-inner">
              <Ghost className="size-6" />
            </span>
            <p className="font-deva text-xl text-night-100">अभी कोई कहानी फ़ाइल में नहीं है।</p>
            <p className="max-w-md text-sm text-night-300">
              Create a story folder under{" "}
              <code className="rounded bg-night-800 px-1.5 py-0.5 text-xs">scripts/NNN_title/</code> or paste a
              script on the <Link className="text-brass-300 underline" href="/new">New script</Link> page.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Reveal variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((s) => {
            const stage = stageMap.get(s.number) ?? "scripted";
            const entity = tracker.entities.find((e) => e.episode.includes(s.title.split("—")[0].trim()));
            return (
              <Reveal key={s.number} variants={item} className="h-full">
                <Link
                  href={`/story/${s.number}`}
                  className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-400"
                >
                  <Card className="relative h-full overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:border-brass-400/50 group-hover:shadow-[0_14px_44px_rgba(232,89,12,0.18)]">
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass-400/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <CardContent className="flex h-full flex-col gap-3 p-5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-3xl font-bold text-night-600 transition-colors group-hover:text-ember-400">
                          {s.number}
                        </span>
                        <StageBadge stage={stage} />
                      </div>

                      <h2 className="font-deva text-2xl leading-snug text-night-100 transition-colors group-hover:text-brass-300">
                        {s.title}
                      </h2>

                      <p className="flex items-center gap-1.5 text-xs text-night-400">
                        <Clapperboard className="size-3.5 shrink-0 text-spectre-400" />
                        {entity?.name ?? s.slug.replace(/_/g, " ")}
                      </p>

                      <div className="mt-auto flex items-center gap-2 border-t border-night-800 pt-3 text-xs text-night-300">
                        <span className="flex items-center gap-1">
                          <FileText className="size-3.5 text-night-400" />
                          {s.scriptParts > 1 ? `${s.scriptParts} parts` : "script"}
                        </span>
                        {s.hasPipeline && (
                          <span className="flex items-center gap-1">
                            <Film className="size-3.5 text-night-400" />
                            pipeline
                          </span>
                        )}
                        {s.hasPrompts && (
                          <span className="flex items-center gap-1">
                            <Sparkles className="size-3.5 text-night-400" />
                            prompts
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </Reveal>
            );
          })}
        </Reveal>
      )}
    </div>
  );
}
