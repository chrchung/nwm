'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var authCtrlStub = {
  index: 'authCtrl.index'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var authIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './auth.controller': authCtrlStub
});

describe('Auth API Router:', function() {

  it('should return an express router instance', function() {
    authIndex.should.equal(routerStub);
  });

  describe('GET /api/auths', function() {

    it('should route to auth.controller.index', function() {
      routerStub.get
        .withArgs('/', 'authCtrl.index')
        .should.have.been.calledOnce;
    });

  });

});
