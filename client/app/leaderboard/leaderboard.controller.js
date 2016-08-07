'use strict';

angular.module('nwmApp')
  .controller('LeaderboardCtrl', function ($scope, $stateParams, Restangular) {
    $scope.prevState = $stateParams.prevState;

    if ($scope.prevState == 'game') {
      Restangular.all('api/scores/').get('cur_user_recent').then(function (serverJson) {
        var result = serverJson.endScore - serverJson.initialScore;
        if (result > 0) {
          $scope.result = result;
        }
        else {
          $scope.result = 0;
        }
      });
      Restangular.all('api/scores/').get('cur_user_overall').then(function (serverJson) {
        $scope.overallScore = serverJson.overallScore;
      });
    }

    var getScores = function (scores) {
      Restangular.all('api/scores/game_scoreboard/10')
        .getList().then(function (serverJson) {
        //alert(serverJson);
        $scope.scores = serverJson;
      });
    };
    getScores();
  });
