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

## The plan channel (`lifeos:plan:v1`)

The app reads a key the knowledge-vault Routine writes, and never writes it itself. It travels
to the phone through normal cloud sync — a Routine holding the Supabase service key writes it
into the `lifeos_state` row, and it lands on the next pull.

```json
{
  "updated": "2026-09-08T06:00:00Z",
  "keyDates": [{ "name": "ESAT", "date": "2026-10-13" }],
  "objective": {
    "date": "2026-09-09",
    "label": "ESAT — circular motion, timed",
    "note": "45 min, marked.",
    "t": 16.5, "e": 17.5, "cat": "Revision"
  }
}
```

- `keyDates` are merged into the deadline radar (deduped on name + date; Dan's own edits win).
- `objective` is dropped onto that day's timeline if no block with the same label is already
  there — this is how the morning brief's one objective becomes a real, swipeable block.
  `t`/`e` are decimal hours, defaulting to 16.5–17.5; `cat` defaults to Revision.
