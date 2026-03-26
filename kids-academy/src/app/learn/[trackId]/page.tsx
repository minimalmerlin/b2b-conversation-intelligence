import Link from "next/link";
import { notFound } from "next/navigation";
import type { TrackId } from "@/lib/curriculum";
import { getTrack, TRACKS } from "@/lib/curriculum";
import { LessonStatusPill } from "@/components/LessonStatusPill";
import { TrackProgress } from "@/components/TrackProgress";

export function generateStaticParams() {
  return TRACKS.map((t) => ({ trackId: t.id }));
}

export default function TrackPage({
  params,
}: {
  params: { trackId: string };
}) {
  const trackId = params.trackId as TrackId;
  const track = TRACKS.find((t) => t.id === trackId) ? getTrack(trackId) : null;
  if (!track) return notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {track.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
              {track.description}
            </p>
          </div>
          <div className="w-full max-w-xs">
            <TrackProgress trackId={track.id} />
          </div>
        </div>
        <p className="text-xs text-zinc-400">
          Empfohlen: {track.recommendedAge}
        </p>
      </div>

      <div className="mt-8 grid gap-3">
        {track.lessons.map((l, idx) => (
          <Link
            key={l.id}
            href={`/learn/${track.id}/${l.id}`}
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-zinc-400">
                  Quest {idx + 1} · {l.minutes} min · {l.xp} XP
                </div>
                <div className="mt-1 text-base font-semibold text-white">
                  {l.title}
                </div>
                <div className="mt-1 text-sm text-zinc-300">{l.summary}</div>
              </div>
              <LessonStatusPill lessonId={l.id} />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-white/10 bg-black/20 p-6">
        <h2 className="text-base font-semibold text-white">Tipp</h2>
        <p className="mt-2 text-sm text-zinc-300">
          Macht lieber 3 kurze Quests pro Woche als einen langen Marathon. Das
          Gehirn liebt Wiederholung.
        </p>
      </div>
    </div>
  );
}

