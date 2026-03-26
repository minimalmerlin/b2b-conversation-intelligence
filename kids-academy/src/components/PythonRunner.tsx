"use client";

import { useEffect, useMemo, useState } from "react";

type PythonResult = { stdout: string; error?: string };

type Pyodide = {
  runPythonAsync: (code: string) => Promise<unknown>;
};

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<unknown>;
  }
}

let pyodidePromise: Promise<Pyodide> | null = null;

function isPyodide(value: unknown): value is Pyodide {
  if (typeof value !== "object" || value === null) return false;
  const maybe = value as { runPythonAsync?: unknown };
  return typeof maybe.runPythonAsync === "function";
}

function errMsg(e: unknown) {
  if (e instanceof Error) return e.message;
  return String(e);
}

async function getPyodide() {
  if (pyodidePromise) return pyodidePromise;
  pyodidePromise = new Promise<Pyodide>(async (resolve, reject) => {
    try {
      if (!window.loadPyodide) {
        await new Promise<void>((res, rej) => {
          const s = document.createElement("script");
          s.src =
            "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
          s.async = true;
          s.onload = () => res();
          s.onerror = () =>
            rej(new Error("Pyodide konnte nicht geladen werden."));
          document.head.appendChild(s);
        });
      }

      if (!window.loadPyodide) {
        throw new Error("Pyodide loader nicht verfügbar.");
      }

      const loaded = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/",
      });
      if (!isPyodide(loaded)) {
        throw new Error("Unerwartetes Pyodide-Objekt.");
      }
      resolve(loaded);
    } catch (e) {
      reject(e);
    }
  });
  return pyodidePromise;
}

async function runPython(pyodide: Pyodide, code: string): Promise<PythonResult> {
  const wrapped = `
import contextlib, io, traceback
_buf = io.StringIO()
with contextlib.redirect_stdout(_buf), contextlib.redirect_stderr(_buf):
    try:
        exec(${JSON.stringify(code)}, {})
    except Exception:
        traceback.print_exc()
_buf.getvalue()
`;
  try {
    const stdout = (await pyodide.runPythonAsync(wrapped)) as string;
    return { stdout: String(stdout ?? "") };
  } catch (e: unknown) {
    return { stdout: "", error: errMsg(e) };
  }
}

export function PythonRunner({
  code,
  runSignal,
  onResult,
}: {
  code: string;
  runSignal: number;
  onResult?: (result: PythonResult) => void;
}) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "running" | "ready" | "error"
  >("idle");
  const [result, setResult] = useState<PythonResult>({ stdout: "" });

  const runKey = useMemo(() => `${runSignal}`, [runSignal]);

  useEffect(() => {
    let alive = true;
    async function run() {
      setStatus("loading");
      setResult({ stdout: "" });
      onResult?.({ stdout: "" });
      try {
        const pyodide = await getPyodide();
        if (!alive) return;
        setStatus("running");
        const next = await runPython(pyodide, code);
        if (!alive) return;
        setResult(next);
        onResult?.(next);
        setStatus(next.error ? "error" : "ready");
      } catch (e: unknown) {
        if (!alive) return;
        const next = { stdout: "", error: errMsg(e) };
        setResult(next);
        onResult?.(next);
        setStatus("error");
      }
    }

    // Only run when asked.
    if (runSignal > 0) void run();
    return () => {
      alive = false;
    };
  }, [code, onResult, runKey, runSignal]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2 text-xs text-zinc-200">
        <div className="font-semibold">Ausgabe</div>
        <div className="text-zinc-400">
          {status === "idle" ? "" : status}
        </div>
      </div>
      <pre className="h-72 overflow-auto bg-black/40 p-4 font-mono text-sm leading-6 text-zinc-50">
        {result.error ? `Fehler:\n${result.error}\n\n` : ""}
        {result.stdout || (status === "idle" ? "Noch nicht ausgeführt." : "")}
      </pre>
    </div>
  );
}
