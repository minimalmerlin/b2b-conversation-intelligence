"use client";

import Link from "next/link";
import type { TrackId } from "@/lib/curriculum";
import { getTrack, PROJECTS, TRACKS } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { TrackProgress } from "@/components/TrackProgress";

function nextLessonLink(isLessonCompleted: (id: string) => boolean) {
  const order: TrackId[] = ["web", "js", "python"];
  for (const trackId of order) {
    const track = getTrack(trackId);
    for (const lesson of track.lessons) {
      if (!isLessonCompleted(lesson.id)) {
        return {
          track,
          lesson,
          href: `/learn/${trackId}/${lesson.id}`,
        };
      }
    }
  }
  return null;
}

export function DashboardClient() {
  const { progress, level, isLessonCompleted, badges } = useProgress();
  const next = nextLessonLink(isLessonCompleted);

  const totalLessons = TRACKS.reduce((acc, t) => acc + t.lessons.length, 0);
  const completedLessons = Object.keys(progress.completedLessons).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Dashboard
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-zinc-300">
          Hier siehst du deinen Fortschritt und findest sofort die nächste Quest.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs font-semibold text-zinc-300">Level</div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {level}
          </div>
          <div className="mt-1 text-xs text-zinc-400">Alle 200 XP ein Level</div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs font-semibold text-zinc-300">XP</div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {progress.xp}
          </div>
          <div className="mt-1 text-xs text-zinc-400">
            Sammle XP durch Quests
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs font-semibold text-zinc-300">Streak</div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {progress.streakDays} Tage
          </div>
          <div className="mt-1 text-xs text-zinc-400">
            1 Quest pro Tag zählt
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs font-semibold text-zinc-300">Quests</div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {completedLessons}/{totalLessons}
          </div>
          <div className="mt-1 text-xs text-zinc-400">Abgeschlossen</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white">Weiter geht’s</h2>
          <p className="mt-2 text-sm text-zinc-300">
            {next
              ? "Mach die nächste Quest – kurz, klar, und du bekommst XP."
              : "Du hast alle Quests abgeschlossen. Zeit für Projekte!"}
          </p>

          {next ? (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold text-zinc-400">
                  Nächste Quest · {next.track.title}
                </div>
                <div className="mt-1 text-base font-semibold text-white">
                  {next.lesson.title}
                </div>
                <div className="mt-1 text-sm text-zinc-300">
                  {next.lesson.summary}
                </div>
              </div>
              <Link
                href={next.href}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-400"
              >
                Starten →
              </Link>
            </div>
          ) : (
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/projects"
                className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
              >
                Projekte öffnen
              </Link>
              <Link
                href="/learn"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10"
              >
                Alle Tracks ansehen
              </Link>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Badges</h2>
          <p className="mt-2 text-sm text-zinc-300">
            Schließe einen ganzen Track ab und hol dir ein Badge.
          </p>
          <div className="mt-4 grid gap-2">
            {TRACKS.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              >
                <div className="text-sm font-semibold text-white">{t.id}</div>
                {badges[t.id] ? (
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                    Badge ✓
                  </span>
                ) : (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                    offen
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white">Tracks</h2>
          <p className="mt-2 text-sm text-zinc-300">
            Mix & match: Heute Web, morgen JavaScript.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {TRACKS.map((t) => (
              <Link
                key={t.id}
                href={`/learn/${t.id}`}
                className="rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {t.title}
                    </div>
                    <div className="mt-1 text-xs text-zinc-300">
                      {t.description}
                    </div>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
                    {t.lessons.length}
                  </span>
                </div>
                <div className="mt-4">
                  <TrackProgress trackId={t.id} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-6">
          <h2 className="text-lg font-semibold text-white">Projekt‑Ideen</h2>
          <p className="mt-2 text-sm text-zinc-300">
            Such dir ein Projekt aus und bau es in kleinen Schritten.
          </p>
          <div className="mt-4 space-y-3">
            {PROJECTS.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="text-sm font-semibold text-white">{p.title}</div>
                <div className="mt-1 text-xs text-zinc-300">{p.description}</div>
              </div>
            ))}
          </div>
          <Link
            href="/projects"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10"
          >
            Alle Projekte ansehen
          </Link>
        </section>
      </div>
    </div>
  );
}

