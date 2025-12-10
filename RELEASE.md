Release: v0.2.3

Changelog

**v0.2.3 (Latest)**
- Added **A = Absent** (red) to attendance codes
- Full attendance code set now: **P (Present), A (Absent), I (Illness), H (Holiday), L (Late)**
- Quick-click buttons for all 5 attendance codes: P/A/I/H/L
- Auto-detention still triggers on **2+ Late marks** with red student name highlighting

**v0.2.2**
- Enhanced `teacher_attendance.html` with standardized attendance codes:
  - **P = Present** (green), **I = Illness** (orange), **H = Holiday** (purple), **L = Late** (red)
- Auto-detention on **2+ Late marks**: Student names highlighted in red with red row background.
- Lates counter displays per student showing cumulative late count.
- Detention status shows prominently in red when triggered.

**v0.2.1**
- Enhanced `behavior_register.html` with 5-level behavior code system:
  - **1 = Excellent** (green), **2 = Good** (blue), **3 = Disruptive** (orange)
  - **4 = Poor** (red) — triggers detention if 2+ recorded
  - **5 = Unsafe** (purple), **/ = Late** (orange) — triggers detention if 2+ recorded

**v0.2.0**
- Added `pa_system.html` — PA system with lockdown/fire alarm sirens and text-to-speech announcements.
- Added `school_bell.html` — UK-style school bell system with configurable schedule and immediate ring on demand.

**v0.1.0**
- Added modern `teacher_attendance.html` UI with client-side persistence and midnight reset logic.
- Added `behavior_register.html` (Bromcom-style grid) with client persistence and midnight reset.
- Implemented Express server with GET/POST state endpoints and scheduled midnight reset using `node-cron`.

---

Run server locally

```bash
npm install
npm start
```

Client pages — Open any of these in your browser:

- `teacher_attendance.html` — Attendance register with P/A/I/H/L codes and detention on 2+ lates
- `behavior_register.html` — Behavior grid register with 5-level coding system and auto-detention
- `pa_system.html` — PA system (lockdown alert, fire alarm, announcements)
- `school_bell.html` — School bell system (scheduled or manual ring)

All pages sync with server at `http://localhost:4000` and fallback to localStorage if unavailable.

- You can simulate a reset by triggering the admin endpoint:

```bash
curl -X POST http://localhost:4000/api/reset
```

Notes

- The server stores state in `server/state.json` and performs midnight resets in timezone Europe/London.
- For production, run the server behind a process manager and ensure `PORT`/`TIMEZONE` env vars are set as desired.
