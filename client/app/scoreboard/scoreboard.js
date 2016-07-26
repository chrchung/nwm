'use strict';

angular.module('nwmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('scoreboard', {
        url: '/landing',
        templateUrl: 'app/scoreboard/scoreboard.html',
        controller: 'ScoreboardCtrl'
      });
  });
