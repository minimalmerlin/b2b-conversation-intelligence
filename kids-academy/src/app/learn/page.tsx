import Link from "next/link";
import { TRACKS } from "@/lib/curriculum";
import { TrackProgress } from "@/components/TrackProgress";

export const metadata = {
  title: "Lernen",
};

export default function LearnPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Lernen
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-zinc-300">
          Wähle einen Track. Jede Quest ist kurz, klar und bringt XP – mit
          kleinen spielerischen Checks.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {TRACKS.map((t) => (
          <Link
            key={t.id}
            href={`/learn/${t.id}`}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-white">{t.title}</h2>
                <p className="mt-2 text-sm text-zinc-300">{t.description}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-200">
                {t.lessons.length} Quests
              </span>
            </div>
            <div className="mt-4">
              <TrackProgress trackId={t.id} />
            </div>
            <p className="mt-4 text-xs text-zinc-400">
              Empfohlen: {t.recommendedAge}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

