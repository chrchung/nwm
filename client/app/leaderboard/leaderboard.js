'use strict';

angular.module('nwmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('leaderboard', {
        url: '/leaderboard/:prevState/',
        templateUrl: 'app/leaderboard/leaderboard.html',
        controller: 'LeaderboardCtrl'
      });
  });
