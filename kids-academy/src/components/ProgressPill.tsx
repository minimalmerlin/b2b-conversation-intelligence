"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";

export function ProgressPill() {
  const { progress, level } = useProgress();

  return (
    <Link
      href="/learn"
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200 hover:bg-white/10"
      aria-label="Fortschritt anzeigen"
    >
      <span className="font-semibold text-white">Lvl {level}</span>
      <span className="hidden sm:inline">·</span>
      <span className="tabular-nums">{progress.xp} XP</span>
      <span className="hidden sm:inline">·</span>
      <span className="hidden tabular-nums sm:inline">
        Streak {progress.streakDays} Tage
      </span>
    </Link>
  );
}
