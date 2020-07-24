const bcrypt = require('bcryptjs');
const jsonwt = require('jsonwebtoken');

const { validationResult } = require('express-validator');

const User = require('../models/User');

const errOccured = require('../utils/errors').errOccured;
const errHandler = require('../utils/errors').errHandler;

exports.regUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) errOccured('validation failed!', 422);
  bcrypt.hash(req.body.password, 12) // hashing
    .then(hashed => {
      const user = new User({ password: hashed, name: req.body.name, email: req.body.email });
      return user.save();
    })
    .then(user => res.status(201).json({ msg: 'user-created', userId: user._id }))
    .catch(err => errHandler(err, next));
};

exports.loginUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) errOccured('validation failed', 422);
  let currUser;

  // password-match
  User.findOne({ email: req.body.email })
    .then(user => {
      currUser = user; // fx-scoped
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(doMatch => {
      if (!doMatch) errOccured('username/password incorrect', 401);

      // create token
      const token = jsonwt.sign(
        { userId: currUser._id.toString(), email: currUser.email }, // JSON data
        'long-string', // secret-key
        { expiresIn: '1h' }); // expiry
      res.status(200).json({ token: token, userId: currUser._id.toString() });
    })
    .catch(err => errHandler(err, next));
};
