const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Post = require('../models/Post');

exports.fetchPosts = (req, res, next) => {
  Post.find()
    .then(posts => {
      if (!posts) {
        const error = new Error('no posts found');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ posts: posts });
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // sync-code
    const error = new Error('validation failed!');
    error.statusCode = 422;
    throw error;
    // return res.status(422).json({ message: 'validation failed!', errors: errors.array() });
  }

  if (!req.file) {
    const error = new Error('no file selected');
    error.statusCode = 422;
    throw error;
  }

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    image: req.file.path.replace('\\', '/'),
    // image: req.file.path, // Linux and OSX
    creator: { name: 'RX-Admin' }
  });
  post.save()
    .then(reslt => {
      res.status(201).json({
        message: 'post created!',
        post: reslt
      });
    })
    .catch(err => {
      // async-code
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.fetchPost = (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => {
      if (!post) {
        throw new Error('no matching post').statusCode(404);
      }
      res.status(200).json({ post: post });
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('validation failed!');
    error.statusCode = 422;
    throw error;
  }
  let image = req.body.image;
  if (req.file) {
    image = req.file.path.replace('\\', '/');
  }
  if (!image) {
    const error = new Error('no image found');
    error.statusCode = 422;
    throw error;
  }
  Post.findById(req.params.id)
    .then(post => {
      if (!post) {
        throw new Error('no matching post').statusCode(404);
      }
      post.title = req.body.title;
      post.content = req.body.content;
      if (image !== post.image) {
        deleteFile(post.image);
        post.image = image;
      }
      return post.save();
    })
    .then(reslt => res.status(200).json({ post: reslt }))
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => {
      if (!post) {
        throw new Error('no matching post').statusCode(404);
      }
      deleteFile(post.image);
      return Post.findByIdAndRemove(req.params.id);
    })
    .then(reslt => res.status(200).json({ msg: 'post deleted!' }))
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

const deleteFile = filepath => {
  filepath = path.join(__dirname, '../', filepath);
  fs.unlink(filepath, err => console.log(err || 'deleted'));
};
