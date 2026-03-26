"use client";

export type KidProfile = {
  id: string;
  name: string;
  createdAt: string;
};

const PROFILES_KEY = "codequest_profiles_v1";
const ACTIVE_PROFILE_KEY = "codequest_active_profile_v1";

const listeners = new Set<() => void>();

const DEFAULT_PROFILE: KidProfile = {
  id: "kid-1",
  name: "Kind 1",
  createdAt: "init",
};

function emit() {
  for (const l of listeners) l();
}

function safeParseProfiles(raw: string | null): KidProfile[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data
      .map((p) => p as Partial<KidProfile>)
      .filter((p) => typeof p.id === "string" && typeof p.name === "string")
      .map((p) => ({
        id: p.id!,
        name: p.name!,
        createdAt:
          typeof p.createdAt === "string" ? p.createdAt : new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

function writeProfiles(profiles: KidProfile[]) {
  window.localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  emit();
}

function readProfiles(): KidProfile[] {
  const existing = safeParseProfiles(window.localStorage.getItem(PROFILES_KEY));
  return existing.length > 0 ? existing : [DEFAULT_PROFILE];
}

export function initializeProfiles() {
  if (typeof window === "undefined") return;
  const existing = safeParseProfiles(window.localStorage.getItem(PROFILES_KEY));
  if (existing.length === 0) {
    window.localStorage.setItem(PROFILES_KEY, JSON.stringify([DEFAULT_PROFILE]));
  }
  const profiles = readProfiles();
  const active = window.localStorage.getItem(ACTIVE_PROFILE_KEY);
  if (!active || !profiles.some((p) => p.id === active)) {
    window.localStorage.setItem(ACTIVE_PROFILE_KEY, profiles[0]!.id);
  }
  emit();
}

export function subscribeProfiles(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getProfilesSnapshot() {
  if (typeof window === "undefined") return [] as KidProfile[];
  return readProfiles();
}

export function getActiveProfileId() {
  if (typeof window === "undefined") return "kid-1";
  const active = window.localStorage.getItem(ACTIVE_PROFILE_KEY);
  const profiles = readProfiles();
  return active && profiles.some((p) => p.id === active) ? active : profiles[0]!.id;
}

export function setActiveProfileId(profileId: string) {
  initializeProfiles();
  const profiles = readProfiles();
  if (!profiles.some((p) => p.id === profileId)) return;
  window.localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
  emit();
}

export function addProfile(name: string) {
  initializeProfiles();
  const profiles = readProfiles();
  const cleaned = name.trim().slice(0, 32);
  if (!cleaned) return;
  const id = `kid-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
  const next: KidProfile = { id, name: cleaned, createdAt: new Date().toISOString() };
  writeProfiles([...profiles, next]);
  setActiveProfileId(id);
}

export function renameProfile(profileId: string, name: string) {
  initializeProfiles();
  const profiles = readProfiles();
  const cleaned = name.trim().slice(0, 32);
  if (!cleaned) return;
  writeProfiles(
    profiles.map((p) => (p.id === profileId ? { ...p, name: cleaned } : p)),
  );
}

export function deleteProfile(profileId: string) {
  initializeProfiles();
  const profiles = readProfiles();
  const next = profiles.filter((p) => p.id !== profileId);
  if (next.length === 0) return;
  writeProfiles(next);
  const active = window.localStorage.getItem(ACTIVE_PROFILE_KEY);
  if (active === profileId) {
    window.localStorage.setItem(ACTIVE_PROFILE_KEY, next[0]!.id);
  }
  emit();
}

export function attachProfilesStorageListener() {
  function onStorage(e: StorageEvent) {
    if (e.key === PROFILES_KEY || e.key === ACTIVE_PROFILE_KEY) emit();
  }
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

export function notifyProfilesChanged() {
  emit();
}
