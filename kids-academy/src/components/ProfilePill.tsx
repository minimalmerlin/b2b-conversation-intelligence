"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  addProfile,
  attachProfilesStorageListener,
  deleteProfile,
  getActiveProfileId,
  getProfilesSnapshot,
  initializeProfiles,
  renameProfile,
  setActiveProfileId,
  subscribeProfiles,
} from "@/lib/profiles";

function useProfiles() {
  const profiles = useSyncExternalStore(
    subscribeProfiles,
    getProfilesSnapshot,
    () => [],
  );
  const activeId = typeof window === "undefined" ? "kid-1" : getActiveProfileId();

  useEffect(() => attachProfilesStorageListener(), []);
  useEffect(() => initializeProfiles(), []);

  return { profiles, activeId };
}

export function ProfilePill() {
  const { profiles, activeId } = useProfiles();

  const active = profiles.find((p) => p.id === activeId);

  return (
    <div className="relative">
      <details className="group">
        <summary className="list-none">
          <span className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200 hover:bg-white/10">
            <span className="hidden sm:inline">Profil</span>
            <span className="font-semibold text-white">
              {active?.name ?? "—"}
            </span>
          </span>
        </summary>

        <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-xl">
          <div className="border-b border-white/10 px-4 py-3 text-xs font-semibold text-zinc-300">
            Kinder‑Profile
          </div>
          <div className="max-h-72 overflow-auto p-2">
            {profiles.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveProfileId(p.id)}
                className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm text-zinc-200 hover:bg-white/5"
              >
                <span className="truncate">
                  {p.name}
                  {p.id === activeId ? (
                    <span className="ml-2 text-xs text-emerald-200">aktiv</span>
                  ) : null}
                </span>
                <span className="text-xs text-zinc-500">{p.id}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-white/10 p-2">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10"
                onClick={() => {
                  const name = window.prompt("Name für neues Profil (z.B. Mila)");
                  if (name) addProfile(name);
                }}
              >
                + Neu
              </button>
              <button
                type="button"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10"
                onClick={() => {
                  const name = window.prompt("Neuer Name", active?.name ?? "");
                  if (name) renameProfile(activeId, name);
                }}
                disabled={!active}
              >
                Umben.
              </button>
              <button
                type="button"
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/20 disabled:opacity-60"
                onClick={() => {
                  if (profiles.length <= 1) return;
                  const ok = window.confirm(
                    `Profil "${active?.name ?? ""}" löschen?`,
                  );
                  if (ok) deleteProfile(activeId);
                }}
                disabled={!active || profiles.length <= 1}
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
