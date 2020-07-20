const express = require('express');

const app = express();

app.get('/', (req, res, next) => {
  res.send('Home');
});

app.listen(8080);