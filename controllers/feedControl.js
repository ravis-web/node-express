const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const errOccured = require('../utils/errors').errOccured;
const errHandler = require('../utils/errors').errHandler;

const Post = require('../models/Post');
const User = require('../models/User');

exports.fetchPosts = async (req, res, next) => {
  const curPage = req.query.page || 1;
  const perPage = 2; // sync w frontend
  try {
    const totalPost = await Post.find().countDocuments();
    const posts = await Post.find().populate('creator').skip((curPage - 1) * perPage).limit(perPage);
    if (!posts) errOccured('no posts found', 404);
    res.status(200).json({ posts: posts, totalItems: totalPost });
  } catch (err) { errHandler(err, next); }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) errOccured('validation failed!', 422);

  /* --- sync-code ---
  const error = new Error('validation failed!');
  error.statusCode = 422;
  throw error;

  // return res.status(422).json({ message: 'validation failed!', errors: errors.array() });
  */

  if (!req.file) errOccured('no file selected', 422);

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    image: req.file.path.replace('\\', '/'),
    // image: req.file.path, // Linux and OSX
    creator: req.userId
  });

  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post); // mongoose adds ref. by default
    await user.save();
    res.status(201).json({
      message: 'post created!',
      post: post,
      creator: { _id: user._id, name: user.name }
    });
  } catch (err) { errHandler(err, next); }
  /* --- async-code ---
  if (!err.statusCode) err.statusCode = 500;
  next(err);
  */
};

exports.fetchPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('creator');
    if (!post) errOccured('no matching post', 404);
    res.status(200).json({ post: post });
  } catch (err) { errHandler(err, next); }
};

exports.updatePost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) errOccured('validation failed!', 422);
  let image = req.body.image;
  if (req.file) {
    image = req.file.path.replace('\\', '/');
    // image = req.file.path.; // Linux and OSX
  }
  if (!image) errOccured('no image found', 422);

  try {
    const post = await Post.findById(req.params.id);
    if (!post) errOccured('no matching post', 404);
    if (post.creator.toString() !== req.userId) errOccured('post created by another user', 403);
    post.title = req.body.title;
    post.content = req.body.content;
    if (image !== post.image) {
      deleteFile(post.image);
      post.image = image;
    }
    await post.save();
    res.status(200).json({ post: post });
  } catch (err) { errHandler(err, next); }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) errOccured('no matching post', 404);
    if (post.creator.toString() !== req.userId) errOccured('post created by another user', 403);
    deleteFile(post.image);
    await Post.findByIdAndRemove(req.params.id);
    const user = await User.findById(req.userId);
    user.posts.pull(req.params.id); // mongoose removes ref from user
    await user.save();
    res.status(200).json({ msg: 'post deleted!' });
  } catch (err) { errHandler(err, next); }
};

exports.fetchStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) errOccured('user not found', 404);
    res.status(200).json({ status: user.status });
  } catch (err) { errHandler(err, next); }
};

exports.updateStatus = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) errOccured('validation failed!', 422);
  try {
    const user = await User.findById(req.userId);
    if (!user) errOccured('user not found', 404);
    user.status = req.body.status;
    await user.save();
    res.status(200).json({ msg: 'status-updated', status: user.status });
  } catch (err) { errHandler(err, next); }
};

const deleteFile = filepath => {
  filepath = path.join(__dirname, '../', filepath);
  fs.unlink(filepath, err => console.log(err || 'deleted'));
};
