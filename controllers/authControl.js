const bcrypt = require('bcryptjs');
const jsonwt = require('jsonwebtoken');

const { validationResult } = require('express-validator');

const User = require('../models/User');

const errOccured = require('../utils/errors').errOccured;
const errHandler = require('../utils/errors').errHandler;

exports.regUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) errOccured('validation failed!', 422);
  try {
    const hashed = await bcrypt.hash(req.body.password, 12); // hashing
    const user = new User({ password: hashed, name: req.body.name, email: req.body.email });
    await user.save();
    res.status(201).json({ msg: 'user-created', userId: user._id });
  } catch (err) { errHandler(err, next); }
};

exports.loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) errOccured('validation failed', 422);

  try {
    // password-match
    const user = await User.findOne({ email: req.body.email });
    const doMatch = await bcrypt.compare(req.body.password, user.password);
    if (!doMatch) errOccured('username/password incorrect', 401);

    // create token
    const token = jsonwt.sign(
      { userId: user._id.toString(), email: user.email }, // JSON data
      'long-string', // secret-key
      { expiresIn: '1h' }); // expiry
    res.status(200).json({ token: token, userId: user._id.toString() });

  } catch (err) { errHandler(err, next); }
};
