const express = require('express');
const { body } = require('express-validator');

const User = require('../models/User');

const authCtrl = require('../controllers/authControl');

const router = express.Router();

// POST routes
router.post('/register', [
  body('name').trim().not().isEmpty(),
  body('email').isEmail().withMessage('please enter a valid email').normalizeEmail()
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then(user => {
        if (user) return Promise.reject('email already exists !');
      });
    }),
  body('password').trim().isLength({ min: 6, max: 15 })
], authCtrl.regUser);

router.post('/login', [
  body('email').isEmail().withMessage('please enter a valid email').normalizeEmail()
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then(user => {
        if (!user) return Promise.reject('user doesnt exist!');
      });
    }),
  body('password').trim().isLength({ min: 6, max: 15 })
], authCtrl.loginUser);

module.exports = router;
