'use strict';

describe('Controller: HowtoCtrl', function () {

  // load the controller's module
  beforeEach(module('nwmApp'));

  var HowtoCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    HowtoCtrl = $controller('HowtoCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
