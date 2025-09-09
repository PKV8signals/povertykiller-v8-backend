const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('✅ Poverty Killer V8 Backend is running (local test)');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});