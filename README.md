{
  "name": "nf-sales-dashboard",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "chart.js": "^4.4.0",
    "chartjs-plugin-datalabels": "^2.2.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^5.4.11"
  }
}
NF Sales Dashboard
Internal sales KPI dashboard for the Nightforce Central territory. Tracks shipped/
unshipped scope and optics sales across product families (ATACR, NX8, NX6, SHV, NXS, NF).
Stack
React 18 + Chart.js, built with Vite (no runtime transpilation, all dependencies bundled)
Password gate via serverless function (`/api/auth`)
Data sourced from Google Sheets
Deploy (Vercel)
Push this repo to GitHub.
Import into Vercel. Framework preset auto-detects as Vite.
Set environment variable `DASHBOARD_PASSWORD` in Vercel project settings.
Vercel runs `npm install && npm run build` and serves `dist/`.
Local note
Source lives in `src/`. Edit `src/App.jsx` for app logic, `src/index.css` for styles.
Vercel builds on every push to `main` — no local build step required.
