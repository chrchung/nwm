'use strict';

describe('Controller: TrailerCtrl', function () {

  // load the controller's module
  beforeEach(module('nwmApp'));

  var TrailerCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TrailerCtrl = $controller('TrailerCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
