"use client";

// SyncButton — masthead button that force re-pulls the binder files
// (scripts/NNN_*/ + episode_tracker_v2.md) into Mongo via POST /api/sync.
// Use after adding/editing story folders on disk: files win, Mongo is refreshed.

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

type SyncReport = {
  ok: boolean;
  seeded?: boolean;
  stories?: number;
  files?: number;
  trackerEntries?: number;
  entities?: number;
  error?: string;
};

export function SyncButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function sync() {
    setBusy(true);
    setDone(false);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data: SyncReport = await res.json();
      if (data.ok) {
        setDone(true);
        toast.success("Sync complete", {
          description: `${data.stories} stories · ${data.files} files · ${data.trackerEntries} tracker rows`,
        });
        router.refresh(); // re-render server components with the fresh Mongo data
        window.setTimeout(() => setDone(false), 4000);
      } else {
        toast.error("Sync failed", { description: data.error });
      }
    } catch (e) {
      toast.error("Sync failed", { description: String(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      variant={done ? "outline" : "ghost"}
      size="sm"
      onClick={sync}
      disabled={busy}
      title="Binder files (scripts/ + tracker) se studio data re-sync karo — files win"
      className={done ? "border-brass-400/60 text-brass-300" : ""}
    >
      <motion.span animate={busy ? { rotate: 360 } : { rotate: 0 }} transition={busy ? { repeat: Infinity, duration: 0.9, ease: "linear" } : { duration: 0.3 }}>
        <RefreshCw className="size-3.5" />
      </motion.span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={done ? "done" : "idle"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {done ? "Synced" : "Sync"}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
