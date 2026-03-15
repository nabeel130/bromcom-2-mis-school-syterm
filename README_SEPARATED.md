# MIS School Management System

A comprehensive school management information system with attendance tracking, behavior management, PA announcements, bell scheduling, and emergency procedures.

## File Structure

- `mis_system.html` - Main HTML structure and layout
- `styles.css` - Complete styling with responsive design
- `script.js` - All JavaScript functionality and logic

## Features

### Attendance Management
- Mark students as present, late, or absent
- Export attendance data to CSV
- Real-time attendance summary

### Behavior Management
- Log behavior incidents with codes
- Automatic detention assignment for serious incidents
- Behavior log with timestamps

### PA System
- Text-to-speech announcements
- Emergency evacuation alerts
- Fire alarm with continuous siren

### Bell System
- Enhanced UK school bell with 3 rings
- Scheduled bell times
- Manual bell ringing

### Detention Management
- Track scheduled detentions
- Update detention status
- Student-specific detention records

### Emergency Procedures
- Evacuation alerts (replaces lockdown)
- Fire alarm with repeating siren
- All-clear functionality

## Technical Details

- **HTML5**: Semantic structure with responsive design
- **CSS3**: Modern styling with CSS variables and animations
- **JavaScript ES6+**: Web Audio API, Speech Synthesis API, localStorage
- **Progressive Web App**: Offline-capable with modern browser APIs

## Local Development

Run a local server to test the application:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/mis_system.html` in your browser.

## Data Persistence

All data is stored locally using browser localStorage:
- Attendance records
- Behavior logs
- PA announcements
- Bell schedules
- Detention records

## Browser Compatibility

Requires modern browsers with support for:
- Web Audio API
- Speech Synthesis API
- localStorage
- ES6+ JavaScript features

## Emergency Features

- **Evacuation**: Replaces lockdown with proper evacuation procedures
- **Fire Alarm**: Continuous siren with visual alerts
- **All Clear**: Emergency resolution and logging