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

`src/vault-plan.js` is the one file that carries Dan's real life into the app: the Year 13
timetable, the calendar, the deadline radar and the open-loop list, all sourced from
`DM-tuition/knowledge-vault`.

Every entry has a `key`. The app applies a key once per device and records it in
`lifeos:appliedSeeds:v1`, so:

- **adding something Dan tells us = append one entry with a new key.** It lands on his phone at
  the next load and never re-applies.
- **his edits stick** — deleting or re-dating something afterwards is permanent, because the
  key is already marked applied.
- entries are additive; only ones marked `replace: true` overwrite (a new timetable does).

Never edit or reuse an existing key — that is what makes the whole thing safe to re-run.
Entry kinds: `event`, `event-remove`, `keyDate`, `todo`, `dayTypes`, `weekAnchor`.

Older one-shot seeds (`lifeos:seededEvents:v1` / `:v2`, the June and family-calendar events)
still run behind their own flags and are left alone.

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
