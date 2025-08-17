// index.js — LIVE SIGNALS (Forex + Crypto) using Alpha Vantage
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;
const AV_KEY = process.env.ALPHA_VANTAGE_KEY;
if (!AV_KEY) console.warn('ALPHA_VANTAGE_KEY not set — live scan will fail.');

// ----------------------- helpers: math/indicators -----------------------
const ema = (arr, period) => {
  const k = 2 / (period + 1);
  let emaArr = [];
  let prev = arr.slice(0, period).reduce((a, b) => a + b, 0) / period;
  emaArr[period - 1] = prev;
  for (let i = period; i < arr.length; i++) {
    const val = arr[i] * k + prev * (1 - k);
    emaArr[i] = val;
    prev = val;
  }
  return emaArr;
};

const rsi = (closes, period = 14) => {
  let gains = [], losses = [];
  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    gains.push(Math.max(diff, 0));
    losses.push(Math.max(-diff, 0));
  }
  const emaGain = ema(gains, period);
  const emaLoss = ema(losses, period);
  let out = Array(closes.length).fill(undefined);
  for (let i = 0; i < closes.length; i++) {
    if (i < period) continue;
    const g = emaGain[i - 1] ?? emaGain[emaGain.length - 1];
    const l = emaLoss[i - 1] ?? emaLoss[emaLoss.length - 1];
    const rs = (g || 1e-9) / ((l || 1e-9));
    out[i] = 100 - 100 / (1 + rs);
  }
  return out;
};

const sma = (arr, p) => arr.map((_, i) =>
  i + 1 >= p ? arr.slice(i - p + 1, i + 1).reduce((a, b) => a + b, 0) / p : undefined
);
const std = (arr, p) => arr.map((_, i) => {
  if (i + 1 < p) return undefined;
  const w = arr.slice(i - p + 1, i + 1);
  const m = w.reduce((a, b) => a + b, 0) / p;
  const v = w.reduce((a, b) => a + (b - m) ** 2, 0) / p;
  return Math.sqrt(v);
});

const bb = (closes, p = 20, mult = 2) => {
  const mid = sma(closes, p);
  const s = std(closes, p);
  const upper = closes.map((_, i) => (mid[i] !== undefined && s[i] !== undefined) ? mid[i] + mult * s[i] : undefined);
  const lower = closes.map((_, i) => (mid[i] !== undefined && s[i] !== undefined) ? mid[i] - mult * s[i] : undefined);
  return { mid, upper, lower };
};

const atr = (highs, lows, closes, p = 14) => {
  const trs = highs.map((h, i) => {
    if (i === 0) return h - lows[i];
    return Math.max(
      h - lows[i],
      Math.abs(h - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
  });
  // simple MA for ATR
  return sma(trs, p);
};

// ----------------------- Alpha Vantage fetching -----------------------
// forex: function=FX_DAILY&from_symbol=EUR&to_symbol=USD
async function fetchForexDaily(fromSym, toSym) {
  const url = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${fromSym}&to_symbol=${toSym}&outputsize=compact&apikey=${AV_KEY}`;
  const r = await fetch(url);
  const j = await r.json();
  const series = j['Time Series FX (Daily)'] || {};
  const rows = Object.entries(series).map(([ts, v]) => ({
    ts: ts,
    open: parseFloat(v['1. open']),
    high: parseFloat(v['2. high']),
    low: parseFloat(v['3. low']),
    close: parseFloat(v['4. close'])
  })).sort((a, b) => new Date(a.ts) - new Date(b.ts));
  return rows;
}

// crypto: function=CRYPTO_DAILY&symbol=BTC&market=USD
async function fetchCryptoDaily(symbol) {
  const url = `https://www.alphavantage.co/query?function=CRYPTO_DAILY&symbol=${symbol}&market=USD&apikey=${AV_KEY}`;
  const r = await fetch(url);
  const j = await r.json();
  const series = j['Time Series (Digital Currency Daily)'] || {};
  const rows = Object.entries(series).map(([ts, v]) => ({
    ts: ts,
    open: parseFloat(v['1a. open (USD)']),
    high: parseFloat(v['2a. high (USD)']),
    low: parseFloat(v['3a. low (USD)']),
    close: parseFloat(v['4a. close (USD)'])
  })).sort((a, b) => new Date(a.ts) - new Date(b.ts));
  return rows;
}

// ----------------------- strategy -----------------------
function generateSignal(rows, symbolLabel) {
  if (!rows || rows.length < 50) return null;

  const closes = rows.map(r => r.close);
  const highs = rows.map(r => r.high);
  const lows  = rows.map(r => r.low);

  const ema8  = ema(closes, 8);
  const ema21 = ema(closes, 21);
  const rsi14 = rsi(closes, 14);
  const { upper, lower, mid } = bb(closes, 20, 2);
  const atr14 = atr(highs, lows, closes, 14);

  const i = closes.length - 1;
  const prev = i - 1;

  const last = {
    price: closes[i],
    ema8: ema8[i],
    ema21: ema21[i],
    rsi: rsi14[i],
    bbU: upper[i],
    bbL: lower[i],
    bbM: mid[i],
    atr: atr14[i]
  };
  const prevC = {
    ema8: ema8[prev],
    ema21: ema21[prev],
    rsi: rsi14[prev]
  };

  if (!last.ema8 || !last.ema21 || !last.rsi || !last.atr) return null;

  // rules:
  const crossedUp   = prevC.ema8 < prevC.ema21 && last.ema8 > last.ema21;
  const crossedDown = prevC.ema8 > prevC.ema21 && last.ema8 < last.ema21;

  // optional BB breakout confirmation
  const brokeAbove = last.price > (last.bbU || Infinity) && last.rsi > 48;
  const brokeBelow = last.price < (last.bbL || -Infinity) && last.rsi < 52;

  let type = null;
  if ((crossedUp && last.rsi > 45 && last.rsi < 75) || brokeAbove) type = 'BUY';
  if ((crossedDown && last.rsi < 55 && last.rsi > 25) || brokeBelow) type = 'SELL';
  if (!type) return null;

  const entry = last.price;
  const atrv = last.atr || (Math.abs(last.price) * 0.002);
  // tighter TP1 for more frequent wins, TP2 for runners
  const tp1 = type === 'BUY' ? entry + 1.2 * atrv : entry - 1.2 * atrv;
  const tp2 = type === 'BUY' ? entry + 2.4 * atrv : entry - 2.4 * atrv;
  const sl  = type === 'BUY' ? entry - 1.0 * atrv : entry + 1.0 * atrv;

  return {
    pair: symbolLabel,
    type,
    entry: roundSmart(entry),
    tp1: roundSmart(tp1),
    tp2: roundSmart(tp2),
    sl: roundSmart(sl),
    rsi: Number(last.rsi.toFixed(1)),
    time: rows[i].ts
  };
}

function roundSmart(n) {
  if (Math.abs(n) >= 1000) return Math.round(n);     // indices/crypto big numbers
  if (Math.abs(n) >= 10)   return Number(n.toFixed(2));
  if (Math.abs(n) >= 1)    return Number(n.toFixed(4));
  return Number(n.toFixed(6));
}

// ----------------------- routes -----------------------
app.get('/', (_req, res) => {
  res.send('Signalkiller V8 LIVE backend is running ✅');
});

/**
 * GET /api/scan-live
 * Query Alpha Vantage for a curated list and return signals now.
 * (Forex + Crypto; you can expand list later)
 */
app.get('/api/scan-live', async (req, res) => {
  if (!AV_KEY) return res.status(500).json({ error: 'ALPHA_VANTAGE_KEY missing' });

  // Minimal, reliable list (expand later)
  const forexPairs = [
    ['EUR','USD'], ['GBP','USD'], ['USD','JPY'], ['AUD','USD'], ['USD','CHF'], ['USD','CAD'], ['NZD','USD']
  ];
  const cryptos = ['BTC','ETH','XRP'];

  let results = [];

  try {
    // FOREX
    for (const [base, quote] of forexPairs) {
      const rows = await fetchForexDaily(base, quote);
      const sig = generateSignal(rows, `${base}/${quote}`);
      if (sig) results.push(sig);
      await sleep(1200); // respect API throttle
    }
    // CRYPTO
    for (const c of cryptos) {
      const rows = await fetchCryptoDaily(c);
      const sig = generateSignal(rows, `${c}/USD`);
      if (sig) results.push(sig);
      await sleep(1200);
    }
  } catch (e) {
    console.error('scan error', e);
    return res.status(500).json({ error: String(e) });
  }

  // Sort by most recent time desc
  results.sort((a, b) => new Date(b.time) - new Date(a.time));
  res.json({ generated: results.length, signals: results });
});

function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

app.listen(PORT, () => {
  console.log(`Live backend on port ${PORT}`);
});