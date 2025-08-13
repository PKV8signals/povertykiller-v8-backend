// Create a test signal (now GET so we can test in the browser)
app.get('/api/test-signal', (req, res) => {
    try {
        db.prepare(
            'INSERT INTO signals (type, pair, price, created_at) VALUES (?, ?, ?, datetime("now"))'
        ).run('forex', 'EUR/USD', 1.2345);
        res.send('✅ Test signal added successfully!');
    } catch (err) {
        console.error(err);
        res.status(500).send('❌ Error adding signal');
    }
});
