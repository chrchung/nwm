'use strict';

describe('Controller: LevelcompleteCtrl', function () {

  // load the controller's module
  beforeEach(module('nwmApp'));

  var LevelcompleteCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LevelcompleteCtrl = $controller('LevelcompleteCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
