const express = require('express');
const bParser = require('body-parser');

const feedRoutes = require('./routes/feed');

const app = express();

app.use(bParser.json()); // application/json
// app.use(bParser.urlencoded({ extended: false })); // x-www-form-urlencoded

/* --- CORS : Allow --- */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);

app.listen(5000);
