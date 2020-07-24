/* -- Error Handler --- */

// sync-code
const errOccured = (msg, code) => {
  const error = new Error(msg);
  error.statusCode = code;
  throw error;
};

// async-code
const errHandler = (err, next) => {
  if (!err.statusCode) err.statusCode = 500;
  next(err);
};

exports.errOccured = errOccured;
exports.errHandler = errHandler;
