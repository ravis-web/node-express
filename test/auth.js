const { expect } = require('chai');

const jwt = require('jsonwebtoken');
const sinon = require('sinon');

const isAuthen = require('../middlewares/isAuthen')

describe('auth-middleware', function () {
  it('should check for auth-headers if present', function () {
    const req = { get: function (header) { return null; } };
    expect(isAuthen.bind(this, req, {}, () => { })).to.throw('auth-header missing');
  })

  it('should throw err if one string auth-header', function () {
    const req = { get: function (header) { return 'stringtoken'; } };
    expect(isAuthen.bind(this, req, {}, () => { })).to.throw();
  })

  it('should throw err if the token cant be verified', function () {
    const req = { get: function (header) { return 'Bearer unveriftoken' } };
    expect(isAuthen.bind(this, req, {}, () => { })).to.throw();
  })

  it('should have userId after decoding the token', function () {
    const req = { get: function (header) { return 'Bearer realtoken' } };

    //jwt.verify = function () { return { userId: 'IDxxxx123' } }; // mock-fx

    sinon.stub(jwt, 'verify'); // stub-fx
    jwt.verify.returns({ userId: 'IDxxxx123' });
    isAuthen(req, {}, () => { });

    expect(req).to.have.property('userId');
    expect(req).to.have.property('userId', 'IDxxxx123');
    expect(jwt.verify.called).to.be.true;

    jwt.verify.restore(); // fx-restored
  })
})
