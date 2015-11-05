/**
 * Created by elsieyang on 2015-11-04.
 */
'use strict';
(function() {

  function LevelOneController($scope, $http) {
    var self = this;
    this.awesomeThings = [];

    //$http.get('/api/levels').then(function(response) {
    //  self.awesomeThings = response.data;
    //});

    $scope.models = [];
    var maxModels = 3;
    var maxAliens = 5;
    for( var i =0 ; i < maxModels;i++){
      $scope.models.push([]);
      for( var j =0 ; j < maxAliens;j++){
        $scope.models[i][j] = "Alien " + j + " in " + i;
      }
    }

  }

  angular.module('levelOne')
    .controller('LevelOneController', LevelOneController);

})();
