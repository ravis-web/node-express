const jwt = require('jsonwebtoken');

const errOccured = require('../utils/errors').errOccured;
const errHandler = require('../utils/errors').errHandler;

module.exports = (req, res, next) => {
  if (!req.get('Authorization')) {
    req.isAuthen = false;
    return next();
    // errOccured('auth-header missing', 401);
  }

  const token = req.get('Authorization').split(' ')[1];
  let decToken;

  try {
    decToken = jwt.verify(token, 'long-string'); // ret dec-token aft validation
    // decToken = jwt.decode(token, 'long-string'); // ret dec-token w/o validation
  } catch (err) {
    req.isAuthen = false;
    return next();
    // errOccured(err.message, 500);
  }

  if (!decToken) {
    req.isAuthen = false;
    return next();
    // errOccured('verif-failed', 401);
  }
  req.isAuthen = true;
  req.userId = decToken.userId;
  next();
};
