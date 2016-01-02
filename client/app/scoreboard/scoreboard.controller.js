'use strict';

angular.module('nwmApp')
  .controller('ScoreboardCtrl', function ($scope) {
    $scope.getScores = function (answer) {
      Restangular.all('api/scores/all_overall').getList().then(function (serverJson) {
        $scope.scores = serverJson;
      });
    };

    $scope.getScores();
  });
