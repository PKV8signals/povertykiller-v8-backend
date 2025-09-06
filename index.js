return {
    pair: label,
    type,
    entry: roundSmart(entry),
    tp1: roundSmart(tp1),
    tp2: roundSmart(tp2),
    sl: roundSmart(sl),
    rsi: Number(rsiVal.toFixed(1)),
    ema8: roundSmart(ema8[i]),
    ema21: roundSmart(ema21[i]),
    macd_hist: Number((mac.hist[i] || 0).toFixed(6)),
    smc,
    confidence: Number(confidence.toFixed(2)),
    time: rows[rows.length-1].ts
  };
}

// ----------------- curated lists -----------------
// NOTE: reduce lists for testing. Full run will take time.
const forexPairs = [['EUR','USD'], ['GBP','USD'], ['AUD','USD'], ['USD','JPY'], ['USD','CAD'], ['NZD','USD'], ['USD','CHF']];
const metals = [['XAU','USD'], ['XAG','USD']]; // often available as FX in AV
const cryptos = ['BTC','ETH'];
// Indices symbols for Twelve Data (common names) - adjust if your provider expects different ticker names
const indices = [
  { symbol: 'US30', label: 'US30 (Dow Jones)' },
  { symbol: 'NAS100', label: 'NAS100 (Nasdaq)' },
  { symbol: 'SPX', label: 'SPX500 (S&P 500)' }, // Twelve Data may use "SPX" or "US500" depending on plan
  { symbol: 'DAX', label: 'DAX40 (Germany)' },
  { symbol: 'FTSE', label: 'UK100 (FTSE)' }
];

// ----------------- main scan endpoint -----------------
app.get('/api/scan-live', async (req, res) => {
  if (!AV_KEY && !TD_KEY) return res.status(500).json({ error: 'No data API keys set (ALPHA_VANTAGE_KEY or TWELVEDATA_KEY)' });

  let results = [];

  try {
    // FOREX via Alpha Vantage preferred
    for (const [a,b] of forexPairs) {
      let rows = [];
      if (AV_KEY) {
        rows = await fetchForexDailyAV(a,b);
      } else if (TD_KEY) {
        // Twelve Data uses "EUR/USD" format
        rows = await fetchTimeSeriesTD(${a}/${b});
      }
      const sig = generateSignalFromSeries(rows, ${a}/${b});
      if (sig) results.push(sig);
      await sleep(SLEEP_MS);
    }

    // METALS
    for (const [m, q] of metals) {
      let rows = [];
      if (AV_KEY) rows = await fetchForexDailyAV(m, q);
      else if (TD_KEY) rows = await fetchTimeSeriesTD(${m}/${q});
      const sig = generateSignalFromSeries(rows, ${m}/${q});
      if (sig) results.push(sig);
      await sleep(SLEEP_MS);
    }

    // CRYPTO
    for (const c of cryptos) {
      let rows = [];
      if (AV_KEY) rows = await fetchCryptoDailyAV(c);
      else if (TD_KEY) rows = await fetchTimeSeriesTD(${c}/USD);
      const sig = generateSignalFromSeries(rows, ${c}/USD);
      if (sig) results.push(sig);
      await sleep(SLEEP_MS);
    }

    // INDICES via Twelve Data (preferred)
    if (TD_KEY) {
      for (const idx of indices) {
        const rows = await fetchTimeSeriesTD(idx.symbol);
        const sig = generateSignalFromSeries(rows, idx.label);
        if (sig) results.push(sig);
        await sleep(SLEEP_MS);
      }
    } else {
      // If no Twelve Data key, skip indices (or try other sources)
      console.warn('Twelve Data key missing - indices scan skipped.');
    }
  } catch (e) {
    console.error('scan-live error', e);
    return res.status(500).json({ error: String(e) });
  }

  results.sort((a,b) => (b.confidence0) - (a.confidence0));
  return res.json({ generated: results.length, signals: results });
});

// convenience endpoint
app.get('/api/signals', async (req, res) => {
  // call scan-live to get fresh signals (this may take time)
  return app._router.handle({ method:'GET', url:'/api/scan-live' }, res);
});

// health root
app.get('/', (req, res) => res.send('SignalKiller V8 engine (Forex+Metals+Crypto+Indices) is running 🚀'));

// start
app.listen(PORT, () => console.log(SignalKiller engine running on port ${PORT}));
