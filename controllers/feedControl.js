const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const errOccured = require('../utils/errors').errOccured;
const errHandler = require('../utils/errors').errHandler;

const Post = require('../models/Post');
const User = require('../models/User');

exports.fetchPosts = (req, res, next) => {
  const curPage = req.query.page || 1;
  const perPage = 2; // sync w frontend
  let totalPost = 0;
  Post.find().countDocuments()
    .then(count => {
      totalPost = count;
      return Post.find().skip((curPage - 1) * perPage).limit(perPage);
    })
    .then(posts => {
      if (!posts) errOccured('no posts found', 404);
      res.status(200).json({ posts: posts, totalItems: totalPost });
    })
    .catch(err => errHandler(err, next));
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) errOccured('validation failed!', 422);

  /* --- sync-code ---
  const error = new Error('validation failed!');
  error.statusCode = 422;
  throw error;

  // return res.status(422).json({ message: 'validation failed!', errors: errors.array() });
  */

  if (!req.file) errOccured('no file selected', 422);

  let creator;
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    image: req.file.path.replace('\\', '/'),
    // image: req.file.path, // Linux and OSX
    creator: req.userId
  });
  post.save()
    .then(reslt => {
      return User.findById(req.userId)
    })
    .then(user => {
      creator = user;
      user.posts.push(post); // mongoose adds ref. by default
      return user.save();
    })
    .then(reslt => {
      res.status(201).json({
        message: 'post created!',
        post: post,
        creator: { _id: creator._id, name: creator.name }
      });
    })
    .catch(err => errHandler(err, next));
  /* --- async-code ---
  if (!err.statusCode) err.statusCode = 500;
  next(err);
  */
};

exports.fetchPost = (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => {
      if (!post) errOccured('no matching post', 404);
      res.status(200).json({ post: post });
    })
    .catch(err => errHandler(err, next));
};

exports.updatePost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) errOccured('validation failed!', 422);
  let image = req.body.image;
  if (req.file) {
    image = req.file.path.replace('\\', '/');
    // image = req.file.path.; // Linux and OSX
  }
  if (!image) errOccured('no image found', 422);
  Post.findById(req.params.id)
    .then(post => {
      if (!post) errOccured('no matching post', 404);
      if (post.creator.toString() !== req.userId) errOccured('post created by another user', 403);
      post.title = req.body.title;
      post.content = req.body.content;
      if (image !== post.image) {
        deleteFile(post.image);
        post.image = image;
      }
      return post.save();
    })
    .then(reslt => res.status(200).json({ post: reslt }))
    .catch(err => errHandler(err, next));
};

exports.deletePost = (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => {
      if (!post) errOccured('no matching post', 404);
      if (post.creator.toString() !== req.userId) errOccured('post created by another user', 403);
      deleteFile(post.image);
      return Post.findByIdAndRemove(req.params.id);
    })
    .then(reslt => User.findById(req.userId))
    .then(user => {
      user.posts.pull(req.params.id); // mongoose removes ref from user
      return user.save();
    })
    .then(reslt => res.status(200).json({ msg: 'post deleted!' }))
    .catch(err => errHandler(err, next));
};

const deleteFile = filepath => {
  filepath = path.join(__dirname, '../', filepath);
  fs.unlink(filepath, err => console.log(err || 'deleted'));
};
