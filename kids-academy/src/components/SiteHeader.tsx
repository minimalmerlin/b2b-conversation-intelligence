import Link from "next/link";
import { ProgressPill } from "@/components/ProgressPill";
import { ProfilePill } from "@/components/ProfilePill";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold tracking-tight hover:bg-white/5"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-200 ring-1 ring-indigo-500/30">
              CQ
            </span>
            <span className="text-zinc-50">CodeQuest Academy</span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm text-zinc-200 sm:flex">
            <Link
              href="/dashboard"
              className="rounded-full px-3 py-2 hover:bg-white/5 hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/learn"
              className="rounded-full px-3 py-2 hover:bg-white/5 hover:text-white"
            >
              Lernen
            </Link>
            <Link
              href="/projects"
              className="rounded-full px-3 py-2 hover:bg-white/5 hover:text-white"
            >
              Projekte
            </Link>
            <Link
              href="/parents"
              className="rounded-full px-3 py-2 hover:bg-white/5 hover:text-white"
            >
              Für Eltern
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ProfilePill />
          <ProgressPill />
        </div>
      </div>
    </header>
  );
}
