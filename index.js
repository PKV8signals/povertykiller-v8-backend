const express = require("express");
const app = express();

const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("✅ Poverty Killer V8 Backend is running correctly");
});

app.listen(PORT, () => {
  console.log(✅ Server running on port ${PORT});
});
