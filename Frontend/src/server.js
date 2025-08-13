require('dotenv').config(); // Load environment variables

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const DB_HOST = process.env.DB_HOST;

app.get('/', (req, res) => {
  res.send(`Connected to DB at ${DB_HOST}`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
