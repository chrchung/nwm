'use strict';
(function() {

  function MainController($scope, $http, $window) {
    var self = this;
    this.awesomeThings = [];

    //$http.get('/api/levels').then(function(response) {
    //  self.awesomeThings = response.data;
    //});
    $scope.redirect = function(){
      $window.location.href = 'app/level-one/level-one.html';
    }

  }

  angular.module('nwmApp')
    .controller('MainController', MainController);

})();
