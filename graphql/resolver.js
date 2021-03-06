/* --- GraphQL : Resolvers --- */

const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Post = require('../models/Post');

module.exports = {
  loginUser: async function ({ email, password }, req) {
    const errors = [];

    if (!validator.isEmail(email)) errors.push({ message: 'invalid email!' });
    if (validator.isEmpty(password) || !validator.isLength(password, { min: 6, max: 15 })) {
      errors.push({ message: 'password too short' });
    }

    if (errors.length > 0) {
      const error = new Error('invalid input');
      error.data = errors; // arr
      error.code = 422; // status
      throw error;
    }

    const user = await User.findOne({ email: email });
    if (!user) throw new Error('user not found');
    const doMatch = await bcrypt.compare(password, user.password);
    if (!doMatch) throw new Error('email/password incorrect');
    const token = jwt.sign({ userId: user._id.toString(), email: user.email }, 'long-string', { expiresIn: '1h' });
    return { token: token, userId: user._id.toString() };
  },

  regUser: async function ({ userInput }, req) {
    const errors = [];

    if (!validator.isEmail(userInput.email)) errors.push({ message: 'invalid email!' });
    if (validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, { min: 6, max: 15 })) {
      errors.push({ message: 'password too short' });
    }

    if (errors.length > 0) {
      const error = new Error('invalid input');
      error.data = errors; // arr
      error.code = 422; // status
      throw error;
    }

    const email = userInput.email;
    const exstUser = await User.findOne({ email: email });
    if (exstUser) throw new Error('user already exists');
    const hashed = await bcrypt.hash(userInput.password, 12); // hashing
    const user = new User({ password: hashed, name: userInput.name, email: userInput.email });
    const currUser = await user.save();
    return { ...currUser._doc, _id: currUser._id.toString() };
  },

  createPost: async function ({ postInput }, req) {
    if (!req.isAuthen) throw new Error('unauthorized request');
    const user = await User.findById(req.userId);
    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      image: postInput.image,
      creator: req.userId
    });
    const currPost = await post.save();
    user.posts.push(currPost);
    await user.save();
    return { ...currPost._doc, _id: currPost._id.toString(), creator: user, createdAt: currPost.createdAt.toISOString(), updatedAt: currPost.updatedAt.toISOString() };
  },

  fetchPosts: async function ({ page }, req) {
    if (!req.isAuthen) throw new Error('unauthorized request');
    const curPage = page || 1;
    const perPage = 2; // sync w frontend
    const totalPost = await Post.find().countDocuments();
    const posts = await Post.find().populate('creator').skip((curPage - 1) * perPage).limit(perPage).sort({ createdAt: -1 });
    if (!posts) throw new Error('no posts found');
    return {
      posts: posts.map(p => {
        return {
          ...p._doc, _id: p._id.toString(), createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString()
        }
      }), total: totalPost
    };
  },

  fetchPost: async function ({ id }, req) {
    if (!req.isAuthen) throw new Error('unauthorized request');
    const post = await Post.findById(id).populate('creator');
    if (!post) throw new Error('post doesnt exist');
    return { ...post._doc, _id: post._id.toString(), createdAt: post.createdAt.toISOString(), updatedAt: post.updatedAt.toISOString() };
  },

  updatePost: async function ({ id, postInput }, req) {
    if (!req.isAuthen) throw new Error('unauthorized request');

    const post = await Post.findById(id).populate('creator');
    if (!post) throw new Error('no matching post');
    if (post.creator._id.toString() !== req.userId.toString()) throw new Error('post created by another user');

    post.title = postInput.title;
    post.content = postInput.content;
    if (post.image !== postInput.image && postInput.image !== 'undefined') post.image = postInput.image;
    const updPost = await post.save();
    return { ...updPost._doc, _id: updPost._id.toString(), createdAt: updPost.createdAt.toISOString(), updatedAt: updPost.updatedAt.toISOString() };
  },

  deletePost: async function ({ id }, req) {
    if (!req.isAuthen) throw new Error('unauthorized request');

    try {
      const post = await Post.findById(id);
      if (!post) throw new Error('no matching post');
      if (post.creator.toString() !== req.userId.toString()) throw new Error('post created by another user');
      require('../controllers/feedControl').deleteFile(post.image);
      await Post.findByIdAndRemove(id);
      const user = await User.findById(req.userId);
      user.posts.pull(id); // mongoose removes ref from user
      await user.save();
      return true;
    } catch (err) {
      console.log(err.message);
      return false;
    }
  },

  fetchStatus: async function (args, req) {
    if (!req.isAuthen) throw new Error('unauthorized request');
    const user = await User.findById(req.userId);
    if (!user) errOccured('user not found', 404);
    return user.status;
  },

  updateStatus: async function ({ status }, req) {
    if (!req.isAuthen) throw new Error('unauthorized request');
    let user = await User.findById(req.userId);
    if (!user) errOccured('user not found', 404);
    user.status = status;
    user = await user.save();
    return user.status;
  }
};
