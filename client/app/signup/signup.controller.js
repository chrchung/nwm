'use strict';

angular.module('nwmApp')
  .controller('SignupCtrl', function ($scope, Restangular, $state) {
    $scope.process = function () {
      Restangular.all('api/users').post({
        username: $scope.username,
        password: $scope.password
      }).then((function (data) {
        $state.go("main");
      }), function (err) {
        if (err == "taken") {
          $scope.taken = true;
        };
      });
    };;
  });
