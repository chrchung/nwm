'use strict';

describe('Controller: LeaderboardCtrl', function () {

  // load the controller's module
  beforeEach(module('nwmApp'));

  var LeaderboardCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LeaderboardCtrl = $controller('LeaderboardCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
