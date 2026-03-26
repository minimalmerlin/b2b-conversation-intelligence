# CodeQuest Academy (Kids Coding)

Eine kleine, lokale Coding‑Akademie für Kinder: **Quests + XP + Projekte** für **HTML, JavaScript, Python**.

## Lokal starten

```bash
cd kids-academy
npm run dev
```

Dann `http://localhost:3000` öffnen.

## Lernkonzept

Siehe `kids-academy/docs/LEHRKONZEPT.md`.

## Python im Browser

Python wird über **Pyodide** im Browser ausgeführt und beim ersten Start aus dem Internet geladen (CDN `cdn.jsdelivr.net`).

## Deploy (Vercel)

1) Repo zu GitHub pushen.
2) In Vercel „New Project“ → Repo auswählen.
3) **Root Directory** auf `kids-academy` setzen.
4) Build/Output unverändert lassen (Next.js Defaults).
