'use strict';

angular.module('nwmApp')
  .controller('AuthCtrl', function ($scope, Restangular, $state) {

    $scope.username = '';
    $scope.password = '';
    $scope.message = '';

    //Restangular.all('api/auth/').get('user_data').then(function (serverJson) {
    //  User.user = serverJson;
    //  if (User.user) {
    //    Restangular.one('api/gallery/gallery_data').get().then(function(galleryData) {
    //      galleryService.data = galleryData;
    //    });
    //    $state.go('main.exhibition');
    //  }
    //});

    $scope.process = function () {
      return Restangular.all('api/auths/login').post({
        username: $scope.username,
        password: $scope.password
      }).then((function (data) {
        $state.go('levelOne');
      }), function (err) {
        $scope.message = "Invalid email or password";
      });
    };
  });
