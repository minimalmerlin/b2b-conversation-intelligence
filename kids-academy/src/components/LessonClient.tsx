"use client";

import { useEffect, useMemo, useState } from "react";
import type { ExerciseCheck, Lesson } from "@/lib/curriculum";
import { Markdown } from "@/components/Markdown";
import { CodeEditor } from "@/components/CodeEditor";
import { SandboxRunner } from "@/components/SandboxRunner";
import { PythonRunner } from "@/components/PythonRunner";
import { useProgress } from "@/lib/progress";

type CheckState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "passed" }
  | { status: "failed"; message: string };

function normalize(str: string) {
  return str.replaceAll("\r\n", "\n");
}

function checkContains(code: string, check: Extract<ExerciseCheck, { kind: "contains" }>) {
  const hay = check.caseSensitive ? code : code.toLowerCase();
  const needles = check.caseSensitive
    ? check.needles
    : check.needles.map((n) => n.toLowerCase());
  const missing = needles.filter((n) => !hay.includes(n));
  return missing.length === 0
    ? { ok: true as const }
    : { ok: false as const, message: `Fehlt noch: ${missing.join(", ")}` };
}

export function LessonClient({ lesson }: { lesson: Lesson }) {
  const { completeLesson, isLessonCompleted } = useProgress();
  const alreadyDone = isLessonCompleted(lesson.id);

  const [code, setCode] = useState(lesson.exercise.starterCode);
  const [runSignal, setRunSignal] = useState(0);
  const [lastJsLogs, setLastJsLogs] = useState<string[]>([]);
  const [lastJsErrors, setLastJsErrors] = useState<string[]>([]);
  const [lastJsDone, setLastJsDone] = useState(false);
  const [lastPyStdout, setLastPyStdout] = useState("");
  const [lastPyError, setLastPyError] = useState<string | undefined>(undefined);
  const [lastPyDone, setLastPyDone] = useState(false);
  const [pendingCheck, setPendingCheck] = useState(false);
  const [checkState, setCheckState] = useState<CheckState>({ status: "idle" });

  const expected = useMemo(() => {
    if (lesson.exercise.check.kind === "js_console_includes") {
      return lesson.exercise.check.expected;
    }
    if (lesson.exercise.check.kind === "python_stdout_includes") {
      return lesson.exercise.check.expected;
    }
    return null;
  }, [lesson.exercise.check]);

  function validateFromOutputs() {
    const check = lesson.exercise.check;
    if (check.kind === "contains") {
      const res = checkContains(code, check);
      return res.ok
        ? { ok: true as const }
        : { ok: false as const, message: res.message };
    }

    if (check.kind === "js_console_includes") {
      const joined = normalize([...lastJsLogs, ...lastJsErrors].join("\n"));
      return joined.includes(check.expected)
        ? { ok: true as const }
        : {
            ok: false as const,
            message:
              "Ich finde den erwarteten Text noch nicht in der Konsole. Tipp: `console.log(...)` benutzen.",
          };
    }

    if (check.kind === "python_stdout_includes") {
      const joined = normalize(`${lastPyError ? `Fehler:\n${lastPyError}\n` : ""}${lastPyStdout}`);
      return joined.includes(check.expected)
        ? { ok: true as const }
        : {
            ok: false as const,
            message:
              "Ich finde den erwarteten Text noch nicht in der Ausgabe. Tipp: `print(...)` benutzen.",
          };
    }

    return { ok: false as const, message: "Unbekannter Check." };
  }

  function run() {
    setCheckState({ status: "idle" });
    setPendingCheck(false);
    setLastJsDone(false);
    setLastPyDone(false);
    setLastJsLogs([]);
    setLastJsErrors([]);
    setLastPyStdout("");
    setLastPyError(undefined);
    setRunSignal((s) => s + 1);
  }

  function checkNow() {
    const check = lesson.exercise.check;
    if (check.kind === "contains") {
      const res = validateFromOutputs();
      if (res.ok) {
        setCheckState({ status: "passed" });
        completeLesson(lesson);
      } else {
        setCheckState({ status: "failed", message: res.message });
      }
      return;
    }

    setCheckState({ status: "running" });
    setPendingCheck(true);
    setLastJsDone(false);
    setLastPyDone(false);
    setLastJsLogs([]);
    setLastJsErrors([]);
    setLastPyStdout("");
    setLastPyError(undefined);
    setRunSignal((s) => s + 1);
  }

  useEffect(() => {
    if (!pendingCheck) return;
    const kind = lesson.exercise.check.kind;
    if (kind === "js_console_includes" && !lastJsDone) return;
    if (kind === "python_stdout_includes" && !lastPyDone) return;
    const res = validateFromOutputs();
    if (res.ok) {
      setCheckState({ status: "passed" });
      setPendingCheck(false);
      completeLesson(lesson);
    } else {
      setCheckState({ status: "failed", message: res.message });
      setPendingCheck(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pendingCheck,
    lastJsLogs,
    lastJsErrors,
    lastJsDone,
    lastPyStdout,
    lastPyError,
    lastPyDone,
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-zinc-300">
                {lesson.minutes} min · {lesson.xp} XP
              </div>
              <h1 className="mt-1 text-2xl font-semibold text-white">
                {lesson.title}
              </h1>
              <p className="mt-2 text-sm text-zinc-300">{lesson.summary}</p>
            </div>
            {alreadyDone ? (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                Abgeschlossen
              </span>
            ) : null}
          </div>
          <div className="mt-4">
            <Markdown md={lesson.contentMd} />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-base font-semibold text-white">
            Übung: {lesson.exercise.title}
          </h2>
          <div className="mt-3">
            <Markdown md={lesson.exercise.instructionsMd} />
          </div>
          {lesson.exercise.hintMd ? (
            <details className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-zinc-200">
                Hinweis
              </summary>
              <div className="mt-3">
                <Markdown md={lesson.exercise.hintMd} />
              </div>
            </details>
          ) : null}

          {lesson.exercise.solutionCode ? (
            <details className="mt-3 rounded-xl border border-white/10 bg-black/20 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-zinc-200">
                Lösung anzeigen (für Eltern / später)
              </summary>
              <pre className="mt-3 overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-sm leading-6 text-zinc-50">
                {lesson.exercise.solutionCode}
              </pre>
            </details>
          ) : null}
        </section>
      </div>

      <div className="space-y-4">
        <CodeEditor
          lessonId={lesson.id}
          language={lesson.exercise.language}
          initialCode={lesson.exercise.starterCode}
          onChange={setCode}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-zinc-300">
            {expected ? (
              <span>
                Erwartet: <span className="font-semibold">{expected}</span>
              </span>
            ) : (
              <span>Check: Struktur prüfen</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10"
              onClick={run}
            >
              Ausführen
            </button>
            <button
              type="button"
              className="rounded-xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
              onClick={checkNow}
              disabled={alreadyDone}
            >
              Check & XP
            </button>
          </div>
        </div>

        {checkState.status === "failed" ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            {checkState.message}
          </div>
        ) : null}
        {checkState.status === "passed" ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            Geschafft! Du bekommst {lesson.xp} XP.
          </div>
        ) : null}
        {checkState.status === "running" ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-200">
            Prüfe gerade …
          </div>
        ) : null}

        {lesson.exercise.language === "html" ? (
          <SandboxRunner mode="html" code={code} runSignal={runSignal} />
        ) : null}

        {lesson.exercise.language === "javascript" ? (
          <SandboxRunner
            key={`js_${runSignal}`}
            mode="javascript"
            code={code}
            runSignal={runSignal}
            onResult={(r) => {
              setLastJsLogs(r.logs);
              setLastJsErrors(r.errors);
              setLastJsDone(r.done);
            }}
          />
        ) : null}

        {lesson.exercise.language === "python" ? (
          <PythonRunner
            key={`py_${runSignal}`}
            code={code}
            runSignal={runSignal}
            onResult={(r) => {
              setLastPyStdout(r.stdout);
              setLastPyError(r.error);
              setLastPyDone(true);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
