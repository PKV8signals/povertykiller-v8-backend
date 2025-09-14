const express = require("express");
const technicalindicators = require("technicalindicators");

const app = express();
const PORT = process.env.PORT || 3000;

// Dummy price data (later we can fetch from broker APIs)
const candles = [1.1000, 1.1010, 1.0990, 1.1020, 1.1040, 1.1030, 1.1060, 1.1050, 1.1070, 1.1080];

// RSI
const rsi = new technicalindicators.RSI({ values: candles, period: 14 }).slice(-1)[0];

// EMA
const emaFast = new technicalindicators.EMA({ values: candles, period: 9 }).slice(-1)[0];
const emaSlow = new technicalindicators.EMA({ values: candles, period: 21 }).slice(-1)[0];

// MACD
const macd = new technicalindicators.MACD({
  values: candles,
  fastPeriod: 12,
  slowPeriod: 26,
  signalPeriod: 9,
  SimpleMAOscillator: false,
  SimpleMASignal: false,
}).slice(-1)[0];

// Generate a signal
let signal = "HOLD";
if (rsi < 30 && emaFast > emaSlow && macd.MACD > macd.signal) {
  signal = "BUY";
} else if (rsi > 70 && emaFast < emaSlow && macd.MACD < macd.signal) {
  signal = "SELL";
}

app.get("/signal", (req, res) => {
  res.json({
    pair: "EURUSD",
    signal,
    entry: candles[candles.length - 1],
    tp1: candles[candles.length - 1] + (signal === "BUY" ? 0.0050 : -0.0050),
    tp2: candles[candles.length - 1] + (signal === "BUY" ? 0.0100 : -0.0100),
    sl: candles[candles.length - 1] + (signal === "BUY" ? -0.0050 : 0.0050),
    indicators: { rsi, emaFast, emaSlow, macd },
    timeframe: "15m",
  });
});

app.listen(PORT, () => console.log(✅ Poverty Killer V8 Backend running on port ${PORT}));
