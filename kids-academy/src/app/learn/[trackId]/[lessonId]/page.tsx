import Link from "next/link";
import { notFound } from "next/navigation";
import type { TrackId } from "@/lib/curriculum";
import { getLesson, getTrack, TRACKS } from "@/lib/curriculum";
import { LessonClient } from "@/components/LessonClient";

export function generateStaticParams() {
  return TRACKS.flatMap((t) =>
    t.lessons.map((l) => ({ trackId: t.id, lessonId: l.id })),
  );
}

export default function LessonPage({
  params,
}: {
  params: { trackId: string; lessonId: string };
}) {
  const trackId = params.trackId as TrackId;
  const track = TRACKS.find((t) => t.id === trackId) ? getTrack(trackId) : null;
  if (!track) return notFound();

  const lesson = track.lessons.find((l) => l.id === params.lessonId)
    ? getLesson(trackId, params.lessonId)
    : null;
  if (!lesson) return notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/learn/${track.id}`}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10"
        >
          ← Zurück zu {track.title}
        </Link>
        <div className="text-xs text-zinc-400">
          Track: <span className="font-semibold text-zinc-200">{track.id}</span>
        </div>
      </div>

      <LessonClient lesson={lesson} />
    </div>
  );
}

