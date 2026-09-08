# Life OS

A personal planning app — daily schedules, routines, and tracking — built with React + Vite and deployed on Vercel.

## Develop locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

Production builds output to `dist/` and are deployed automatically by Vercel on every push to `main`.

## Seeded data (from the knowledge vault)

Real dates and commitments are seeded into the app from Dan's knowledge vault rather than
typed in by hand. Each seed runs **once per device**, behind its own flag in `localStorage`:

| Flag | What it seeds |
|---|---|
| `lifeos:seededEvents:v1` / `:v2` | June calendar + confirmed family-calendar events → Month tab |
| `lifeos:seededPlan:v3` | Vault dates (ESAT, UCAS, driving test) → Month · open loops → To Do · recurring commitments (objective block, gym, football, wind-down) and the ESAT Mock / Tuition formats → Day Types |

Rules for adding a seed: bump to a new flag, never reuse one; merge into what's on the device
(existing entries always win); make it idempotent so a re-run is a no-op. See `seedPlan()` in
`src/LifeOS.jsx`.
