# मयाजाल स्टूडियो — Mayajaal Studio

Production dashboard for the **Mayajaal Duniya** channel. Reads the same binder files you
already use (`scripts/NNN_title/`, `episode_tracker_v2.md`) — the files stay the source of
truth, the studio is the view + tools on top.

## Run it

```bash
cd studio
npm install
npm run dev        # http://localhost:3000
```

First time: copy `.env.example` → `.env.local` and set `PY_EXE` to your python.exe full path.

## What each page does

| Page | What |
|---|---|
| `/` Stories | Ledger of every `scripts/NNN_title/` folder with stage stamps, pulled from the tracker |
| `/story/001` | Tabbed case file: **Script** (paper reader, scene-wise, with cues styled) + **Run TTS lint** button with stamped PASS/FAIL verdict + findings list · **Prompts** tab: every reference sheet and frame with **one-click copy** · **Pipeline** tab |
| `/tracker` | Episode log + entity registry, live from `episode_tracker_v2.md` |
| `/new` | Paste a script → pick runtime → lint inline → **Save to binder** (auto-numbers the folder) |

## Linter

The studio shells out to the same `tts_linter.py` you run by hand — one QA brain, two doors:

```bash
# by hand
python tts_linter.py scripts/001_aam_ka_ped/001_script.md 90s
# or just click "Run TTS lint" in the studio
```

## MongoDB Atlas (Phase 2 — live)

Storage is now Mongo-backed. The markdown binder stays as the **seed/backup format**.

- `.env.local` → `MONGODB_URI=mongodb+srv://user:pass@cluster/dbname` (db name comes from the URI path)
- Collections: `stories`, `scripts` (scripts + pipeline + prompts + packaging), `tracker` (episode log + entities as one doc), `lintRuns`
- First app hit auto-seeds Mongo from `scripts/NNN_*/` + `episode_tracker_v2.md` (once per process, idempotent)
- `POST /api/sync` forces a re-pull from files (files win, Mongo file-derived docs replaced)
- Stage moves, saves and packaging kits write Mongo first, then best-effort markdown backup
- Lint runs are logged to `lintRuns` (best-effort)

## Notes

- Server-side paths resolve to the project root (`../scripts`, `../tts_linter.py`) — keep the studio inside this folder.
- `PY_EXE` is needed because the Windows Store python stub intercepts bare `python`.
