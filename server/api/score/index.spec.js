'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var scoreCtrlStub = {
  index: 'scoreCtrl.index'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var scoreIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './score.controller': scoreCtrlStub
});

describe('Score API Router:', function() {

  it('should return an express router instance', function() {
    scoreIndex.should.equal(routerStub);
  });

  describe('GET /api/scores', function() {

    it('should route to score.controller.index', function() {
      routerStub.get
        .withArgs('/', 'scoreCtrl.index')
        .should.have.been.calledOnce;
    });

  });

});
