const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ Test Poverty Killer Backend is working');
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
