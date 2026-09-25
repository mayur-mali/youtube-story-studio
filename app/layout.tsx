import type { Metadata } from "next";
import { Tiro_Devanagari_Hindi, Archivo } from "next/font/google";
import "./globals.css";
import SyncButton from "./_components/SyncButton";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${tiro.variable} ${archivo.variable}`}>
        <header className="masthead">
          <a className="masthead__brand" href="/">
            <span className="masthead__deva">मयाजाल</span>
            <span className="masthead__latin">Mayajaal Studio</span>
          </a>
          <nav className="masthead__nav">
            <a href="/">Stories</a>
            <a href="/board">Board</a>
            <a href="/packaging">Packaging</a>
            <a href="/tracker">Tracker</a>
            <a href="/new">New script</a>
            <SyncButton />
          </nav>
        </header>
        <main className="sheet">{children}</main>
        <footer className="colophon">
          <span>Mayajaal Duniya — production binder</span>
          <span>scripted → voiced → edited → published</span>
        </footer>
      </body>
    </html>
  );
}
