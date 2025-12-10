Release draft: v0.1.0

Changelog
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
# start server
npm run start
# server listens on :4000 by default
```

Client pages

- Open `behavior_register.html` and `teacher_attendance.html` in a browser. They will try to sync with `http://localhost:4000` and fallback to localStorage.

Testing midnight reset

- You can simulate a reset by triggering the admin endpoint:

```bash
curl -X POST http://localhost:4000/api/reset
```

Notes

- The server stores state in `server/state.json` and performs midnight resets in timezone Europe/London.
- For production, run the server behind a process manager and ensure `PORT`/`TIMEZONE` env vars are set as desired.
