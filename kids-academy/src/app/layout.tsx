import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: {
    default: "CodeQuest Academy",
    template: "%s · CodeQuest Academy",
  },
  description:
    "Spielerisch Programmieren lernen (HTML, JavaScript, Python) – für Kinder, mit Quests, Projekten und Fortschrittssystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/10 py-10">
          <div className="mx-auto w-full max-w-6xl px-4 text-sm text-zinc-300">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p>© CodeQuest Academy</p>
              <p className="text-zinc-400">
                Lokal gespeicherter Fortschritt · Keine Accounts nötig
              </p>
            </div>
          </div>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
