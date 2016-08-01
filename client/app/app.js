'use strict';

angular.module('nwmApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'ngDragDrop',
  'restangular',
  'countTo',
  'pageslide-directive',
  'angularResizable',
  'ngStorage'
])

  .config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
