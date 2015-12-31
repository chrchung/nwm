'use strict';

angular.module('nwmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('auth', {
        url: '/auth',
        templateUrl: 'app/auth/auth.html',
        controller: 'AuthCtrl'
      });
  });
