'use strict';

var app = require('../..');
var request = require('supertest');

describe('Auth API:', function() {

  describe('GET /api/auths', function() {
    var auths;

    beforeEach(function(done) {
      request(app)
        .get('/api/auths')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          auths = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      auths.should.be.instanceOf(Array);
    });

  });

});
