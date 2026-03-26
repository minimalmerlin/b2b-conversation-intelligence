"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ExerciseLanguage } from "@/lib/curriculum";

function draftKey(lessonId: string) {
  return `codequest_draft_v1:${lessonId}`;
}

export function CodeEditor({
  lessonId,
  language,
  initialCode,
  onChange,
}: {
  lessonId: string;
  language: ExerciseLanguage;
  initialCode: string;
  onChange: (code: string) => void;
}) {
  const key = useMemo(() => draftKey(lessonId), [lessonId]);
  const [code, setCode] = useState(initialCode);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(key);
    if (raw && raw.trim().length > 0) {
      setCode(raw);
      onChange(raw);
    } else {
      setCode(initialCode);
      onChange(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    window.localStorage.setItem(key, code);
  }, [key, code]);

  function update(next: string) {
    setCode(next);
    onChange(next);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-xs font-semibold text-zinc-200">
          Editor · {language.toUpperCase()}
        </div>
        <button
          type="button"
          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-200 hover:bg-white/10"
          onClick={() => update(initialCode)}
        >
          Reset
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => update(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Tab") return;
          e.preventDefault();
          const el = textareaRef.current;
          if (!el) return;
          const start = el.selectionStart ?? 0;
          const end = el.selectionEnd ?? 0;
          const next = code.slice(0, start) + "  " + code.slice(end);
          update(next);
          requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = start + 2;
          });
        }}
        spellCheck={false}
        className="h-64 w-full resize-y rounded-xl bg-black/40 p-3 font-mono text-sm leading-6 text-zinc-50 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500/50"
      />
    </div>
  );
}

