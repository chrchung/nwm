'use strict';

var app = require('../..');
var request = require('supertest');

describe('Score API:', function() {

  describe('GET /api/scores', function() {
    var scores;

    beforeEach(function(done) {
      request(app)
        .get('/api/scores')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          scores = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      scores.should.be.instanceOf(Array);
    });

  });

});
