// index.js - PovertyKiller V8 backend
require('dotenv').config();
const express = require('express');
const Database = require('better-sqlite3');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Connect to SQLite database
const db = new Database('signals.db');

// Initialize Firebase Admin from environment variable
if (process.env.FCM_SERVICE_ACCOUNT_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.FCM_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase admin initialized.');
  } catch (err) {
    console.error('Failed to initialize Firebase:', err);
  }
} else {
  console.warn('No Firebase service account found — Push notifications disabled.');
}

// Create signals table if not exists
db.prepare(
  CREATE TABLE IF NOT EXISTS signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    pair TEXT,
    price REAL,
    created_at TEXT
  )
).run();

// Root route
app.get('/', (req, res) => {
  res.send('Poverty Killer V8 Backend is running ✅');
});

// Fetch latest signals
app.get('/api/signals', (req, res) => {
  try {
    const signals = db.prepare('SELECT * FROM signals ORDER BY created_at DESC LIMIT 20').all();
    res.json(signals);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving signals');
  }
});

// Create a test signal
app.post('/api/test-signal', (req, res) => {
  try {
    db.prepare('INSERT INTO signals (type, pair, price, created_at) VALUES (?, ?, ?, datetime("now"))')
      .run('forex', 'EUR/USD', 1.2345);
    res.send('Test signal added successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding signal');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(Server running on port ${PORT});
});
