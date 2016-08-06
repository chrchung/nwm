'use strict';

describe('Controller: PropertiesCtrl', function () {

  // load the controller's module
  beforeEach(module('nwmApp'));

  var PropertiesCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PropertiesCtrl = $controller('PropertiesCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
