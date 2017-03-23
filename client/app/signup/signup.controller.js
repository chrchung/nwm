'use strict';

angular.module('nwmApp')
  .controller('SignupCtrl', function ($scope, Restangular, $state) {
    $scope.taken =  false;
    $scope.process = function () {
      Restangular.all('api/users').post({
        username: $scope.username,
        password: $scope.password,
        turk: $scope.turk
      }).then((function (data) {
        $scope.taken =  false;
        if (data == 'taken') {
          $scope.taken = true;
        } else {
          $state.go('scoreboard');
        }
      }), function (err) {

      });
    };
  });
