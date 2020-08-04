/* --- TEST CLUSTER --- */

const keys = {
  username: 'dell',
  password: 'inspiron14',
  database: 'node-blog-test'
};

const cluster = `mongodb+srv://${keys.username}:${keys.password}@aws-asia-mum.ozjht.mongodb.net/${keys.database}?retryWrites=true&w=majority`;

const configs = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

exports.cluster = cluster;
exports.configs = configs;
