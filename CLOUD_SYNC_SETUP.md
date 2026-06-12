# Turn on Cloud Sync (auto-backup + phone↔laptop sync)

No coding. ~10 minutes, once. Until you do this, the app still works fine offline on your phone — this just adds a free cloud backup that syncs across devices.

## STEP 1 — Make a free Supabase project
1. Go to <https://supabase.com> → **Start your project** → sign in with GitHub (same as before).
2. Click **New project**. Give it a name (e.g. `life-os`), set a database password (save it somewhere), pick the region closest to you, click **Create new project**.
3. Wait ~2 minutes for it to finish setting up.

## STEP 2 — Create the storage table
1. In your project, click **SQL Editor** (left sidebar) → **New query**.
2. Paste this in and click **Run**:

```sql
create table lifeos_state (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb,
  updated_at timestamptz default now()
);
alter table lifeos_state enable row level security;
create policy "own rows" on lifeos_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

You should see "Success. No rows returned." That's correct.

## STEP 3 — Turn off email confirmation (so login is instant)
1. Left sidebar → **Authentication** → **Sign In / Providers** (or **Providers → Email**).
2. Find **Confirm email** and turn it **OFF**. Save.
   *(This lets you sign in straight away without clicking a confirmation email. Optional, but much smoother.)*

## STEP 4 — Copy your two keys
1. Left sidebar → **Project Settings** (gear) → **API**.
2. Copy two things:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **anon public** key (a long string starting `eyJ…`)

> The anon key is safe to put in the app — it only works together with the row-level security you set up in Step 2.

## STEP 5 — Connect it in the app
1. Open Life OS → tap **☁ Sync** (top right).
2. Paste the **Project URL** and **anon key** → **Connect project**.
3. Enter an email + password → **Create account**.
4. Done — it now auto-backs-up every change and shows "● Synced."

## Using it on your laptop (or a new phone)
1. Open your Life OS link there → **☁ Sync**.
2. Paste the same URL + anon key → **Connect** → **Sign in** with the same email/password.
3. Your data appears. From then on, both devices stay in sync automatically.

---

**How it works / safety**
- Every change is saved to your phone instantly (as before) and pushed to your private Supabase row a moment later.
- On opening the app, it pulls the newest version first.
- It's last-write-wins: if you edit the same day on two devices at once, the most recent save wins. For one person on a phone + laptop this is fine.
- Your **Backup → Export** button still works as a manual belt-and-braces backup any time.
