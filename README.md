# Cream Flow Rovers: tactics board

Matchday tactics board for the Worthington's Cream Flow Rovers, UCD Superleague 2026/27.
A static web app (plain HTML, CSS and JavaScript, no build step) backed by Supabase for
shared, live-syncing data and email sign-in.

- **Anyone with the link** can view the board.
- **Editors** (emails listed in Supabase) sign in with a one-time email link and can change it.
- Changes sync live between devices, so both managers see the same board.

## Project layout

```
index.html              page shell, loads everything below in order
css/styles.css          all styling (light and dark themes)
js/config.js            Supabase URL + public key (edit this)
js/data.js              formations, opponent styles, tactical text, default squad
js/logic.js             state, position fit, best-XI solver, shape maths, suggestion engine
js/roles.js             per-role instructions, pre-match checks, set pieces, rotation planner, team sheet
js/render.js            header, squad rail, toolbar, pitch SVG
js/panes.js             Game plan / Roles / Set pieces / Checks panes, Rotation and Squad views, dialogs
js/store.js             Supabase persistence, realtime sync, sign-in, local fallback
js/events.js            clicks, inputs, drag and drop, drawing, boot
vendor/supabase-*.js    pinned copy of supabase-js (no CDN dependency)
supabase/schema.sql     tables, security rules, realtime
supabase/seed.sql       current squad and the 3 Oct match
```

## One-time setup (about 15 minutes)

### 1. Create the database

1. Create a free project at [supabase.com](https://supabase.com). Pick an EU region (for example Ireland, eu-west-1).
2. Open **SQL Editor → New query**, paste `supabase/schema.sql`, change the two emails at
   the bottom to yours and Liam's, and press **Run**.
3. New query again: paste `supabase/seed.sql` and **Run**. This loads the squad and the first match.
4. Go to **Project Settings → API** (or **API Keys**) and copy the **Project URL** and the
   **anon / publishable** key. Never use the `service_role` / secret key in this app.
5. Put both into `js/config.js`.

### 2. Put it on GitHub and publish

1. Create a new GitHub repository (it can be private if you have GitHub Pro; otherwise public is fine,
   because the key in `config.js` is designed to be public and writes are locked down by the database).
2. Push this folder:
   ```bash
   git init
   git add .
   git commit -m "Tactics board"
   git branch -M main
   git remote add origin https://github.com/<you>/rovers-tactics.git
   git push -u origin main
   ```
3. In the repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   branch `main`, folder `/ (root)`. After a minute the site is live at
   `https://<you>.github.io/rovers-tactics/`.

Every push to `main` redeploys automatically.

### 3. Tell Supabase where the site lives (needed for sign-in links)

**Authentication → URL Configuration**:

- **Site URL:** `https://<you>.github.io/rovers-tactics/`
- **Redirect URLs:** add the same URL, plus `http://localhost:8000/` for local testing.

### 4. Sign in

Open the site, press **Sign in**, enter an editor email and click the link in the email.
The status in the top right should read **Saved** once you change something.

## Day-to-day

- **Add a co-manager:** Supabase **Table Editor → editors → Insert row** with their email.
- **Remove one:** delete their row.
- **Make the board private** (editors only, no public viewing): see the comment above the
  read policy in `supabase/schema.sql`.
- **Back up:** Table Editor → `board_docs` → Export to CSV. Each row is one JSON document.

## Developing locally

No build step is needed; any static server works:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

With the placeholder values left in `js/config.js`, the board runs in **browser-only mode**:
everything works, but data is stored in that browser's localStorage only. That is handy for
experimenting without touching the shared data.

## Hosting alternatives

Any static host works the same way, just point it at the repository root with no build command:
Netlify, Vercel or Cloudflare Pages. Remember to add that URL to Supabase's redirect list.

## Free-tier note

Supabase pauses free projects after about a week with no activity. If the board shows
"Offline" after a quiet spell, open the Supabase dashboard and press **Restore project**.
Regular use during the season keeps it awake.
