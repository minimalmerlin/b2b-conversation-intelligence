"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import type { Lesson, TrackId } from "@/lib/curriculum";
import { getTrack, TRACKS } from "@/lib/curriculum";
import { getActiveProfileId, subscribeProfiles } from "@/lib/profiles";

type StoredProgress = {
  completedLessons: Record<string, true>;
  xp: number;
  streakDays: number;
  lastCompletedDate?: string; // YYYY-MM-DD
};

const STORAGE_KEY = "codequest_progress_v1";

const DEFAULT_PROGRESS: StoredProgress = {
  completedLessons: {},
  xp: 0,
  streakDays: 0,
  lastCompletedDate: undefined,
};

function safeParse(raw: string | null): StoredProgress {
  if (!raw) return DEFAULT_PROGRESS;
  try {
    const data = JSON.parse(raw) as Partial<StoredProgress>;
    return {
      completedLessons: data.completedLessons ?? {},
      xp: typeof data.xp === "number" ? data.xp : 0,
      streakDays: typeof data.streakDays === "number" ? data.streakDays : 0,
      lastCompletedDate:
        typeof data.lastCompletedDate === "string"
          ? data.lastCompletedDate
          : undefined,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const da = Date.UTC(ay!, am! - 1, ad!);
  const db = Date.UTC(by!, bm! - 1, bd!);
  return Math.round((db - da) / (24 * 60 * 60 * 1000));
}

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function readProgress(): StoredProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  const profileId = getActiveProfileId();
  return safeParse(window.localStorage.getItem(`${STORAGE_KEY}:${profileId}`));
}

function writeProgress(next: StoredProgress) {
  const profileId = getActiveProfileId();
  window.localStorage.setItem(
    `${STORAGE_KEY}:${profileId}`,
    JSON.stringify(next),
  );
  emit();
}

export function useProgress() {
  const subscribe = useCallback((cb: () => void) => {
    listeners.add(cb);
    const unsubscribeProfiles = subscribeProfiles(cb);
    return () => {
      listeners.delete(cb);
      unsubscribeProfiles();
    };
  }, []);

  const snapshot = useCallback(() => readProgress(), []);

  const progress = useSyncExternalStore(subscribe, snapshot, () => DEFAULT_PROGRESS);

  const level = useMemo(() => Math.floor(progress.xp / 200) + 1, [progress.xp]);

  const completeLesson = useCallback((lesson: Lesson) => {
    const current = readProgress();
    if (current.completedLessons[lesson.id]) return;

    const today = todayKey();
    let streakDays = current.streakDays;

    if (!current.lastCompletedDate) {
      streakDays = 1;
    } else {
      const diff = dayDiff(current.lastCompletedDate, today);
      if (diff === 0) {
        streakDays = current.streakDays;
      } else if (diff === 1) {
        streakDays = current.streakDays + 1;
      } else {
        streakDays = 1;
      }
    }

    writeProgress({
      completedLessons: { ...current.completedLessons, [lesson.id]: true },
      xp: current.xp + lesson.xp,
      streakDays,
      lastCompletedDate: today,
    });
  }, []);

  const isLessonCompleted = useCallback(
    (lessonId: string) => !!progress.completedLessons[lessonId],
    [progress.completedLessons],
  );

  const trackStats = useCallback(
    (trackId: TrackId) => {
      const track = getTrack(trackId);
      const completed = track.lessons.filter((l) => isLessonCompleted(l.id))
        .length;
      return { completed, total: track.lessons.length };
    },
    [isLessonCompleted],
  );

  const badges = useMemo(() => {
    const result: Record<TrackId, boolean> = {
      web: false,
      js: false,
      python: false,
    };
    for (const track of TRACKS) {
      result[track.id] =
        track.lessons.length > 0 &&
        track.lessons.every((l) => !!progress.completedLessons[l.id]);
    }
    return result;
  }, [progress.completedLessons]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key && e.key.startsWith(`${STORAGE_KEY}:`)) emit();
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return {
    progress,
    level,
    completeLesson,
    isLessonCompleted,
    trackStats,
    badges,
  };
}
