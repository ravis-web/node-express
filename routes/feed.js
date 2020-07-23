const express = require('express');
const { body } = require('express-validator');

const feedCtrl = require('../controllers/feedControl');

const router = express.Router();

// GET routes
router.get('/posts', feedCtrl.fetchPosts);
router.get('/post/:id', feedCtrl.fetchPost);


// POST routes
router.post('/post', [
  body('title').trim().isLength({ min: 5 }),
  body('content').trim().isLength({ min: 5 })
], feedCtrl.createPost);


// PUT routes
router.put('/post/:id', [
  body('title').trim().isLength({ min: 5 }),
  body('content').trim().isLength({ min: 5 })
], feedCtrl.updatePost);


// DELETE routes
router.delete('/post/:id', feedCtrl.deletePost);

module.exports = router;
