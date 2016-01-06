'use strict';

angular.module('nwmApp')
  .controller('ScoreboardCtrl', function ($scope, Restangular) {
    $scope.getScores = function (scores) {
      Restangular.all('api/scores/all_overall').getList().then(function (serverJson) {
        $scope.scores = serverJson;
      });
    };

    $scope.getScores();
  });
