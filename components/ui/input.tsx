"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full rounded-lg border border-night-600 bg-night-900/70 px-3 py-1 text-sm text-night-100 shadow-inner transition-colors placeholder:text-night-400 focus-visible:border-brass-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-400/25 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[21rem] w-full rounded-lg border border-night-600 bg-night-900/70 px-3 py-2 font-deva text-[1.08rem] leading-[1.85] text-night-100 shadow-inner transition-colors placeholder:text-night-400 focus-visible:border-brass-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-400/25 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
}

function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "flex h-9 w-full cursor-pointer rounded-lg border border-night-600 bg-night-900/70 px-3 py-1 text-sm text-night-100 shadow-inner transition-colors focus-visible:border-brass-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-400/25 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-night-900 [&>option]:text-night-100",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Input, Textarea, Label, Select };
