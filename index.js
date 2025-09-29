const express = require("express");
const app = express();
const PORT = process.env.PORT || 10000;

// Root route
app.get("/", (req, res) => {
  res.send("✅ PKV8 Backend is running successfully!");
});

// Example test signal
app.get("/api/signal", (req, res) => {
  res.json({
    asset: "XAUUSD",
    signal: "SELL",
    entry: 1945.50,
    tp1: 1940.00,
    tp2: 1935.00,
    sl: 1950.00,
    timeframe: "15m"
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});