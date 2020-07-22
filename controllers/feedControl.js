const { validationResult } = require('express-validator');

exports.fetchPosts = (req, res, next) => {
  res.status(200).json({
    posts: [{
      _id: 1,
      title: 'First Post',
      content: 'Hello World!',
      image: '/logo/node.js',
      creator: { name: 'RX-Admin' },
      createdAt: new Date()
    }]
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: 'validation failed!', errors: errors.array() });
  }
  res.status(201).json({
    message: 'post created successfully!',
    post: {
      _id: Date.now(),
      title: req.body.title,
      content: req.body.content,
      image: '/logo/node.js',
      creator: { name: 'RX-Admin' },
      createdAt: new Date()
    }
  });
};
