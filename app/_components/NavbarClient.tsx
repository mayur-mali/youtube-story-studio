"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { BookOpenText, LayoutDashboard, Package, PlusCircle, ScrollText } from "lucide-react";

import { cn } from "@/lib/utils";

const ICONS = {
  scroll: ScrollText,
  board: LayoutDashboard,
  package: Package,
  book: BookOpenText,
  plus: PlusCircle,
} as const;

export type NavItem = { href: string; label: string; icon: keyof typeof ICONS };

export default function NavbarClient({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="ml-2 hidden items-center gap-1 md:flex">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = ICONS[item.icon] ?? ScrollText;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "text-night-950" : "text-night-300 hover:text-night-100"
            )}
          >
            {active && (
              <motion.span
                layoutId="nav-pill"
                className="absolute inset-0 rounded-lg bg-gradient-to-b from-brass-300 to-ember-400 shadow-[0_0_16px_rgba(232,89,12,0.35)]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Icon className="relative z-10 size-4" />
            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
