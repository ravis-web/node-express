const bcrypt = require('bcryptjs');

const { validationResult } = require('express-validator');

const User = require('../models/User');

exports.regUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('validation failed!');
    error.statusCode = 422;
    throw error;
  }
  bcrypt.hash(req.body.password, 12) // hashing
    .then(hashed => {
      const user = new User({ password: hashed, name: req.body.name, email: req.body.email });
      return user.save();
    })
    .then(user => res.status(201).json({ msg: 'user-created', userId: user._id }))
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};
