'use strict';

angular.module('nwmApp')
  .controller('ScoreboardCtrl', function ($scope, $state, Restangular) {

    $scope.logout = function (scores) {
      return Restangular.all('api/auths/logout').post(
      ).then((function (data) {
        $state.go('main');
      }), function (err) {

      });
    };

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
