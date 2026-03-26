"use client";

import { useProgress } from "@/lib/progress";

export function LessonStatusPill({ lessonId }: { lessonId: string }) {
  const { isLessonCompleted } = useProgress();
  const done = isLessonCompleted(lessonId);

  return done ? (
    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">
      fertig
    </span>
  ) : (
    <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-zinc-300">
      offen
    </span>
  );
}

