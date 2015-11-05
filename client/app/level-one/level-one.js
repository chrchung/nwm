
var levelOne = angular.module('nwmApp')
.config(function($stateProvider) {
  $stateProvider
    .state('levelOne', {
      url: '/levelOne',
      templateUrl: 'app/level-one/level-one.html',
      controller: 'LevelOneController'
    });
});
