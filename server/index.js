const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const cors = require('cors');

const DATA_FILE = path.join(__dirname, 'state.json');
const PORT = process.env.PORT || 4000;
const TIMEZONE = process.env.TIMEZONE || 'Europe/London';

function readState(){
  try{
    if(!fs.existsSync(DATA_FILE)) return { attendance: {}, behavior: {}, lastReset: null };
    return JSON.parse(fs.readFileSync(DATA_FILE,'utf8'));
  }catch(e){
    console.error('readState error', e);
    return { attendance: {}, behavior: {}, lastReset: null };
  }
}

function writeState(obj){
  fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), 'utf8');
}

// initialize file if missing
if(!fs.existsSync(DATA_FILE)){
  writeState({ attendance: {}, behavior: {}, lastReset: null });
}

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));

// Serve client static files from project root so visiting / shows the UI
const STATIC_DIR = path.join(__dirname, '..');
app.use(express.static(STATIC_DIR));
app.get('/', (req, res) => {
  return res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

// GET state for a key (attendance|behavior)
app.get('/api/state/:type', (req, res) => {
  const type = req.params.type;
  const state = readState();
  if(!state[type]) return res.status(404).json({ error: 'unknown type' });
  return res.json({ ok:true, data: state[type], lastReset: state.lastReset });
});

// POST state for a key (attendance|behavior)
app.post('/api/state/:type', (req, res) => {
  const type = req.params.type;
  const payload = req.body;
  const state = readState();
  state[type] = payload || {};
  writeState(state);
  return res.json({ ok:true });
});

// POST /api/reset  -> performs reset immediately (admin)
app.post('/api/reset', (req, res) => {
  const state = readState();
  state.attendance = {};
  state.behavior = {};
  const today = new Date();
  state.lastReset = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  writeState(state);
  console.log('Server reset performed');
  return res.json({ ok:true, message: 'reset complete', lastReset: state.lastReset });
});

// health
app.get('/api/health', (req,res)=>res.json({ok:true, now: new Date().toISOString(), tz: TIMEZONE}));

// schedule daily reset at midnight Europe/London
cron.schedule('0 0 * * *', ()=>{
  console.log('Cron midnight reset running for timezone', TIMEZONE);
  const state = readState();
  state.attendance = {};
  state.behavior = {};
  const today = new Date();
  state.lastReset = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  writeState(state);
  console.log('Midnight reset complete at', new Date().toISOString());
}, { timezone: TIMEZONE });

app.listen(PORT, ()=>{
  console.log(`MIS gateway server listening on port ${PORT}`);
  console.log('Timezone for cron:', TIMEZONE);
});
