# NF Sales Dashboard

Internal sales KPI dashboard for the Nightforce Central territory. Tracks shipped/
unshipped scope and optics sales across product families (ATACR, NX8, NX6, SHV, NXS, NF).

## Stack
- React 18 + Chart.js, built with Vite (no runtime transpilation, all dependencies bundled)
- Password gate via serverless function (`/api/auth`)
- Data sourced from Google Sheets

## Deploy (Vercel)
1. Push this repo to GitHub.
2. Import into Vercel. Framework preset auto-detects as **Vite**.
3. Set environment variable **`DASHBOARD_PASSWORD`** in Vercel project settings.
4. Vercel runs `npm install && npm run build` and serves `dist/`.

## Local note
Source lives in `src/`. Edit `src/App.jsx` for app logic, `src/index.css` for styles.
Vercel builds on every push to `main` — no local build step required.
