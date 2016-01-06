'use strict';

angular.module('nwmApp')
  .controller('ScoreboardCtrl', function ($scope, Restangular) {
    $scope.getScores = function (scores) {
      Restangular.all('api/scores/all_overall').getList().then(function (serverJson) {
        $scope.scores = serverJson;
      });
    };

    $scope.getUserRecent = function (scores) {
      Restangular.all('api/scores/cur_user_recent').getList().then(function (serverJson) {
        $scope.userRecent = serverJson;
      });
    };

    Restangular.all('api/users/').get('current_user').then(function (serverJson) {
      $scope.userRecent = serverJson;
    });

    $scope.getScores();
    $scope.getUserRecent();
  });
