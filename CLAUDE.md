# CLAUDE.md: notes for AI-assisted changes

Static site, no framework and no build step. Classic `<script>` files share one global
scope and load in the order listed in `index.html`; top-level `const`/`let`/`function`
names must be unique across files. Do not convert to ES modules unless you convert all files.

## Data model
- Squad: `squad` array of `{id, name, pos[], traits[], notes}`. `id` is stable; names are display only.
  Position codes: GK CB LB RB CDM CM CAM LW RW ST ANY (first listed = preferred).
- Matches: `matches[id]` objects, shape defined by `defaultMatch()` in `js/data.js`.
  Always pass loaded data through `normMatch()` (js/store.js) so new fields get defaults.
- Lineups use 11 fixed slot ids: GK LB LCB RCB RB DM1 DM2 AM LW RW ST. Each formation in
  `FORM` (js/data.js) relabels the slots and gives `ip` (in possession) and `oop`
  coordinates: x 0..100 left to right, y 0 (opponent goal) .. 100 (our goal).
- Persistence: Supabase table `board_docs(path, data jsonb)`. Paths: `season/squad`, `matches/<id>`.
  After any state change call `saveMatch()` or `saveSquad()`, then `render()`
  (or `commit()` / `commitAnimated()` in js/events.js).

## Conventions
- Rendering is string-built HTML/SVG set via `innerHTML`; always escape user text with `esc()`.
- UI actions use `data-act` (clicks) and `data-ch` (change events), handled centrally in js/events.js.
- Colours are CSS variables in css/styles.css with light and dark sets. The pitch SVG uses fixed
  colours so exported images look the same in both themes.
- Tactical text lives in `STYLES`, `SHAPE_TIPS` (js/data.js), `suggest()` (js/logic.js) and `job()` (js/roles.js).
  Placeholders like `{LB}`, `{HOLD}`, `{fbGo}` are replaced with player names by `tpl()`.

## Testing
`python3 -m http.server 8000` and open http://localhost:8000. With placeholder config the app
runs on localStorage only, which is the safe way to test changes without touching shared data.
