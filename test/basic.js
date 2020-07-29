const { assert } = require("chai");

it('should add two numbers', function () {
  const a = 2;
  const b = 3;
  assert.equal(a + b, 5, 'addition');
})

it('should not add two numbers', function () {
  const a = 3;
  const b = 3;
  assert.notEqual(a + b, 6, 'addition');
})
