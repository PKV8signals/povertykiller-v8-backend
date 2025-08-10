# POVERTYKILLER V8 Backend

This is a Node.js backend with:
- SQLite database for storing forex/crypto/indices signals
- Firebase push notification support (optional)
- Test endpoint to insert a fake signal for testing

## Endpoints
- POST /api/test-signal → Creates a new signal and sends a push notification if configured
- GET /api/signals → Returns latest signals

## Running locally
1. Install dependencies: `npm install`
2. Start server: `npm start`
