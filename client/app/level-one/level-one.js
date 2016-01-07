
var levelOne = angular.module('nwmApp')
.config(function($stateProvider) {
  $stateProvider
    .state('game', {
      url: '/game/:id',
      templateUrl: 'app/level-one/level-one.html',
      controller: 'LevelOneController'
    });
});
