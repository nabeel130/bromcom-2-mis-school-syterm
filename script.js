// Global state
let currentPage = 'dashboard';
let students = [
  { id: 'S001', name: 'Abid' }, { id: 'S002', name: 'Rakeeb' }, { id: 'S003', name: 'Nadeem' },
  { id: 'S004', name: 'Waqas' }, { id: 'S005', name: 'Rais' }, { id: 'S006', name: 'Arfan' },
  { id: 'S007', name: 'Sebi' }, { id: 'S008', name: 'Rehan' }, { id: 'S009', name: 'Adeel' },
  { id: 'S010', name: 'Haffis' }, { id: 'S011', name: 'Ambo' }, { id: 'S012', name: 'Sajad' },
  { id: 'S013', name: 'Afraz' }, { id: 'S014', name: 'Syed' }, { id: 'S015', name: 'Ideeris' },
  { id: 'S016', name: 'Fasil' }, { id: 'S017', name: 'Shazi' }, { id: 'S018', name: 'Nasir' },
  { id: 'S019', name: 'Usman' }, { id: 'S020', name: 'Shaf' }, { id: 'S021', name: 'Tahir' },
  { id: 'S022', name: 'Aqeel' }
];

let attendanceData = {};
let behaviorLog = [];
let paLog = [];
let scheduledAnnouncements = [];
let savedTemplates = [];
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let bellSchedule = [];
let detentions = [];
let emergencyActive = false;

// PA system preferences
let paPreferMaleVoice = true;
let paDefaultVoiceIndex = null;

// Announcement queue
let announcementQueue = [];
let announcementQueueProcessing = false;

// Audio context for bell and announcements
let audioContext = null;

// Islamic calendar data
let islamicMonths = [
  'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
  'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
  'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
];

// Prayer times (sample - in real app, calculate based on location)
let prayerTimes = {
  fajr: '05:30',
  dhuhr: '12:15',
  asr: '15:45',
  maghrib: '18:20',
  isha: '19:45'
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  loadData();
  updateDashboard();
  updateBellDescription();
  startBellChecker();
  initializePASystem();
  startAnnouncementScheduler();
  updateIslamicCalendar();
  updatePrayerTimes();
});

// Navigation
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(pageId).classList.add('active');
  event.target.classList.add('active');
  currentPage = pageId;
}

// Data persistence
function saveData() {
  localStorage.setItem('mis_attendance', JSON.stringify(attendanceData));
  localStorage.setItem('mis_behavior', JSON.stringify(behaviorLog));
  localStorage.setItem('mis_pa_log', JSON.stringify(paLog));
  localStorage.setItem('mis_bell_schedule', JSON.stringify(bellSchedule));
  localStorage.setItem('mis_detentions', JSON.stringify(detentions));
  localStorage.setItem('mis_assessments', JSON.stringify(assessments));
  localStorage.setItem('mis_scheduled_announcements', JSON.stringify(scheduledAnnouncements));
  localStorage.setItem('mis_saved_templates', JSON.stringify(savedTemplates));
  localStorage.setItem('mis_pa_prefer_male_voice', JSON.stringify(paPreferMaleVoice));
  localStorage.setItem('mis_pa_default_voice_index', JSON.stringify(paDefaultVoiceIndex));
}

function loadData() {
  attendanceData = JSON.parse(localStorage.getItem('mis_attendance') || '{}');
  behaviorLog = JSON.parse(localStorage.getItem('mis_behavior') || '[]');
  paLog = JSON.parse(localStorage.getItem('mis_pa_log') || '[]');
  bellSchedule = JSON.parse(localStorage.getItem('mis_bell_schedule') || '[]');
  detentions = JSON.parse(localStorage.getItem('mis_detentions') || '[]');
  assessments = JSON.parse(localStorage.getItem('mis_assessments') || '[]');
  scheduledAnnouncements = JSON.parse(localStorage.getItem('mis_scheduled_announcements') || '[]');
  savedTemplates = JSON.parse(localStorage.getItem('mis_saved_templates') || '[]');
  paPreferMaleVoice = JSON.parse(localStorage.getItem('mis_pa_prefer_male_voice') || 'true');
  paDefaultVoiceIndex = JSON.parse(localStorage.getItem('mis_pa_default_voice_index') || 'null');
}

// Attendance functions
function renderAttendance() {
  const grid = document.getElementById('attendance-grid');
  const today = new Date().toISOString().split('T')[0];

  if (!attendanceData[today]) {
    attendanceData[today] = {};
  }

  grid.innerHTML = students.map(student => {
    const status = attendanceData[today][student.id] || 'unknown';
    return `
      <div class="student-card ${status}" onclick="markAttendance('${student.id}', '${today}')">
        <div style="font-weight: bold;">${student.name}</div>
        <div style="font-size: 12px; margin-top: 5px;">${status.toUpperCase()}</div>
      </div>
    `;
  }).join('');
}

function markAttendance(studentId, date) {
  if (!attendanceData[date]) attendanceData[date] = {};

  const currentStatus = attendanceData[date][studentId] || 'unknown';
  const statuses = ['unknown', 'present', 'late', 'absent'];
  const currentIndex = statuses.indexOf(currentStatus);
  const nextStatus = statuses[(currentIndex + 1) % statuses.length];

  attendanceData[date][studentId] = nextStatus;
  saveData();
  renderAttendance();
  updateDashboard();
}

function saveAttendance() {
  saveData();
  showStatus('Attendance saved successfully!', 'success');
}

function exportAttendance() {
  const today = new Date().toISOString().split('T')[0];
  const data = attendanceData[today] || {};
  const csv = 'Student,Status\n' +
    students.map(s => `${s.name},${data[s.id] || 'unknown'}`).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance_${today}.csv`;
  a.click();
}

// Behavior functions
function renderBehaviorSelect() {
  const select = document.getElementById('behavior-student');
  select.innerHTML = '<option value="">Select student...</option>' +
    students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

function logBehavior() {
  const studentId = document.getElementById('behavior-student').value;
  const code = document.getElementById('behavior-code').value;
  const description = document.getElementById('behavior-description').value;

  if (!studentId || !code) {
    showStatus('Please select student and incident type', 'error');
    return;
  }

  const student = students.find(s => s.id === studentId);
  const entry = {
    id: Date.now(),
    student: student.name,
    studentId: studentId,
    code: code,
    description: description,
    timestamp: new Date().toISOString()
  };

  behaviorLog.unshift(entry);

  // Auto-add detention for code 5
  if (code === '5') {
    detentions.push({
      id: Date.now(),
      student: student.name,
      studentId: studentId,
      reason: description,
      date: new Date().toISOString().split('T')[0],
      status: 'scheduled'
    });
  }

  saveData();
  renderBehaviorLog();
  renderDetentions();
  updateDashboard();

  // Clear form
  document.getElementById('behavior-student').value = '';
  document.getElementById('behavior-description').value = '';
  showStatus('Behavior incident logged', 'success');
}

function renderBehaviorLog() {
  const log = document.getElementById('behavior-log');
  log.innerHTML = behaviorLog.slice(0, 10).map(entry => `
    <div class="log-entry">
      <strong>${entry.student}</strong> - Code ${entry.code} - ${new Date(entry.timestamp).toLocaleString()}
      ${entry.description ? `<br><small>${entry.description}</small>` : ''}
    </div>
  `).join('');
}

// PA System functions

function triggerLockdown() {
  if (confirm('Activate EVACUATION? This will trigger emergency procedures.')) {
    emergencyActive = true;
    document.getElementById('emergency-alert').style.display = 'block';
    document.getElementById('emergency-message').textContent =
      'EVACUATION ALERT: All students and staff must leave the building immediately using the nearest safe exit. Teachers, take your class roster and lead students to the designated assembly area. Do not re-enter until all-clear is given.';

    // Speak evacuation message
    const utterance = createSpeechUtterance(
      'Attention please. This is an evacuation notice. All students and staff must leave the building immediately using the nearest safe exit. Teachers, take your class roster and lead students to the designated assembly area. Do not re-enter the building until the all-clear is given.'
    );
    speechSynthesis.speak(utterance);

    paLog.unshift({
      id: Date.now(),
      text: 'EVACUATION ALERT ACTIVATED',
      timestamp: new Date().toISOString(),
      type: 'emergency'
    });

    saveData();
    renderPALog();
    renderEmergencyLog();
  }
}

function triggerFireAlarm() {
  if (confirm('Activate FIRE ALARM? This will trigger continuous siren.')) {
    emergencyActive = true;
    document.getElementById('emergency-alert').style.display = 'block';
    document.getElementById('emergency-message').textContent =
      'FIRE ALARM ACTIVE: Evacuate immediately! Use nearest safe exit.';

    // Start continuous fire siren
    startFireSiren();

    paLog.unshift({
      id: Date.now(),
      text: 'FIRE ALARM ACTIVATED',
      timestamp: new Date().toISOString(),
      type: 'emergency'
    });

    saveData();
    renderPALog();
    renderEmergencyLog();
  }
}

function allClear() {
  emergencyActive = false;
  document.getElementById('emergency-alert').style.display = 'none';
  stopSiren();

  // Speak all clear message
  const utterance = createSpeechUtterance(
    'Attention please. All clear. The emergency has been resolved. Normal activities may resume.'
  );
  speechSynthesis.speak(utterance);

  paLog.unshift({
    id: Date.now(),
    text: 'ALL CLEAR - Emergency resolved',
    timestamp: new Date().toISOString(),
    type: 'emergency'
  });

  saveData();
  renderPALog();
  renderEmergencyLog();
  showStatus('All clear signal sent', 'success');
}

function triggerTerroristThreat() {
  if (confirm('Activate SECURITY THREAT ALERT? This will trigger immediate lockdown procedures.')) {
    emergencyActive = true;
    document.getElementById('emergency-alert').style.display = 'block';
    document.getElementById('emergency-message').textContent =
      'SECURITY THREAT ALERT: Immediate lockdown in effect. All doors must be locked. Students and staff remain in current location. Do not open doors for anyone. Police have been notified.';

    const utterance = createSpeechUtterance(
      'Attention please. This is a security threat alert. Immediate lockdown is in effect. All doors must be locked. Students and staff remain in your current location. Do not open doors for anyone. Police have been notified. Stay calm and follow your safety procedures.'
    );
    speechSynthesis.speak(utterance);

    paLog.unshift({
      id: Date.now(),
      text: 'SECURITY THREAT ALERT ACTIVATED',
      timestamp: new Date().toISOString(),
      type: 'emergency'
    });

    saveData();
    renderPALog();
    renderEmergencyLog();
  }
}

function triggerEarthquake() {
  if (confirm('Activate EARTHQUAKE ALERT? This will trigger safety procedures.')) {
    emergencyActive = true;
    document.getElementById('emergency-alert').style.display = 'block';
    document.getElementById('emergency-message').textContent =
      'EARTHQUAKE ALERT: Drop, Cover, and Hold On! Stay under desks or against interior walls. Protect your head and neck. Remain in position until shaking stops.';

    const utterance = createSpeechUtterance(
      'Attention please. Earthquake alert. Drop, cover, and hold on. Stay under desks or against interior walls. Protect your head and neck. Remain in position until the shaking stops. Teachers, ensure all students are following safety procedures.'
    );
    speechSynthesis.speak(utterance);

    paLog.unshift({
      id: Date.now(),
      text: 'EARTHQUAKE ALERT ACTIVATED',
      timestamp: new Date().toISOString(),
      type: 'emergency'
    });

    saveData();
    renderPALog();
    renderEmergencyLog();
  }
}

function triggerPowerOutage() {
  if (confirm('Activate POWER OUTAGE ALERT? This will notify staff of procedures.')) {
    emergencyActive = true;
    document.getElementById('emergency-alert').style.display = 'block';
    document.getElementById('emergency-message').textContent =
      'POWER OUTAGE: Emergency lighting and backup systems are active. Teachers, account for all students. Remain in classrooms until power is restored or further instructions given.';

    const utterance = createSpeechUtterance(
      'Attention please. Power outage in effect. Emergency lighting and backup systems are active. Teachers, please account for all students in your class. Remain in classrooms until power is restored or further instructions are given.'
    );
    speechSynthesis.speak(utterance);

    paLog.unshift({
      id: Date.now(),
      text: 'POWER OUTAGE ALERT ACTIVATED',
      timestamp: new Date().toISOString(),
      type: 'emergency'
    });

    saveData();
    renderPALog();
    renderEmergencyLog();
  }
}

// Quick Emergency Actions
function quickEvacuation() {
  triggerLockdown();
}

function quickLockdown() {
  triggerLockdownDrill();
}

function quickMedical() {
  triggerMedicalEmergency();
}

function quickAllClear() {
  allClear();
}

function clearEmergency() {
  allClear();
}

function renderPALog() {
  const log = document.getElementById('pa-log');
  log.innerHTML = paLog.slice(0, 10).map(entry => `
    <div class="log-entry">
      <strong>${entry.type.toUpperCase()}</strong> - ${new Date(entry.timestamp).toLocaleString()}
      <br><small>${entry.text}</small>
    </div>
  `).join('');
}

// Advanced PA System Functions
function initializePASystem() {
  // Apply stored preferences
  const maleCheckbox = document.getElementById('pa-male-voice');
  if (maleCheckbox) {
    maleCheckbox.checked = paPreferMaleVoice;
    maleCheckbox.addEventListener('change', () => {
      paPreferMaleVoice = maleCheckbox.checked;
      saveData();
      loadVoices();
    });
  }

  loadVoices();
  renderScheduledAnnouncements();
  renderSavedTemplates();

  // Set default mosque-focused announcement
  setTimeout(() => {
    document.getElementById('announcement-type').value = 'azan';
    updateAnnouncementTemplates();
  }, 100);
}

function loadVoices() {
  const voiceSelect = document.getElementById('pa-voice');

  function populateVoices() {
    const voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';

    // Separate Pakistani/Urdu voices and other voices
    const pakistaniVoices = [];
    const englishVoices = [];
    const otherVoices = [];

    voices.forEach((voice, index) => {
      const voiceOption = {
        voice: voice,
        index: index,
        name: `${voice.name} (${voice.lang})`,
        isPakistani: voice.lang.includes('ur') || voice.lang.includes('hi') ||
                    voice.name.toLowerCase().includes('pakistan') ||
                    voice.name.toLowerCase().includes('urdu') ||
                    voice.name.toLowerCase().includes('indian') ||
                    voice.name.toLowerCase().includes('hindi')
      };

      if (voiceOption.isPakistani) {
        pakistaniVoices.push(voiceOption);
      } else if (voice.lang.includes('en')) {
        englishVoices.push(voiceOption);
      } else {
        otherVoices.push(voiceOption);
      }
    });

    // Add Pakistani voices first with special labeling
    if (pakistaniVoices.length > 0) {
      const pakGroup = document.createElement('optgroup');
      pakGroup.label = '🇵🇰 Pakistani/Urdu Voices';
      pakistaniVoices.forEach(v => {
        const option = document.createElement('option');
        option.value = v.index;
        const malePrefix = isMaleVoice(v.voice) ? '♂ ' : '';
        option.textContent = `🇵🇰 ${malePrefix}${v.name}`;
        option.style.fontWeight = 'bold';
        option.style.color = '#006600';
        pakGroup.appendChild(option);
      });
      voiceSelect.appendChild(pakGroup);
    }

    // Add English voices
    if (englishVoices.length > 0) {
      const engGroup = document.createElement('optgroup');
      engGroup.label = '🇺🇸 English Voices';
      englishVoices.forEach(v => {
        const option = document.createElement('option');
        option.value = v.index;
        const malePrefix = isMaleVoice(v.voice) ? '♂ ' : '';
        option.textContent = `${malePrefix}${v.name}`;
        engGroup.appendChild(option);
      });
      voiceSelect.appendChild(engGroup);
    }

    // Add other voices
    if (otherVoices.length > 0) {
      const otherGroup = document.createElement('optgroup');
      otherGroup.label = '🌍 Other Languages';
      otherVoices.forEach(v => {
        const option = document.createElement('option');
        option.value = v.index;
        const malePrefix = isMaleVoice(v.voice) ? '♂ ' : '';
        option.textContent = `${malePrefix}${v.name}`;
        otherGroup.appendChild(option);
      });
      voiceSelect.appendChild(otherGroup);
    }

    // Auto-select a preferred male voice if requested, otherwise prefer a Pakistani voice if available
    const preferMale = paPreferMaleVoice;
    if (preferMale) {
      const maleIndex = voices.findIndex(v => isMaleVoice(v));
      if (maleIndex >= 0) {
        voiceSelect.value = maleIndex;
        paDefaultVoiceIndex = maleIndex;
        return;
      }
    }

    if (paDefaultVoiceIndex !== null && voices[paDefaultVoiceIndex]) {
      voiceSelect.value = paDefaultVoiceIndex;
    } else if (pakistaniVoices.length > 0) {
      voiceSelect.value = pakistaniVoices[0].index;
    }

    // Persist current voice selection
    voiceSelect.onchange = () => {
      paDefaultVoiceIndex = Number(voiceSelect.value);
      saveData();
    };
  }

  populateVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
      populateVoices();
      if (paDefaultVoiceIndex !== null) {
        document.getElementById('pa-voice').value = paDefaultVoiceIndex;
      }
    };
  }
}

function isMaleVoice(voice) {
  const name = (voice.name || '').toLowerCase();
  // Basic heuristics: many system voices include gendered names or the word "male"
  return /\b(male|man|david|john|mike|michael|daniel|alex|tom|chris|paul|mark|adam|james|robert|steve)\b/.test(name);
}

function createSpeechUtterance(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  const preferMale = paPreferMaleVoice;
  const voiceIndex = Number(document.getElementById('pa-voice').value);

  // Prefer a male voice when requested (falls back to selected voice)
  if (preferMale) {
    const maleIndex = voices.findIndex(v => isMaleVoice(v));
    if (maleIndex >= 0) {
      utterance.voice = voices[maleIndex];
    }
  }

  if (!utterance.voice && voices[voiceIndex]) {
    utterance.voice = voices[voiceIndex];
    paDefaultVoiceIndex = voiceIndex;
    saveData();
  }

  utterance.volume = document.getElementById('pa-volume').value / 100;
  utterance.rate = document.getElementById('pa-rate').value;
  utterance.pitch = document.getElementById('pa-pitch').value;

  // Slightly lower pitch for male-like tone when preferred
  if (preferMale && utterance.pitch > 0.9) {
    utterance.pitch = 0.9;
  }

  return utterance;
}

function updateAnnouncementTemplates() {
  const type = document.getElementById('announcement-type').value;
  const textArea = document.getElementById('pa-text');

  const templates = {
    'fajr': 'Assalamu Alaikum. It is time for Fajr prayer. All Muslim students and staff may proceed to the prayer area. Fajr prayer begins now.',
    'dhuhr': 'Assalamu Alaikum. It is time for Dhuhr prayer. All Muslim students and staff may proceed to the prayer area. Dhuhr prayer begins now.',
    'asr': 'Assalamu Alaikum. It is time for Asr prayer. All Muslim students and staff may proceed to the prayer area. Asr prayer begins now.',
    'maghrib': 'Assalamu Alaikum. It is time for Maghrib prayer. All Muslim students and staff may proceed to the prayer area. Maghrib prayer begins now.',
    'isha': 'Assalamu Alaikum. It is time for Isha prayer. All Muslim students and staff may proceed to the prayer area. Isha prayer begins now.',
    'azan': 'Assalamu Alaikum. The call to prayer has begun. All Muslim students and staff may proceed to the prayer area. Non-Muslim students, please remain quiet and respectful during this time.',
    'eid': 'Eid Mubarak to all our Muslim students and staff! School will be closed today in celebration of Eid-ul-Fitr. Khuda Hafiz and enjoy the festivities with your families.',
    'ramadan': 'Ramadan Kareem to all our Muslim students. During this blessed month, please be mindful of fasting times and show respect to your fasting classmates.',
    'jummah': 'Assalamu Alaikum. It is time for Jummah prayer. All Muslim male students and staff may proceed to the mosque for Friday prayer. Classes are suspended for Jummah.',
    'iftar': 'Assalamu Alaikum. Iftar time has arrived. All fasting students may break their fast. Maghrib prayer will follow shortly.',
    'sehar': 'Assalamu Alaikum. Sehri time is ending. All fasting students should complete their Sehri meal before Fajr prayer begins.',
    'quran': 'Assalamu Alaikum. Quran recitation class begins now. All students participating in Quran studies, please proceed to the designated area.',
    'islamic-studies': 'Assalamu Alaikum. Islamic Studies class begins now. All students enrolled in Islamic Studies, please proceed to your classroom.',
    'assembly': 'Assalamu Alaikum. All students and staff are requested to assemble in the main hall for an important Islamic assembly.',
    'sports': 'Assalamu Alaikum. Sports activities begin now. All students participating in sports should report to the sports ground wearing appropriate Islamic attire.',
    'exam': 'Assalamu Alaikum. Examinations begin today. Students, please arrive on time and come prepared. May Allah grant you success in your studies!',
    'holiday': 'Assalamu Alaikum. Due to Islamic holiday, school will remain closed today. Classes will resume tomorrow.',
    'emergency-drill': 'Assalamu Alaikum. This is an emergency drill. Please evacuate the building using the nearest exit and proceed to the assembly point in an orderly manner.',
    'medical': 'Assalamu Alaikum. Medical emergency in progress. Please remain calm. Medical staff and ambulance have been called.',
    'weather': 'Assalamu Alaikum. Due to severe weather conditions, school will close early today. Parents, please collect your children promptly.',
    'power': 'Assalamu Alaikum. Power outage in effect. Emergency lighting and backup systems are active. Please remain in your current locations until power is restored.',
    'security': 'Assalamu Alaikum. Security alert activated. All doors are to be locked. Students and staff should shelter in place until further notice.',
    'earthquake': 'Assalamu Alaikum. Earthquake safety procedures: Drop, cover, and hold on. Protect your head and stay under cover until shaking stops.',
    'evacuation': 'Assalamu Alaikum. Emergency evacuation required. Leave the building immediately using marked exits. Teachers, lead your students to safety.',
    'all-clear': 'Assalamu Alaikum. All clear. The emergency has been resolved. Normal activities may resume. Thank you for your cooperation.'
  };

  if (templates[type]) {
    textArea.value = templates[type];
  }
}

function makeAnnouncement() {
  const text = document.getElementById('pa-text').value.trim();
  if (!text) {
    showStatus('Please enter announcement text', 'error');
    return;
  }

  const priority = document.getElementById('pa-priority').value;
  const utterance = createSpeechUtterance(text);
  const voiceName = utterance.voice?.name || 'Default';

  enqueueAnnouncement({ text, priority, voiceName });

  paLog.unshift({
    id: Date.now(),
    text: text,
    timestamp: new Date().toISOString(),
    type: 'announcement',
    priority: priority,
    voice: voiceName
  });

  saveData();
  renderPALog();
  updateDashboard();

  document.getElementById('pa-text').value = '';
  showStatus('Announcement queued', 'success');
}

function enqueueAnnouncement(item) {
  // Apply audio effects by adjusting volume before queuing
  if (document.getElementById('pa-echo').checked) {
    item.echo = true;
  }

  announcementQueue.push(item);
  updateQueueStatus();
  processAnnouncementQueue();
}

function updateQueueStatus() {
  const statusEl = document.getElementById('queue-status');
  const listEl = document.getElementById('queue-list');

  if (!statusEl || !listEl) return;

  if (announcementQueue.length === 0) {
    statusEl.style.display = 'none';
    listEl.innerHTML = '';
    return;
  }

  statusEl.style.display = 'block';
  listEl.innerHTML = announcementQueue.map((item, idx) => `
    <div style="margin-bottom: 6px;">
      <strong>#${idx + 1}</strong> [${item.priority}] <em>${item.voice}</em><br>
      ${item.text.length > 120 ? item.text.slice(0, 120) + '…' : item.text}
    </div>
  `).join('');
}

async function processAnnouncementQueue() {
  if (announcementQueueProcessing) return;
  if (announcementQueue.length === 0) return;

  announcementQueueProcessing = true;

  while (announcementQueue.length > 0) {
    const item = announcementQueue.shift();
    updateQueueStatus();

    await speakQueuedAnnouncement(item);
  }

  announcementQueueProcessing = false;
  updateQueueStatus();
}

function speakQueuedAnnouncement(item) {
  return new Promise(resolve => {
    const utterance = createSpeechUtterance(item.text);
    if (item.echo) {
      utterance.volume *= 0.8;
    }

    const finish = () => {
      resolve();
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    if (item.priority === 'emergency') {
      ringBell();
      setTimeout(() => speechSynthesis.speak(utterance), 2000);
    } else if (item.priority === 'urgent') {
      ringBell();
      setTimeout(() => {
        ringBell();
        setTimeout(() => speechSynthesis.speak(utterance), 1000);
      }, 1000);
    } else {
      speechSynthesis.speak(utterance);
    }
  });
}

function clearAnnouncementQueue() {
  announcementQueue = [];
  speechSynthesis.cancel();
  announcementQueueProcessing = false;
  updateQueueStatus();
  showStatus('Announcement queue cleared', 'info');
}

function testAllVoices() {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) {
    showStatus('No voices available yet. Please wait a moment and try again.', 'error');
    return;
  }

  speechSynthesis.cancel();

  let index = 0;
  function playNext() {
    if (index >= voices.length) {
      showStatus('All voices tested.', 'success');
      return;
    }

    const voice = voices[index];
    const utterance = new SpeechSynthesisUtterance(`Testing voice: ${voice.name}`);
    utterance.voice = voice;
    utterance.volume = 0.9;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => {
      index += 1;
      setTimeout(playNext, 250);
    };

    speechSynthesis.speak(utterance);
  }

  showStatus('Testing all available voices...', 'info');
  playNext();
}

function previewAnnouncement() {
  const text = document.getElementById('pa-text').value.trim();
  if (!text) {
    showStatus('Please enter announcement text to preview', 'error');
    return;
  }

  const utterance = createSpeechUtterance(text);

  speechSynthesis.speak(utterance);
  showStatus('Preview playing...', 'info');
}

function saveAnnouncement() {
  const text = document.getElementById('pa-text').value.trim();
  const type = document.getElementById('announcement-type').value;

  if (!text) {
    showStatus('Please enter announcement text to save', 'error');
    return;
  }

  const template = {
    id: Date.now(),
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Template`,
    text: text,
    type: type,
    created: new Date().toISOString()
  };

  savedTemplates.push(template);
  saveData();
  renderSavedTemplates();
  showStatus('Template saved successfully', 'success');
}

function renderSavedTemplates() {
  const container = document.getElementById('announcement-templates');
  if (savedTemplates.length === 0) {
    container.innerHTML = '<p>No saved templates</p>';
    return;
  }

  container.innerHTML = savedTemplates.map(template => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid var(--border); margin: 5px 0; border-radius: 4px;">
      <div>
        <strong>${template.name}</strong>
        <br><small style="color: var(--muted);">${template.text.substring(0, 50)}...</small>
      </div>
      <div>
        <button class="btn btn-sm btn-primary" onclick="loadTemplate(${template.id})">Load</button>
        <button class="btn btn-sm btn-danger" onclick="deleteTemplate(${template.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function loadTemplate(id) {
  const template = savedTemplates.find(t => t.id === id);
  if (template) {
    document.getElementById('pa-text').value = template.text;
    document.getElementById('announcement-type').value = template.type;
    showStatus('Template loaded', 'success');
  }
}

function deleteTemplate(id) {
  savedTemplates = savedTemplates.filter(t => t.id !== id);
  saveData();
  renderSavedTemplates();
  showStatus('Template deleted', 'success');
}

// Scheduled Announcements
function showScheduleModal() {
  document.getElementById('schedule-modal').style.display = 'flex';
  document.getElementById('schedule-datetime').value = new Date().toISOString().slice(0, 16);
}

function closeScheduleModal() {
  document.getElementById('schedule-modal').style.display = 'none';
  document.getElementById('schedule-text').value = '';
}

function saveScheduledAnnouncement() {
  const text = document.getElementById('schedule-text').value.trim();
  const datetime = document.getElementById('schedule-datetime').value;
  const repeat = document.getElementById('schedule-repeat').value;

  if (!text || !datetime) {
    showStatus('Please fill in all fields', 'error');
    return;
  }

  const announcement = {
    id: Date.now(),
    text: text,
    scheduledTime: new Date(datetime).toISOString(),
    repeat: repeat,
    active: true
  };

  scheduledAnnouncements.push(announcement);
  saveData();
  renderScheduledAnnouncements();
  closeScheduleModal();
  showStatus('Announcement scheduled', 'success');
}

function renderScheduledAnnouncements() {
  const container = document.getElementById('scheduled-announcements');
  if (scheduledAnnouncements.length === 0) {
    container.innerHTML = '<p>No scheduled announcements</p>';
    return;
  }

  container.innerHTML = scheduledAnnouncements.map(announcement => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid var(--border); margin: 5px 0; border-radius: 4px;">
      <div>
        <strong>${new Date(announcement.scheduledTime).toLocaleString()}</strong>
        <br><small>${announcement.text.substring(0, 50)}...</small>
        <br><small style="color: var(--muted);">Repeat: ${announcement.repeat}</small>
      </div>
      <div>
        <button class="btn btn-sm btn-danger" onclick="deleteScheduledAnnouncement(${announcement.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function deleteScheduledAnnouncement(id) {
  scheduledAnnouncements = scheduledAnnouncements.filter(a => a.id !== id);
  saveData();
  renderScheduledAnnouncements();
  showStatus('Scheduled announcement deleted', 'success');
}

function startAnnouncementScheduler() {
  setInterval(() => {
    const now = new Date();
    scheduledAnnouncements.forEach(announcement => {
      if (!announcement.active) return;

      const scheduledTime = new Date(announcement.scheduledTime);
      if (Math.abs(now - scheduledTime) < 60000) { // Within 1 minute
        // Make the announcement
        document.getElementById('pa-text').value = announcement.text;
        makeAnnouncement();

        // Handle repeats
        if (announcement.repeat === 'once') {
          announcement.active = false;
        } else if (announcement.repeat === 'daily') {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
          announcement.scheduledTime = scheduledTime.toISOString();
        } else if (announcement.repeat === 'weekly') {
          scheduledTime.setDate(scheduledTime.getDate() + 7);
          announcement.scheduledTime = scheduledTime.toISOString();
        } else if (announcement.repeat === 'weekdays') {
          do {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
          } while (scheduledTime.getDay() === 0 || scheduledTime.getDay() === 6);
          announcement.scheduledTime = scheduledTime.toISOString();
        }

        saveData();
        renderScheduledAnnouncements();
      }
    });
  }, 30000); // Check every 30 seconds
}

// Audio Recording Functions
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'audio/wav' });
      const audioURL = URL.createObjectURL(blob);
      const audio = new Audio(audioURL);
      audio.controls = true;

      document.getElementById('play-recording-btn').onclick = () => audio.play();
      document.getElementById('play-recording-btn').style.display = 'inline-block';
    };

    mediaRecorder.start();
    isRecording = true;

    document.getElementById('record-btn').style.display = 'none';
    document.getElementById('stop-record-btn').style.display = 'inline-block';
    document.getElementById('recording-status').textContent = 'Recording...';
    document.getElementById('recording-status').style.color = 'var(--danger)';

  } catch (error) {
    showStatus('Error accessing microphone: ' + error.message, 'error');
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    isRecording = false;

    document.getElementById('record-btn').style.display = 'inline-block';
    document.getElementById('stop-record-btn').style.display = 'none';
    document.getElementById('recording-status').textContent = 'Recording saved';
    document.getElementById('recording-status').style.color = 'var(--success)';
  }
}

function playRecording() {
  // Recording playback is handled in the onstop event
}

// Additional Emergency Functions
function triggerLockdownDrill() {
  if (confirm('Activate LOCKDOWN DRILL? This will simulate a lockdown procedure.')) {
    emergencyActive = true;
    document.getElementById('emergency-alert').style.display = 'block';
    document.getElementById('emergency-message').textContent =
      'LOCKDOWN DRILL IN PROGRESS: This is a drill. Teachers, secure your classrooms immediately. Students, follow lockdown procedures. Do not leave until all-clear is given.';

    const utterance = createSpeechUtterance(
      'Attention. This is a lockdown drill. Teachers, secure your classrooms immediately. Students, follow your lockdown procedures. Stay quiet and await further instructions.'
    );
    speechSynthesis.speak(utterance);

    paLog.unshift({
      id: Date.now(),
      text: 'LOCKDOWN DRILL ACTIVATED',
      timestamp: new Date().toISOString(),
      type: 'emergency'
    });

    saveData();
    renderPALog();
    renderEmergencyLog();
  }
}

function triggerSevereWeather() {
  if (confirm('Activate SEVERE WEATHER ALERT?')) {
    emergencyActive = true;
    document.getElementById('emergency-alert').style.display = 'block';
    document.getElementById('emergency-message').textContent =
      'SEVERE WEATHER ALERT: Due to dangerous weather conditions, school activities are suspended. Parents, please pick up your children immediately. Staff, follow severe weather procedures.';

    const utterance = createSpeechUtterance(
      'Severe weather alert. Due to dangerous weather conditions, all school activities are suspended. Parents, please pick up your children immediately. Staff, follow severe weather procedures.'
    );
    speechSynthesis.speak(utterance);

    paLog.unshift({
      id: Date.now(),
      text: 'SEVERE WEATHER ALERT ACTIVATED',
      timestamp: new Date().toISOString(),
      type: 'emergency'
    });

    saveData();
    renderPALog();
    renderEmergencyLog();
  }
}

function triggerMedicalEmergency() {
  if (confirm('Activate MEDICAL EMERGENCY ALERT?')) {
    emergencyActive = true;
    document.getElementById('emergency-alert').style.display = 'block';
    document.getElementById('emergency-message').textContent =
      'MEDICAL EMERGENCY: A medical emergency has been reported. Medical staff and first aid responders, please report to [location]. All other staff, maintain normal operations unless directed otherwise.';

    const utterance = createSpeechUtterance(
      'Medical emergency alert. Medical staff and first aid responders, please report to the designated location immediately. All other staff, maintain normal operations unless directed otherwise.'
    );
    speechSynthesis.speak(utterance);

    paLog.unshift({
      id: Date.now(),
      text: 'MEDICAL EMERGENCY ALERT ACTIVATED',
      timestamp: new Date().toISOString(),
      type: 'emergency'
    });

    saveData();
    renderPALog();
    renderEmergencyLog();
  }
}

function renderEmergencyLog() {
  // Emergency log is part of the main PA log, so this function can be empty or used for specific emergency filtering
  renderPALog();
}

// Bell functions - Upgraded with multiple types and patterns
let currentBellType = 'mosque';
let currentBellPattern = 'triple';

function ringBell() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  const volume = document.getElementById('bell-volume').value / 100;
  const pattern = document.getElementById('bell-pattern').value;

  // Visual feedback
  const bellVisual = document.getElementById('bell-visual');
  bellVisual.classList.add('ringing');
  setTimeout(() => {
    bellVisual.classList.remove('ringing');
  }, 1000);

  // Different patterns
  let timings = [];
  switch(pattern) {
    case 'single':
      timings = [0];
      break;
    case 'double':
      timings = [0, 800];
      break;
    case 'triple':
      timings = [0, 800, 1600];
      break;
    case 'continuous':
      timings = [0, 500, 1000, 1500, 2000];
      break;
  }

  timings.forEach((delay, ring) => {
    setTimeout(() => {
      playBellTone(volume, currentBellType);
    }, delay);
  });

  // Log the bell ring
  const bellTypeNames = {
    'school': 'Traditional School Bell',
    'modern': 'Modern Electronic Bell',
    'fire': 'Fire Alarm',
    'mosque': 'Mosque Adhan',
    'gong': 'Temple Gong'
  };

  paLog.unshift({
    id: Date.now(),
    text: `${bellTypeNames[currentBellType]} rang (${pattern} pattern)`,
    timestamp: new Date().toISOString(),
    type: 'bell'
  });

  saveData();
  renderPALog();
}

function playBellTone(volume, type) {
  let duration, harmonics;

  switch(type) {
    case 'school':
      duration = 3.0;
      harmonics = [
        { freq: 523.25, amp: 1.0 },    // C5 - fundamental (strong, clear tone)
        { freq: 1046.5, amp: 0.8 },    // C6 - octave (reinforces fundamental)
        { freq: 1569.75, amp: 0.6 },   // G6 - fifth harmonic
        { freq: 2093.0, amp: 0.4 },    // C7 - second octave
        { freq: 2629.25, amp: 0.3 },   // E7 - major sixth
        { freq: 3138.5, amp: 0.2 },    // G7 - dominant
        { freq: 4186.0, amp: 0.15 }    // C8 - high octave
      ];
      break;

    case 'modern':
      duration = 1.0;
      harmonics = [
        { freq: 1000, amp: 1.0 },   // Clean electronic tone
        { freq: 2000, amp: 0.3 },   // Second harmonic
        { freq: 3000, amp: 0.1 }    // Third harmonic
      ];
      break;

    case 'fire':
      duration = 0.8;
      harmonics = [
        { freq: 800, amp: 1.0 },    // Low frequency alarm
        { freq: 1200, amp: 0.8 },   // Higher alarm tone
        { freq: 1600, amp: 0.6 }    // Even higher
      ];
      break;

    case 'mosque':
      duration = 8.0; // Longer for authentic adhan feel
      harmonics = [
        // Primary adhan tones - authentic frequencies used in Islamic call to prayer
        { freq: 146.83, amp: 1.0 },   // D3 - deep resonant base (الله أكبر)
        { freq: 164.81, amp: 0.95 },  // E3 - Allahu Akbar tone
        { freq: 195.00, amp: 0.9 },   // G3 - La ilaha illallah
        { freq: 220.00, amp: 0.85 },  // A3 - Ashhadu an la ilaha
        { freq: 246.94, amp: 0.8 },   // B3 - Muhammadur rasulullah
        { freq: 293.66, amp: 0.75 },  // D4 - Hayya alassalah
        { freq: 329.63, amp: 0.7 },   // E4 - Hayya alalfalah
        { freq: 369.99, amp: 0.65 },  // F#4 - Allahu Akbar (higher)
        { freq: 415.30, amp: 0.6 },   // G#4 - La ilaha illallah (higher)
        { freq: 493.88, amp: 0.55 },  // B4 - Ashhadu an la ilaha (higher)
        { freq: 554.37, amp: 0.5 },   // C#5 - Muhammadur rasulullah (higher)
        { freq: 659.25, amp: 0.45 },  // E5 - Hayya alassalah (higher)
        { freq: 739.99, amp: 0.4 },   // F#5 - Hayya alalfalah (higher)
        { freq: 830.61, amp: 0.35 },  // G#5 - Allahu Akbar (highest)
        { freq: 987.77, amp: 0.3 }    // B5 - Final resonant tone
      ];
      break;

    case 'gong':
      duration = 4.0;
      harmonics = [
        { freq: 130.81, amp: 1.0 },   // C3 - deep fundamental
        { freq: 261.63, amp: 0.8 },   // C4 - octave
        { freq: 392.00, amp: 0.6 },   // G4 - fifth
        { freq: 523.25, amp: 0.4 },   // C5 - high octave
        { freq: 654.06, amp: 0.3 }    // E5 - major sixth
      ];
      break;

    default:
      duration = 2.5;
      harmonics = [{ freq: 800, amp: 1.0 }];
  }

  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
  const data = buffer.getChannelData(0);

  for(let i = 0; i < duration * sampleRate; i++){
    const t = i / sampleRate;
    let wave = 0;

    // Add strike noise for realistic sound
    const strike = (t < 0.05) ? (Math.random() - 0.5) * 0.3 : 0;

    harmonics.forEach(harm => {
      let envelope;
      if (type === 'mosque') {
        // Authentic adhan-style envelope with slow decay and slight modulation
        const baseDecay = Math.exp(-t * 0.03); // Very slow decay
        const modulation = 1 + 0.1 * Math.sin(t * 2 * Math.PI * 0.5); // Slow wavering
        envelope = baseDecay * modulation;
      } else if (type === 'gong') {
        // Gong-style exponential decay
        envelope = Math.exp(-t * 0.08) * Math.sin(t * Math.PI * 2);
      } else if (type === 'fire') {
        // Fire alarm - pulsing
        envelope = Math.sin(t * Math.PI * 8) * Math.exp(-t * 0.5);
      } else {
        // Standard bell decay
        envelope = Math.exp(-t * 0.3) * (1 - Math.exp(-t * 10));
      }

      wave += Math.sin(2 * Math.PI * harm.freq * t) * harm.amp * envelope;
    });

    // Overall envelope with type-specific characteristics
    let attackTime, decayRate;
    if (type === 'mosque') {
      attackTime = 0.1; // Slower attack for adhan
      decayRate = 0.02; // Very slow decay for sustained resonance
    } else {
      attackTime = 0.02;
      decayRate = 0.2;
    }

    const attack = t < attackTime ? (t / attackTime) : 1;
    const overallEnvelope = attack * Math.exp(-t * decayRate);

    data[i] = (wave + strike) * overallEnvelope * volume;
  }

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
}

function changeBellType() {
  currentBellType = document.getElementById('bell-type').value;
  updateBellDescription();
}

function updateBellVolume() {
  // Volume is handled in real-time by the range input
}

function updateBellDescription() {
  const descriptions = {
    'school': 'Traditional School Bell (authentic harmonics, clear tone, 3.0s duration, triple ring pattern)',
    'modern': 'Modern Electronic Bell (clean digital tone, 1s duration)',
    'fire': 'Fire Alarm (urgent pulsing sound, 0.8s duration)',
    'mosque': 'Mosque Adhan Call (authentic Islamic call to prayer, 8s duration, spiritual resonance with traditional frequencies)',
    'gong': 'Temple Gong (deep resonant tone, 4s duration, Eastern harmonics)'
  };

  document.getElementById('bell-description').innerHTML =
    `<strong>Current Bell:</strong> ${descriptions[currentBellType]}`;
}

function testBellSchedule() {
  if (bellSchedule.length === 0) {
    showStatus('No bells scheduled to test', 'warning');
    return;
  }

  showStatus('Testing all scheduled bells...', 'info');
  bellSchedule.forEach((schedule, index) => {
    if (schedule.active) {
      setTimeout(() => {
        ringBell();
        showStatus(`Testing bell ${index + 1}/${bellSchedule.length}`, 'info');
      }, index * 2000); // 2 second intervals between test rings
    }
  });
}

function addBellTime() {
  const time = prompt('Enter bell time (HH:MM):', '09:00');
  if (time) {
    bellSchedule.push({ time: time, active: true });
    saveData();
    renderBellSchedule();
  }
}

function renderBellSchedule() {
  const list = document.getElementById('bell-schedule-list');
  if (bellSchedule.length === 0) {
    list.innerHTML = '<p>No scheduled bells</p>';
    return;
  }

  list.innerHTML = bellSchedule.map((item, index) => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid var(--border); margin: 5px 0; border-radius: 4px;">
      <span>${item.time} ${item.active ? '(Active)' : '(Inactive)'}</span>
      <button class="btn btn-danger" onclick="removeBellTime(${index})">Remove</button>
    </div>
  `).join('');
}

function removeBellTime(index) {
  bellSchedule.splice(index, 1);
  saveData();
  renderBellSchedule();
}

function startBellChecker() {
  setInterval(() => {
    if (bellSchedule.length === 0) return;

    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' +
                       now.getMinutes().toString().padStart(2, '0');

    bellSchedule.forEach(schedule => {
      if (schedule.active && schedule.time === currentTime) {
        ringBell();
      }
    });
  }, 60000); // Check every minute
}

// Detentions functions
function renderDetentions() {
  const tbody = document.getElementById('detention-table-body');
  if (detentions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--muted);">No detentions scheduled</td></tr>';
    return;
  }

  tbody.innerHTML = detentions.map(detention => `
    <tr>
      <td>${detention.student}</td>
      <td>${detention.reason}</td>
      <td>${detention.date}</td>
      <td>
        <select onchange="updateDetentionStatus(${detention.id}, this.value)">
          <option value="scheduled" ${detention.status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
          <option value="served" ${detention.status === 'served' ? 'selected' : ''}>Served</option>
          <option value="cancelled" ${detention.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
    </tr>
  `).join('');
}

function updateDetentionStatus(id, status) {
  const detention = detentions.find(d => d.id === id);
  if (detention) {
    detention.status = status;
    saveData();
    renderDetentions();
  }
}

// Audio functions for emergency
let sirenSource = null;

function startFireSiren() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  stopSiren();

  const oscA = audioContext.createOscillator();
  const oscB = audioContext.createOscillator();
  oscA.type = 'sawtooth';
  oscB.type = 'sine';
  oscA.frequency.value = 900;
  oscB.frequency.value = 1300;

  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.6;

  const lfoGain = audioContext.createGain();
  lfoGain.gain.value = 300;
  lfo.connect(lfoGain);
  lfoGain.connect(oscA.frequency);
  lfoGain.connect(oscB.frequency);

  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0;
  oscA.connect(gainNode);
  oscB.connect(gainNode);
  gainNode.connect(audioContext.destination);

  gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(1.0, audioContext.currentTime + 0.5);

  oscA.start(audioContext.currentTime);
  oscB.start(audioContext.currentTime);
  lfo.start(audioContext.currentTime);

  sirenSource = { oscA, oscB, lfo, gainNode };
}

function stopSiren() {
  if (sirenSource) {
    const now = audioContext.currentTime;
    sirenSource.gainNode.gain.setTargetAtTime(0.0001, now, 0.2);
    setTimeout(() => {
      try {
        sirenSource.oscA.stop();
        sirenSource.oscB.stop();
        sirenSource.lfo.stop();
      } catch (e) {}
    }, 500);
    sirenSource = null;
  }
}

// Emergency log functions
function renderEmergencyLog() {
  const log = document.getElementById('emergency-log');
  const emergencyMessages = paLog.filter(entry => entry.type === 'emergency');

  if (emergencyMessages.length === 0) {
    log.innerHTML = '<p style="color: var(--muted); text-align: center;">No emergency messages sent yet</p>';
    return;
  }

  log.innerHTML = emergencyMessages.slice(0, 20).map(entry => `
    <div class="log-entry" style="border-left: 4px solid var(--danger); padding-left: 10px; margin: 5px 0;">
      <strong style="color: var(--danger);">${entry.text}</strong>
      <br><small style="color: var(--muted);">${new Date(entry.timestamp).toLocaleString()}</small>
    </div>
  `).join('');
}

function clearEmergencyLog() {
  if (confirm('Clear all emergency message history?')) {
    // Remove only emergency messages from paLog
    const nonEmergencyMessages = paLog.filter(entry => entry.type !== 'emergency');
    paLog.length = 0; // Clear the array
    paLog.push(...nonEmergencyMessages); // Add back non-emergency messages
    saveData();
    renderEmergencyLog();
    renderPALog(); // Update PA log as well
    showStatus('Emergency log cleared', 'success');
  }
}

// Dashboard functions
function updateDashboard() {
  // Attendance summary
  const today = new Date().toISOString().split('T')[0];
  const todayData = attendanceData[today] || {};
  const present = Object.values(todayData).filter(status => status === 'present').length;
  const absent = Object.values(todayData).filter(status => status === 'absent').length;
  const late = Object.values(todayData).filter(status => status === 'late').length;

  document.getElementById('attendance-summary').innerHTML = `
    <div style="display: flex; justify-content: space-around; margin-top: 10px;">
      <div style="text-align: center;">
        <div style="font-size: 24px; color: var(--success);">${present}</div>
        <div>Present</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 24px; color: var(--danger);">${absent}</div>
        <div>Absent</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 24px; color: var(--warning);">${late}</div>
        <div>Late</div>
      </div>
    </div>
  `;

  // Behavior summary
  const todayIncidents = behaviorLog.filter(entry =>
    entry.timestamp.startsWith(today)
  ).length;

  document.getElementById('behavior-summary').innerHTML = `
    <div style="font-size: 24px; color: var(--warning); margin: 10px 0;">${todayIncidents}</div>
    <div>Incidents today</div>
  `;

  // Recent announcements
  const recentPA = paLog.slice(0, 3);
  document.getElementById('announcement-log').innerHTML = recentPA.length ?
    recentPA.map(entry => `<div style="margin: 5px 0; padding: 5px; background: #f0f0f0; border-radius: 3px;">${entry.text}</div>`).join('') :
    'No recent announcements';

  // Next bell
  const nextBell = bellSchedule.find(schedule => schedule.active);
  document.getElementById('bell-schedule').innerHTML = nextBell ?
    `Next scheduled: ${nextBell.time}` :
    'No scheduled bells';
}

// Assessment functions
let assessments = [];

function openAssessmentModal() {
  const subject = document.getElementById('assessment-subject').value;
  const type = document.getElementById('assessment-type').value;

  if (!subject || !type) {
    showStatus('Please select subject and assessment type', 'error');
    return;
  }

  // Simple assessment recording (in real Bromcom this would be more complex)
  const assessment = {
    id: Date.now(),
    subject: subject,
    type: type,
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString()
  };

  assessments.unshift(assessment);
  saveData();
  renderAssessmentLog();
  showStatus('Assessment recorded', 'success');
}

function renderAssessmentLog() {
  const log = document.getElementById('assessment-log');
  if (assessments.length === 0) {
    log.innerHTML = 'No assessments recorded yet';
    return;
  }

  log.innerHTML = assessments.slice(0, 10).map(assessment => `
    <div class="log-entry">
      <strong>${assessment.subject.toUpperCase()}</strong> - ${assessment.type}
      <br><small>${new Date(assessment.timestamp).toLocaleString()}</small>
    </div>
  `).join('');
}

// Reporting functions
function generateReport() {
  const reportType = document.getElementById('report-type').value;
  const period = document.getElementById('report-period').value;
  const results = document.getElementById('report-results');

  let reportData = '';

  switch(reportType) {
    case 'attendance':
      const today = new Date().toISOString().split('T')[0];
      const todayData = attendanceData[today] || {};
      const present = Object.values(todayData).filter(status => status === 'present').length;
      const absent = Object.values(todayData).filter(status => status === 'absent').length;
      const late = Object.values(todayData).filter(status => status === 'late').length;

      reportData = `
        <h4>Attendance Report - ${period === 'today' ? 'Today' : 'Period'}</h4>
        <div style="display: flex; gap: 20px; margin: 20px 0;">
          <div style="text-align: center; padding: 15px; background: var(--success); color: white; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: bold;">${present}</div>
            <div>Present</div>
          </div>
          <div style="text-align: center; padding: 15px; background: var(--danger); color: white; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: bold;">${absent}</div>
            <div>Absent</div>
          </div>
          <div style="text-align: center; padding: 15px; background: var(--warning); color: white; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: bold;">${late}</div>
            <div>Late</div>
          </div>
        </div>
      `;
      break;

    case 'behavior':
      const todayIncidents = behaviorLog.filter(entry =>
        entry.timestamp.startsWith(new Date().toISOString().split('T')[0])
      ).length;

      reportData = `
        <h4>Behavior Report - ${period === 'today' ? 'Today' : 'Period'}</h4>
        <div style="padding: 20px; background: var(--warning); color: white; border-radius: 8px; margin: 20px 0;">
          <div style="font-size: 24px; font-weight: bold;">${todayIncidents}</div>
          <div>Behavior Incidents</div>
        </div>
        <div style="margin-top: 15px;">
          <strong>Recent Incidents:</strong>
          <ul>
            ${behaviorLog.slice(0, 5).map(entry => `<li>${entry.student} - Code ${entry.code}</li>`).join('')}
          </ul>
        </div>
      `;
      break;

    case 'assessments':
      reportData = `
        <h4>Assessment Report - ${period === 'today' ? 'Today' : 'Period'}</h4>
        <div style="padding: 20px; background: var(--primary); color: white; border-radius: 8px; margin: 20px 0;">
          <div style="font-size: 24px; font-weight: bold;">${assessments.length}</div>
          <div>Assessments Recorded</div>
        </div>
        <div style="margin-top: 15px;">
          <strong>Recent Assessments:</strong>
          <ul>
            ${assessments.slice(0, 5).map(assessment => `<li>${assessment.subject} - ${assessment.type}</li>`).join('')}
          </ul>
        </div>
      `;
      break;

    case 'detentions':
      reportData = `
        <h4>Detention Report - ${period === 'today' ? 'Today' : 'Period'}</h4>
        <div style="padding: 20px; background: var(--danger); color: white; border-radius: 8px; margin: 20px 0;">
          <div style="font-size: 24px; font-weight: bold;">${detentions.length}</div>
          <div>Detentions Scheduled</div>
        </div>
        <div style="margin-top: 15px;">
          <strong>Scheduled Detentions:</strong>
          <ul>
            ${detentions.slice(0, 5).map(detention => `<li>${detention.student} - ${detention.reason}</li>`).join('')}
          </ul>
        </div>
      `;
      break;
  }

  results.innerHTML = reportData;
}

function exportReport() {
  const reportType = document.getElementById('report-type').value;
  const period = document.getElementById('report-period').value;

  let csvContent = '';
  let filename = '';

  switch(reportType) {
    case 'attendance':
      const today = new Date().toISOString().split('T')[0];
      const todayData = attendanceData[today] || {};
      csvContent = 'Student,Status\n' +
        students.map(s => `${s.name},${todayData[s.id] || 'unknown'}`).join('\n');
      filename = `attendance_report_${today}.csv`;
      break;

    case 'behavior':
      csvContent = 'Student,Code,Description,Date\n' +
        behaviorLog.map(entry => `"${entry.student}","${entry.code}","${entry.description}","${new Date(entry.timestamp).toLocaleDateString()}"`).join('\n');
      filename = `behavior_report_${period}.csv`;
      break;

    case 'assessments':
      csvContent = 'Subject,Type,Date\n' +
        assessments.map(assessment => `"${assessment.subject}","${assessment.type}","${assessment.date}"`).join('\n');
      filename = `assessment_report_${period}.csv`;
      break;

    case 'detentions':
      csvContent = 'Student,Reason,Date,Status\n' +
        detentions.map(detention => `"${detention.student}","${detention.reason}","${detention.date}","${detention.status}"`).join('\n');
      filename = `detention_report_${period}.csv`;
      break;
  }

  if (csvContent) {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    showStatus('Report exported successfully', 'success');
  } else {
    showStatus('No data to export', 'error');
  }
}

// Utility functions
function showStatus(message, type) {
  const status = document.createElement('div');
  status.className = `status ${type}`;
  status.textContent = message;
  status.style.position = 'fixed';
  status.style.top = '20px';
  status.style.right = '20px';
  status.style.zIndex = '1000';

  document.body.appendChild(status);
  setTimeout(() => {
    document.body.removeChild(status);
  }, 3000);
}

// Initialize everything
renderBehaviorLog();
renderPALog();
renderEmergencyLog();
renderAssessmentLog();
renderDetentions();