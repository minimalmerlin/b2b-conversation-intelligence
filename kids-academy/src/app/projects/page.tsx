import Link from "next/link";
import { PROJECTS } from "@/lib/curriculum";

export const metadata = {
  title: "Projekte",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-white">
        Projekte
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
        Projekte sind der Turbo: Kinder merken, dass Code echte Dinge bauen
        kann. Wählt ein Projekt aus und setzt es in kleinen Etappen um.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {PROJECTS.map((p) => (
          <section
            key={p.id}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-white">{p.title}</h2>
                <p className="mt-2 text-sm text-zinc-300">{p.description}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-200">
                {p.difficulty}
              </span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold text-zinc-200">Skills</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300">
                {p.skills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="mt-4 text-sm text-zinc-300">
              <span className="font-semibold text-zinc-200">Abgabe:</span>{" "}
              {p.deliverable}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {p.trackIds.map((t) => (
                <Link
                  key={t}
                  href={`/learn/${t}`}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200 hover:bg-white/10"
                >
                  Passender Track: {t}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-white/10 bg-black/20 p-6">
        <h2 className="text-base font-semibold text-white">Projekt‑Ritual</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-300">
          <li>Klein starten (eine Funktion / ein Abschnitt)</li>
          <li>Jedes Mal kurz zeigen, was schon klappt</li>
          <li>Fehler feiern: „Cool, wir haben was gelernt!“</li>
          <li>Am Ende veröffentlichen (Git + Vercel)</li>
        </ol>
      </div>
    </div>
  );
}

