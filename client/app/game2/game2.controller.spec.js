/**
 * Created by elsieyang on 2015-11-04.
 */
'use strict';

describe('Controller: game2Controller', function() {

  // load the controller's module
  beforeEach(module('game2'));
  beforeEach(module('stateMock'));

  var scope;
  var game2Controller;
  var state;
  var $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function(_$httpBackend_, $controller, $rootScope, $state) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/things')
      .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);

    scope = $rootScope.$new();
    state = $state;
    game2Controller = $controller('game2Controller', {
      $scope: scope
    });
  }));

  it('should attach a list of things to the controller', function() {
    $httpBackend.flush();
    expect(game2Controller.awesomeThings.length).toBe(4);
  });
});
