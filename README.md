const express = require("express");
const app = express();
const PORT = process.env.PORT || 10000;

// Root route (when you visit the Render link)
app.get("/", (req, res) => {
  res.send("✅ PovertyKiller V8 Backend is running!");
});

// Example API route for signals
app.get("/api/signals", (req, res) => {
  const signals = [
    { pair: "EUR/USD", type: "BUY", entry: 1.0850, tp: 1.0900, sl: 1.0830 },
    { pair: "XAU/USD", type: "SELL", entry: 1940, tp: 1930, sl: 1950 },
    { pair: "BTC/USD", type: "BUY", entry: 26000, tp: 27000, sl: 25500 },
  ];
  res.json(signals);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});