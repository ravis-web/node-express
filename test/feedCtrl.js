const sinon = require('sinon');
const expect = require('chai').expect;
const mongoose = require('mongoose');

const cluster = require('./cluster').cluster;
const configs = require('./cluster').configs;

const User = require('../models/User');
const Feed = require('../controllers/feedControl');

describe('feed-controller', function () {

  before(function (done) {
    // db-connect
    mongoose.connect(cluster, configs).then(conn => {
      const user = new User({ name: 'Tester', email: 'test@testmail.com', password: 'testpassword', posts: [], _id: '5c0f66b979af55031b34728a' });
      return user.save();
    }).then(() => done());
  });


  it('should add a created post to the user posts', function (done) {
    const req = {
      body: { title: 'Test Post', content: 'this is a test' },
      file: { path: '/uploads/test-image.png' },
      userId: '5c0f66b979af55031b34728a'
    };
    const res = { status: function () { return this }, json: function () { } }; // chain

    /* Note : add return user in controller-fx */
    Feed.createPost(req, res, () => { }).then(user => {
      expect(user).to.have.property('posts');
      expect(user.posts).to.have.length(1);
      done();
    });
  });


  after(function (done) {
    // db-cleanup
    User.deleteMany({}).then(() => mongoose.disconnect()).then(() => done()); // disconnect and done
  });

})
