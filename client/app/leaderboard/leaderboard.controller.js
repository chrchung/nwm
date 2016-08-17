'use strict';

angular.module('nwmApp')
  .controller('LeaderboardCtrl', function ($scope, $stateParams, Restangular) {
    $scope.prevState = $stateParams.prevState;



    var getScores = function (scores) {
      Restangular.all('api/scores/game_scoreboard/10')
        .getList().then(function (serverJson) {
        $scope.scores = serverJson;
      });
    };

    var getScoresAfterGame = function (scores) {
      Restangular.all('api/users').get('has_seen_tut').then(function (user) {
        Restangular.all('api/scores/game_scoreboard/10')
          .getList().then(function (serverJson) {
          $scope.result = $stateParams.score;
          $scope.overallScore = user.overallScore;
          $scope.scores = [];
          serverJson.forEach(function(data) {
            if (data.user == user.username) {
              $scope.scores.push({user: data.user, overallScore: $scope.overallScore});
            }
            else {
              $scope.scores.push(data);
            }
          });
          $scope.scores.sort(function(a, b) {
            return b.score - a.score;
          });
        });
      });
    };

    // if ($scope.prevState == 'game') {
      getScoresAfterGame();
    // }
    // else {
      getScores();
    // }


  });
