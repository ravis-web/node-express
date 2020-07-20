const express = require('express');

const feedCtrl = require('../controllers/feedControl');

const router = express.Router();

router.get('/posts', feedCtrl.fetchPosts);

router.post('/post', feedCtrl.createPost);

module.exports = router;
