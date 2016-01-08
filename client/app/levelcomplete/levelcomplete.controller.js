'use strict';

angular.module('nwmApp')
  .controller('LevelcompleteCtrl', function ($scope, $state, Restangular, $stateParams) {

    $scope.isCollapsed = false;

    // Current level
    $scope.cur_level = $stateParams.level_id;
    // Current game
    $scope.cur_game = $stateParams.game_id;
    // User's score
    $scope.last_score = $stateParams.score;
    //alert($scope.last_score);

    $scope.next = function (){
      $state.go('game', {id: parseInt($scope.cur_level) + 1});
    }

    $scope.scoreboard = function (){
      $state.go('scoreboard');
    }

    $scope.unlockedLevels = function () {
      Restangular.all('api/levels').get('last_unlocked_level').then(function (serverJson) {
        if (serverJson = 'n/a') {
          $scope.lastLevel = 0;
        } else {
          $scope.lastLevel = serverJson;
        };
      });
    };


    $scope.getScores = function (scores) {
      Restangular.all('api/scores/game_scoreboard/' + $scope.cur_level + '/' + $scope.cur_game)
        .getList().then(function (serverJson) {
          //alert(serverJson);
        $scope.scores = serverJson;
      });
    };

    $scope.unlockedLevels();
    $scope.getScores();
  });
