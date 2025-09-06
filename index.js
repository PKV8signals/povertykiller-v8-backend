const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

// Test endpoint with a few sample signals
app.get('/api/signals', (req, res) => {
  res.json([
    { pair: 'EUR/USD', action: 'BUY', entry: 1.0850, tp: 1.0900, sl: 1.0820 },
    { pair: 'XAU/USD (Gold)', action: 'SELL', entry: 1945, tp: 1930, sl: 1955 },
    { pair: 'BTC/USD (Bitcoin)', action: 'BUY', entry: 27000, tp: 28000, sl: 26500 },
    { pair: 'US30 (Dow Jones)', action: 'SELL', entry: 34000, tp: 33800, sl: 34150 }
  ]);
});

// Start server
app.listen(PORT, () => console.log(Server running on port ${PORT}));
