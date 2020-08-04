const sinon = require('sinon');
const expect = require('chai').expect;
const mongoose = require('mongoose');

const cluster = require('./cluster').cluster;
const configs = require('./cluster').configs;

const User = require('../models/User');
const Auth = require('../controllers/authControl');
const Feed = require('../controllers/feedControl'); // for user-status

describe('auth-controller', function () {

  before(function (done) {
    // db-connect
    mongoose.connect(cluster, configs).then(conn => {
      const user = new User({ name: 'Tester', email: 'test@testmail.com', password: 'testpassword', posts: [], _id: '5c0f66b979af55031b34728a' });
      return user.save();
    }).then(() => done());
  });


  it('should throw HTTP 500 err if db-access fails', function (done) { // async-mocha fx
    sinon.stub(User, 'findOne');
    User.findOne.throws();

    const req = { body: { email: 'test@testmail.com', password: 'testpassword' } }

    /* Note : add return err in controller-fx */
    Auth.loginUser(req, {}, () => { }).then(reslt => {
      expect(reslt).to.be.an('error'); // mocha-keyword
      expect(reslt).to.have.property('statusCode', 500);
      done(); // waits for async-code execution
    });

    User.findOne.restore();
  });

  it('should return a valid user response if exists', function (done) {
    const req = { userId: '5c0f66b979af55031b34728a' };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code;
        return this; // chain
      },
      json: function (data) {
        this.userStatus = data.status;
      }
    };
    Feed.fetchStatus(req, res, () => { }).then(() => {
      expect(res.statusCode).to.be.equal(200);
      expect(res.userStatus).to.be.equal('new-user');
      done();
    });
  })


  after(function (done) {
    // db-cleanup
    User.deleteMany({}).then(() => mongoose.disconnect()).then(() => done()); // disconnect and done
  });

})
