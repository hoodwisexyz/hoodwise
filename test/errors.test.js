const test = require('node:test');
const assert = require('node:assert/strict');
const { HttpError, BadRequestError, NotFoundError, InternalError } = require('../src/lib/errors');

test('BadRequestError defaults to status 400 and is exposed', () => {
  const err = new BadRequestError('bad input');
  assert.equal(err.status, 400);
  assert.equal(err.expose, true);
  assert.equal(err.message, 'bad input');
});

test('NotFoundError defaults to status 404', () => {
  const err = new NotFoundError();
  assert.equal(err.status, 404);
});

test('InternalError is not exposed by default (message hidden from client)', () => {
  const err = new InternalError('db connection string leaked here');
  assert.equal(err.status, 500);
  assert.equal(err.expose, false);
});

test('all typed errors are instances of HttpError', () => {
  assert.ok(new BadRequestError() instanceof HttpError);
  assert.ok(new NotFoundError() instanceof HttpError);
  assert.ok(new InternalError() instanceof HttpError);
});
