import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-night-600 bg-night-800 text-night-200",
        scripted: "border-night-500 bg-night-800/80 text-night-300",
        voiced: "border-spectre-400/50 bg-spectre-500/15 text-spectre-300",
        edited: "border-brass-400/50 bg-brass-500/15 text-brass-300",
        published: "border-jade-400/50 bg-jade-500/15 text-jade-300",
        ember: "border-ember-400/50 bg-ember-500/15 text-ember-300",
        outline: "border-night-600 text-night-200",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
