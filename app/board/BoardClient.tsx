"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Card = {
  number: string;
  title: string;
  stage: string;
  type: string;
  format: string;
  hasPackaging: boolean;
};

const STAGES = [
  { key: "scripted", deva: "लिखा गया", hint: "lint PASS pending or fresh" },
  { key: "voiced", deva: "आवाज़ दी", hint: "TTS render done" },
  { key: "edited", deva: "एडिट हुआ", hint: "CapCut assembly done" },
  { key: "published", deva: "प्रकाशित", hint: "live on YouTube" },
] as const;

export default function BoardClient({ cards: initial }: { cards: Card[] }) {
  const [cards, setCards] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function move(number: string, title: string, stage: string) {
    setBusy(number + stage);
    try {
      const res = await fetch("/api/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, stage }),
      });
      const data = await res.json();
      if (data.ok) {
        setCards((cs) => cs.map((c) => (c.number === number ? { ...c, stage } : c)));
        toast.success(`${title} → ${stage}`, {
          description: "Tracker row updated in the binder.",
        });
      } else {
        toast.error("Tracker write failed", { description: data.error });
      }
    } catch {
      toast.error("Stage move request failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STAGES.map((s, si) => {
          const col = cards.filter((c) => c.stage === s.key);
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.07, duration: 0.4, ease: "easeOut" }}
              className="rounded-2xl border border-night-700 bg-night-900/50 p-3 backdrop-blur-sm"
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <div>
                  <span className="block font-deva text-lg leading-tight text-night-100">{s.deva}</span>
                  <span className="block text-[0.7rem] text-night-400">{s.hint}</span>
                </div>
                <Badge variant={s.key}>{col.length}</Badge>
              </div>

              <AnimatePresence mode="popLayout">
                {col.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid place-items-center rounded-xl border border-dashed border-night-700 py-10 text-night-600"
                  >
                    —
                  </motion.div>
                )}
                {col.map((c) => (
                  <motion.div
                    key={c.number}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  >
                    <div className="group mb-2.5 rounded-xl border border-night-700 bg-night-850 p-3 shadow-[0_6px_20px_rgba(0,0,0,0.3)] transition-colors hover:border-night-500">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-lg font-bold text-night-500 group-hover:text-ember-400">
                          {c.number}
                        </span>
                        <Badge variant={c.stage as "scripted" | "voiced" | "edited" | "published"}>{c.stage}</Badge>
                      </div>
                      <Link
                        className="mt-1 block font-semibold text-night-100 transition-colors hover:text-brass-300"
                        href={`/story/${c.number}`}
                      >
                        {c.title}
                      </Link>
                      <div className="mt-0.5 text-[0.72rem] text-night-400">
                        {c.type} · {c.format}
                        {c.hasPackaging ? " · packaging ✓" : ""}
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {STAGES.filter((x) => x.key !== c.stage).map((x) => (
                          <Button
                            key={x.key}
                            variant="outline"
                            size="sm"
                            disabled={busy === c.number + x.key}
                            onClick={() => move(c.number, c.title, x.key)}
                            className={cn("h-7 px-2.5 text-[0.7rem]")}
                          >
                            → {x.key}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
