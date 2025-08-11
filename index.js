// index.js - POVERTYKILLER V8 backend
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const Database = require('better-sqlite3');
const admin = require('firebase-admin');

const PORT = process.env.PORT || 3000;

// Connect to SQLite database
const db = new Database('signals.db');

// Load Firebase service account from environment variable
if (process.env.FCM_SERVICE_ACCOUNT_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.FCM_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase admin initialized.');
  } catch (err) {
    console.error('Invalid Firebase service account JSON in env:', err.message);
  }
} else {
  console.warn('No Firebase service account found — push notifications disabled.');
}

const app = express();
app.use(express.json());

// Test endpoint
app.post('/api/test-signal', (req, res) => {
  const stmt = db.prepare('INSERT INTO signals (type, content) VALUES (?, ?)');
  stmt.run('test', 'This is a test signal');
  res.json({ success: true, message: 'Test signal created' });
});

// Get latest signals
app.get('/api/signals', (req, res) => {
  const rows = db.prepare('SELECT * FROM signals ORDER BY id DESC LIMIT 10').all();
  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
