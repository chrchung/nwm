'use strict';

angular.module('nwmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('leaderboard', {
        url: '/leaderboard/:prevState/:score',
        templateUrl: 'app/leaderboard/leaderboard.html',
        controller: 'LeaderboardCtrl'
      });
  });
