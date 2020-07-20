exports.fetchPosts = (req, res, next) => {
  res.status(200).json({ posts: [{ title: 'First Post', content: 'Hello World!' }] });
};

exports.createPost = (req, res, next) => {
  res.status(201).json({ message: 'post created successfully!', post: { id: Date.now(), title: req.body.title, content: req.body.content } });
};
