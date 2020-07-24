const express = require('express');
const { body } = require('express-validator');

const isAuthen = require('../middlewares/isAuthen');

const feedCtrl = require('../controllers/feedControl');

const router = express.Router();

// GET routes
router.get('/posts', isAuthen, feedCtrl.fetchPosts);
router.get('/post/:id', isAuthen, feedCtrl.fetchPost);
router.get('/status', isAuthen, feedCtrl.fetchStatus);


// POST routes
router.post('/post', isAuthen, [
  body('title').trim().isLength({ min: 5 }),
  body('content').trim().isLength({ min: 5 })
], feedCtrl.createPost);


// PUT routes
router.put('/post/:id', isAuthen, [
  body('title').trim().isLength({ min: 5 }),
  body('content').trim().isLength({ min: 5 })
], feedCtrl.updatePost);

// PATCH routes
router.patch('/status', isAuthen, [
  body('status').trim().not().isEmpty(),
], feedCtrl.updateStatus);


// DELETE routes
router.delete('/post/:id', isAuthen, feedCtrl.deletePost);

module.exports = router;
