const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Root route
app.get("/", (req, res) => {
  res.send("✅ Poverty Killer V8 Backend is running!");
});

// Example signal route
app.get("/signal", (req, res) => {
  res.json({
    pair: "EURUSD",
    signal: "BUY",
    entry: 1.1080,
    tp1: 1.1130,
    tp2: 1.1180,
    sl: 1.1030,
    timeframe: "15m"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
