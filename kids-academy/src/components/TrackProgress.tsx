"use client";

import type { TrackId } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";

export function TrackProgress({ trackId }: { trackId: TrackId }) {
  const { trackStats } = useProgress();
  const stats = trackStats(trackId);
  const pct = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-zinc-300">
        <span>
          {stats.completed}/{stats.total} Quests
        </span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-indigo-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

