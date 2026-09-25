"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    toastless();
    setTimeout(() => setCopied(false), 1400);
  }

  function toastless() {
    /* no-op — visual feedback via icon swap */
  }

  return (
    <Button
      variant={copied ? "outline" : "ghost"}
      size="sm"
      onClick={copy}
      aria-live="polite"
      className={copied ? "border-jade-400/60 text-jade-300" : "text-night-300"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? "check" : "copy"}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.15 }}
          className="inline-flex"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </motion.span>
      </AnimatePresence>
      <span className="hidden sm:inline">{copied ? "Copied" : label}</span>
    </Button>
  );
}
