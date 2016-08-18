'use strict';

angular.module('nwmApp')
  .controller('LeaderboardCtrl', function ($scope, $stateParams, Restangular) {
    $scope.prevState = $stateParams.prevState;



    var getScores = function () {
      Restangular.all('api/scores').get('game_scoreboard/' + 20).then(function (serverJson) {
        $scope.scores = serverJson.scores;
        $scope.overallScore = serverJson.overallScore;
        $scope.overallScoreRank = serverJson.rank;
      });
    };

    // if ($scope.prevState == 'game') {
      //getScoresAfterGame();
    // }
    // else {
      getScores();
    // }


  });
