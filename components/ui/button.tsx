"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-400 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-ember-500 text-night-950 shadow-[0_0_18px_rgba(232,89,12,0.25)] hover:bg-ember-400 hover:shadow-[0_0_26px_rgba(255,122,47,0.4)]",
        outline: "border border-night-600 bg-night-850/60 text-night-100 hover:border-brass-400 hover:text-brass-300 hover:bg-night-800",
        ghost: "text-night-300 hover:bg-night-800 hover:text-night-100",
        danger: "bg-blood-500 text-white hover:bg-blood-400",
        link: "text-brass-300 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp: React.ElementType = asChild ? Slot : motion.button;
  const motionProps = asChild
    ? {}
    : { whileHover: { y: -1 }, whileTap: { scale: 0.97 }, transition: { type: "spring" as const, stiffness: 400, damping: 17 } };
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...motionProps}
      {...props}
    />
  );
}

export { Button, buttonVariants };
