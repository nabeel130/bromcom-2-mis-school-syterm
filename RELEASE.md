Release: v0.2.2

Changelog

**v0.2.2 (Latest)**
- Enhanced `teacher_attendance.html` with standardized attendance codes:
  - **P = Present** (green, #2ecc71)
  - **I = Illness** (orange, #ff8a00)
  - **H = Holiday** (purple, #7b61ff)
  - **L = Late** (red, #ff5252) — triggers detention if 2+ recorded
- Auto-detention on **2+ Late marks**: Student names highlighted in red with red row background when 2+ lates are recorded.
- Lates counter displays per student showing cumulative late count.
- Detention status shows prominently in red when triggered.
- One-click marking with P/I/H/L buttons; lates counter auto-increments.
- Server sync included; falls back to localStorage if server unavailable.
- Midnight reset clears all attendance data daily, lates counters reset.

**v0.2.1**
- Enhanced `behavior_register.html` with 5-level behavior code system:
  - **1 = Excellent** (green), **2 = Good** (blue), **3 = Disruptive** (orange)
  - **4 = Poor** (red) — triggers detention if 2+ recorded
  - **5 = Unsafe** (purple)
  - **/ = Late** (orange) — triggers detention if 2+ recorded
- Auto-detention logic: 2+ "Poor" marks OR 2+ "Late" entries trigger detention with red student name highlighting.
- Popup menu on cell click to select behavior code or clear.
- Student behavior stats in sidebar showing count of each code + detention status.

**v0.2.0**
- Added `pa_system.html` — PA system with lockdown/fire alarm sirens and text-to-speech announcements (rings immediately on button press).
- Added `school_bell.html` — UK-style school bell system with configurable schedule and immediate ring on demand.
- Attendance and Behaviour systems working with client/server persistence.

**v0.1.0**
- Added modern `teacher_attendance.html` UI with client-side persistence and midnight reset logic.
- Added `behavior_register.html` (Bromcom-style grid) with client persistence and midnight reset.
- Implemented server: small Express API at `server/index.js` supporting GET/POST state for `attendance` and `behavior`, and `/api/reset`.
- Server runs a scheduled midnight reset using `node-cron` with timezone `Europe/London`.

---

Tag & Create Release (local):

1) Create a lightweight annotated tag locally and push it:

```bash
# from repository root
git add .
git commit -m "Add attendance and behaviour UIs + server + midnight reset"
# create annotated tag
git tag -a v0.1.0 -m "MIS UI + server midnight reset"
# push tag to origin
git push origin v0.1.0
```

2) Create a GitHub release draft (using `gh` or web UI):

Using `gh` (GitHub CLI):

```bash
# create a release draft (untagged release will not work; ensure tag exists remotely)
gh release create v0.1.0 --title "v0.1.0" --notes-file RELEASE.md --draft
```

If you prefer me to create the release directly from this environment, grant `gh` authentication or say so and I'll run the commands.

Run server locally

```bash
# install dependencies
npm install
# start server (runs on :4000)
npm start
```

Client pages — Open any of these in your browser:

- `teacher_attendance.html` — Attendance register with P/I/H/L codes and detention on 2+ lates
- `behavior_register.html` — Behavior grid register with 5-level coding system and auto-detention
- `pa_system.html` — PA system (lockdown alert, fire alarm, announcements)
- `school_bell.html` — School bell system (scheduled or manual ring)

All pages will try to sync with `http://localhost:4000` and fallback to localStorage if server unavailable.

Testing midnight reset

- You can simulate a reset by triggering the admin endpoint:

```bash
curl -X POST http://localhost:4000/api/reset
```

Notes

- The server stores state in `server/state.json` and performs midnight resets in timezone Europe/London.
- For production, run the server behind a process manager and ensure `PORT`/`TIMEZONE` env vars are set as desired.
