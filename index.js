// index.js - Poverty Killer V8 Backend with Strategies
require('dotenv').config();
const express = require('express');
const Database = require('better-sqlite3');
const app = express();

const PORT = process.env.PORT || 10000;

// SQLite database
const db = new Database('signals.db');

// Create signals table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    pair TEXT,
    action TEXT,
    price REAL,
    created_at TEXT
  )
`).run();

// Root route
app.get('/', (req, res) => {
  res.send('✅ Poverty Killer V8 Backend is running!');
});

// Get latest signals
app.get('/api/signals', (req, res) => {
  try {
    const signals = db.prepare(
      'SELECT * FROM signals ORDER BY created_at DESC LIMIT 20'
    ).all();
    res.json(signals);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving signals');
  }
});

// Create a test signal
app.post('/api/test-signal', (req, res) => {
  try {
    db.prepare(
      'INSERT INTO signals (type, pair, action, price, created_at) VALUES (?, ?, ?, ?, datetime("now"))'
    ).run('forex', 'EUR/USD', 'BUY', 1.2345);
    res.send('Test signal added successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding signal');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});