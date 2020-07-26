const path = require('path');

const express = require('express');
const bParser = require('body-parser');
const multer = require('multer');
const expGrQL = require('express-graphql');

/* Mongoose : Setup */
const mongoose = require('mongoose');
const cluster = require('./utils/cluster').cluster;
const configs = require('./utils/cluster').configs;

/* GraphQL : Setup */
const graphql = expGrQL.graphqlHTTP;
const schema = require('./graphql/schema');
const resolver = require('./graphql/resolver');


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


/* Route : Imports
const authRoutes = require('./routes/auth');
const feedRoutes = require('./routes/feed');
*/

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

  // GraphQL
  if (req.method === 'OPTIONS') return res.sendStatus(200); // acceptance

  next();
});


/* routes
app.use('/auth', authRoutes);
app.use('/feed', feedRoutes);
*/

// GraphQL
app.use('/graphql', graphql({
  schema: schema,
  rootValue: resolver,
  graphiql: true,
  // formatError(err) // deprecated
  customFormatErrorFn: err => {
    if (!err.originalError) return err;
    const data = err.originalError.data;
    const code = err.originalError.code;
    return { message: err.message || 'an error occurred!', status: code || 500, data: data };
  }
}));


// error-handler
app.use((err, req, res, nxt) => {
  console.log(err);
  res.status(err.statusCode || 500).json({ msg: err.message });
});


/* --- database connection --- */
mongoose.connect(cluster, configs)
  .then(conn => {
    console.log('cluster-connected');
    const server = app.listen(5000);

    /* Web-Socket : Socket.io
    const io = require('./socket/io').init(server); // estab websocket conn
    io.on('connection', socket => { console.log('socket-client : ' + socket.id) }); // listener // client-conn
    */
  })
  .catch(err => console.log(err));
