'use strict';

angular.module('nwmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('scoreboard', {
        url: '/scoreboard',
        templateUrl: 'app/scoreboard/scoreboard.html',
        controller: 'ScoreboardCtrl'
      });
  });
