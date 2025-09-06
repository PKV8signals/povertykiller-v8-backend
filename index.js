const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

// Test endpoint
app.get('/api/signals', (req, res) => {
  res.json([
    { pair: 'EUR/USD', action: 'BUY', entry: 1.0850, tp: 1.0900, sl: 1.0820 },
    { pair: 'XAU/USD', action: 'SELL', entry: 1945, tp: 1930, sl: 1955 }
  ]);
});

// Start server
app.listen(PORT, () => console.log(Server running on port ${PORT}));
