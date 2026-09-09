// ============================================================================
// VAULT PLAN — the one file that carries Dan's real life into the app.
//
// Every entry has a `key`. The app applies each key exactly once per device and
// records it in `lifeos:appliedSeeds:v1`, so:
//   • adding something new = append one entry with a new key. It lands on the
//     phone at the next load and never re-applies.
//   • Dan editing or deleting something afterwards sticks — nothing is re-added.
//   • entries are additive by default; the few that must overwrite say so.
//
// Source of truth is the knowledge vault (DM-tuition/knowledge-vault):
// Personal/wiki/Year 13 Timetable.md · Personal/wiki/Calendar.md · Review.md ·
// Oxbridge-Prep/wiki/Live Workstreams.md. Keep this file in step with those.
// Last synced: 2026-09-09.
// ============================================================================

// ---- bell times (school-wide; Thursday runs short lessons with no form) ----
const FORM = { t: 8 + 40 / 60, e: 9 };
const P  = [null, [9,10], [10,11], [11+20/60, 12+20/60], [13+20/60, 14+20/60], [14+20/60, 15+20/60]];
const TH = [null, [9+20/60, 10+15/60], [10+15/60, 11+10/60], [11.5, 12+25/60], [13.5, 14+25/60], [14+25/60, 15+20/60]];

const form   = ()      => ({ t: FORM.t, e: FORM.e, label: "Form · 13GH · S14", cat: "School" });
const lesson = (p, l)  => ({ t: p[0], e: p[1], label: l, cat: "School" });
const study  = (p)     => ({ t: p[0], e: p[1], label: "Private Study", cat: "Revision",
                             note: "Red dot on the card — timetabled study, not a free." });
const free   = (p)     => ({ t: p[0], e: p[1], label: "Free period", cat: "Other",
                             note: "~8 of these a week. This is where ESAT goes — it costs no evening and no gym." });
const games  = (p)     => ({ t: p[0], e: p[1], label: "Games · Field", cat: "Sport" });

// ---- the evening, placed off the timetable itself ----
// Early-finish days (nothing in P5) get the objective block straight after school and
// the gym after it; full days get the objective block at 16:30.
const objEarly = { t: 15,   e: 16,    label: "Objective block", cat: "Revision",
                   note: "The one thing that matters today. ESAT until 13 Oct — timed and marked, not read." };
const objLate  = { t: 16.5, e: 17.5,  label: "Objective block", cat: "Revision",
                   note: "The one thing that matters today. ESAT until 13 Oct — timed and marked, not read." };
const gym      = { t: 16.5, e: 17.75, label: "Gym · with Rory", cat: "Gym",
                   note: "First thing to sacrifice until mid-October — see the Oxford-only month decision." };
const football = { t: 19,   e: 20.5,  label: "6-a-side · Tom", cat: "Sport" };
const wind     = { t: 22,   e: 22.5,  label: "Wind-down · phone out of the room", cat: "Other",
                   note: "Lights out 10:30. The evening phone is the sleep problem — this block is the fix." };

// ---- Year 13 timetable, 2026/27 (transcribed 8 Sep 2026 from the printed card) ----
const MF = "Maths + F. Maths", PH = "Physics", EC = "Economics";
const Y13 = {
  "school-a-mon": { name: "Y13 A · Mon", color: "#E0529B", blocks: [
    form(), study(P[1]), lesson(P[2], `${MF} · S14`), lesson(P[3], `${PH} · PC3`),
    lesson(P[4], `${EC} · S20`), lesson(P[5], `${PH} · PC4`), objLate, wind ]},
  "school-a-tue": { name: "Y13 A · Tue", color: "#E0529B", blocks: [
    form(), lesson(P[1], `${EC} · S18`), free(P[2]), lesson(P[3], `${MF} · M5`),
    lesson(P[4], `${PH} · PC2`), objEarly, football, wind ]},
  "school-a-wed": { name: "Y13 A · Wed", color: "#E0529B", blocks: [
    form(), lesson(P[1], `${PH} · PC2`), lesson(P[2], `${MF} · M5`), lesson(P[3], `${PH} · PC4`),
    lesson(P[4], `${EC} · S20`), games(P[5]), objLate, wind ]},
  "school-a-thu": { name: "Y13 A · Thu", color: "#E0529B", blocks: [
    lesson(TH[1], `${MF} · M5`), study(TH[2]), lesson(TH[3], `${PH} · PC4`),
    lesson(TH[4], `${MF} · S14`), objEarly, gym, wind ]},
  "school-a-fri": { name: "Y13 A · Fri", color: "#E0529B", blocks: [
    form(), lesson(P[1], `${MF} · S14`), study(P[2]), lesson(P[3], `${MF} · M5`),
    lesson(P[4], `${PH} · PC5`), objEarly, gym, wind ]},

  "school-b-mon": { name: "Y13 B · Mon", color: "#4FC3E0", blocks: [
    form(), study(P[1]), lesson(P[2], `${MF} · S14`), lesson(P[3], `${PH} · PC4`),
    lesson(P[4], `${EC} · S18`), objEarly, gym, wind ]},
  "school-b-tue": { name: "Y13 B · Tue", color: "#4FC3E0", blocks: [
    form(), lesson(P[1], `${EC} · S18`), free(P[2]), lesson(P[3], `${MF} · S14`),
    lesson(P[4], `${EC} · S18`), objEarly, football, wind ]},
  "school-b-wed": { name: "Y13 B · Wed", color: "#4FC3E0", blocks: [
    form(), lesson(P[1], `${EC} · S20`), lesson(P[2], `${MF} · M5`), free(P[3]),
    lesson(P[4], `${EC} · S20`), games(P[5]), objLate, wind ]},
  "school-b-thu": { name: "Y13 B · Thu", color: "#4FC3E0", blocks: [
    lesson(TH[1], `${MF} · M5`), free(TH[2]), lesson(TH[3], `${PH} · PC4`),
    lesson(TH[4], `${MF} · S14`), objEarly, gym, wind ]},
  "school-b-fri": { name: "Y13 B · Fri", color: "#4FC3E0", blocks: [
    form(), lesson(P[1], `${MF} · S14`), free(P[2]), lesson(P[3], `${MF} · M5`),
    free(P[4]), lesson(P[5], `${EC} · S20`), objLate, wind ]},
};

// ---- extra day formats ----
const EXTRA_TYPES = {
  "esat-mock": { name: "ESAT Mock Day", color: "#E6B800", blocks: [
    { t: 9.5,  e: 10.25, label: "ESAT Maths 1 · timed", cat: "Revision", note: "27 MCQs / 40 min. No calculator, no negative marking." },
    { t: 10.5, e: 11.25, label: "ESAT Maths 2 · timed", cat: "Revision", note: "27 MCQs / 40 min." },
    { t: 11.5, e: 12.25, label: "ESAT Physics · timed", cat: "Revision", note: "27 MCQs / 40 min. Your strongest paper — protect the lead." },
    { t: 13.5, e: 15,    label: "Mark it + review every wrong answer", cat: "Revision", note: "The marking is the revision. Every miss goes on the weak-topic list." },
    wind ]},
  "match-day": { name: "Match Day", color: "#2F9E44", blocks: [
    { t: 10, e: 11.5, label: "Fixture / training", cat: "Sport" },
    objLate, wind ]},
  "tuition": { name: "Tuition Day", color: "#2BA8B8", blocks: [
    { t: 17, e: 18, label: "Isla · maths & physics", cat: "Work", note: "Grade 6 → 9. Log what was covered, gaps and homework straight after." },
    wind ]},
};

// ---- non-school formats -------------------------------------------------------------------
const OTHER_TYPES = {
  "weekend": { name: "Weekend", color: "#2F9E44", blocks: [
    { t: 10, e: 12, label: "Revision", cat: "Revision" },
    { t: 15, e: 16.5, label: "Gym", cat: "Gym" }, wind ]},
  "holiday": { name: "Holiday / Half-term", color: "#E6B800", blocks: [
    { t: 10, e: 12, label: "Deep work / revision", cat: "Revision" },
    { t: 16, e: 18, label: "Gym", cat: "Gym" }, wind ]},
  "rest":  { name: "Rest Day",  color: "#7B4FB5", blocks: [] },
  "blank": { name: "Blank Day", color: "#8C92A0", blocks: [] },
};

// What a brand-new device starts with, and what "Load my real timetable" restores.
export const DEFAULT_DAYTYPES = { ...Y13, ...OTHER_TYPES, ...EXTRA_TYPES };

// ============================================================================
// The ledger. Append new entries at the bottom; never edit or reuse an old key.
// ============================================================================
export const VAULT_PLAN = [
  // --- correct the Year 12 timetable and the wrong driving-test date --------
  { key: "y13-timetable-2026", kind: "dayTypes", replace: true, types: Y13 },
  { key: "y13-extra-formats",  kind: "dayTypes", types: EXTRA_TYPES },
  { key: "y13-week-anchor",    kind: "weekAnchor", monday: "2026-09-14",
    why: "w/c Mon 7 Sep 2026 is Week B, so the next Monday starts Week A." },
  { key: "fix-driving-14oct",  kind: "event-remove", date: "2026-10-14", text: "Driving test" },

  // --- calendar (Personal/wiki/Calendar.md, 9 Sep 2026) ---------------------
  { key: "ev-oxford-openday-1", kind: "event", date: "2026-09-17", text: "Oxford open day" },
  { key: "ev-oxford-openday-2", kind: "event", date: "2026-09-18", text: "Oxford open day" },
  { key: "ev-ucas-submit",      kind: "event", date: "2026-10-10", text: "UCAS — submit (target)" },
  { key: "ev-esat",             kind: "event", date: "2026-10-13", text: "★ ESAT exam" },
  { key: "ev-driving-test",     kind: "event", date: "2026-10-15", text: "Driving test" },
  { key: "ev-ucas-deadline",    kind: "event", date: "2026-10-15", text: "UCAS deadline — Oxford" },
  { key: "ev-hyrox",            kind: "event", date: "2026-10-25", text: "HYROX doubles w/ Ayaan (~)" },
  { key: "ev-ey-screening",     kind: "event", date: "2027-03-01", text: "EY screening opens (~) — decline before this" },

  // --- deadline radar ------------------------------------------------------
  { key: "kd-oxford-openday", kind: "keyDate", name: "Oxford open day", date: "2026-09-17" },
  { key: "kd-ucas",           kind: "keyDate", name: "UCAS submit",     date: "2026-10-10" },
  { key: "kd-esat",           kind: "keyDate", name: "ESAT",            date: "2026-10-13" },
  { key: "kd-ucas-deadline",  kind: "keyDate", name: "Oxford deadline", date: "2026-10-15" },
  { key: "kd-driving",        kind: "keyDate", name: "Driving test",    date: "2026-10-15" },
  { key: "kd-hyrox",          kind: "keyDate", name: "HYROX",           date: "2026-10-25" },

  // --- open loops ----------------------------------------------------------
  { key: "td-ucas-ref",   kind: "todo", star: true, due: "2026-09-09",
    text: "Request the UCAS reference from school — longest lead time on the board" },
  { key: "td-isa",        kind: "todo", star: true, due: "2026-09-12",
    text: "Open the Stocks & Shares ISA — the £10k has landed and is sitting idle" },
  { key: "td-esat-diag",  kind: "todo", star: true, due: "2026-09-12",
    text: "ESAT — sit the first scored, timed diagnostic" },
  { key: "td-esat-plan",  kind: "todo", star: true, due: "2026-09-13",
    text: "ESAT — turn the diagnostic into a topic plan across the free periods to 13 Oct" },
  { key: "td-teachers",   kind: "todo", due: "2026-09-11",
    text: "Confirm the SS / SI teacher names (they look swapped) + Thursday bell times" },
  { key: "td-football",   kind: "todo", due: "2026-09-11",
    text: "Tell Claude the football match + training days and gym days, so the week is real" },
  { key: "td-terms",      kind: "todo", due: "2026-09-13",
    text: "Add term dates + half-term to the Month tab" },
  { key: "td-decision",   kind: "todo", star: true, due: "2026-09-20",
    text: "Decide Oxford vs Cambridge — the open day (17th) is the input, call it straight after" },
  { key: "td-ps",         kind: "todo", star: true, due: "2026-09-20",
    text: "Personal statement — action the teacher feedback, revise the draft" },
  { key: "td-higgs",      kind: "todo", due: "2026-09-20",
    text: "Higgs setup — minimum viable, it only has to unblock the PS ending" },
  { key: "td-isla",       kind: "todo", due: "2026-09-13",
    text: "Isla — lock a regular weekly slot, log each session" },
  { key: "td-ucas-submit",kind: "todo", star: true, due: "2026-10-10",
    text: "UCAS — final check and submit (Oxford deadline 15 Oct)" },
  { key: "td-run-close",  kind: "todo", due: "2026-09-20",
    text: "100-mile run close-out — thank-yous and the Challenge Log entry (£660, CALM)" },
  { key: "td-apikey",     kind: "todo", star: true, due: "2026-10-18",
    text: "⚠ DM Tuition — move the site chatbot's API key server-side, then rotate it" },
  { key: "td-ey-decline", kind: "todo", due: "2027-01-15",
    text: "EY — decline in the Jan–Mar 2027 window, before pre-employment screening opens" },
  { key: "td-interview",  kind: "todo", due: "2026-10-19",
    text: "Oxford interview prep — becomes the whole job once ESAT is sat" },
  { key: "td-stamford",   kind: "todo",
    text: "Stamford House site — captain photos, real house email, verify the event data" },
  { key: "td-peaks",      kind: "todo",
    text: "Three Peaks 2027 — find the driver, then lock a weather window" },

  // --- appended 2026-09-09 -------------------------------------------------
  // The 4 Oct half marathon was seeded from the family calendar in July and is not real
  // (corrected in the vault 7 Sep) — HYROX at the end of October replaced it.
  { key: "fix-half-marathon-4oct", kind: "event-remove", date: "2026-10-04", text: "Half marathon" },
];
