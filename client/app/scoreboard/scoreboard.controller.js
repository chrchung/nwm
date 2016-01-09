'use strict';

angular.module('nwmApp')
  .controller('ScoreboardCtrl', function ($scope, $state, Restangular) {

    $scope.logout = function (scores) {
      Restangular.all('api/auths/logout').post(
      ).then((function (data) {
        $state.go('main');
      }), function (err) {

      });
    };

    $scope.unlockedLevels = function () {
      Restangular.all('api/levels').get('last_unlocked_level').then(function (serverJson) {
        if (serverJson == 'n/a') {
          $scope.lastLevel = 0;
        } else {
          $scope.lastLevel = serverJson;
        };
      });
    };

    $scope.getScores = function (scores) {
      Restangular.all('api/scores/all_overall').getList().then(function (serverJson) {
        $scope.scores = serverJson;
      });
    };

    $scope.getUserRecent = function (scores) {
      Restangular.all('api/scores/cur_user_recent').getList().then(function (serverJson) {
        $scope.userRecent = serverJson.map(function(val) {
          val.createdAt = val.createdAt.substring(0, 10);
          return val;
        });
      });
    };

    //Restangular.all('api/users/').get('current_user').then(function (serverJson) {
    //  $scope.userRecent = serverJson;
    //});

    $scope.getScores();
    $scope.getUserRecent();
    $scope.unlockedLevels();
  });
