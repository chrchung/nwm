'use strict';

angular.module('nwmApp')
  .controller('MainCtrl', function ($scope, Restangular, $state) {

    $state.go('auth');
  });
