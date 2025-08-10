// index.js - POVERTYKILLER V8 backend with test-signal endpoint
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const Database = require('better-sqlite3');
const admin = require('firebase-admin');

const PORT = process.env.PORT || 3000;
// Load service account from environment variable instead of file path
const serviceAccount = JSON.parse(process.env.FCM_SERVICE_ACCOUNT_JSON);

// Initialize Firebase Admin if service account exists
if (fs.existsSync(path.resolve(SERVICE_ACCOUNT_PATH))) {
  const serviceAccount = require(path.resolve(SERVICE_ACCOUNT_PATH));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  console.log('Firebase admin initialized.');
} else {
  console.warn('Firebase service account not found — Push notifications disabled.');
}

// SQLite setup
const dbPath = path.join(__dirname, 'signals.db');
const db = new Database(dbPath);
db.exec(`CREATE TABLE IF NOT EXISTS signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT,
  signal_type TEXT,
  entry_price REAL,
  target1 REAL,
  target2 REAL,
  stop_loss REAL,
  confidence REAL,
  timeframe TEXT,
  timestamp INTEGER
);`);

function saveSignal(s) {
  const stmt = db.prepare(`INSERT INTO signals (symbol, signal_type, entry_price, target1, target2, stop_loss, confidence, timeframe, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const info = stmt.run(s.symbol, s.signal_type, s.entry_price, s.target1, s.target2, s.stop_loss, s.confidence, s.timeframe, Math.floor(Date.now()/1000));
  return info.lastInsertRowid;
}

async function sendPush(signal) {
  if (!admin.apps.length) return;
  try {
    const message = {
      notification: {
        title: `${signal.signal_type} ${signal.symbol}`,
        body: `Entry ${signal.entry_price} | TP1 ${signal.target1} | SL ${signal.stop_loss}`
      },
      topic: 'all_users'
    };
    const resp = await admin.messaging().send(message);
    console.log('Push sent:', resp);
  } catch (err) {
    console.error('Push error:', err);
  }
}

const app = express();
app.use(express.json());

// Test signal endpoint
app.post('/api/test-signal', (req, res) => {
  const body = req.body || {};
  const signal = {
    symbol: body.symbol || 'EUR_USD',
    signal_type: body.signal_type || 'BUY',
    entry_price: body.entry_price || 1.23456,
    target1: body.target1 || 1.23600,
    target2: body.target2 || 1.24000,
    stop_loss: body.stop_loss || 1.23000,
    confidence: body.confidence || 0.8,
    timeframe: body.timeframe || '15m'
  };
  const id = saveSignal(signal);
  signal.id = id;
  sendPush(signal);
  res.json({ status: 'ok', id, signal });
});

// Fetch signals
app.get('/api/signals', (req, res) => {
  const rows = db.prepare('SELECT * FROM signals ORDER BY timestamp DESC LIMIT 50').all();
  res.json(rows);
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
