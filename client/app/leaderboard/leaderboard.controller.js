'use strict';

angular.module('nwmApp')
  .controller('LeaderboardCtrl', function ($scope, $stateParams, Restangular) {
    $scope.prevState = $stateParams.prevState;



    var getScores = function (scores) {
      Restangular.all('api/scores/game_scoreboard/10')
        .getList().then(function (serverJson) {
        //alert(serverJson);
        $scope.scores = serverJson;
      });
    };
    getScores();

    if ($scope.prevState == 'game') {
      $scope.result = $stateParams.score;
      Restangular.all('api/scores/').get('cur_user_overall').then(function (serverJson) {
        $scope.overallScore = parseInt(serverJson.overallScore);
      });
    }
  });
