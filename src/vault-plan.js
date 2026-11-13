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
//
// Daily habit check-in (from 2026-10-20): `habitLog` entries carry yesterday's habits from the
// check-in chat — see Personal/wiki/Habit Log.md. `habitCfg` retunes a habit's quota/type.
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
                             note: "~8 of these a week. Silent work that costs no evening: written interview problems, or A-level homework so the evening stays free." });
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
// Lessons only since 29 Oct: the evening blocks (objective, gym with Rory, 6-a-side at 19:00,
// wind-down) were ESAT-era guesses and the 6-a-side time was wrong. Evenings now come from the
// Sunday planner as `plan` entries, week by week — see knowledge-vault AI/PLANNER.md.
const MF = "Maths + F. Maths", PH = "Physics", EC = "Economics";
const Y13 = {
  "school-a-mon": { name: "Y13 A · Mon", color: "#E0529B", blocks: [
    form(), study(P[1]), lesson(P[2], `${MF} · S14`), lesson(P[3], `${PH} · PC3`),
    lesson(P[4], `${EC} · S20`), lesson(P[5], `${PH} · PC4`) ]},
  "school-a-tue": { name: "Y13 A · Tue", color: "#E0529B", blocks: [
    form(), lesson(P[1], `${EC} · S18`), free(P[2]), lesson(P[3], `${MF} · M5`),
    lesson(P[4], `${PH} · PC2`) ]},
  "school-a-wed": { name: "Y13 A · Wed", color: "#E0529B", blocks: [
    form(), lesson(P[1], `${PH} · PC2`), lesson(P[2], `${MF} · M5`), lesson(P[3], `${PH} · PC4`),
    lesson(P[4], `${EC} · S20`), games(P[5]) ]},
  "school-a-thu": { name: "Y13 A · Thu", color: "#E0529B", blocks: [
    lesson(TH[1], `${MF} · M5`), study(TH[2]), lesson(TH[3], `${PH} · PC4`),
    lesson(TH[4], `${MF} · S14`) ]},
  "school-a-fri": { name: "Y13 A · Fri", color: "#E0529B", blocks: [
    form(), lesson(P[1], `${MF} · S14`), study(P[2]), lesson(P[3], `${MF} · M5`),
    lesson(P[4], `${PH} · PC5`) ]},

  "school-b-mon": { name: "Y13 B · Mon", color: "#4FC3E0", blocks: [
    form(), study(P[1]), lesson(P[2], `${MF} · S14`), lesson(P[3], `${PH} · PC4`),
    lesson(P[4], `${EC} · S18`) ]},
  "school-b-tue": { name: "Y13 B · Tue", color: "#4FC3E0", blocks: [
    form(), lesson(P[1], `${EC} · S18`), free(P[2]), lesson(P[3], `${MF} · S14`),
    lesson(P[4], `${EC} · S18`) ]},
  "school-b-wed": { name: "Y13 B · Wed", color: "#4FC3E0", blocks: [
    form(), lesson(P[1], `${EC} · S20`), lesson(P[2], `${MF} · M5`), free(P[3]),
    lesson(P[4], `${EC} · S20`), games(P[5]) ]},
  "school-b-thu": { name: "Y13 B · Thu", color: "#4FC3E0", blocks: [
    lesson(TH[1], `${MF} · M5`), free(TH[2]), lesson(TH[3], `${PH} · PC4`),
    lesson(TH[4], `${MF} · S14`) ]},
  "school-b-fri": { name: "Y13 B · Fri", color: "#4FC3E0", blocks: [
    form(), lesson(P[1], `${MF} · S14`), free(P[2]), lesson(P[3], `${MF} · M5`),
    free(P[4]), lesson(P[5], `${EC} · S20`) ]},
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
  "weekend": { name: "Weekend", color: "#2F9E44", blocks: [] },
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

  // --- appended 2026-09-10 (Dan asked directly) ----------------------------
  { key: "td-gym-tracking", kind: "todo",
    text: "Get gym / HYROX training tracking set up — log sessions for the ~25 Oct HYROX" },

  // --- appended 2026-09-10 -------------------------------------------------
  // The Shopping List (Personal/wiki/Shopping/Shopping List.md) has existed since 7 Sep with nothing
  // bought. No due date invented — Dan never gave one.
  { key: "td-sauna-block", kind: "todo", star: true,
    text: "Buy the sauna/pool block — sauna hat, swim cap, goggles (~£60, 9 months overdue)" },

  // --- appended 2026-09-10 -------------------------------------------------
  // Approved off the Shopping List. The alarm clock is the phone-out-of-the-bedroom
  // mechanism; the socks are indicated by the 100-mile blisters, HYROX is ~25 Oct.
  { key: "td-alarm-clock", kind: "todo", star: true,
    text: "Buy an alarm clock + downstairs charger (~£20) — gets the phone out of the bedroom" },
  { key: "td-hyrox-socks", kind: "todo",
    text: "Buy anti-blister socks before HYROX (~25 Oct) — blisters on the 100-miler" },

  // --- appended 2026-09-15 -------------------------------------------------
  // Dan: "delete the Friday lessons and replace with open day, as well as Thursday evening."
  // Friday 18 Sep's four lessons are cancelled; Thursday is school as normal, then travel.
  // The two plain "Oxford open day" rows are replaced rather than edited (keys are immutable).
  { key: "fix-openday-17", kind: "event-remove", date: "2026-09-17", text: "Oxford open day" },
  { key: "fix-openday-18", kind: "event-remove", date: "2026-09-18", text: "Oxford open day" },
  { key: "ev-openday-thu", kind: "event", date: "2026-09-17",
    text: "School as normal (to 14:25), then travel to Oxford" },
  { key: "ev-openday-fri", kind: "event", date: "2026-09-18",
    text: "★ Oxford open day — no lessons, off school all day" },

  // --- appended 2026-09-16 -------------------------------------------------
  // Five-minute dump. Higgs costed at ~7h (3 sittings), PS is a full rewrite, so Higgs
  // is now the critical path. College choice surfaced as a new open item on the UCAS form.
  { key: "td-higgs-s1", kind: "todo", star: true, due: "2026-09-21",
    text: "Higgs sitting 1 (~2h) — Colab, data in, first mass plot. It should look like noise" },
  { key: "td-higgs-s2", kind: "todo", star: true, due: "2026-09-25",
    text: "Higgs sitting 2 (~2h) — apply the cuts, find the ~125 GeV bump. This is the result" },
  { key: "td-higgs-s3", kind: "todo", due: "2026-09-28",
    text: "Higgs sitting 3 (~2h, no code) — understand it well enough for interview" },
  { key: "td-ps-rewrite", kind: "todo", star: true, due: "2026-10-10",
    text: "Personal statement — full rewrite, AFTER Higgs gives you a finding to end on" },
  { key: "td-esat-data", kind: "todo", due: "2026-09-20",
    text: "Send the ESAT data — per-section, so 'didn't go amazingly' becomes a topic list" },
  { key: "td-colleges", kind: "todo", due: "2026-10-05",
    text: "Oxford college choice — it's on the UCAS form. Ask at the open day, decide by ~5 Oct" },

  // --- appended 2026-09-17 -------------------------------------------------
  // Dan raised the rosacea checkup himself. It has sat on Appearance and Grooming since
  // June 2026 unactioned; it is free and needs a phone call. No date given, none invented.
  { key: "td-rosacea-gp", kind: "todo", star: true,
    text: "Book a GP appointment about the rosacea — on file since June, costs nothing" },

  // --- appended 2026-10-15 -------------------------------------------------
  // The Decision closed on 13 Oct: Cambridge Natural Sciences at Queens'. Three to-dos
  // shipped in September are now about the wrong university, and a to-do cannot be edited
  // once applied — so they are retracted by key and replaced. `todo-remove` targets the
  // `seed` key of the entry that created the row; Dan's own to-dos are never touched.
  { key: "rm-td-decision", kind: "todo-remove", target: "td-decision" },
  { key: "rm-td-colleges", kind: "todo-remove", target: "td-colleges" },
  { key: "rm-td-interview", kind: "todo-remove", target: "td-interview" },
  { key: "td-cam-interview", kind: "todo", star: true,
    text: "Cambridge interview prep — NatSci at Queens'. December, date TBC" },

  // Driving test failed 15 Oct (two majors). DVSA enforces a 10-working-day wait, so the
  // earliest retest is ~29 Oct — an estimate, not a booking, so no date goes in.
  { key: "td-driving-rebook", kind: "todo", star: true,
    text: "Rebook the driving test — earliest ~29 Oct (10 working days after a fail)" },

  // --- appended 2026-10-16 -------------------------------------------------
  // The Obsidian Git token on the iPad expired, the iPad went stale without saying so, and a
  // commit from that stale copy reverted the vault on main (restored same day). The renewal
  // date is the thing that prevents a repeat, so it goes on the phone, not just in the vault.
  { key: "kd-gh-token", kind: "keyDate", name: "GitHub token expires", date: "2027-09-30" },
  { key: "td-gh-token-renew", kind: "todo", due: "2027-09-16", star: true,
    text: "Renew the GitHub token for Obsidian Git (expires 30 Sep) — classic token, repo scope" },

  // --- appended 2026-10-19 -------------------------------------------------
  // My Cambridge Application: everything submitted-ready except three items, which Dan
  // plans to finish tonight. Hard deadline Wed 22 Oct, 6pm UK time.
  { key: "td-mca-finish", kind: "todo", due: "2026-10-22", star: true,
    text: "Finish My Cambridge Application — photo, optional statement, A-level topics. Deadline 6pm" },

  // --- appended 2026-10-19 -------------------------------------------------
  // Dan: "for my holidays, on the month section, make it a distinct colour, so I don't have to
  // read the text of holiday — make the COLOUR holiday... maybe yellow." Holidays are now a
  // gold wash on the Month tab (kind "holiday"), not an event row. No text is added.
  // ⚠️ Dates are Claude's reading of "holiday from Friday this week, a whole week, until Monday
  // the week after" (said Mon 19 Oct): Fri 23 Oct through Sun 1 Nov, back at school Mon 2 Nov.
  // Both edges are unconfirmed — if Friday is a normal school day, or the Monday is also off,
  // this needs a holiday-remove + a new holiday entry.
  { key: "hol-half-term-oct26", kind: "holiday",
    start: "2026-10-23", end: "2026-11-01", label: "October half term" },

  // --- appended 2026-10-19 (second pass, after Dan saw the first) -----------
  // "Make it subtle but noticeable, not gold and crystal everywhere." And: "the holiday
  // itself, meaning off school, should be a colour, but if I'm going somewhere that should be
  // a different colour." So day colours are now typed — `off` (amber) and `away` (purple) —
  // and rendered as a faint tint plus a 3px bar along the top of the cell rather than a wash.
  // A day that is both shows both bars.
  { key: "hol-fix-oct26-restyle", kind: "holiday-remove", target: "hol-half-term-oct26" },

  // Half term CONFIRMED by Dan: half day Thu 22nd, Friday off, back Monday the 2nd.
  { key: "hol-half-term-oct26-v2", kind: "holiday", type: "off",
    start: "2026-10-23", end: "2026-11-01", label: "October half term" },
  { key: "ev-half-day-22oct", kind: "event", date: "2026-10-22", text: "Half day" },

  // HYROX: Dan, 19 Oct — "it's not the 27th, not the 25th. It's the 28th."
  { key: "fix-hyrox-25", kind: "event-remove", date: "2026-10-25", text: "HYROX doubles w/ Ayaan (~)" },
  { key: "fix-kd-hyrox-25", kind: "keyDate-remove", name: "HYROX", date: "2026-10-25" },
  { key: "ev-hyrox-28", kind: "event", date: "2026-10-28", text: "HYROX doubles w/ Ayaan" },
  { key: "kd-hyrox-28", kind: "keyDate", name: "HYROX", date: "2026-10-28" },

  // --- appended 2026-10-19 (third pass) ------------------------------------
  // Dan: "just before Christmas, the week before, I'm going away... the 19th to the 24th,
  // somewhere in the Bahamas — just say Bahamas."
  // ⚠️ His words were "I think I'm from the 19th to the 24th" — dates unconfirmed, and he has
  // offered to send the whole family calendar. Christmas school holiday dates still unknown,
  // so this is the trip only, not the end of term.
  { key: "hol-bahamas-dec26", kind: "holiday", type: "away",
    start: "2026-12-19", end: "2026-12-24", label: "Bahamas" },

  // HYROX is a single day — Dan travels there and back on the 28th, so no travel days.
  { key: "td-hyrox-time", kind: "todo", due: "2026-10-26",
    text: "HYROX (Wed 28th) — find out the actual start time and put it in" },

  // --- appended 2026-10-19 (fourth pass) -----------------------------------
  // Dan: "interview prep is highest priority." UCAS is in, the ESAT is sat, the college is
  // chosen — December interviews are the only thing left that the outcome depends on. So the
  // single vague "Cambridge interview prep" row is replaced with the actual work, dated to
  // half term (Fri 23 Oct – Sun 1 Nov), which is the biggest free block before December.
  { key: "rm-td-cam-interview-vague", kind: "todo-remove", target: "td-cam-interview" },

  // Mock dates have to be asked for AT SCHOOL, and school breaks up Thu 22nd (half day).
  { key: "td-mock-dates", kind: "todo", due: "2026-10-22", star: true,
    text: "Pin dates for the 4 mock interviews (2 school, 2 Blue Education) — ask before Thu" },

  // Integrity item: it is named in the submitted personal statement and is unfinished.
  { key: "td-six-easy-pieces", kind: "todo", due: "2026-11-01", star: true,
    text: "Finish Six Easy Pieces — it's in your submitted PS, so they can ask about it" },

  // Highest-yield single thing: most of the PS word count is the Higgs/Z analysis.
  { key: "td-higgs-outloud", kind: "todo", due: "2026-11-01", star: true,
    text: "Explain the Higgs/Z analysis out loud, unaided, in 5 min — the 1.9 sigma result" },

  { key: "td-natsci-partia", kind: "todo", due: "2026-11-01",
    text: "Know NatSci Part IA: which 3 sciences + maths you'd pick, and why. They ask" },

  { key: "td-why-natsci-rehearse", kind: "todo", due: "2026-11-01",
    text: "Rehearse 'why NatSci, not Oxford Physics' out loud — reasoning, not a script" },

  { key: "td-think-aloud", kind: "todo", due: "2026-11-08",
    text: "Unseen-problem practice, narrating every step — thinking aloud IS the interview" },

  { key: "td-theory-breaks", kind: "todo", due: "2026-11-08",
    text: "Spacetime-light theory: be able to say where it breaks, not just what it is" },

  // Driving test is rebooked (30 Mar 2027), so the rebook row has been overtaken.
  { key: "rm-td-driving-rebook", kind: "todo-remove", target: "td-driving-rebook" },
  { key: "kd-driving-retest", kind: "keyDate", name: "Driving retest", date: "2027-03-30" },

  // --- appended 2026-10-20 -------------------------------------------------
  // Dan: "check off things I've completed on the to do list, and on the Life OS as well."
  // Only rows the VAULT EVIDENCES as finished are ticked — nothing is assumed done. Ticked,
  // not deleted, so the list still shows he did them. Anything he ticked himself already is
  // skipped by the `!t.done` guard, and his own rows are untouchable (these target seed keys).
  { key: "done-higgs-s1", kind: "todo-done", target: "td-higgs-s1" },   // Higgs run 22 Sep
  { key: "done-higgs-s2", kind: "todo-done", target: "td-higgs-s2" },   // the result, 22 Sep
  { key: "done-ps-rewrite", kind: "todo-done", target: "td-ps-rewrite" }, // PS done 6 Oct, submitted 14 Oct
  { key: "done-sauna-block", kind: "todo-done", target: "td-sauna-block" }, // block 100% closed (Bought.md)

  // Not done — overtaken by events, so retired rather than ticked. Ticking these would be a lie.
  { key: "rm-td-hyrox-socks", kind: "todo-remove", target: "td-hyrox-socks" },  // "I have trainers, don't need socks" (15 Sep)
  { key: "rm-td-esat-data", kind: "todo-remove", target: "td-esat-data" },      // ESAT now sat; official results pending
  // --- appended 2026-10-20 · daily habit check-in ------------------------------
  // Mon 19 Oct, from Dan's ramble: bed 22:30, up 07:15, felt refreshed · ~1.5h leisure screen
  // · upper gym + swim + sauna · eggs / soup / spag bol at mum's (homemade apple pie) · no ice
  // bath, no reps (both lapsed over summer) · "about 7.5 out of 10".
  { key: "hl-2026-10-19", kind: "habitLog", date: "2026-10-19", rating: 7.5,
    habits: { sleep8: true, eatwell: true, exercise: true, screen: true } },

  // No Garmin connector exists for Claude (checked 20 Oct). Garmin → Strava auto-sync works, but
  // Claude's Strava connector turned out to need a paid Strava subscription — see below.
  { key: "td-garmin-strava", kind: "todo", due: "2026-10-25",
    text: "Garmin Connect → link Strava so workouts auto-sync (sleep still read off the watch)" },

  // --- appended 2026-10-20 -------------------------------------------------
  // Twelve gap questions answered. Only the dated/commitment ones belong in the app.
  { key: "ev-cup-navratri", kind: "event", date: "2026-10-21", text: "School cup game · Navratri (eve)" },

  // Term end is DAN'S GUESS, not the school calendar: "couldn't tell you... the Friday before
  // the 19th". 19 Dec 2026 is a Saturday, so Fri 18 Dec. Flagged, and worth confirming.
  { key: "ev-term-end-guess", kind: "event", date: "2026-12-18", text: "Last day of term (~ unconfirmed)" },

  // HYROX start time: Dan says morning, and that the specifics don't matter. Retire the chase.
  { key: "rm-td-hyrox-time", kind: "todo-remove", target: "td-hyrox-time" },

  // ISA: unblocked - doing it with Mum, "very soon". No date given, so none invented.
  { key: "td-isa-date", kind: "todo", star: true,
    text: "ISA with Mum - agree an actual date. 'Very soon' has drifted 6 weeks already" },
  // --- appended 2026-10-20 · workouts onto the timeline ------------------------
  // Dan: "the workouts I do on Strava, if it's a swim then make sure it's represented on my
  // Life OS." Times weren't given, so the blocks sit after school and say so — drag to fix.
  { key: "wo-2026-10-19-gym", kind: "workout", date: "2026-10-19", t: 17.5, e: 18.5, cat: "Gym",
    label: "Gym · upper", note: "From the habit check-in. Time approximate." },
  { key: "wo-2026-10-19-swim", kind: "workout", date: "2026-10-19", t: 18.5, e: 19, cat: "Sport",
    label: "Swim + sauna", note: "From the habit check-in. Time approximate." },

  // Claude's Strava connector is subscribers-only (checked 20 Oct: "not eligible"), so linking
  // Garmin → Strava alone gets Claude nothing. Retire that row; replace it with the real choice.
  { key: "rm-td-garmin-strava", kind: "todo-remove", target: "td-garmin-strava" },
  { key: "td-strava-sub", kind: "todo", due: "2026-10-25",
    text: "Strava: subscribe (lets Claude read workouts) or keep telling the check-in — decide" },

  // --- appended 2026-10-21 -------------------------------------------------
  // My Cambridge Application submitted 21 Oct, a day inside the deadline.
  { key: "rm-td-mca-finish", kind: "todo-remove", target: "td-mca-finish" },
  // --- appended 2026-10-21 · habit check-in, Tue 20 Oct --------------------------
  // Bed 22:30, 7h32 asleep (Garmin 80) — under 8h, so Sleep 8hrs+ stays unticked · mum's, ate
  // well · football 20–21 at BTH · ~1h screen · ice baths stopped · "about 8 out of 10".
  { key: "hl-2026-10-20", kind: "habitLog", date: "2026-10-20", rating: 8,
    habits: { eatwell: true, exercise: true, screen: true } },
  { key: "wo-2026-10-20-football", kind: "workout", date: "2026-10-20", t: 20, e: 21, cat: "Sport",
    label: "Football · BTH", note: "From the habit check-in." },
  { key: "td-garmin-connect", kind: "todo",
    text: "Connect Garmin to Claude — needs a computer, do it when you're at one" },
  // --- appended 2026-10-22 · habit check-in, Wed 21 Oct ---------------------------
  // Tracker change (Dan, 22 Oct): Sleep 8hrs+ → "In bed by 22:30" (key `bed`); Ice Bath removed.
  // Back-fill `bed` for the two nights already logged — both were 22:30 exactly.
  { key: "hl-bed-2026-10-19", kind: "habitLog", date: "2026-10-19", habits: { bed: true } },
  { key: "hl-bed-2026-10-20", kind: "habitLog", date: "2026-10-20", habits: { bed: true } },

  // Wed 21 Oct: Navaratri, home ~01:00, bed ~01:40, 6h12 asleep (Garmin 58), up 08:30 · mum's,
  // ate well · away football match in Liverpool (won) + Total Fitness pool and 20-min sauna +
  // Navaratri dancing · ~40 min screen · "8.5 out of 10". Workout times weren't given.
  { key: "hl-2026-10-21", kind: "habitLog", date: "2026-10-21", rating: 8.5,
    habits: { eatwell: true, exercise: true, screen: true } },
  { key: "wo-2026-10-21-football", kind: "workout", date: "2026-10-21", t: 14.5, e: 16.5, cat: "Sport",
    label: "Football match · Liverpool (won)", note: "From the habit check-in. Time approximate." },
  { key: "wo-2026-10-21-swim", kind: "workout", date: "2026-10-21", t: 18, e: 18.5, cat: "Sport",
    label: "Swim · Total Fitness", note: "A few laps. From the habit check-in. Time approximate." },
  { key: "wo-2026-10-21-sauna", kind: "workout", date: "2026-10-21", t: 18.5, e: 18.85, cat: "Gym",
    label: "Sauna · 20 min", note: "From the habit check-in. Time approximate." },
  { key: "wo-2026-10-21-navaratri", kind: "workout", date: "2026-10-21", t: 20.5, e: 24, cat: "Social",
    label: "Navaratri", note: "Dancing — 'surprisingly energetic'. Home ~01:00. Time approximate." },

  // Strava decided: "I'm not paying for Strava, that's not gonna happen." Ticked, not deleted.
  { key: "done-td-strava-sub", kind: "todo-done", target: "td-strava-sub" },
  // --- appended 2026-10-24 · habit check-in, Thu 22 + Fri 23 Oct (+ Sat so far) -------
  // Thu 22: two tests (physics went well, maths didn't), half day, Rudy's pizza, ISOC football
  // tournament (watched), Pepe's in Broadheath with the guys, then chose Dad's over Mum's —
  // junk food, late bed. No exercise. "Probably a 6."
  { key: "hl-2026-10-22", kind: "habitLog", date: "2026-10-22", rating: 6, habits: {} },
  // Fri 23: "a true BS day" — at Dad's, woke late, film + YouTube, junk all day, heavy screen
  // time. He scored it 0; the app's score runs 1–10, so it's flagged BS day and left unscored.
  { key: "hl-2026-10-23", kind: "habitLog", date: "2026-10-23", bs: true, habits: {} },
  // Sat 24 (so far): woke 10:00, then a mock HYROX at the gym from 12:00. Rest of the day
  // gets logged at tomorrow's check-in.
  { key: "wo-2026-10-24-mock-hyrox", kind: "workout", date: "2026-10-24", t: 12, e: 13.5, cat: "Gym",
    label: "Mock HYROX", note: "4 days before the real one (Wed 28). From the check-in. End time approximate." },
  // --- appended 2026-10-26 · half-term plan ------------------------------------
  // First mock booked by Dan 24 Oct (Blue Education, 16:30–17:30, 45 min interview). Was vault-only.
  { key: "ev-mock-blue-30oct", kind: "event", date: "2026-10-30", text: "Mock interview · Blue Education 16:30" },
  { key: "kd-mock-blue-30oct", kind: "keyDate", name: "First mock", date: "2026-10-30" },
  // Half-term plan set 26 Oct (vault: Personal/wiki/Calendar.md). One anchor per day.
  { key: "td-six-easy-pieces-ht", kind: "todo", due: "2026-10-27", star: true,
    text: "Finish Six Easy Pieces — it's in the submitted PS" },
  { key: "td-higgs-out-loud-ht", kind: "todo", due: "2026-10-29", star: true,
    text: "Higgs/Z analysis out loud, unaided, 5 min — recorded" },
  { key: "td-natsci-ia-ht", kind: "todo", due: "2026-10-29",
    text: "NatSci Part IA: pick 3 sciences + maths, say why" },
  { key: "td-mock-debrief-30oct", kind: "todo", due: "2026-10-30",
    text: "Debrief the mock within an hour — tell Claude what went wrong" },
  { key: "td-gym-redesign-ht", kind: "todo", due: "2026-10-29",
    text: "Redesign the gym routine with Claude (incl. a cardio day)" },
  { key: "td-stamford-site-ht", kind: "todo", due: "2026-11-01",
    text: "Stamford site: captain photos, house email, check event dates" },
  // --- appended 2026-10-26 (second pass) · plan rebuilt around problem-solving practice ------
  { key: "rm-td-higgs-out-loud-ht", kind: "todo-remove", target: "td-higgs-out-loud-ht" },
  { key: "rm-td-natsci-ia-ht", kind: "todo-remove", target: "td-natsci-ia-ht" },
  { key: "ev-halloween-party-28oct", kind: "event", date: "2026-10-28", text: "Halloween party (evening)" },
  { key: "ev-football-31oct", kind: "event", date: "2026-10-31", text: "Football 14:00" },
  { key: "td-problems-mon", kind: "todo", due: "2026-10-26", star: true,
    text: "Library: 2 x 90 min unseen problems, talking aloud" },
  { key: "td-stamford-asks", kind: "todo", due: "2026-10-26",
    text: "Message Ayaan/school: captain photos, house email, House Shout date" },
  { key: "td-problems-tue", kind: "todo", due: "2026-10-27", star: true,
    text: "Library: 2 x 90 min unseen problems" },
  { key: "td-hyrox-prep-tue", kind: "todo", due: "2026-10-27",
    text: "HYROX kit + carbs dinner, bed 22:30" },
  { key: "td-problems-thu", kind: "todo", due: "2026-10-29", star: true,
    text: "Library: 2 x 90 min unseen problems" },
  { key: "td-practice-mock-fri", kind: "todo", due: "2026-10-30", star: true,
    text: "Practice mock with Claude, 45 min, before the 16:30" },
  { key: "td-formet-cap", kind: "todo", due: "2026-11-01",
    text: "Formet: 2-3h cap, then stop" },
  // --- appended 2026-10-27 · habit check-in, Sat 24 – Mon 26 Oct --------------------
  // Sat 24: up ~10, junk breakfast, then the full HYROX solo with Rory at the gym from 12
  // (stations doubled — home ~16:00, so the mock-HYROX block shipped 24 Oct is short),
  // Spurs game, Rory + Maz round for UFC 333, late bed. "6 out of 10".
  { key: "hl-2026-10-24", kind: "habitLog", date: "2026-10-24", rating: 6, habits: { exercise: true } },
  // Sun 25: at mum's — ate well, up ~12, bed ~02:00, TV all day. Rest day after the HYROX
  // (deliberate). "Probably 4 out of 10." Not flagged BS: he called it one, then "not a complete BS day".
  { key: "hl-2026-10-25", kind: "habitLog", date: "2026-10-25", rating: 4, habits: { eatwell: true } },
  // Mon 26: up ~11, easy HYROX session with Ian at 12, pool + sauna, Pizza Anna, ~2h at the
  // library (interview prep + organising, then the Stamford House website), walk round
  // Timperley with Julian, healthy dinner, bed ~01:00. "Let's just say 7."
  { key: "hl-2026-10-26", kind: "habitLog", date: "2026-10-26", rating: 7, habits: { eatwell: true } },
  { key: "wo-2026-10-26-hyrox", kind: "workout", date: "2026-10-26", t: 12, e: 13, cat: "Gym",
    label: "HYROX session (easy) · with Ian", note: "Calm, nothing too fatiguing. Time approximate." },
  { key: "wo-2026-10-26-swim", kind: "workout", date: "2026-10-26", t: 13, e: 13.5, cat: "Sport",
    label: "Swim", note: "From the habit check-in. Time approximate." },
  { key: "wo-2026-10-26-sauna", kind: "workout", date: "2026-10-26", t: 13.5, e: 13.85, cat: "Gym",
    label: "Sauna", note: "From the habit check-in. Time approximate." },
  // --- appended 2026-10-29 · habit check-in, Tue 27 + Wed 28 Oct ------------------
  // Tue 27: rest day before HYROX at mum's — slept and ate well, but no work. "A BS day… 4 out of 10."
  { key: "hl-2026-10-27", kind: "habitLog", date: "2026-10-27", rating: 4, bs: true, habits: { eatwell: true } },
  // Wed 28: HYROX doubles in Birmingham, 13:10 start (finish time not given yet); Dave's Hot
  // Chicken after; Halloween party; bed ~03:00. Day score not given yet.
  { key: "hl-2026-10-28", kind: "habitLog", date: "2026-10-28", habits: {} },
  { key: "wo-2026-10-28-hyrox", kind: "workout", date: "2026-10-28", t: 13 + 10/60, e: 14 + 10/60, cat: "Sport",
    label: "HYROX doubles · Birmingham", note: "Start 13:10 (Dan). End assumes ~1hr — finish time to come." },
  // Mum flies to Vietnam Fri 30 Oct ("tomorrow, I think") — two weeks at Dad's from then.
  { key: "ev-dads-fortnight", kind: "event", date: "2026-10-30",
    text: "Mum flies to Vietnam (tbc) — 2 weeks at Dad's starts" },
  // HYROX doubles finish: 1hr 17min (Dan, 29 Oct) — target was sub-1hr. Stretch the block.
  { key: "wo-edit-2026-10-28-hyrox", kind: "workout-edit", date: "2026-10-28",
    label: "HYROX doubles · Birmingham", e: 13 + 10/60 + 77/60, note: "Start 13:10, finished in 1:17:00 (target sub-1hr)." },

  // --- appended 2026-10-29 -------------------------------------------------
  // Gym bag and school bag have sat on the Shopping List since 10 Sep. Dan named the
  // procrastination himself. Half term ends Sun 1 Nov; no due date invented, he hasn't
  // given a day. Starred so it sits at the top of the To Do list.
  { key: "td-shop-run-oct", kind: "todo", star: true,
    text: "The shopping run — gym bag, school bag, weight belt, Umbro tops + trackies, shorts, alarm clock + charger" },
  // --- appended 2026-10-29 · gym routine set (vault: Personal/wiki/Knowledge/Gym routine.md) ---
  { key: "td-dips-test-29oct", kind: "todo", due: "2026-10-29",
    text: "Test max strict dips in today's gym session; tell Claude the number" },
  // --- appended 2026-10-29 · session A done (time approximate: Dan said "3-4") -------------
  { key: "wo-2026-10-29-gym-a", kind: "workout", date: "2026-10-29", t: 15, e: 16, cat: "Gym",
    label: "Gym A (upper)", note: "Weighted pull-up 15kg x9, dips +10kg x13, muscle-ups. Times approximate." },
  // --- appended 2026-10-29 · Fri 30 Oct filled in -----------------------------
  // Booking email: the Blue Education mock is 17:00–17:45 on Zoom, not 16:30 (Dan's 24 Oct
  // dictation). The keyDate carries no time, so it stays. The practice-mock row said
  // "before the 16:30", so it is retracted and re-shipped. No Zoom code or password here.
  { key: "fix-mock-blue-1630", kind: "event-remove", date: "2026-10-30", text: "Mock interview · Blue Education 16:30" },
  { key: "ev-mock-blue-30oct-1700", kind: "event", date: "2026-10-30",
    text: "★ Mock interview · Blue Education · Zoom 17:00–17:45 (link opens 16:45)" },
  { key: "rm-td-practice-mock-fri", kind: "todo-remove", target: "td-practice-mock-fri" },
  { key: "td-practice-mock-fri-1700", kind: "todo", due: "2026-10-30", star: true,
    text: "Practice mock with Claude, 45 min, before the 17:00 mock" },
  // --- appended 2026-10-29 · the Sunday planner, first run (planning chat) -------------
  // School templates are now lessons only (see Y13 above); the planner owns everything else.
  // `plan` = blocks onto a day · `plan-remove` = retract a plan's untouched blocks for that day.
  // Keys are wp-<date>; a re-plan adds `plan-remove` for the old key, then a new wp-<date>-v2.
  { key: "y13-timetable-lessons-only", kind: "dayTypes", replace: true,
    types: { ...Y13, weekend: { name: "Weekend", color: "#2F9E44", blocks: [] } } },

  // Week of Mon 2 Nov — Week B, back at school, at Dad's (Mum in Vietnam to ~13 Nov).
  // Vault: Personal/wiki/Week Plan.md. Sleep ASSUMED (no Garmin feed): bed 22:30, up 06:45.
  // Priorities: interview reps daily (4–18 Dec), gym A/B/skills Mon/Wed/Fri, A-level homework.
  { key: "wp-2026-11-02", kind: "plan", date: "2026-11-02", blocks: [
    { t: 7, e: 7.25, label: "Morning: handstand + stretch + sets", cat: "Other", note: "5 min stretch · handstand 5–7 min · 1 pull-up set + 1 push-up set, 2 short of failure." },
    { t: 7.25, e: 8.25, label: "Breakfast · leave for school", cat: "Other", note: "From Dad's — travel time assumed ~30 min. Tell the planner the real one." },
    { t: 14.5, e: 15.25, label: "Travel · snack", cat: "Other" },
    { t: 15.5, e: 16.33, label: "Gym A (upper)", cat: "Gym", note: "Weighted pull-up aim +17.5–20 kg · dip +12.5–15 kg · incline DB press. Full list: Gym routine." },
    { t: 17, e: 18, label: "Interview problems — out loud", cat: "Revision", note: "2–3 unseen problems, talk the whole way, record one. Claude can play the interviewer." },
    { t: 18, e: 19, label: "Dinner", cat: "Other" },
    { t: 19, e: 20, label: "A-level homework", cat: "Revision", note: "Whatever is due first. Nothing due → Further Maths past-paper questions." },
    { t: 22, e: 22.5, label: "Wind-down · phone out of the room", cat: "Other", note: "Bed 22:30." },
  ]},
  { key: "wp-2026-11-03", kind: "plan", date: "2026-11-03", blocks: [
    { t: 7, e: 7.25, label: "Morning: front lever + stretch + sets", cat: "Other", note: "Archer push-ups today (board is at home — at Dad's? plain if not)." },
    { t: 7.25, e: 8.25, label: "Breakfast · leave for school", cat: "Other" },
    { t: 15, e: 16.5, label: "Interview problems + A-level homework", cat: "Revision", note: "45 min problems out loud, then 45 min homework. School finishes 14:20 (P5 free)." },
    { t: 17.5, e: 18.25, label: "Dinner (early, before football)", cat: "Other" },
    { t: 20, e: 21, label: "6-a-side · Tom", cat: "Sport" },
    { t: 22, e: 22.5, label: "Wind-down · phone out of the room", cat: "Other", note: "Bed 22:30 — straight home after the game." },
  ]},
  { key: "wp-2026-11-04", kind: "plan", date: "2026-11-04", blocks: [
    { t: 7, e: 7.25, label: "Morning: handstand + stretch + sets", cat: "Other" },
    { t: 7.25, e: 8.25, label: "Breakfast · leave for school", cat: "Other" },
    { t: 16, e: 16.83, label: "Gym B (legs heavier)", cat: "Gym", note: "Light muscle-ups first, then squat 6–8, RDL, weighted chin-up, OHP. Games is P5 — go easy on legs there." },
    { t: 17.25, e: 18.25, label: "Interview problems — out loud", cat: "Revision" },
    { t: 18.25, e: 19, label: "Dinner", cat: "Other" },
    { t: 19, e: 20, label: "A-level homework", cat: "Revision" },
    { t: 22, e: 22.5, label: "Wind-down · phone out of the room", cat: "Other" },
  ]},
  { key: "wp-2026-11-05", kind: "plan", date: "2026-11-05", blocks: [
    { t: 7, e: 7.25, label: "Morning: front lever + stretch + sets", cat: "Other" },
    { t: 7.25, e: 8.5, label: "Breakfast · leave for school", cat: "Other", note: "Thursday starts 09:20 — no form." },
    { t: 15, e: 16.5, label: "Interview problems + A-level homework", cat: "Revision", note: "School finishes 14:25 (P5 free)." },
    { t: 18, e: 19, label: "Dinner", cat: "Other" },
    { t: 21, e: 22, label: "Football training", cat: "Sport", note: "Home ~22:20. Bed by 23:00 is the realistic target tonight, not 22:30." },
    { t: 22.5, e: 23, label: "Wind-down · bed", cat: "Other" },
  ]},
  { key: "wp-2026-11-06", kind: "plan", date: "2026-11-06", blocks: [
    { t: 7, e: 7.25, label: "Morning: handstand + stretch + sets", cat: "Other" },
    { t: 7.25, e: 8.25, label: "Breakfast · leave for school", cat: "Other" },
    { t: 16, e: 16.67, label: "Gym skills (no legs)", cat: "Gym", note: "Weighted muscle-ups first, front lever tucks, handstand holds, pull-up + dip sets, L-sit, prehab." },
    { t: 17, e: 18, label: "Interview problems — out loud", cat: "Revision" },
    { t: 18.5, e: 19.5, label: "Dinner", cat: "Other" },
    { t: 22, e: 22.5, label: "Wind-down · phone out of the room", cat: "Other", note: "Match tomorrow at 14:00." },
  ]},
  { key: "wp-2026-11-07", kind: "plan", date: "2026-11-07", blocks: [
    { t: 8.75, e: 9, label: "Stretch", cat: "Other", note: "Up ~08:30 (assumed)." },
    { t: 10, e: 11.5, label: "Interview problems + A-level catch-up", cat: "Revision", note: "45 + 45. Library if Dad's is too loud." },
    { t: 12, e: 12.75, label: "Lunch (carbs)", cat: "Other" },
    { t: 14, e: 16, label: "Football match", cat: "Sport", note: "Club or school — one of the two, as every Saturday." },
    { t: 22.5, e: 23, label: "Wind-down", cat: "Other" },
  ]},
  { key: "wp-2026-11-08", kind: "plan", date: "2026-11-08", blocks: [
    { t: 9, e: 9.25, label: "Stretch", cat: "Other" },
    { t: 10, e: 10.33, label: "Answer the planner's questions", cat: "Other", note: "In the Planning and Calendar chat. 10 minutes — it builds next week from your answers." },
    { t: 10.5, e: 12, label: "Interview problems + A-level", cat: "Revision" },
    { t: 18, e: 18.5, label: "School-week setup", cat: "Other", note: "Bag, kit, gym clothes for Mon + Wed." },
    { t: 22, e: 22.5, label: "Wind-down · phone out of the room", cat: "Other" },
  ]},

  // --- appended 2026-11-02 · Week A confirmed (Dan, 2 Nov): half term paused the rota ------------
  // The straight count from 14 Sep made w/c 2 Nov Week B; it's A. Re-anchor, then fix today, which
  // was already opened under B (lessons only — planned and own blocks kept).
  { key: "y13-week-anchor-2nov", kind: "weekAnchor", monday: "2026-11-02",
    why: "Rota paused over half term — w/c 2 Nov is Week A (Dan, 2 Nov)." },
  { key: "fix-2026-11-02-week-a", kind: "dayType-set", date: "2026-11-02", type: "school-a-mon" },
  // Week A clashes: Mon has P5 Physics to 15:20 (travel + gym slide later); Fri ends 14:20 (gym earlier).
  { key: "rm-wp-2026-11-02-pm", kind: "plan-remove", date: "2026-11-02", target: "wp-2026-11-02",
    labels: ["Travel · snack", "Gym A (upper)"] },
  { key: "wp-2026-11-02-v2", kind: "plan", date: "2026-11-02", blocks: [
    { t: 15 + 20/60, e: 15 + 40/60, label: "Travel · snack", cat: "Other" },
    { t: 15 + 40/60, e: 16.5, label: "Gym A (upper)", cat: "Gym", note: "Weighted pull-up aim +17.5–20 kg · dip +12.5–15 kg · incline DB press. Week A: P5 Physics runs to 15:20." },
  ]},
  { key: "rm-wp-2026-11-06-gym", kind: "plan-remove", date: "2026-11-06", target: "wp-2026-11-06",
    labels: ["Gym skills (no legs)"] },
  { key: "wp-2026-11-06-v2", kind: "plan", date: "2026-11-06", blocks: [
    { t: 14 + 40/60, e: 15.5, label: "Gym skills (no legs)", cat: "Gym", note: "Week A Friday ends 14:20 (P5 free). Weighted muscle-ups first, front lever tucks, handstand holds, pull-up + dip sets, L-sit, prehab." },
  ]},
  // --- appended 2026-11-02 · To Do split into Big picture + Daily (Dan, 2 Nov) ---------------
  // "It's clouded with small random things." Rows reality has moved past are retracted (ESAT, UCAS,
  // Higgs, half-term days, duplicates); the five interview-prep rows fold into one Big item, since the
  // detail lives in Cambridge Interview Prep.md and the Week Plan blocks. Everything else is filed.
  { key: "rm2-td-ucas-ref", kind: "todo-remove", target: "td-ucas-ref" },
  { key: "rm2-td-esat-diag", kind: "todo-remove", target: "td-esat-diag" },
  { key: "rm2-td-esat-plan", kind: "todo-remove", target: "td-esat-plan" },
  { key: "rm2-td-teachers", kind: "todo-remove", target: "td-teachers" },
  { key: "rm2-td-football", kind: "todo-remove", target: "td-football" },
  { key: "rm2-td-terms", kind: "todo-remove", target: "td-terms" },
  { key: "rm2-td-ps", kind: "todo-remove", target: "td-ps" },
  { key: "rm2-td-higgs", kind: "todo-remove", target: "td-higgs" },
  { key: "rm2-td-isla", kind: "todo-remove", target: "td-isla" },
  { key: "rm2-td-ucas-submit", kind: "todo-remove", target: "td-ucas-submit" },
  { key: "rm2-td-higgs-s3", kind: "todo-remove", target: "td-higgs-s3" },
  { key: "rm2-td-gym-tracking", kind: "todo-remove", target: "td-gym-tracking" },
  { key: "rm2-td-alarm-clock", kind: "todo-remove", target: "td-alarm-clock" },
  { key: "rm2-td-isa", kind: "todo-remove", target: "td-isa" },
  { key: "rm2-td-stamford-site-ht", kind: "todo-remove", target: "td-stamford-site-ht" },
  { key: "rm2-td-six-easy-pieces", kind: "todo-remove", target: "td-six-easy-pieces" },
  { key: "rm2-td-higgs-outloud", kind: "todo-remove", target: "td-higgs-outloud" },
  { key: "rm2-td-natsci-partia", kind: "todo-remove", target: "td-natsci-partia" },
  { key: "rm2-td-why-natsci-rehearse", kind: "todo-remove", target: "td-why-natsci-rehearse" },
  { key: "rm2-td-think-aloud", kind: "todo-remove", target: "td-think-aloud" },
  { key: "rm2-td-theory-breaks", kind: "todo-remove", target: "td-theory-breaks" },
  { key: "rm2-td-gym-redesign-ht", kind: "todo-remove", target: "td-gym-redesign-ht" },
  { key: "rm2-td-problems-mon", kind: "todo-remove", target: "td-problems-mon" },
  { key: "rm2-td-problems-tue", kind: "todo-remove", target: "td-problems-tue" },
  { key: "rm2-td-problems-thu", kind: "todo-remove", target: "td-problems-thu" },
  { key: "rm2-td-hyrox-prep-tue", kind: "todo-remove", target: "td-hyrox-prep-tue" },
  { key: "rm2-td-formet-cap", kind: "todo-remove", target: "td-formet-cap" },
  { key: "rm2-td-dips-test-29oct", kind: "todo-remove", target: "td-dips-test-29oct" },
  { key: "rm2-td-practice-mock-fri-1700", kind: "todo-remove", target: "td-practice-mock-fri-1700" },
  { key: "rm2-td-stamford-asks", kind: "todo-remove", target: "td-stamford-asks" },
  { key: "big-td-mock-dates", kind: "todo-list", target: "td-mock-dates", list: "big" },
  { key: "big-td-six-easy-pieces-ht", kind: "todo-list", target: "td-six-easy-pieces-ht", list: "big" },
  { key: "big-td-isa-date", kind: "todo-list", target: "td-isa-date", list: "big" },
  { key: "big-td-stamford", kind: "todo-list", target: "td-stamford", list: "big" },
  { key: "big-td-peaks", kind: "todo-list", target: "td-peaks", list: "big" },
  { key: "big-td-ey-decline", kind: "todo-list", target: "td-ey-decline", list: "big" },
  { key: "big-td-apikey", kind: "todo-list", target: "td-apikey", list: "big" },
  { key: "td-big-interview", kind: "todo", list: "big", star: true,
    text: "Cambridge interview (4–18 Dec): daily unseen problems out loud, Higgs/Z unaided in 5 min, Part IA choice, why NatSci" },
  { key: "td-big-dofe", kind: "todo", list: "big",
    text: "DofE Gold: finish the award (tell Claude what is left to sign off)" },
  { key: "td-big-gym", kind: "todo", list: "big",
    text: "Gym routine: run it 4 weeks, log every set, review ~26 Nov (Gym routine page)" },
  // --- appended 2026-11-02 · Big items reworded from Dan's answers ---------------------------
  // "I mean optimising the gym routine that I have so it works best for me." / DofE: "I need to
  // sort out the admin of submitting everything."
  { key: "rm-td-big-gym", kind: "todo-remove", target: "td-big-gym" },
  { key: "td-big-gym-optimise", kind: "todo", list: "big",
    text: "Optimise the gym routine so it works best for you: log every set, then tune exercises, volume and days with Claude" },
  { key: "rm-td-big-dofe", kind: "todo-remove", target: "td-big-dofe" },
  { key: "td-big-dofe-admin", kind: "todo", list: "big",
    text: "DofE Gold admin: get every section signed off and submitted on eDofE (evidence, assessor reports)" },
  // --- appended 2026-11-04 · habit check-in, backlog 30 Oct – 3 Nov (at Dad's) ----------
  // Dan: "Sunday and Friday were BS days… Friday was probably like a zero. Saturday was probably
  // like a 4" (football game most of the day), "Sunday… like a 2". Friday's 0 can't be stored
  // on a 1–10 scale, so it carries the BS flag only.
  { key: "hl-2026-10-30", kind: "habitLog", date: "2026-10-30", bad: { bs: true }, habits: {} },
  { key: "hl-2026-10-31", kind: "habitLog", date: "2026-10-31", rating: 4, habits: { exercise: true } },
  { key: "hl-2026-11-01", kind: "habitLog", date: "2026-11-01", rating: 2, bad: { bs: true }, habits: {} },
  // Mon 2: Gym A, watched Rocky (~2h screen), decent dinner but junk snacking after — Eat Well
  // left unticked for the snacking. "About 7.5."
  { key: "hl-2026-11-02", kind: "habitLog", date: "2026-11-02", rating: 7.5,
    habits: { exercise: true, screen: true } },
  // Tue 3: football 20–21, little screen, bed 23:00 (Garmin 82, 7h45, up 07:15). "8 out of 10."
  { key: "hl-2026-11-03", kind: "habitLog", date: "2026-11-03", rating: 8, habits: { screen: true } },
  { key: "wo-2026-11-03-football", kind: "workout", date: "2026-11-03", t: 20, e: 21, cat: "Sport",
    label: "Football", note: "From the habit check-in." },
  // --- appended 2026-11-05 · to-do review with Dan ------------------------------------------
  // Dan kept: interview, Six Easy Pieces, gym optimise, DofE admin, Stamford site, mock debrief,
  // shopping run (halfway), rosacea GP, Garmin. Everything else shipped here is off his list.
  { key: "rm3-td-mock-dates", kind: "todo-remove", target: "td-mock-dates" },
  { key: "rm3-td-isa-date", kind: "todo-remove", target: "td-isa-date" },
  { key: "rm3-td-apikey", kind: "todo-remove", target: "td-apikey" },
  { key: "rm3-td-peaks", kind: "todo-remove", target: "td-peaks" },
  { key: "rm3-td-ey-decline", kind: "todo-remove", target: "td-ey-decline" },   // decline window stays on Calendar
  { key: "rm3-td-run-close", kind: "todo-remove", target: "td-run-close" },
  // GitHub token: "don't bring it up until two weeks before" — off the list, onto the Month tab.
  { key: "rm3-td-gh-token-renew", kind: "todo-remove", target: "td-gh-token-renew" },
  { key: "ev-gh-token-renew-2027", kind: "event", date: "2027-09-16",
    text: "Renew GitHub token for Obsidian Git (expires 30 Sep) — classic token, repo scope" },
  // --- appended 2026-11-05 · LinkedIn backlog (vault: Personal/wiki/LinkedIn Posts.md) -------
  { key: "td-linkedin-posts", kind: "todo", list: "big",
    text: "LinkedIn posts: 100-miler (owed since Sep), HYROX, Higgs project, EY offer, Trafford sports mela" },
  // --- appended 2026-11-08 · Sunday planner: week of Mon 9 Nov (Week B) ---------------------
  // Vault: Personal/wiki/Week Plan.md. Interview blocks target Mock 1's gap (potential-energy curve,
  // intermolecular forces); gym blocks sized to routine v8 (A ~80, B ~85, Fri ~50 min); pool + sauna on
  // rest days; weekend mornings anchored early (the last two Dad's weekends became BS days).
  { key: "wp-2026-11-09", kind: "plan", date: "2026-11-09", blocks: [
    { t: 7, e: 7.25, label: "Morning: handstand + stretch + sets", cat: "Other" },
    { t: 7.25, e: 8.25, label: "Breakfast · leave for school", cat: "Other" },
    { t: 14 + 20/60, e: 15, label: "Travel · snack", cat: "Other", note: "Week B Monday: P5 free, school ends 14:20." },
    { t: 15, e: 16 + 20/60, label: "Gym A (upper)", cat: "Gym", note: "~80 min incl. warm-up (routine v8). Log every set — the optimisation runs on those numbers." },
    { t: 17, e: 18, label: "Interview problems — out loud", cat: "Revision", note: "Mock 1 follow-up: U″ at the minimum is the effective spring constant → bond vibration frequency. Sketch, derive, say it aloud; record one." },
    { t: 18, e: 19, label: "Dinner", cat: "Other" },
    { t: 19, e: 20, label: "A-level homework", cat: "Revision", note: "Whatever is due first." },
    { t: 22, e: 22.5, label: "Wind-down · phone out of the room", cat: "Other", note: "Bed 22:30." },
  ]},
  { key: "wp-2026-11-10", kind: "plan", date: "2026-11-10", blocks: [
    { t: 7, e: 7.25, label: "Morning: front lever + stretch + sets", cat: "Other" },
    { t: 7.25, e: 8.25, label: "Breakfast · leave for school", cat: "Other" },
    { t: 15, e: 16.5, label: "Interview problems + A-level homework", cat: "Revision", note: "45 min: one-page primer on intermolecular forces (London/Van der Waals, dipole–dipole, hydrogen bonding), then explain it aloud — the gap Mock 1 found. Then 45 min homework." },
    { t: 16.75, e: 17.5, label: "Pool + sauna", cat: "Sport", note: "Rest-day recovery — the routine moved pool + sauna off gym days. Optional." },
    { t: 17.75, e: 18.5, label: "Dinner (early, before football)", cat: "Other" },
    { t: 20, e: 21, label: "6-a-side · Tom", cat: "Sport" },
    { t: 22, e: 22.5, label: "Wind-down · phone out of the room", cat: "Other", note: "Bed 22:30." },
  ]},
  { key: "wp-2026-11-11", kind: "plan", date: "2026-11-11", blocks: [
    { t: 7, e: 7.25, label: "Morning: handstand + stretch + sets", cat: "Other" },
    { t: 7.25, e: 8.25, label: "Breakfast · leave for school", cat: "Other" },
    { t: 15 + 20/60, e: 15.75, label: "Travel · snack", cat: "Other", note: "Games is P5, school ends 15:20." },
    { t: 15.75, e: 17.25, label: "Gym B (legs heavier)", cat: "Gym", note: "~85 min incl. warm-up. Games was P5 — keep the squat honest, not heroic. Log every set." },
    { t: 17.5, e: 18.25, label: "Dinner", cat: "Other" },
    { t: 18.5, e: 19.5, label: "Interview problems — out loud", cat: "Revision", note: "Asymmetric well → thermal expansion: explain unprompted why the average separation grows with temperature. This was the follow-up Mock 1 left on the table." },
    { t: 19.5, e: 20.25, label: "A-level homework", cat: "Revision", note: "45 min. P3 is free today too — do the rest there." },
    { t: 22, e: 22.5, label: "Wind-down · phone out of the room", cat: "Other", note: "Bed 22:30." },
  ]},
  { key: "wp-2026-11-12", kind: "plan", date: "2026-11-12", blocks: [
    { t: 7, e: 7.25, label: "Morning: front lever + stretch + sets", cat: "Other" },
    { t: 7.25, e: 8.5, label: "Breakfast · leave for school", cat: "Other" },
    { t: 15, e: 16.5, label: "Interview problems + A-level homework", cat: "Revision", note: "Primer: bonding (ionic, covalent, metallic) + bond energy vs kT → why things melt and boil. Explain aloud, then homework." },
    { t: 18, e: 19, label: "Dinner", cat: "Other" },
    { t: 21, e: 22, label: "Football training", cat: "Sport", note: "Home ~22:20 — bed ~23:00 tonight." },
    { t: 22.5, e: 23, label: "Wind-down · bed", cat: "Other" },
  ]},
  { key: "wp-2026-11-13", kind: "plan", date: "2026-11-13", blocks: [
    { t: 7, e: 7.25, label: "Morning: handstand + stretch + sets", cat: "Other" },
    { t: 7.25, e: 8.25, label: "Breakfast · leave for school", cat: "Other" },
    { t: 15 + 20/60, e: 15 + 40/60, label: "Travel · snack", cat: "Other", note: "School ends 15:20 (P5 Economics)." },
    { t: 15 + 40/60, e: 16.5, label: "Gym skills (no legs)", cat: "Gym", note: "~50 min. Weighted pull-up + dip day (routine v7). No legs before Saturday." },
    { t: 17, e: 17.75, label: "Interview problems — out loud", cat: "Revision", note: "Mock-style: sketch one unseen function, find its features, say what physics it could be. Record it and listen back." },
    { t: 18.5, e: 19.5, label: "Dinner", cat: "Other" },
    { t: 22, e: 22.5, label: "Wind-down · phone out of the room", cat: "Other", note: "Bed 22:30." },
  ]},
  { key: "wp-2026-11-14", kind: "plan", date: "2026-11-14", blocks: [
    { t: 8.75, e: 9, label: "Stretch", cat: "Other", note: "Up ~08:30 (assumed)." },
    { t: 10, e: 11.5, label: "Interview problems + A-level catch-up", cat: "Revision", note: "Out the door by 09:45 — the last two weekends at Dad's slid into BS days. Topic: Lennard-Jones 6–12, why the attraction goes as r⁻⁶ (induced dipoles). Library if Dad's is loud." },
    { t: 12, e: 12.75, label: "Lunch (carbs)", cat: "Other" },
    { t: 14, e: 16, label: "Football match", cat: "Sport", note: "Club or school — time assumed 14:00." },
    { t: 22.5, e: 23, label: "Wind-down", cat: "Other" },
  ]},
  { key: "wp-2026-11-15", kind: "plan", date: "2026-11-15", blocks: [
    { t: 9, e: 9.25, label: "Stretch", cat: "Other" },
    { t: 10, e: 10 + 20/60, label: "Answer the planner's questions", cat: "Other", note: "In the Planning and Calendar chat — next week is built from the answers." },
    { t: 10.5, e: 12, label: "Interview problems + A-level", cat: "Revision", note: "Listen back to the week's recordings; name the weakest answer — that's next week's target." },
    { t: 13, e: 14, label: "Pool + sauna", cat: "Sport", note: "Rest day." },
    { t: 18, e: 18.5, label: "School-week setup", cat: "Other", note: "Bag, kit, gym clothes for Mon + Wed." },
    { t: 22, e: 22.5, label: "Wind-down · phone out of the room", cat: "Other", note: "Bed 22:30." },
  ]},
  // --- appended 2026-11-09 · habit check-in, scores only (detail to follow from Dan) ---
  { key: "hl-2026-11-04", kind: "habitLog", date: "2026-11-04", rating: 6.5, habits: {} },
  { key: "hl-2026-11-05", kind: "habitLog", date: "2026-11-05", rating: 8, habits: {} },
  { key: "hl-2026-11-06", kind: "habitLog", date: "2026-11-06", rating: 8, habits: {} },
  { key: "hl-2026-11-07", kind: "habitLog", date: "2026-11-07", rating: 6.5, habits: {} },
  { key: "hl-2026-11-08", kind: "habitLog", date: "2026-11-08", rating: 8.5, habits: {} },
  // --- appended 2026-11-09 · Utsav Charity Run (ADS × Trafford Hindu Society) ---------------
  // Sun 15 Nov 14:00, Stamford Park, 11,048 m. Sunday re-planned: the 13:00 pool slot gives way.
  { key: "ev-utsav-run-15nov", kind: "event", date: "2026-11-15",
    text: "🏃 Utsav Charity Run — Stamford Park, 14:00 (11,048 m). Dan organising" },
  { key: "kd-utsav-run", kind: "keyDate", name: "Utsav run", date: "2026-11-15" },
  { key: "td-utsav-reels-riyan", kind: "todo", due: "2026-11-10", star: true,
    text: "Film Utsav run promo reels with Riyan" },
  { key: "td-utsav-park-check", kind: "todo", due: "2026-11-11",
    text: "Utsav run: confirm meeting point + postcode, and check whether the park needs booking" },
  { key: "rm-wp-2026-11-15", kind: "plan-remove", date: "2026-11-15", target: "wp-2026-11-15" },
  { key: "wp-2026-11-15-v2", kind: "plan", date: "2026-11-15", blocks: [
    { t: 9, e: 9.25, label: "Stretch", cat: "Other" },
    { t: 10, e: 10 + 20/60, label: "Answer the planner's questions", cat: "Other", note: "In the Planning and Calendar chat." },
    { t: 10.5, e: 12, label: "Interview problems + A-level", cat: "Revision", note: "Listen back to the week's recordings; name the weakest answer." },
    { t: 12, e: 12.75, label: "Lunch (carbs)", cat: "Other" },
    { t: 13, e: 14, label: "Utsav run set-up · Stamford Park", cat: "Other", note: "Organiser: meeting point, first-aid kit, JustGiving QR." },
    { t: 14, e: 16, label: "Utsav Charity Run · 11,048 m", cat: "Sport", note: "End time assumed (~2h incl. walkers)." },
    { t: 18, e: 18.5, label: "School-week setup", cat: "Other", note: "Bag, kit, gym clothes for Mon + Wed." },
    { t: 22, e: 22.5, label: "Wind-down · phone out of the room", cat: "Other", note: "Bed 22:30." },
  ]},
  // --- appended 2026-11-10 · Utsav show date (Dan: "Utsav is on the 27th") ----------------
  { key: "ev-utsav-show-27nov", kind: "event", date: "2026-11-27",
    text: "🪔 Utsav: Trafford Hindu Society show (announce run total)" },
  { key: "td-utsav-headcount-post", kind: "todo", due: "2026-11-12",
    text: "Utsav run: post the 'X people signed up' headcount (numbers from Riyan's form)" },
  // --- appended 2026-11-10 · Dan's answers (9 Nov): school game Sat MORNING; Sunday games too ----------
  // Times not given — assumed and marked. Sunday games "will probably be more regular" from now.
  { key: "rm-wp-2026-11-14-v1", kind: "plan-remove", date: "2026-11-14", target: "wp-2026-11-14",
    labels: ["Interview problems + A-level catch-up", "Lunch (carbs)", "Football match"] },
  { key: "wp-2026-11-14-v2", kind: "plan", date: "2026-11-14", blocks: [
    { t: 9.5, e: 12, label: "School football match", cat: "Sport", note: "Morning game (Dan, 9 Nov) — kick-off time assumed ~10:00; tell the planner the real one." },
    { t: 12.5, e: 13.25, label: "Lunch", cat: "Other" },
    { t: 14, e: 15.5, label: "Interview problems + A-level catch-up", cat: "Revision", note: "Moved to the afternoon for the match. Topic: Lennard-Jones 6–12, why the attraction goes as r⁻⁶ (induced dipoles)." },
  ]},
  { key: "rm-wp-2026-11-15-v1", kind: "plan-remove", date: "2026-11-15", target: "wp-2026-11-15",
    labels: ["Answer the planner's questions", "Interview problems + A-level", "Pool + sauna"] },
  // --- appended 2026-11-10 · Sun 15 Nov re-planned around the Utsav run (Dan organising, 14:00) -------
  // v2 had assumed a Sunday match; with the run that day, no match is planned this Sunday.
  { key: "rm-wp-2026-11-15-v2", kind: "plan-remove", date: "2026-11-15", target: "wp-2026-11-15-v2" },
  { key: "wp-2026-11-15-v3", kind: "plan", date: "2026-11-15", blocks: [
    { t: 9.5, e: 9.84, label: "Answer the planner's questions", cat: "Other", note: "In the Planning and Calendar chat." },
    { t: 10.5, e: 12, label: "Interview problems + A-level", cat: "Revision", note: "Listen back to the week's recordings; name the weakest answer — that's next week's target." },
    { t: 12, e: 12.75, label: "Lunch", cat: "Other" },
    { t: 13, e: 14, label: "Stamford Park set-up", cat: "Work", note: "Utsav Charity Run — you're organising. Meeting point + postcode: see the ADS page." },
    { t: 14, e: 16, label: "Utsav Charity Run (11,048 m)", cat: "Sport", note: "ADS × Trafford Hindu Society. One metre per £1 Utsav raised last year. Pack-down included." },
  ]},
  // --- appended 2026-11-10 · Dan: no football Tue/Thu this week; real kick-off times; travel ---------
  // "I'm not doing football training this week on Tuesday or Thursday... I've definitely got some extra
  // space to lock in more on interviews." Sat: meet 12:30, kick-off 14:00. Sun: meet 09:15, kick-off 10:00.
  { key: "rm-wp-2026-11-10-fb", kind: "plan-remove", date: "2026-11-10", target: "wp-2026-11-10",
    labels: ["6-a-side · Tom", "Dinner (early, before football)"] },
  { key: "wp-2026-11-10-v2", kind: "plan", date: "2026-11-10", blocks: [
    { t: 18, e: 18.75, label: "Dinner", cat: "Other" },
    { t: 19.5, e: 20.5, label: "Interview problems — out loud", cat: "Revision", note: "Extra block — no 6-a-side this week. Mock-style: one unseen problem, talk the whole way, record it." },
  ]},
  { key: "rm-wp-2026-11-12-fb", kind: "plan-remove", date: "2026-11-12", target: "wp-2026-11-12",
    labels: ["Football training", "Wind-down · bed"] },
  { key: "wp-2026-11-12-v2", kind: "plan", date: "2026-11-12", blocks: [
    { t: 19.5, e: 20.5, label: "Interview problems — out loud", cat: "Revision", note: "Extra block — no training this week. Explain the Lennard-Jones curve start to finish, unprompted: shape, minimum, force, spring constant, thermal expansion." },
    { t: 22, e: 22.5, label: "Wind-down · phone out of the room", cat: "Other", note: "Bed 22:30 — no late training tonight." },
  ]},
  { key: "rm-wp-2026-11-14-v2", kind: "plan-remove", date: "2026-11-14", target: "wp-2026-11-14-v2" },
  { key: "wp-2026-11-14-v3", kind: "plan", date: "2026-11-14", blocks: [
    { t: 10, e: 11.5, label: "Interview problems + A-level catch-up", cat: "Revision", note: "Topic: Lennard-Jones 6–12, why the attraction goes as r⁻⁶ (induced dipoles)." },
    { t: 11.75, e: 12.25, label: "Lunch (carbs)", cat: "Other" },
    { t: 12.5, e: 16, label: "School football match", cat: "Sport", note: "Meet 12:30, kick-off 14:00 (Dan, 10 Nov)." },
  ]},
  { key: "rm-wp-2026-11-15-am", kind: "plan-remove", date: "2026-11-15", target: "wp-2026-11-15-v3",
    labels: ["Answer the planner's questions", "Interview problems + A-level", "Lunch"] },
  { key: "rm-wp-2026-11-15-stretch", kind: "plan-remove", date: "2026-11-15", target: "wp-2026-11-15", labels: ["Stretch"] },
  { key: "wp-2026-11-15-v4", kind: "plan", date: "2026-11-15", blocks: [
    { t: 8.5, e: 8.75, label: "Stretch", cat: "Other" },
    { t: 9.25, e: 11.75, label: "Sunday football match", cat: "Sport", note: "Meet 09:15, kick-off 10:00 (Dan, 10 Nov)." },
    { t: 12, e: 12.75, label: "Lunch + answer the planner's questions", cat: "Other", note: "In the Planning and Calendar chat — 10 minutes." },
    { t: 16.5, e: 17.5, label: "Interview recordings review", cat: "Revision", note: "Listen back to the week's recordings; name the weakest answer — that's next week's target." },
  ]},
  // --- appended 2026-11-10 · fix: key clash on Sun 15 ----------------------------------------------
  // Two sessions both wrote "wp-2026-11-15-v2" (the Utsav session's applied; the planner's never did and
  // is removed). The planner's rm-wp-2026-11-15-v2 then also cleared the Utsav session's evening blocks.
  // Put those back. Rule for re-plans: grep for the key before appending.
  { key: "wp-2026-11-15-v5", kind: "plan", date: "2026-11-15", blocks: [
    { t: 18, e: 18.5, label: "School-week setup", cat: "Other", note: "Bag, kit, gym clothes for Mon + Wed." },
    { t: 22, e: 22.5, label: "Wind-down · phone out of the room", cat: "Other", note: "Bed 22:30." },
  ]},
  // --- appended 2026-11-12 · Ironman 2027 entry decision (vault: ADS/wiki/Ironman 2027.md) ---
  { key: "td-ironman-entry-decision", kind: "todo", due: "2026-11-18", star: true, list: "big",
    text: "Ironman 2027: decide Leeds (15 Aug) vs Vichy (22 Aug) with Ian + Varish — Leeds Flex90 entry ends 18 Nov, Vichy 25 Nov" },
  // --- appended 2026-11-12 · gym chat: Dan asked for the gym setup on his to-do list ----------
  { key: "td-gym-app-setup-12nov", kind: "todo", due: "2026-11-12", star: true,
    text: "Set up the gym tracking app and enter Gym A, Gym B and Skills" },
  { key: "td-gym-specifics-chat", kind: "todo", due: "2026-11-15",
    text: "Gym chat with Claude: specifics (Y raise, Tuesday sessions, missing numbers)" },
  { key: "td-gym-review-26nov", kind: "todo", due: "2026-11-26",
    text: "Gym routine 4-week review with Claude: send app screenshots first" },
  // --- appended 2026-11-12 · Ironman to-do: "Ian" was dictation for Ayaan ---
  { key: "rm-td-ironman-entry-decision", kind: "todo-remove", target: "td-ironman-entry-decision" },
  { key: "td-ironman-entry-decision-v2", kind: "todo", due: "2026-11-18", star: true, list: "big",
    text: "Ironman 2027 (ADS): decide Leeds (15 Aug) vs Vichy (22 Aug) with Ayaan + Varish — Leeds Flex90 entry ends 18 Nov, Vichy 25 Nov" },
  // --- appended 2026-11-12 · gym chat: exercise ticks (times not given, so no timeline blocks) ---
  // Tue 10 Nov back + biceps at PureGym with Aryaman and Rory · Wed 11 Nov Gym B · Thu 12 Nov 1 km swim.
  { key: "hl-ex-2026-11-10-gymchat", kind: "habitLog", date: "2026-11-10", habits: { exercise: true } },
  { key: "hl-ex-2026-11-11-gymchat", kind: "habitLog", date: "2026-11-11", habits: { exercise: true } },
  { key: "hl-ex-2026-11-12-gymchat", kind: "habitLog", date: "2026-11-12", habits: { exercise: true } },
  // --- appended 2026-11-12 · IRONMAN Leeds chosen (vault: ADS/wiki/Ironman 2027.md) ---
  { key: "ev-ironman-leeds-2027", kind: "event", date: "2027-08-15", text: "IRONMAN Leeds — full distance, Roundhay Park (Dan, Ayaan, Varish)" },
  { key: "kd-ironman-leeds-2027", kind: "keyDate", name: "Ironman Leeds", date: "2027-08-15" },
  { key: "rm-td-ironman-entry-decision-v2", kind: "todo-remove", target: "td-ironman-entry-decision-v2" },
  { key: "td-ironman-leeds-enter", kind: "todo", due: "2026-11-18", star: true, list: "big",
    text: "Enter IRONMAN Leeds (£752.64) — Dan, Ayaan + Varish all by Wed 18 Nov for Flex90" },
  { key: "td-ironman-swim-lessons", kind: "todo", due: "2026-11-30", list: "big",
    text: "Ironman: book front-crawl lessons / masters swim squad — 3 swims a week from December" },
  // --- appended 2026-11-12 · this morning's swim; Thursday 07:30 swim is now a regular slot ----
  { key: "wo-2026-11-12-swim", kind: "workout", date: "2026-11-12", t: 7.5, e: 8.5, cat: "Sport",
    label: "Swim 1 km", note: "Late school start. Now a regular Thursday slot (Google Calendar, from 19 Nov)." },
  // --- appended 2026-11-12 · monthly Garmin export (recurring in Google Calendar on the 12th) ---
  { key: "td-garmin-export-12nov", kind: "todo", due: "2026-11-14",
    text: "Garmin export (requested 12 Nov): when the email lands, upload the file to the Gym routine chat" },
  { key: "td-garmin-export-12dec", kind: "todo", due: "2026-12-12",
    text: "Monthly Garmin data export (last 30 days) → send to Claude with Hevy screenshots" },
  // --- appended 2026-11-12 · habit check-in, scores only ---
  { key: "hl-2026-11-09", kind: "habitLog", date: "2026-11-09", rating: 7.5, habits: {} },
  { key: "hl-2026-11-10", kind: "habitLog", date: "2026-11-10", rating: 7.5, habits: {} },
  { key: "hl-2026-11-11", kind: "habitLog", date: "2026-11-11", rating: 7, habits: {} },
  // --- appended 2026-11-12 · first Garmin export (vault: Personal/wiki/Garmin Data.md) ----------
  // Real sleep from 19 Oct (the start of app tracking) replaces the 8h assumption. `date` = wake date.
  // No bed ticks added: not one night since 19 Oct was he asleep by 22:30 (earliest 23:04).
  { key: "sl-2026-10-20", kind: "sleep", date: "2026-10-20", bed: "23:04", wake: "06:13", hours: 5.83, score: 58 },
  { key: "sl-2026-10-21", kind: "sleep", date: "2026-10-21", bed: "23:24", wake: "07:10", hours: 7.53, score: 80 },
  { key: "sl-2026-10-22", kind: "sleep", date: "2026-10-22", bed: "01:31", wake: "08:00", hours: 6.2, score: 58 },
  { key: "sl-2026-10-23", kind: "sleep", date: "2026-10-23", bed: "01:56", wake: "08:26", hours: 6.0, score: 49 },
  { key: "sl-2026-10-24", kind: "sleep", date: "2026-10-24", bed: "02:04", wake: "09:57", hours: 6.37, score: 44 },
  { key: "sl-2026-10-25", kind: "sleep", date: "2026-10-25", bed: "01:40", wake: "11:53", hours: 9.5, score: 69 },
  { key: "sl-2026-10-26", kind: "sleep", date: "2026-10-26", bed: "01:59", wake: "10:16", hours: 7.25, score: 54 },
  { key: "sl-2026-10-27", kind: "sleep", date: "2026-10-27", bed: "01:36", wake: "10:16", hours: 7.85, score: 68 },
  { key: "sl-2026-10-28", kind: "sleep", date: "2026-10-28", bed: "01:07", wake: "08:15", hours: 7.12, score: 80 },
  { key: "sl-2026-10-29", kind: "sleep", date: "2026-10-29", bed: "03:48", wake: "09:34", hours: 5.65, score: 53 },
  { key: "sl-2026-10-30", kind: "sleep", date: "2026-10-30", bed: "01:56", wake: "12:15", hours: 8.87, score: 58 },
  { key: "sl-2026-10-31", kind: "sleep", date: "2026-10-31", bed: "03:03", wake: "10:10", hours: 6.5, score: 67 },
  { key: "sl-2026-11-01", kind: "sleep", date: "2026-11-01", bed: "01:48", wake: "10:46", hours: 8.88, score: 77 },
  { key: "sl-2026-11-02", kind: "sleep", date: "2026-11-02", bed: "02:59", wake: "07:06", hours: 3.97, score: 43 },
  { key: "sl-2026-11-03", kind: "sleep", date: "2026-11-03", bed: "00:41", wake: "07:24", hours: 6.6, score: 61 },
  { key: "sl-2026-11-04", kind: "sleep", date: "2026-11-04", bed: "23:29", wake: "07:24", hours: 7.75, score: 82 },
  { key: "sl-2026-11-05", kind: "sleep", date: "2026-11-05", bed: "23:36", wake: "06:51", hours: 6.42, score: 59 },
  { key: "sl-2026-11-06", kind: "sleep", date: "2026-11-06", bed: "00:32", wake: "07:05", hours: 6.53, score: 63 },
  { key: "sl-2026-11-07", kind: "sleep", date: "2026-11-07", bed: "01:22", wake: "11:30", hours: 9.5, score: 81 },
  { key: "sl-2026-11-08", kind: "sleep", date: "2026-11-08", bed: "01:17", wake: "08:52", hours: 7.38, score: 74 },
  // Sessions already logged with guessed times → Garmin's real times (matched by label).
  { key: "we-g-2026-10-19-swim", kind: "workout-edit", date: "2026-10-19", label: "Swim + sauna", t: 17.03, e: 17.32, note: "Garmin: 875 m, 17:02–17:19. Sauna not recorded." },
  { key: "we-g-2026-10-21-swim", kind: "workout-edit", date: "2026-10-21", label: "Swim · Total Fitness", t: 18.25, e: 18.35, note: "Garmin: 250 m, 18:15–18:21." },
  { key: "we-g-2026-10-24-hyrox", kind: "workout-edit", date: "2026-10-24", label: "Mock HYROX", t: 12.45, e: 14.17, note: "Garmin: 12:27–14:10, 103 min, avg HR 149." },
  { key: "we-g-2026-10-26-hyrox", kind: "workout-edit", date: "2026-10-26", label: "HYROX session (easy) · with Ian", t: 12.15, e: 13.33, note: "With Ayaan. Garmin: 12:09–13:20, avg HR 123." },
  { key: "we-g-2026-10-26-swim", kind: "workout-edit", date: "2026-10-26", label: "Swim", t: 13.75, e: 13.95, note: "Garmin: 300 m, 13:45–13:58." },
  { key: "we-g-2026-10-26-sauna", kind: "workout-edit", date: "2026-10-26", label: "Sauna", t: 13.95, e: 14.3, note: "After the swim. Time approximate." },
  { key: "we-g-2026-10-28-hyrox", kind: "workout-edit", date: "2026-10-28", label: "HYROX doubles · Birmingham", t: 13.17, e: 14.52, note: "Garmin: 13:10–14:31, avg HR 168. Official finish 1:17:00." },
  { key: "we-g-2026-11-03-football", kind: "workout-edit", date: "2026-11-03", label: "Football", t: 20.08, e: 21.1, note: "Garmin: 20:05–21:06, avg HR 143." },
  { key: "we-g-2026-11-12-swim", kind: "workout-edit", date: "2026-11-12", label: "Swim 1 km", t: 7.92, e: 8.72, note: "Garmin: 1,000 m 07:55–08:20, then 250 m to 08:42. Regular Thursday slot from 19 Nov." },
  // Planned gym blocks that happened → actual times.
  { key: "we-g-2026-11-02-gym", kind: "workout-edit", date: "2026-11-02", label: "Gym A (upper)", t: 15.85, e: 17.03, note: "Garmin (logged as Cardio): 15:51–17:02." },
  { key: "we-g-2026-11-06-gym", kind: "workout-edit", date: "2026-11-06", label: "Gym skills (no legs)", t: 15.42, e: 16.27, note: "Garmin: 15:25–16:16." },
  { key: "we-g-2026-11-09-gym", kind: "workout-edit", date: "2026-11-09", label: "Gym A (upper)", t: 15, e: 16.03, note: "Garmin: 15:00–16:01." },
  // Sessions the app never had.
  { key: "wo-g-2026-10-29-swim", kind: "workout", date: "2026-10-29", t: 16.97, e: 17.07, cat: "Sport", label: "Swim 275 m", note: "Garmin, 16:58." },
  { key: "wo-g-2026-11-02-swim", kind: "workout", date: "2026-11-02", t: 17.4, e: 17.5, cat: "Sport", label: "Swim 275 m", note: "Garmin, 17:24." },
  { key: "wo-g-2026-11-06-swim", kind: "workout", date: "2026-11-06", t: 16.43, e: 16.53, cat: "Sport", label: "Swim 325 m", note: "Garmin, 16:26." },
  { key: "wo-g-2026-11-09-swim", kind: "workout", date: "2026-11-09", t: 16.63, e: 16.8, cat: "Sport", label: "Swim 350 m", note: "Garmin, 16:38." },
  { key: "wo-g-2026-11-10-gym", kind: "workout", date: "2026-11-10", t: 15.05, e: 16.42, cat: "Gym", label: "Back + biceps · PureGym", note: "With Aryaman and Rory. Garmin: 15:03–16:25." },
  // The export arrived; Garmin now reaches Claude by monthly export (Dec one stays).
  { key: "dn-td-garmin-export-12nov", kind: "todo-done", target: "td-garmin-export-12nov" },
  { key: "dn-td-garmin-connect", kind: "todo-done", target: "td-garmin-connect" },
  // --- appended 2026-11-12 · Garmin backfill to the start of the data + bed rule 23:00 (+15) ------
  // Dan: "change the bedtime requirement to 11 and give a 15 minute leeway" and fill every day the
  // export covers. Bed ticked when Garmin has him asleep by 23:15 (night of = the evening's date).
  // Summer holiday tinted off so the old days don't open with school lessons on them.
  { key: "hol-summer-2026", kind: "holiday", type: "off", start: "2026-07-18", end: "2026-09-06", label: "Summer holidays" },
  // Real sleep, 6 Aug → 19 Oct (20 Oct onward shipped earlier today).
  { key: "sl-2026-08-06", kind: "sleep", date: "2026-08-06", bed: "01:54", wake: "11:59", hours: 7.95, score: 48 },
  { key: "sl-2026-08-07", kind: "sleep", date: "2026-08-07", bed: "02:53", wake: "10:35", hours: 6.57, score: 44 },
  { key: "sl-2026-08-08", kind: "sleep", date: "2026-08-08", bed: "01:36", wake: "11:13", hours: 9.05, score: 80 },
  { key: "sl-2026-08-09", kind: "sleep", date: "2026-08-09", bed: "02:10", wake: "06:14", hours: 3.97, score: 45 },
  { key: "sl-2026-08-10", kind: "sleep", date: "2026-08-10", bed: "00:50", wake: "10:52", hours: 9.0, score: 76 },
  { key: "sl-2026-08-11", kind: "sleep", date: "2026-08-11", bed: "02:11", wake: "09:12", hours: 6.48, score: 64 },
  { key: "sl-2026-08-12", kind: "sleep", date: "2026-08-12", bed: "00:36", wake: "08:33", hours: 7.07, score: 50 },
  { key: "sl-2026-08-13", kind: "sleep", date: "2026-08-13", bed: "01:02", wake: "08:36", hours: 6.48, score: 48 },
  { key: "sl-2026-08-14", kind: "sleep", date: "2026-08-14", bed: "01:50", wake: "10:04", hours: 5.38, score: 38 },
  { key: "sl-2026-08-15", kind: "sleep", date: "2026-08-15", bed: "01:54", wake: "06:39", hours: 4.72, score: 55 },
  { key: "sl-2026-08-16", kind: "sleep", date: "2026-08-16", bed: "01:50", wake: "07:53", hours: 3.78, score: 40 },
  { key: "sl-2026-08-17", kind: "sleep", date: "2026-08-17", bed: "01:52", wake: "08:48", hours: 6.22, score: 65 },
  { key: "sl-2026-08-18", kind: "sleep", date: "2026-08-18", bed: "01:15", wake: "06:04", hours: 4.75, score: 61 },
  { key: "sl-2026-08-19", kind: "sleep", date: "2026-08-19", bed: "23:50", wake: "08:42", hours: 7.72, score: 71 },
  { key: "sl-2026-08-20", kind: "sleep", date: "2026-08-20", bed: "23:59", wake: "10:23", hours: 8.27, score: 51 },
  { key: "sl-2026-08-21", kind: "sleep", date: "2026-08-21", bed: "00:26", wake: "07:46", hours: 7.3, score: 72 },
  { key: "sl-2026-08-23", kind: "sleep", date: "2026-08-23", bed: "00:32", wake: "07:58", hours: 6.88, score: 54 },
  { key: "sl-2026-08-24", kind: "sleep", date: "2026-08-24", bed: "01:07", wake: "09:14", hours: 7.23, score: 63 },
  { key: "sl-2026-08-25", kind: "sleep", date: "2026-08-25", bed: "00:25", wake: "09:15", hours: 8.72, score: 86 },
  { key: "sl-2026-08-26", kind: "sleep", date: "2026-08-26", bed: "01:52", wake: "12:06", hours: 9.77, score: 80 },
  { key: "sl-2026-08-28", kind: "sleep", date: "2026-08-28", bed: "02:01", wake: "11:33", hours: 9.0, score: 80 },
  { key: "sl-2026-08-29", kind: "sleep", date: "2026-08-29", bed: "02:23", wake: "08:43", hours: 6.27, score: 69 },
  { key: "sl-2026-08-30", kind: "sleep", date: "2026-08-30", bed: "02:57", wake: "11:53", hours: 8.53, score: 81 },
  { key: "sl-2026-08-31", kind: "sleep", date: "2026-08-31", bed: "03:46", wake: "07:32", hours: 3.75, score: 41 },
  { key: "sl-2026-09-01", kind: "sleep", date: "2026-09-01", bed: "00:13", wake: "07:29", hours: 6.77, score: 69 },
  { key: "sl-2026-09-02", kind: "sleep", date: "2026-09-02", bed: "00:36", wake: "07:30", hours: 6.55, score: 59 },
  { key: "sl-2026-09-03", kind: "sleep", date: "2026-09-03", bed: "01:04", wake: "07:49", hours: 6.75, score: 66 },
  { key: "sl-2026-09-04", kind: "sleep", date: "2026-09-04", bed: "02:26", wake: "09:14", hours: 6.55, score: 67 },
  { key: "sl-2026-09-05", kind: "sleep", date: "2026-09-05", bed: "01:32", wake: "09:27", hours: 7.73, score: 80 },
  { key: "sl-2026-09-06", kind: "sleep", date: "2026-09-06", bed: "02:21", wake: "10:04", hours: 6.97, score: 63 },
  { key: "sl-2026-09-07", kind: "sleep", date: "2026-09-07", bed: "23:39", wake: "06:28", hours: 6.32, score: 63 },
  { key: "sl-2026-09-08", kind: "sleep", date: "2026-09-08", bed: "23:53", wake: "06:41", hours: 4.37, score: 33 },
  { key: "sl-2026-09-09", kind: "sleep", date: "2026-09-09", bed: "23:49", wake: "05:49", hours: 5.82, score: 66 },
  { key: "sl-2026-09-10", kind: "sleep", date: "2026-09-10", bed: "23:33", wake: "07:30", hours: 7.75, score: 71 },
  { key: "sl-2026-09-11", kind: "sleep", date: "2026-09-11", bed: "23:36", wake: "06:45", hours: 7.07, score: 67 },
  { key: "sl-2026-09-12", kind: "sleep", date: "2026-09-12", bed: "00:16", wake: "09:33", hours: 7.87, score: 59 },
  { key: "sl-2026-09-13", kind: "sleep", date: "2026-09-13", bed: "00:21", wake: "06:39", hours: 6.27, score: 70 },
  { key: "sl-2026-09-14", kind: "sleep", date: "2026-09-14", bed: "00:53", wake: "09:40", hours: 7.97, score: 57 },
  { key: "sl-2026-09-15", kind: "sleep", date: "2026-09-15", bed: "23:59", wake: "07:33", hours: 7.45, score: 77 },
  { key: "sl-2026-09-16", kind: "sleep", date: "2026-09-16", bed: "00:22", wake: "07:22", hours: 6.65, score: 69 },
  { key: "sl-2026-09-17", kind: "sleep", date: "2026-09-17", bed: "23:19", wake: "05:54", hours: 6.47, score: 56 },
  { key: "sl-2026-09-18", kind: "sleep", date: "2026-09-18", bed: "22:55", wake: "07:07", hours: 7.78, score: 81 },
  { key: "sl-2026-09-19", kind: "sleep", date: "2026-09-19", bed: "00:15", wake: "09:12", hours: 8.68, score: 87 },
  { key: "sl-2026-09-20", kind: "sleep", date: "2026-09-20", bed: "02:18", wake: "09:58", hours: 7.25, score: 73 },
  { key: "sl-2026-09-21", kind: "sleep", date: "2026-09-21", bed: "00:47", wake: "07:00", hours: 5.7, score: 58 },
  { key: "sl-2026-09-22", kind: "sleep", date: "2026-09-22", bed: "22:28", wake: "06:40", hours: 7.87, score: 68 },
  { key: "sl-2026-09-23", kind: "sleep", date: "2026-09-23", bed: "23:40", wake: "06:50", hours: 7.03, score: 79 },
  { key: "sl-2026-09-24", kind: "sleep", date: "2026-09-24", bed: "22:38", wake: "07:10", hours: 8.18, score: 72 },
  { key: "sl-2026-09-25", kind: "sleep", date: "2026-09-25", bed: "23:28", wake: "06:59", hours: 6.83, score: 61 },
  { key: "sl-2026-09-26", kind: "sleep", date: "2026-09-26", bed: "23:28", wake: "07:47", hours: 7.5, score: 62 },
  { key: "sl-2026-09-27", kind: "sleep", date: "2026-09-27", bed: "00:07", wake: "08:37", hours: 8.48, score: 87 },
  { key: "sl-2026-09-28", kind: "sleep", date: "2026-09-28", bed: "00:06", wake: "06:50", hours: 5.9, score: 62 },
  { key: "sl-2026-09-29", kind: "sleep", date: "2026-09-29", bed: "23:04", wake: "07:17", hours: 8.08, score: 63 },
  { key: "sl-2026-09-30", kind: "sleep", date: "2026-09-30", bed: "23:44", wake: "07:16", hours: 7.13, score: 66 },
  { key: "sl-2026-10-01", kind: "sleep", date: "2026-10-01", bed: "22:41", wake: "07:50", hours: 8.65, score: 68 },
  { key: "sl-2026-10-02", kind: "sleep", date: "2026-10-02", bed: "22:50", wake: "06:11", hours: 6.48, score: 46 },
  { key: "sl-2026-10-03", kind: "sleep", date: "2026-10-03", bed: "01:21", wake: "07:29", hours: 6.13, score: 71 },
  { key: "sl-2026-10-04", kind: "sleep", date: "2026-10-04", bed: "23:47", wake: "09:47", hours: 8.87, score: 71 },
  { key: "sl-2026-10-05", kind: "sleep", date: "2026-10-05", bed: "00:38", wake: "07:17", hours: 6.63, score: 75 },
  { key: "sl-2026-10-06", kind: "sleep", date: "2026-10-06", bed: "23:37", wake: "07:00", hours: 7.15, score: 62 },
  { key: "sl-2026-10-07", kind: "sleep", date: "2026-10-07", bed: "23:27", wake: "08:00", hours: 7.78, score: 68 },
  { key: "sl-2026-10-08", kind: "sleep", date: "2026-10-08", bed: "23:50", wake: "08:41", hours: 8.37, score: 63 },
  { key: "sl-2026-10-09", kind: "sleep", date: "2026-10-09", bed: "23:40", wake: "08:53", hours: 8.72, score: 83 },
  { key: "sl-2026-10-10", kind: "sleep", date: "2026-10-10", bed: "01:21", wake: "07:48", hours: 6.08, score: 58 },
  { key: "sl-2026-10-11", kind: "sleep", date: "2026-10-11", bed: "23:33", wake: "08:31", hours: 8.67, score: 83 },
  { key: "sl-2026-10-12", kind: "sleep", date: "2026-10-12", bed: "00:16", wake: "08:39", hours: 7.93, score: 80 },
  { key: "sl-2026-10-19", kind: "sleep", date: "2026-10-19", bed: "01:30", wake: "07:22", hours: 5.62, score: 62 },
  // Bed by 23:00 (asleep by 23:15): 7 of 87 nights.
  { key: "hl-bed23-2026-09-17", kind: "habitLog", date: "2026-09-17", habits: { bed: true } },  // asleep 22:55
  { key: "hl-bed23-2026-09-21", kind: "habitLog", date: "2026-09-21", habits: { bed: true } },  // asleep 22:28
  { key: "hl-bed23-2026-09-23", kind: "habitLog", date: "2026-09-23", habits: { bed: true } },  // asleep 22:38
  { key: "hl-bed23-2026-09-28", kind: "habitLog", date: "2026-09-28", habits: { bed: true } },  // asleep 23:04
  { key: "hl-bed23-2026-09-30", kind: "habitLog", date: "2026-09-30", habits: { bed: true } },  // asleep 22:41
  { key: "hl-bed23-2026-10-01", kind: "habitLog", date: "2026-10-01", habits: { bed: true } },  // asleep 22:50
  { key: "hl-bed23-2026-10-19", kind: "habitLog", date: "2026-10-19", habits: { bed: true } },  // asleep 23:04
  // Every workout before 19 Oct (later ones shipped earlier today). Each ticks Exercise.
  { key: "wo-g-23901745069", kind: "workout", date: "2026-08-08", t: 16.78, e: 17.3, cat: "Gym", label: "Cardio", note: "Garmin: 16:47, 31 min, avg HR 119" },
  { key: "wo-g-23941729036", kind: "workout", date: "2026-08-11", t: 9.87, e: 10.59, cat: "Gym", label: "Gym", note: "Garmin: 09:52, 43 min, avg HR 106" },
  { key: "wo-g-23941729643", kind: "workout", date: "2026-08-11", t: 10.6, e: 11.75, cat: "Sport", label: "Run 10.2 km", note: "Garmin: 10:36, 69 min, avg HR 155" },
  { key: "wo-g-23941729941", kind: "workout", date: "2026-08-11", t: 12.28, e: 12.4, cat: "Sport", label: "Swim 350 m", note: "Garmin: 12:17, 7 min, avg HR 143" },
  { key: "wo-g-23941730622", kind: "workout", date: "2026-08-11", t: 19.48, e: 20.8, cat: "Sport", label: "Basketball", note: "Garmin: 19:29, 79 min, avg HR 124" },
  { key: "wo-g-23947067834", kind: "workout", date: "2026-08-12", t: 9.87, e: 10.74, cat: "Sport", label: "Run 9.3 km", note: "Garmin: 09:52, 52 min, avg HR 158" },
  { key: "wo-g-23952120682", kind: "workout", date: "2026-08-12", t: 17.68, e: 17.81, cat: "Sport", label: "Swim 350 m", note: "Garmin: 17:41, 8 min, avg HR 104" },
  { key: "wo-g-23953064902", kind: "workout", date: "2026-08-12", t: 18.78, e: 19.05, cat: "Sport", label: "Basketball", note: "Garmin: 18:47, 16 min, avg HR 107" },
  { key: "wo-g-23966861467", kind: "workout", date: "2026-08-13", t: 19.77, e: 20.87, cat: "Sport", label: "Football", note: "Garmin: 19:46, 66 min, avg HR 141" },
  { key: "wo-g-24007818950", kind: "workout", date: "2026-08-17", t: 9.8, e: 11.05, cat: "Sport", label: "Run 9.4 km", note: "Garmin: 09:48, 75 min, avg HR 152" },
  { key: "wo-g-24008029338", kind: "workout", date: "2026-08-17", t: 11.2, e: 11.38, cat: "Sport", label: "Swim 475 m", note: "Garmin: 11:12, 11 min, avg HR 125" },
  { key: "wo-g-24012474204", kind: "workout", date: "2026-08-17", t: 16.35, e: 17.9, cat: "Sport", label: "Football", note: "Garmin: 16:21, 93 min, avg HR 110" },
  { key: "wo-g-24020035466", kind: "workout", date: "2026-08-18", t: 9.43, e: 9.93, cat: "Sport", label: "Run 5.1 km", note: "Garmin: 09:26, 30 min, avg HR 138" },
  { key: "wo-g-24028039298", kind: "workout", date: "2026-08-18", t: 20.27, e: 21.0, cat: "Sport", label: "Run 4.0 km", note: "Garmin: 20:16, 44 min, avg HR 155" },
  { key: "wo-g-24094662191", kind: "workout", date: "2026-08-21", t: 9.2, e: 12.5, cat: "Activity", label: "Walk 24.4 km", note: "101-mile challenge (ADS). Garmin: 09:12, 198 min, avg HR 134" },
  { key: "wo-g-24094667804", kind: "workout", date: "2026-08-21", t: 12.52, e: 24, cat: "Sport", label: "Run 75.4 km", note: "101-mile challenge (ADS). Garmin: 12:31, 791 min, avg HR 122. Ran on past midnight." },
  { key: "wo-g-24094667804-b", kind: "workout", date: "2026-08-22", t: 0, e: 1.7, cat: "Sport", label: "Run 75.4 km (continued)", note: "101-mile challenge (ADS). Garmin: 12:31, 791 min, avg HR 122" },
  { key: "wo-g-24094669268", kind: "workout", date: "2026-08-22", t: 5.03, e: 6.58, cat: "Activity", label: "Walk 8.2 km", note: "101-mile challenge (ADS). Garmin: 05:02, 93 min, avg HR 98" },
  { key: "wo-g-24097658443", kind: "workout", date: "2026-08-22", t: 7.03, e: 15.78, cat: "Activity", label: "Walk 43.3 km", note: "101-mile challenge (ADS). Garmin: 07:02, 525 min, avg HR 101" },
  { key: "wo-g-24097260106", kind: "workout", date: "2026-08-24", t: 14.12, e: 14.92, cat: "Gym", label: "Gym", note: "Garmin: 14:07, 48 min, avg HR 96" },
  { key: "wo-g-24097658985", kind: "workout", date: "2026-08-24", t: 15.4, e: 15.5, cat: "Sport", label: "Swim 250 m", note: "Garmin: 15:24, 6 min, avg HR 97" },
  { key: "wo-g-24188414949", kind: "workout", date: "2026-08-31", t: 19.42, e: 20.69, cat: "Activity", label: "Walk 5.6 km", note: "Garmin: 19:25, 76 min, avg HR 81" },
  { key: "wo-g-24301706694", kind: "workout", date: "2026-09-07", t: 15.23, e: 15.41, cat: "Sport", label: "Swim 475 m", note: "Garmin: 15:14, 11 min, avg HR 99" },
  { key: "wo-g-24301707424", kind: "workout", date: "2026-09-08", t: 20.13, e: 21.05, cat: "Sport", label: "Football", note: "Garmin: 20:08, 55 min, avg HR 161" },
  { key: "wo-g-24309854559", kind: "workout", date: "2026-09-10", t: 14.97, e: 15.09, cat: "Gym", label: "Gym", note: "Garmin: 14:58, 7 min, avg HR 92" },
  { key: "wo-g-24385207392", kind: "workout", date: "2026-09-16", t: 16.73, e: 16.85, cat: "Sport", label: "Swim 400 m", note: "Garmin: 16:44, 7 min, avg HR 135" },
  { key: "wo-g-24478267804", kind: "workout", date: "2026-09-23", t: 16.63, e: 16.8, cat: "Sport", label: "Swim 375 m", note: "Garmin: 16:38, 10 min, avg HR 145" },
  { key: "wo-g-24816444542", kind: "workout", date: "2026-10-03", t: 13.73, e: 13.83, cat: "Sport", label: "Swim 250 m", note: "Garmin: 13:44, 6 min, avg HR 134" },
  { key: "wo-g-24816445062", kind: "workout", date: "2026-10-09", t: 14.97, e: 15.05, cat: "Sport", label: "Swim 275 m", note: "Garmin: 14:58, 5 min, avg HR 116" },
  { key: "wo-g-24816445662", kind: "workout", date: "2026-10-10", t: 12.1, e: 12.2, cat: "Sport", label: "Swim 275 m", note: "Garmin: 12:06, 6 min, avg HR 140" },
  // --- appended 2026-11-12 · day scores: real 0s + estimates for unscored past days ---------------
  // Dan: "for the days that I didn't track, assume slightly worse than the general local trend, but only
  // for the past". Real 0/10 BS days (23 + 30 Oct) stored as 0 now the scale allows it. Estimates:
  // gaps with 3+ scored neighbours (±3 days) = their mean − 0.5; else tracked mean (6.0) − 0.5,
  // ±0.5 for whether Garmin recorded exercise, smoothed over 7 days. est:true → hollow dot, and any
  // real score (app or check-in) replaces it.
  { key: "rt-2026-10-23", kind: "rating", date: "2026-10-23", value: 0 },
  { key: "rt-2026-10-30", kind: "rating", date: "2026-10-30", value: 0 },
  { key: "rte-2026-08-06", kind: "rating", date: "2026-08-06", value: 5, est: true },
  { key: "rte-2026-08-07", kind: "rating", date: "2026-08-07", value: 5, est: true },
  { key: "rte-2026-08-08", kind: "rating", date: "2026-08-08", value: 5.5, est: true },
  { key: "rte-2026-08-09", kind: "rating", date: "2026-08-09", value: 5.5, est: true },
  { key: "rte-2026-08-10", kind: "rating", date: "2026-08-10", value: 5.5, est: true },
  { key: "rte-2026-08-11", kind: "rating", date: "2026-08-11", value: 5.5, est: true },
  { key: "rte-2026-08-12", kind: "rating", date: "2026-08-12", value: 5.5, est: true },
  { key: "rte-2026-08-13", kind: "rating", date: "2026-08-13", value: 5.5, est: true },
  { key: "rte-2026-08-14", kind: "rating", date: "2026-08-14", value: 5.5, est: true },
  { key: "rte-2026-08-15", kind: "rating", date: "2026-08-15", value: 5.5, est: true },
  { key: "rte-2026-08-16", kind: "rating", date: "2026-08-16", value: 5.5, est: true },
  { key: "rte-2026-08-17", kind: "rating", date: "2026-08-17", value: 5.5, est: true },
  { key: "rte-2026-08-18", kind: "rating", date: "2026-08-18", value: 5.5, est: true },
  { key: "rte-2026-08-19", kind: "rating", date: "2026-08-19", value: 5.5, est: true },
  { key: "rte-2026-08-20", kind: "rating", date: "2026-08-20", value: 5.5, est: true },
  { key: "rte-2026-08-21", kind: "rating", date: "2026-08-21", value: 5.5, est: true },
  { key: "rte-2026-08-22", kind: "rating", date: "2026-08-22", value: 5.5, est: true },
  { key: "rte-2026-08-23", kind: "rating", date: "2026-08-23", value: 5.5, est: true },
  { key: "rte-2026-08-24", kind: "rating", date: "2026-08-24", value: 5.5, est: true },
  { key: "rte-2026-08-25", kind: "rating", date: "2026-08-25", value: 5.5, est: true },
  { key: "rte-2026-08-26", kind: "rating", date: "2026-08-26", value: 5, est: true },
  { key: "rte-2026-08-27", kind: "rating", date: "2026-08-27", value: 5, est: true },
  { key: "rte-2026-08-28", kind: "rating", date: "2026-08-28", value: 5, est: true },
  { key: "rte-2026-08-29", kind: "rating", date: "2026-08-29", value: 5, est: true },
  { key: "rte-2026-08-30", kind: "rating", date: "2026-08-30", value: 5, est: true },
  { key: "rte-2026-08-31", kind: "rating", date: "2026-08-31", value: 5, est: true },
  { key: "rte-2026-09-01", kind: "rating", date: "2026-09-01", value: 5, est: true },
  { key: "rte-2026-09-02", kind: "rating", date: "2026-09-02", value: 5, est: true },
  { key: "rte-2026-09-03", kind: "rating", date: "2026-09-03", value: 5, est: true },
  { key: "rte-2026-09-04", kind: "rating", date: "2026-09-04", value: 5, est: true },
  { key: "rte-2026-09-05", kind: "rating", date: "2026-09-05", value: 5.5, est: true },
  { key: "rte-2026-09-06", kind: "rating", date: "2026-09-06", value: 5.5, est: true },
  { key: "rte-2026-09-07", kind: "rating", date: "2026-09-07", value: 5.5, est: true },
  { key: "rte-2026-09-08", kind: "rating", date: "2026-09-08", value: 5.5, est: true },
  { key: "rte-2026-09-09", kind: "rating", date: "2026-09-09", value: 5.5, est: true },
  { key: "rte-2026-09-10", kind: "rating", date: "2026-09-10", value: 5.5, est: true },
  { key: "rte-2026-09-11", kind: "rating", date: "2026-09-11", value: 5.5, est: true },
  { key: "rte-2026-09-12", kind: "rating", date: "2026-09-12", value: 5, est: true },
  { key: "rte-2026-09-13", kind: "rating", date: "2026-09-13", value: 5.5, est: true },
  { key: "rte-2026-09-14", kind: "rating", date: "2026-09-14", value: 5, est: true },
  { key: "rte-2026-09-15", kind: "rating", date: "2026-09-15", value: 5, est: true },
  { key: "rte-2026-09-16", kind: "rating", date: "2026-09-16", value: 5, est: true },
  { key: "rte-2026-09-17", kind: "rating", date: "2026-09-17", value: 5, est: true },
  { key: "rte-2026-09-18", kind: "rating", date: "2026-09-18", value: 5, est: true },
  { key: "rte-2026-09-19", kind: "rating", date: "2026-09-19", value: 5, est: true },
  { key: "rte-2026-09-20", kind: "rating", date: "2026-09-20", value: 5, est: true },
  { key: "rte-2026-09-21", kind: "rating", date: "2026-09-21", value: 5, est: true },
  { key: "rte-2026-09-22", kind: "rating", date: "2026-09-22", value: 5, est: true },
  { key: "rte-2026-09-23", kind: "rating", date: "2026-09-23", value: 5, est: true },
  { key: "rte-2026-09-24", kind: "rating", date: "2026-09-24", value: 5, est: true },
  { key: "rte-2026-09-25", kind: "rating", date: "2026-09-25", value: 5, est: true },
  { key: "rte-2026-09-26", kind: "rating", date: "2026-09-26", value: 5, est: true },
  { key: "rte-2026-09-27", kind: "rating", date: "2026-09-27", value: 5, est: true },
  { key: "rte-2026-09-28", kind: "rating", date: "2026-09-28", value: 5, est: true },
  { key: "rte-2026-09-29", kind: "rating", date: "2026-09-29", value: 5, est: true },
  { key: "rte-2026-09-30", kind: "rating", date: "2026-09-30", value: 5, est: true },
  { key: "rte-2026-10-01", kind: "rating", date: "2026-10-01", value: 5, est: true },
  { key: "rte-2026-10-02", kind: "rating", date: "2026-10-02", value: 5, est: true },
  { key: "rte-2026-10-03", kind: "rating", date: "2026-10-03", value: 5, est: true },
  { key: "rte-2026-10-04", kind: "rating", date: "2026-10-04", value: 5, est: true },
  { key: "rte-2026-10-05", kind: "rating", date: "2026-10-05", value: 5, est: true },
  { key: "rte-2026-10-06", kind: "rating", date: "2026-10-06", value: 5.5, est: true },
  { key: "rte-2026-10-07", kind: "rating", date: "2026-10-07", value: 5.5, est: true },
  { key: "rte-2026-10-08", kind: "rating", date: "2026-10-08", value: 5.5, est: true },
  { key: "rte-2026-10-09", kind: "rating", date: "2026-10-09", value: 5.5, est: true },
  { key: "rte-2026-10-10", kind: "rating", date: "2026-10-10", value: 5.5, est: true },
  { key: "rte-2026-10-11", kind: "rating", date: "2026-10-11", value: 5.5, est: true },
  { key: "rte-2026-10-12", kind: "rating", date: "2026-10-12", value: 5.5, est: true },
  { key: "rte-2026-10-13", kind: "rating", date: "2026-10-13", value: 5, est: true },
  { key: "rte-2026-10-14", kind: "rating", date: "2026-10-14", value: 5, est: true },
  { key: "rte-2026-10-15", kind: "rating", date: "2026-10-15", value: 5, est: true },
  { key: "rte-2026-10-16", kind: "rating", date: "2026-10-16", value: 5, est: true },
  { key: "rte-2026-10-17", kind: "rating", date: "2026-10-17", value: 5.5, est: true },
  { key: "rte-2026-10-18", kind: "rating", date: "2026-10-18", value: 7.5, est: true },
  { key: "rte-2026-10-28", kind: "rating", date: "2026-10-28", value: 3.5, est: true },
  { key: "rte-2026-10-29", kind: "rating", date: "2026-10-29", value: 3, est: true },
  // --- appended 2026-11-12 · day-score estimates v2, from his logs (Dan: "use my daily logs and stuff
  // to assist that estimation"). Same "slightly worse than the local trend" rule, with local trends from
  // his own scored days: school weekdays 7.5 → 7 · weekends/holidays ~4.4 → 4–4.5, +0.5 if Garmin shows
  // training. Days the vault has evidence for are scored from it, `why` says what. Replaces v1 (rte-*).
  { key: "rte2-2026-08-06", kind: "rating", date: "2026-08-06", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-08-07", kind: "rating", date: "2026-08-07", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-08-08", kind: "rating", date: "2026-08-08", value: 5, est: true, why: "summer holiday, trained" },
  { key: "rte2-2026-08-09", kind: "rating", date: "2026-08-09", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-08-10", kind: "rating", date: "2026-08-10", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-08-11", kind: "rating", date: "2026-08-11", value: 6, est: true, why: "first check-in in 9 days; run, swim and basketball" },
  { key: "rte2-2026-08-12", kind: "rating", date: "2026-08-12", value: 5, est: true, why: "summer holiday, trained" },
  { key: "rte2-2026-08-13", kind: "rating", date: "2026-08-13", value: 5, est: true, why: "summer holiday, trained" },
  { key: "rte2-2026-08-14", kind: "rating", date: "2026-08-14", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-08-15", kind: "rating", date: "2026-08-15", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-08-16", kind: "rating", date: "2026-08-16", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-08-17", kind: "rating", date: "2026-08-17", value: 5, est: true, why: "summer holiday, trained" },
  { key: "rte2-2026-08-18", kind: "rating", date: "2026-08-18", value: 5, est: true, why: "summer holiday, trained" },
  { key: "rte2-2026-08-19", kind: "rating", date: "2026-08-19", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-08-20", kind: "rating", date: "2026-08-20", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-08-21", kind: "rating", date: "2026-08-21", value: 8.5, est: true, why: "101-mile challenge, day 1" },
  { key: "rte2-2026-08-22", kind: "rating", date: "2026-08-22", value: 9, est: true, why: "finished the 101 miles" },
  { key: "rte2-2026-08-23", kind: "rating", date: "2026-08-23", value: 5, est: true, why: "recovery day after the 101" },
  { key: "rte2-2026-08-24", kind: "rating", date: "2026-08-24", value: 5, est: true, why: "check-in: 'no system yet'; gym + swim" },
  { key: "rte2-2026-08-25", kind: "rating", date: "2026-08-25", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-08-26", kind: "rating", date: "2026-08-26", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-08-27", kind: "rating", date: "2026-08-27", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-08-28", kind: "rating", date: "2026-08-28", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-08-29", kind: "rating", date: "2026-08-29", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-08-30", kind: "rating", date: "2026-08-30", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-08-31", kind: "rating", date: "2026-08-31", value: 5, est: true, why: "summer holiday, trained" },
  { key: "rte2-2026-09-01", kind: "rating", date: "2026-09-01", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-09-02", kind: "rating", date: "2026-09-02", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-09-03", kind: "rating", date: "2026-09-03", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-09-04", kind: "rating", date: "2026-09-04", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-09-05", kind: "rating", date: "2026-09-05", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-09-06", kind: "rating", date: "2026-09-06", value: 4, est: true, why: "summer holiday: by your own 8 Sep post-mortem, late, TV, no rhythm" },
  { key: "rte2-2026-09-07", kind: "rating", date: "2026-09-07", value: 7.5, est: true, why: "EY offer accepted; first day back at school" },
  { key: "rte2-2026-09-08", kind: "rating", date: "2026-09-08", value: 8, est: true, why: "18th birthday; timetable filed, long open dump" },
  { key: "rte2-2026-09-09", kind: "rating", date: "2026-09-09", value: 7, est: true, why: "school day: you lock in inside structure" },
  { key: "rte2-2026-09-10", kind: "rating", date: "2026-09-10", value: 7, est: true, why: "school day, trained" },
  { key: "rte2-2026-09-11", kind: "rating", date: "2026-09-11", value: 7, est: true, why: "school day: you lock in inside structure" },
  { key: "rte2-2026-09-12", kind: "rating", date: "2026-09-12", value: 4.5, est: true, why: "term weekend (BS days cluster here)" },
  { key: "rte2-2026-09-13", kind: "rating", date: "2026-09-13", value: 5.5, est: true, why: "canal working party" },
  { key: "rte2-2026-09-14", kind: "rating", date: "2026-09-14", value: 7, est: true, why: "school day: you lock in inside structure" },
  { key: "rte2-2026-09-15", kind: "rating", date: "2026-09-15", value: 6.5, est: true, why: "ESAT past paper, 'didn't go amazingly'" },
  { key: "rte2-2026-09-16", kind: "rating", date: "2026-09-16", value: 7, est: true, why: "pre-Oxford dump; ESAT ~2h a day" },
  { key: "rte2-2026-09-17", kind: "rating", date: "2026-09-17", value: 7.5, est: true, why: "Oxford open day (evening)" },
  { key: "rte2-2026-09-18", kind: "rating", date: "2026-09-18", value: 7.5, est: true, why: "Oxford open day" },
  { key: "rte2-2026-09-19", kind: "rating", date: "2026-09-19", value: 4.5, est: true, why: "term weekend (BS days cluster here)" },
  { key: "rte2-2026-09-20", kind: "rating", date: "2026-09-20", value: 4.5, est: true, why: "term weekend (BS days cluster here)" },
  { key: "rte2-2026-09-21", kind: "rating", date: "2026-09-21", value: 7, est: true, why: "school day: you lock in inside structure" },
  { key: "rte2-2026-09-22", kind: "rating", date: "2026-09-22", value: 8, est: true, why: "whole Higgs analysis done in one evening" },
  { key: "rte2-2026-09-23", kind: "rating", date: "2026-09-23", value: 7, est: true, why: "school day, trained" },
  { key: "rte2-2026-09-24", kind: "rating", date: "2026-09-24", value: 7, est: true, why: "school day: you lock in inside structure" },
  { key: "rte2-2026-09-25", kind: "rating", date: "2026-09-25", value: 7, est: true, why: "school day: you lock in inside structure" },
  { key: "rte2-2026-09-26", kind: "rating", date: "2026-09-26", value: 4.5, est: true, why: "term weekend (BS days cluster here)" },
  { key: "rte2-2026-09-27", kind: "rating", date: "2026-09-27", value: 4.5, est: true, why: "term weekend (BS days cluster here)" },
  { key: "rte2-2026-09-28", kind: "rating", date: "2026-09-28", value: 6.5, est: true, why: "ESAT Lab export: Maths 2 is the crisis" },
  { key: "rte2-2026-09-29", kind: "rating", date: "2026-09-29", value: 7, est: true, why: "school day: you lock in inside structure" },
  { key: "rte2-2026-09-30", kind: "rating", date: "2026-09-30", value: 7, est: true, why: "school day: you lock in inside structure" },
  { key: "rte2-2026-10-01", kind: "rating", date: "2026-10-01", value: 7, est: true, why: "school day: you lock in inside structure" },
  { key: "rte2-2026-10-02", kind: "rating", date: "2026-10-02", value: 7, est: true, why: "school day: you lock in inside structure" },
  { key: "rte2-2026-10-03", kind: "rating", date: "2026-10-03", value: 5, est: true, why: "term weekend, trained" },
  { key: "rte2-2026-10-04", kind: "rating", date: "2026-10-04", value: 4.5, est: true, why: "term weekend (BS days cluster here)" },
  { key: "rte2-2026-10-05", kind: "rating", date: "2026-10-05", value: 7, est: true, why: "school day: you lock in inside structure" },
  { key: "rte2-2026-10-06", kind: "rating", date: "2026-10-06", value: 7.5, est: true, why: "personal statement finished" },
  { key: "rte2-2026-10-07", kind: "rating", date: "2026-10-07", value: 7, est: true, why: "school day: you lock in inside structure" },
  { key: "rte2-2026-10-08", kind: "rating", date: "2026-10-08", value: 7, est: true, why: "school day: you lock in inside structure" },
  { key: "rte2-2026-10-09", kind: "rating", date: "2026-10-09", value: 7.5, est: true, why: "UAT-UK specimen sat; technique sheet to 91 entries" },
  { key: "rte2-2026-10-10", kind: "rating", date: "2026-10-10", value: 7.5, est: true, why: "specimen re-sits: Maths 1 23/27, Physics 27/27" },
  { key: "rte2-2026-10-11", kind: "rating", date: "2026-10-11", value: 4.5, est: true, why: "term weekend (BS days cluster here)" },
  { key: "rte2-2026-10-12", kind: "rating", date: "2026-10-12", value: 7, est: true, why: "school day: you lock in inside structure" },
  { key: "rte2-2026-10-13", kind: "rating", date: "2026-10-13", value: 7.5, est: true, why: "ESAT sat (~72% self-estimate); decision closed: Cambridge" },
  { key: "rte2-2026-10-14", kind: "rating", date: "2026-10-14", value: 7, est: true, why: "school day: you lock in inside structure" },
  { key: "rte2-2026-10-15", kind: "rating", date: "2026-10-15", value: 5.5, est: true, why: "driving test failed (two majors); statement submitted" },
  { key: "rte2-2026-10-16", kind: "rating", date: "2026-10-16", value: 7, est: true, why: "school day: you lock in inside structure" },
  { key: "rte2-2026-10-17", kind: "rating", date: "2026-10-17", value: 4.5, est: true, why: "term weekend (BS days cluster here)" },
  { key: "rte2-2026-10-18", kind: "rating", date: "2026-10-18", value: 4.5, est: true, why: "term weekend (BS days cluster here)" },
  { key: "rte2-2026-10-28", kind: "rating", date: "2026-10-28", value: 6.5, est: true, why: "HYROX doubles 1:17 (target sub-1h), then Rohan's party" },
  { key: "rte2-2026-10-29", kind: "rating", date: "2026-10-29", value: 6, est: true, why: "library in the morning, dinner out with mum before she flew" },
  // --- appended 2026-11-12 · discipline trend made true (Dan: "my Garmin data ... informs you on what
  // the truth is"). `known` = habits the check-in actually assessed (from the Habit Log table), so an
  // unticked one reads as a real miss, not unknown. Garmin overrules a stated bedtime: 20 Oct asleep 23:24.
  { key: "hl-off-bed-2026-10-20", kind: "habitLog", date: "2026-10-20", habits: {}, off: ["bed"] },
  { key: "hl-known-2026-10-19", kind: "habitLog", date: "2026-10-19", habits: {}, known: ["eatwell", "exercise", "screen"] },
  { key: "hl-known-2026-10-20", kind: "habitLog", date: "2026-10-20", habits: {}, known: ["eatwell", "exercise", "screen"] },
  { key: "hl-known-2026-10-21", kind: "habitLog", date: "2026-10-21", habits: {}, known: ["eatwell", "exercise", "screen"] },
  { key: "hl-known-2026-10-22", kind: "habitLog", date: "2026-10-22", habits: {}, known: ["eatwell", "exercise"] },
  { key: "hl-known-2026-10-23", kind: "habitLog", date: "2026-10-23", habits: {}, known: ["eatwell", "exercise", "screen"] },
  { key: "hl-known-2026-10-24", kind: "habitLog", date: "2026-10-24", habits: {}, known: ["eatwell", "exercise"] },
  { key: "hl-known-2026-10-25", kind: "habitLog", date: "2026-10-25", habits: {}, known: ["eatwell", "exercise", "screen"] },
  { key: "hl-known-2026-10-26", kind: "habitLog", date: "2026-10-26", habits: {}, known: ["eatwell", "exercise"] },
  { key: "hl-known-2026-10-27", kind: "habitLog", date: "2026-10-27", habits: {}, known: ["eatwell", "exercise"] },
  { key: "hl-known-2026-10-28", kind: "habitLog", date: "2026-10-28", habits: {}, known: ["eatwell", "exercise"] },
  { key: "hl-known-2026-10-30", kind: "habitLog", date: "2026-10-30", habits: {}, known: ["eatwell", "exercise"] },
  { key: "hl-known-2026-10-31", kind: "habitLog", date: "2026-10-31", habits: {}, known: ["exercise"] },
  { key: "hl-known-2026-11-01", kind: "habitLog", date: "2026-11-01", habits: {}, known: ["exercise"] },
  { key: "hl-known-2026-11-02", kind: "habitLog", date: "2026-11-02", habits: {}, known: ["eatwell", "exercise", "screen"] },
  { key: "hl-known-2026-11-03", kind: "habitLog", date: "2026-11-03", habits: {}, known: ["eatwell", "exercise", "screen"] },
  // "Last week or so I've had a pretty very healthy diet" (Dan, 12 Nov) -> Eat Well 5-11 Nov.
  { key: "hl-eat-2026-11-05", kind: "habitLog", date: "2026-11-05", habits: { eatwell: true } },
  { key: "hl-eat-2026-11-06", kind: "habitLog", date: "2026-11-06", habits: { eatwell: true } },
  { key: "hl-eat-2026-11-07", kind: "habitLog", date: "2026-11-07", habits: { eatwell: true } },
  { key: "hl-eat-2026-11-08", kind: "habitLog", date: "2026-11-08", habits: { eatwell: true } },
  { key: "hl-eat-2026-11-09", kind: "habitLog", date: "2026-11-09", habits: { eatwell: true } },
  { key: "hl-eat-2026-11-10", kind: "habitLog", date: "2026-11-10", habits: { eatwell: true } },
  { key: "hl-eat-2026-11-11", kind: "habitLog", date: "2026-11-11", habits: { eatwell: true } },
  // New Library habit (12 Nov). Known library days so far: 26 Oct (~2h, interview prep), 29 Oct (morning).
  { key: "hl-lib-2026-10-26", kind: "habitLog", date: "2026-10-26", habits: { library: true } },
  { key: "hl-lib-2026-10-29", kind: "habitLog", date: "2026-10-29", habits: { library: true } },
  // --- appended 2026-11-12 · Garmin data export cadence (Dan exports by hand; window is 30 days) ---
  { key: "td-garmin-export-2026-12", kind: "todo", due: "2026-12-08", list: "small",
    text: "Garmin export (last 30 days) — do it every 4 weeks so there's no gap; next one early Jan" },
  // --- appended 2026-11-12 · weekend bedtime, library history + scoring, 4 Nov gym --------------
  // Dan: "12 o'clock on Fridays and Saturdays" -> Fri/Sat nights tick if Garmin has him asleep by 00:15.
  { key: "hl-bedwk-2026-09-18", kind: "habitLog", date: "2026-09-18", habits: { bed: true } },  // asleep 00:15
  { key: "hl-bedwk-2026-09-25", kind: "habitLog", date: "2026-09-25", habits: { bed: true } },  // asleep 23:28
  { key: "hl-bedwk-2026-09-26", kind: "habitLog", date: "2026-09-26", habits: { bed: true } },  // asleep 00:07
  { key: "hl-bedwk-2026-10-03", kind: "habitLog", date: "2026-10-03", habits: { bed: true } },  // asleep 23:47
  { key: "hl-bedwk-2026-10-10", kind: "habitLog", date: "2026-10-10", habits: { bed: true } },  // asleep 23:33
  // (5 weekend nights newly qualify.)
  // Library: "during ESAT pretty much every day, other than Sundays, never on a Sunday, and occasionally
  // on Saturdays" -> every school day 7 Sep - 12 Oct (term started 7 Sep), except Fri 18 Sep (Oxford
  // open day). Hours and verdict unknown, so +1 each. Saturdays left unticked ("occasionally").
  { key: "hl-lib-2026-09-07", kind: "habitLog", date: "2026-09-07", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-09-08", kind: "habitLog", date: "2026-09-08", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-09-09", kind: "habitLog", date: "2026-09-09", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-09-10", kind: "habitLog", date: "2026-09-10", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-09-11", kind: "habitLog", date: "2026-09-11", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-09-14", kind: "habitLog", date: "2026-09-14", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-09-15", kind: "habitLog", date: "2026-09-15", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-09-16", kind: "habitLog", date: "2026-09-16", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-09-17", kind: "habitLog", date: "2026-09-17", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-09-21", kind: "habitLog", date: "2026-09-21", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-09-22", kind: "habitLog", date: "2026-09-22", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-09-23", kind: "habitLog", date: "2026-09-23", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-09-24", kind: "habitLog", date: "2026-09-24", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-09-25", kind: "habitLog", date: "2026-09-25", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-09-28", kind: "habitLog", date: "2026-09-28", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-09-29", kind: "habitLog", date: "2026-09-29", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-09-30", kind: "habitLog", date: "2026-09-30", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-10-01", kind: "habitLog", date: "2026-10-01", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-10-02", kind: "habitLog", date: "2026-10-02", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-10-05", kind: "habitLog", date: "2026-10-05", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-10-06", kind: "habitLog", date: "2026-10-06", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-10-07", kind: "habitLog", date: "2026-10-07", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-10-08", kind: "habitLog", date: "2026-10-08", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-10-09", kind: "habitLog", date: "2026-10-09", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-10-12", kind: "habitLog", date: "2026-10-12", habits: { library: true }, known: ["library"] },
  { key: "hl-lib2-2026-10-26", kind: "habitLog", date: "2026-10-26", habits: { library: true }, library: { hours: 2, productive: true } },  // interview prep + Stamford site
  // Wed 4 Nov: "I've done every session since last week. Been consistent." -> Gym B happened.
  { key: "hl-ex-2026-11-04", kind: "habitLog", date: "2026-11-04", habits: { exercise: true }, known: ["exercise"] },
  // --- appended 2026-11-12 · library detail (Dan: "during ESAT, it was basically just library ... except
  // for the last 2 days"; since then "genuinely 5 out of 5 days a week ... every school day") -----------
  // ESAT block 7 Sep - 8 Oct: 3h+ locked in (+2). Last two school days before the exam (Fri 9, Mon 12 Oct): no library.
  { key: "hl-lib3-2026-09-07", kind: "habitLog", date: "2026-09-07", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-09-08", kind: "habitLog", date: "2026-09-08", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-09-09", kind: "habitLog", date: "2026-09-09", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-09-10", kind: "habitLog", date: "2026-09-10", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-09-11", kind: "habitLog", date: "2026-09-11", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-09-14", kind: "habitLog", date: "2026-09-14", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-09-15", kind: "habitLog", date: "2026-09-15", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-09-16", kind: "habitLog", date: "2026-09-16", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-09-17", kind: "habitLog", date: "2026-09-17", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-09-21", kind: "habitLog", date: "2026-09-21", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-09-22", kind: "habitLog", date: "2026-09-22", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-09-23", kind: "habitLog", date: "2026-09-23", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-09-24", kind: "habitLog", date: "2026-09-24", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-09-25", kind: "habitLog", date: "2026-09-25", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-09-28", kind: "habitLog", date: "2026-09-28", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-09-29", kind: "habitLog", date: "2026-09-29", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-09-30", kind: "habitLog", date: "2026-09-30", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-10-01", kind: "habitLog", date: "2026-10-01", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-10-02", kind: "habitLog", date: "2026-10-02", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-10-05", kind: "habitLog", date: "2026-10-05", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-10-06", kind: "habitLog", date: "2026-10-06", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-10-07", kind: "habitLog", date: "2026-10-07", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib3-2026-10-08", kind: "habitLog", date: "2026-10-08", habits: { library: true }, library: { hours: 3, productive: true }, known: ["library"] },
  { key: "hl-lib-off-2026-10-09", kind: "habitLog", date: "2026-10-09", habits: {}, off: ["library"] },
  { key: "hl-lib-off-2026-10-12", kind: "habitLog", date: "2026-10-12", habits: {}, off: ["library"] },
  // After the ESAT: every school day (hours + verdict unknown, so +1). Half term 23 Oct - 1 Nov excluded; today not filled.
  { key: "hl-lib-2026-10-14", kind: "habitLog", date: "2026-10-14", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-10-15", kind: "habitLog", date: "2026-10-15", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-10-16", kind: "habitLog", date: "2026-10-16", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-10-19", kind: "habitLog", date: "2026-10-19", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-10-20", kind: "habitLog", date: "2026-10-20", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-10-21", kind: "habitLog", date: "2026-10-21", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-10-22", kind: "habitLog", date: "2026-10-22", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-11-02", kind: "habitLog", date: "2026-11-02", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-11-03", kind: "habitLog", date: "2026-11-03", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-11-04", kind: "habitLog", date: "2026-11-04", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-11-05", kind: "habitLog", date: "2026-11-05", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-11-06", kind: "habitLog", date: "2026-11-06", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-11-09", kind: "habitLog", date: "2026-11-09", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-11-10", kind: "habitLog", date: "2026-11-10", habits: { library: true }, known: ["library"] },
  { key: "hl-lib-2026-11-11", kind: "habitLog", date: "2026-11-11", habits: { library: true }, known: ["library"] },
  // --- appended 2026-11-13 · habit check-in, Thu 12 Nov ---
  // 1k swim in the morning, good school day, library (lost time on Garmin setup), home at 5
  // to make brownies, then a terrible diet. Early bed (time to confirm). "A 5.5."
  { key: "hl-2026-11-12", kind: "habitLog", date: "2026-11-12", rating: 5.5, habits: {} },
  // Thu 12 Nov, per the 12 Nov protocol: early bed (taken as before 23:00, Garmin overrides),
  // diet failed after brownies, ~2h library mostly on Garmin = "pissed about" → library 0.
  { key: "hl-2026-11-12-v2", kind: "habitLog", date: "2026-11-12", habits: { bed: true },
    known: ["bed", "eatwell", "exercise", "library"], library: { hours: 2, productive: false } },
  // --- appended 2026-11-13 · Dan's answers ---
  // Correction: Thu 12 Nov bed was 23:15, then 20 min phone, struggled to sleep, ~6h asleep in
  // ~8h in bed — not "early" enough for the 23:00/23:15 rule. Bed off; screen known (YouTube+phone).
  { key: "hl-2026-11-12-v3", kind: "habitLog", date: "2026-11-12", off: ["bed"], known: ["bed"], habits: {} },
  // Mum back from Vietnam Sun 15 Nov; Dan back at hers next week.
  { key: "ev-mum-back-2026-11-15", kind: "event", date: "2026-11-15", text: "Mum back from Vietnam — back to Mum's" },
];
