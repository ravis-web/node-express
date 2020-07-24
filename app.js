const path = require('path');

const express = require('express');
const bParser = require('body-parser');
const multer = require('multer');

/* Mongoose : Setup */
const mongoose = require('mongoose');
const cluster = require('./utils/cluster').cluster;
const configs = require('./utils/cluster').configs;


/* Multer : Configs */
const fileStore = multer.diskStorage({
  destination: (req, file, callb) => callb(null, 'uploads'),
  filename: (req, file, callb) => callb(null, Date.now() + '-' + file.originalname)
});
const fileFilter = (req, file, callb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg') {
    callb(null, true);
  } else {
    console.warn('image type not supported');
    callb(null, false);
  }
};


const authRoutes = require('./routes/auth');
const feedRoutes = require('./routes/feed');


const app = express();


/* --- Middlewares --- */
app.use(bParser.json()); // application/json
// app.use(bParser.urlencoded({ extended: false })); // x-www-form-urlencoded

app.use(multer({ storage: fileStore, fileFilter: fileFilter }).single('image'));

// static-serve
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


/* --- CORS : Allow --- */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});


// routes
app.use('/auth', authRoutes);
app.use('/feed', feedRoutes);


// error-handler
app.use((err, req, res, nxt) => {
  console.log(err);
  res.status(err.statusCode || 500).json({ msg: err.message });
});


/* --- database connection --- */
mongoose.connect(cluster, configs)
  .then(conn => {
    console.log('cluster-connected');
    app.listen(5000);
  })
  .catch(err => console.log(err));
