/**
 * Created by elsieyang on 2015-11-04.
 */
'use strict';

describe('Controller: game3Controller', function() {

  // load the controller's module
  beforeEach(module('game3'));
  beforeEach(module('stateMock'));

  var scope;
  var game3Controller;
  var state;
  var $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function(_$httpBackend_, $controller, $rootScope, $state) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/things')
      .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);

    scope = $rootScope.$new();
    state = $state;
    game3Controller = $controller('game3Controller', {
      $scope: scope
    });
  }));

  it('should attach a list of things to the controller', function() {
    $httpBackend.flush();
    expect(game3Controller.awesomeThings.length).toBe(4);
  });
});
