// index.js - Simple Render test
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// Root route
app.get('/', (req, res) => {
    res.send('✅ Backend is working on Render!');
});

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'This is a test endpoint.', status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});
