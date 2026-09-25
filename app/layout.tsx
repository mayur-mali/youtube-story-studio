import type { Metadata } from "next";
import Link from "next/link";
import { Tiro_Devanagari_Hindi, Archivo } from "next/font/google";
import { Ghost } from "lucide-react";

import "./globals.css";
import NavbarClient from "./_components/NavbarClient";
import { SyncButton } from "./_components/SyncButton";
import { Toaster } from "./_components/Toaster";

const tiro = Tiro_Devanagari_Hindi({
  weight: "400",
  subsets: ["devanagari", "latin"],
  variable: "--font-tiro",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "मयाजाल स्टूडियो — Mayajaal Studio",
  description: "Production desk for the Mayajaal Duniya channel: scripts, prompts, lint, tracker.",
};

const NAV = [
  { href: "/", label: "Stories", icon: "scroll" },
  { href: "/board", label: "Board", icon: "board" },
  { href: "/packaging", label: "Packaging", icon: "package" },
  { href: "/tracker", label: "Tracker", icon: "book" },
  { href: "/new", label: "New script", icon: "plus" },
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${tiro.variable} ${archivo.variable}`}>
        <header className="sticky top-0 z-40 border-b border-night-700/80 bg-night-950/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-spectre-500 to-ember-600 shadow-[0_0_18px_rgba(109,91,208,0.45)] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
                <Ghost className="size-5 text-night-100" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-deva text-lg">मयाजाल</span>
                <span className="text-[0.68rem] uppercase tracking-[0.22em] text-night-400">Mayajaal Studio</span>
              </span>
            </Link>

            <NavbarClient items={NAV} />

            <div className="ml-auto flex items-center gap-2">
              <SyncButton />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>

        <footer className="border-t border-night-800">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-night-400 sm:px-6">
            <span className="flex items-center gap-2">
              <Ghost className="size-3.5 text-spectre-400" />
              Mayajaal Duniya — production binder
            </span>
            <span className="tracking-[0.14em] uppercase">scripted → voiced → edited → published</span>
          </div>
        </footer>

        <Toaster />
      </body>
    </html>
  );
}
