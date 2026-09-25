"use client";

// Server-safe motion wrappers. Only exported *functions* become valid client
// references, so server components must use <MDiv> etc. instead of motion.div.
// Props stay plain objects (serializable): initial/animate/variants/transition.

import type { ComponentProps } from "react";
import { motion, AnimatePresence } from "motion/react";

type DivProps = ComponentProps<typeof motion.div>;
type TrProps = ComponentProps<typeof motion.tr>;
type SectionProps = ComponentProps<typeof motion.section>;
type SpanProps = ComponentProps<typeof motion.span>;

export function MDiv(props: DivProps) {
  return <motion.div {...props} />;
}

export function MTr(props: TrProps) {
  return <motion.tr {...props} />;
}

export function MSection(props: SectionProps) {
  return <motion.section {...props} />;
}

export function MSpan(props: SpanProps) {
  return <motion.span {...props} />;
}

export { AnimatePresence };
