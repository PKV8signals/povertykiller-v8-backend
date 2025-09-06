const express = require("express");
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Add this route for test signals
app.get("/api/signals", (req, res) => {
  res.json([
    { pair: "EUR/USD", type: "BUY", entry: 1.0850, tp: 1.0900, sl: 1.0800 },
    { pair: "GBP/USD", type: "SELL", entry: 1.2750, tp: 1.2700, sl: 1.2800 },
    { pair: "XAU/USD (Gold)", type: "BUY", entry: 1925, tp: 1940, sl: 1910 },
  ]);
});

app.listen(PORT, () => console.log(Server running on port ${PORT}));
