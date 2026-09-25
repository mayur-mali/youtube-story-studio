import { Ghost, Skull } from "lucide-react";

import { getTracker } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MDiv as Reveal, MTr as RevealRow } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

const STAGE_ORDER = ["scripted", "voiced", "edited", "published"] as const;

function StageBadge({ stage }: { stage: string }) {
  const key = (STAGE_ORDER.includes(stage.toLowerCase() as (typeof STAGE_ORDER)[number])
    ? stage.toLowerCase()
    : "scripted") as "scripted" | "voiced" | "edited" | "published";
  return <Badge variant={key}>{stage}</Badge>;
}

export default async function TrackerPage() {
  const t = await getTracker();

  return (
    <div className="space-y-8">
      <Reveal initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="text-xs uppercase tracking-[0.22em] text-night-400">episode_tracker_v2.md · live from the binder</div>
        <h1 className="mt-1 font-deva text-4xl text-night-100">ट्रैकर</h1>
      </Reveal>

      <Reveal initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.4 }}>
        <Card>
          <CardContent className="p-0">
            <div className="border-b border-night-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-brass-300">
              Episode log
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-night-700 text-left text-xs text-night-400">
                    <th className="px-4 py-2.5 font-medium">Date</th>
                    <th className="px-4 py-2.5 font-medium">Title</th>
                    <th className="px-4 py-2.5 font-medium">Type</th>
                    <th className="px-4 py-2.5 font-medium">Format</th>
                    <th className="px-4 py-2.5 font-medium">Stage</th>
                    <th className="px-4 py-2.5 font-medium">Parts</th>
                    <th className="px-4 py-2.5 font-medium">Runtime</th>
                    <th className="px-4 py-2.5 font-medium">Key context</th>
                  </tr>
                </thead>
                <tbody>
                  {t.entries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-night-400">कोई entry नहीं — tracker खाली है।</td>
                    </tr>
                  ) : (
                    t.entries.map((e, i) => (
                      <RevealRow
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.12 + i * 0.05 }}
                        className="border-b border-night-800 transition-colors last:border-0 hover:bg-night-800/50"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-night-300">{e.date}</td>
                        <td className="px-4 py-3 font-deva text-[1.02rem] text-night-100">{e.title}</td>
                        <td className="px-4 py-3 text-night-300">{e.type}</td>
                        <td className="px-4 py-3 text-night-300">{e.format}</td>
                        <td className="px-4 py-3"><StageBadge stage={e.stage} /></td>
                        <td className="px-4 py-3 text-night-300">{e.parts}</td>
                        <td className="px-4 py-3 text-night-300">{e.runtime}</td>
                        <td className="max-w-sm px-4 py-3 text-night-400">{e.context}</td>
                      </RevealRow>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.4 }}>
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center gap-2 border-b border-night-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-spectre-300">
              <Skull className="size-4" /> Entity / lore registry
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-night-700 text-left text-xs text-night-400">
                    <th className="px-4 py-2.5 font-medium">Entity</th>
                    <th className="px-4 py-2.5 font-medium">Episode</th>
                    <th className="px-4 py-2.5 font-medium">Origin</th>
                    <th className="px-4 py-2.5 font-medium">Powers / rules</th>
                    <th className="px-4 py-2.5 font-medium">Resolved</th>
                  </tr>
                </thead>
                <tbody>
                  {t.entities.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-night-400">रजिस्ट्री खाली है।</td>
                    </tr>
                  ) : (
                    t.entities.map((e, i) => (
                      <RevealRow
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        className="border-b border-night-800 transition-colors last:border-0 hover:bg-night-800/50"
                      >
                        <td className="px-4 py-3 font-deva text-[1.02rem] text-night-100">{e.name}</td>
                        <td className="px-4 py-3 font-deva text-night-300">{e.episode}</td>
                        <td className="px-4 py-3 font-deva text-night-300">{e.origin}</td>
                        <td className="px-4 py-3 font-deva text-night-300">{e.powers}</td>
                        <td className="px-4 py-3">
                          {e.resolved.toLowerCase().startsWith("no") ? (
                            <Badge variant="ember">unresolved</Badge>
                          ) : (
                            <Badge variant="published">{e.resolved}</Badge>
                          )}
                        </td>
                      </RevealRow>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {t.entities.length === 0 && t.entries.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-6 text-night-500">
          <Ghost className="size-4" /> The binder awaits its first case.
        </div>
      )}
    </div>
  );
}
