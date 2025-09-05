// index.js - SignalKiller V8 backend
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const Database = require('better-sqlite3');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// connect SQLite
const db = new Database('signals.db');

// create signals table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset TEXT,
    type TEXT,
    entry REAL,
    tp REAL,
    sl REAL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`).run();

// --- simple strategy engine ---
async function generateSignal(asset, symbol) {
  try {
    // Example using Alpha Vantage free API (replace with your key)
    const apiKey = process.env.ALPHA_VANTAGE_KEY || "demo";
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${apiKey}`;

    const response = await axios.get(url);
    const data = response.data["Time Series (5min)"];
    if (!data) return null;

    const prices = Object.values(data).map(d => parseFloat(d["4. close"]));
    if (prices.length < 20) return null;

    const last = prices[0];
    const prev = prices[1];

    // simple logic
    let type = last > prev ? "BUY" : "SELL";

    // tp/sl
    let tp = type === "BUY" ? last * 1.002 : last * 0.998;
    let sl = type === "BUY" ? last * 0.998 : last * 1.002;

    // insert into db
    db.prepare(
      "INSERT INTO signals (asset, type, entry, tp, sl) VALUES (?, ?, ?, ?, ?)"
    ).run(asset, type, last, tp, sl);

    return { asset, type, entry: last, tp, sl };
  } catch (err) {
    console.error("Error generating signal:", err.message);
    return null;
  }
}

// --- routes ---
app.get("/", (req, res) => {
  res.send("✅ SignalKiller V8 Backend running");
});

app.get("/api/signals", (req, res) => {
  try {
    const signals = db
      .prepare("SELECT * FROM signals ORDER BY created_at DESC LIMIT 10")
      .all();
    res.json(signals);
  } catch (err) {
    res.status(500).send("Error fetching signals");
  }
});

app.get("/api/generate", async (req, res) => {
  const signal = await generateSignal("EUR/USD", "EURUSD");
  if (signal) res.json(signal);
  else res.status(500).send("Failed to generate signal");
});

// start
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});