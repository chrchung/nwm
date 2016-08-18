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
          $scope.overallScore = user.overallScore;



          Restangular.all('api/users/').get('current_user').then(function (user) {
            $scope.scores = [];
            for (var i = 0; i < serverJson.length; i++) {
              if (serverJson[i].user == user.username) {
                //$scope.overallScore = serverJson[i].overallScore + $scope.score - $scope.highest_score;
                $scope.scores.push({user: serverJson[i].user, overallScore: $scope.overallScore});
              }
              else {
                $scope.scores.push(serverJson[i]);
              }
              if (i == serverJson.length-1) {
                $scope.scores.sort(function(a, b) {
                  return b.score - a.score;
                });
                $scope.overallScoreRank = 0;
                for (var j = 0; j < $scope.scores.length; j++) {
                  $scope.overallScoreRank++;
                  if ($scope.scores[j].overallScore == $scope.overallScore) {
                    break;
                  }
                }
                $scope.submittedScore = true;
              }
            }
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
