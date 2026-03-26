import Link from "next/link";
import { TRACKS } from "@/lib/curriculum";
import { TrackProgress } from "@/components/TrackProgress";

export default function Home() {
  return (
    <div className="code-panel">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-200">
              Spielerisch lernen · HTML · JavaScript · Python
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Eine eigene Coding‑Akademie für deine Kinder
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-300">
              Kurze Quests, sofortiges Feedback, XP & Level – vom ersten Tag bis
              zu den ersten eigenen Projekten.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-400"
              >
                Jetzt starten
              </Link>
              <Link
                href="/parents"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-white/10"
              >
                Lernplan für Eltern
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Quests</p>
                <p className="mt-1 text-xs text-zinc-300">
                  10–30 Minuten pro Einheit
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Projekte</p>
                <p className="mt-1 text-xs text-zinc-300">
                  Steckbrief, Quiz, Adventure
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Fortschritt</p>
                <p className="mt-1 text-xs text-zinc-300">
                  Lokal gespeichert, ohne Login
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
              <h2 className="text-lg font-semibold text-white">
                Deine Lernpfade
              </h2>
              <p className="mt-2 text-sm text-zinc-300">
                Wähle einen Track – oder mische alles. Jede Quest bringt XP.
              </p>
              <div className="mt-5 grid gap-3">
                {TRACKS.map((t) => (
                  <Link
                    key={t.id}
                    href={`/learn/${t.id}`}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {t.title}
                        </div>
                        <div className="mt-1 text-xs text-zinc-300">
                          {t.description}
                        </div>
                      </div>
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-200">
                        {t.lessons.length} Quests
                      </span>
                    </div>
                    <div className="mt-4">
                      <TrackProgress trackId={t.id} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">
                Wie es funktioniert
              </h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-300">
                <li>Quest öffnen und kurz lesen</li>
                <li>Code im Editor schreiben</li>
                <li>Ausführen & Check machen</li>
                <li>XP sammeln und Projekte bauen</li>
              </ol>
              <p className="mt-4 text-xs text-zinc-400">
                Hinweis: JavaScript läuft in einer sicheren Browser‑Sandbox
                (iframe). Python läuft im Browser über Pyodide (Download beim
                ersten Start).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
