/* --- GraphQL : Resolvers --- */

const bcrypt = require('bcryptjs');

const User = require('../models/User');

module.exports = {
  hello() {
    return { name: 'GraphQL', view: 123 };
  },

  regUser: async function ({ userInput }, req) {
    const email = userInput.email;
    const exstUser = await User.findOne({ email: email });
    if (exstUser) throw new Error('user already exists');
    const hashed = await bcrypt.hash(userInput.password, 12); // hashing
    const user = new User({ password: hashed, name: userInput.name, email: userInput.email });
    const currUser = await user.save();
    return { ...currUser._doc, _id: currUser._id.toString() };
  }
};
