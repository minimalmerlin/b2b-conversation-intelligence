import Link from "next/link";
import { TRACKS } from "@/lib/curriculum";

export const metadata = {
  title: "Für Eltern",
};

export default function ParentsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-white">
        Für Eltern
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
        Ziel dieser Academy: Kinder sollen **selbstständig** die Grundlagen
        lernen – und am Ende echte Mini‑Projekte bauen, die man zeigen kann.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-base font-semibold text-white">
            Empfohlener Ablauf (8 Wochen)
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-300">
            <li>Woche 1–2: HTML & CSS (Track Web)</li>
            <li>Woche 3–5: JavaScript‑Logik (Track JS)</li>
            <li>Woche 6–7: Python‑Basics (Track Python)</li>
            <li>Woche 8: Capstone‑Projekt + Deploy</li>
          </ol>
          <p className="mt-4 text-xs text-zinc-400">
            Rhythmus: 3× pro Woche 20–30 Minuten statt 1× 2 Stunden.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-base font-semibold text-white">
            Spielregeln (damit’s Spaß macht)
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-300">
            <li>Erst verstehen, dann kopieren.</li>
            <li>Fehler = Hinweise, keine Niederlagen.</li>
            <li>Kleine Ziele: „Heute nur 1 Quest“.</li>
            <li>Am Ende immer kurz zeigen & erklären lassen.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-base font-semibold text-white">
            Eure Rolle als Eltern
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-300">
            <li>Fragen stellen: „Was macht diese Zeile?“</li>
            <li>Mini‑Code‑Review: 1 Lob, 1 Frage, 1 Idee</li>
            <li>Projekte sichtbar machen (Git + Vercel)</li>
          </ul>
        </section>
      </div>

      <div className="mt-10 rounded-3xl border border-white/10 bg-black/20 p-6">
        <h2 className="text-base font-semibold text-white">
          Start‑Check (5 Minuten)
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-300">
          <li>Kann dein Kind 10 Minuten konzentriert tippen?</li>
          <li>Ist ein Laptop/Keyboard vorhanden?</li>
          <li>Darf es Fehler machen, ohne frustriert zu sein?</li>
          <li>Habt ihr 3× pro Woche 20 Minuten?</li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/learn"
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            Tracks öffnen
          </Link>
          {TRACKS.map((t) => (
            <Link
              key={t.id}
              href={`/learn/${t.id}`}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10"
            >
              {t.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

