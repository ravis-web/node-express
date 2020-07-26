/* --- GraphQL : Resolvers --- */

const bcrypt = require('bcryptjs');
const validator = require('validator');

const User = require('../models/User');

module.exports = {
  hello() {
    return { name: 'GraphQL', view: 123 };
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
  }
};
