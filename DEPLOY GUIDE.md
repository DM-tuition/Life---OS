# Getting Life OS onto your phone — step by step

You don’t need to write or understand any code. ~10-15 minutes.

## What you have

A folder called `life-os` with all the project files. Keep it unzipped somewhere you can find it.

-----

## STEP 1 — Make a GitHub account (free)

1. Go to <https://github.com> and sign up (just email + password).
1. Once logged in, click the **+** top-right → **New repository**.
1. Name it `life-os`. Leave everything else default. Click **Create repository**.

## STEP 2 — Upload the project files

1. On your new empty repo page, click the link **“uploading an existing file”**.
1. Open the `life-os` folder on your computer. Select EVERYTHING inside it
   (index.html, package.json, vite.config.js, the `src` folder, the `public` folder)
   and drag it all into the browser upload box.
- Tip: drag the *contents* of the folder, not the folder itself.
1. Wait for the files to finish uploading, then click **Commit changes**.

## STEP 3 — Deploy on Vercel (free)

1. Go to <https://vercel.com> and click **Sign up** → choose **Continue with GitHub**
   (this links the two accounts automatically).
1. On your Vercel dashboard click **Add New… → Project**.
1. You’ll see your `life-os` repo listed. Click **Import**.
1. Don’t change any settings — Vercel auto-detects it’s a Vite app.
   Just click **Deploy**.
1. Wait ~60 seconds. You’ll get a live link like `https://life-os-xxxx.vercel.app`.
   That’s your app, live on the internet.

## STEP 4 — Put it on your home screen

**iPhone (Safari):**

1. Open your Vercel link in Safari.
1. Tap the **Share** button (square with up-arrow).
1. Scroll down → **Add to Home Screen** → **Add**.
1. You now have a “Life OS” icon. Open it — it runs fullscreen, no browser bars.

**Android (Chrome):**

1. Open the link in Chrome.
1. Tap the **⋮** menu top-right → **Add to Home screen** → **Add**.

-----

## Making changes later

When you want updates:

1. I give you a new `LifeOS.jsx` file.
1. On GitHub, go into the `src` folder, click `LifeOS.jsx`, click the pencil (Edit),
   delete everything, paste the new version, click **Commit changes**.
1. Vercel automatically rebuilds in ~30 seconds. Refresh the app on your phone.

(Or even easier: just ask me and I’ll walk you through it again.)

-----

## Important notes

- **Your data lives on your phone’s browser storage.** It persists between sessions,
  but it does NOT sync to your laptop, and clearing browser data wipes it.
- When you’re ready, the next upgrade is **Supabase** (free) for true cross-device
  sync + permanent cloud backup. Ask me when you want it.
- The app icon is a placeholder — easy to swap for something better later.