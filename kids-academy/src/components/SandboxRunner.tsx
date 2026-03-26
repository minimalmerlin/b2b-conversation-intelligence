"use client";

import { useEffect, useMemo, useState } from "react";

type RunResult = { logs: string[]; errors: string[] };

function escapeForScript(code: string) {
  return code.replaceAll("</script>", "<\\/script>");
}

export function SandboxRunner({
  mode,
  code,
  runSignal,
  onResult,
}: {
  mode: "html" | "javascript";
  code: string;
  runSignal: number;
  onResult?: (result: RunResult & { done: boolean }) => void;
}) {
  const [result, setResult] = useState<RunResult & { done: boolean }>({
    logs: [],
    errors: [],
    done: false,
  });

  const runId = useMemo(() => `run_${mode}_${runSignal}`, [mode, runSignal]);

  const srcDoc = useMemo(() => {
    if (mode === "html") return code;

    const user = escapeForScript(code);
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CodeQuest Sandbox</title>
  </head>
  <body>
    <pre id="out" style="white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;"></pre>
    <script>
      (function () {
        const runId = ${JSON.stringify(runId)};
        function send(type, payload) {
          parent.postMessage({ source: "codequest", runId, type, payload }, "*");
        }
        const out = document.getElementById("out");
        const original = { log: console.log, error: console.error, warn: console.warn };
        function write(line) {
          out.textContent += line + "\\n";
        }
        console.log = (...args) => { const msg = args.map(String).join(" "); write(msg); send("log", msg); };
        console.warn = (...args) => { const msg = args.map(String).join(" "); write("WARN: " + msg); send("log", "WARN: " + msg); };
        console.error = (...args) => { const msg = args.map(String).join(" "); write("ERROR: " + msg); send("error", msg); };
        window.addEventListener("error", (e) => {
          send("error", String(e.message || e.error || "Unbekannter Fehler"));
        });
        try {
          "use strict";
          ${user}
        } catch (e) {
          send("error", String(e && (e.stack || e.message) || e));
        } finally {
          console.log = original.log;
          console.error = original.error;
          console.warn = original.warn;
          send("done", "");
        }
      })();
    </script>
  </body>
</html>`;
  }, [mode, code, runId]);

  useEffect(() => {
    if (mode === "html") {
      // No message protocol needed for HTML previews.
      return;
    }

    function onMessage(e: MessageEvent) {
      const data = e.data as
        | { source?: string; runId?: string; type?: string; payload?: string }
        | undefined;
      if (!data || data.source !== "codequest" || data.runId !== runId) return;

      setResult((prev) => {
        const next: RunResult & { done: boolean } = {
          logs:
            data.type === "log" && typeof data.payload === "string"
              ? [...prev.logs, data.payload]
              : prev.logs,
          errors:
            data.type === "error" && typeof data.payload === "string"
              ? [...prev.errors, data.payload]
              : prev.errors,
          done: data.type === "done" ? true : prev.done,
        };
        onResult?.(next);
        return next;
      });
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [mode, onResult, runId]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2 text-xs text-zinc-200">
        <div className="font-semibold">
          {mode === "html" ? "Vorschau" : "Konsole"}
        </div>
        {mode === "javascript" ? (
          <div className="flex items-center gap-2">
            <div className="tabular-nums text-zinc-400">
              Logs: {result.logs.length} · Errors: {result.errors.length}
            </div>
          </div>
        ) : null}
      </div>
      <iframe
        key={runId}
        sandbox="allow-scripts"
        className="h-72 w-full bg-white"
        srcDoc={srcDoc}
        title="CodeQuest Vorschau"
      />
    </div>
  );
}
