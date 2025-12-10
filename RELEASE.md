Release: v0.2.0

Changelog

**v0.2.0 (Latest)**
- Added `pa_system.html` — PA system with lockdown/fire alarm sirens and text-to-speech announcements (rings immediately on button press).
- Added `school_bell.html` — UK-style school bell system with configurable schedule and immediate ring on demand.
- Attendance and Behaviour systems working with client/server persistence.

**v0.1.0**
- Added modern `teacher_attendance.html` UI with client-side persistence and midnight reset logic.
- Added `behavior_register.html` (Bromcom-style grid) with client persistence and midnight reset.
- Implemented server: small Express API at `server/index.js` supporting GET/POST state for `attendance` and `behavior`, and `/api/reset`.
- Server runs a scheduled midnight reset using `node-cron` with timezone `Europe/London`.

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

- `teacher_attendance.html` — Modern attendance register with detention logic
- `behavior_register.html` — Bromcom-style behavior grid register  
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
