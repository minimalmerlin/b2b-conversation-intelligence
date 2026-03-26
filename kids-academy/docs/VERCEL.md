# Deploy auf Vercel (Monorepo/Subfolder)

## 1) GitHub
1. Stelle sicher, dass `kids-academy/` im selben Git‑Repo committed ist.
2. Push zu GitHub.

## 2) Vercel Projekt anlegen
1. Vercel → **New Project**
2. Repository auswählen
3. **Root Directory**: `kids-academy`
4. Framework: **Next.js** (auto)
5. Build Command: `npm run build` (auto)
6. Output: (auto)

## 3) Hinweise
- Python‑Runner nutzt Pyodide über CDN (`cdn.jsdelivr.net`). Der erste Run lädt Pyodide im Browser.
- Kein Backend, keine DB, kein Login – Fortschritt wird lokal im Browser gespeichert.

