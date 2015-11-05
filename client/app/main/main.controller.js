'use strict';
(function() {

  function MainController($scope, $http, $window) {
    var self = this;
    this.awesomeThings = [];

    //$http.get('/api/levels').then(function(response) {
    //  self.awesomeThings = response.data;
    //});

  }

  angular.module('nwmApp')
    .controller('MainController', MainController);

})();
