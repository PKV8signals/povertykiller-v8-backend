const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Root route
app.get("/", (req, res) => {
  res.send("✅ Poverty Killer V8 Backend is running");
});

// Sample signals (Forex, indices, crypto, metals)
app.get("/signals", (req, res) => {
  const signals = [
    {
      asset: "EUR/USD",
      type: "BUY",
      entry: 1.0870,
      stopLoss: 1.0830,
      takeProfit: 1.0930,
      strategy: "RSI + EMA + MACD + SMC"
    },
    {
      asset: "XAU/USD (Gold)",
      type: "SELL",
      entry: 1930.5,
      stopLoss: 1938.0,
      takeProfit: 1915.0,
      strategy: "EMA + MACD + SMC"
    },
    {
      asset: "BTC/USD",
      type: "BUY",
      entry: 27000,
      stopLoss: 26500,
      takeProfit: 28000,
      strategy: "RSI + EMA"
    },
    {
      asset: "US30 (Dow Jones)",
      type: "SELL",
      entry: 34700,
      stopLoss: 34900,
      takeProfit: 34400,
      strategy: "RSI + SMC"
    }
  ];

  res.json({ status: "success", signals });
});

// Start server
app.listen(PORT, () => {
  console.log(✅ Server running on port ${PORT});
});
