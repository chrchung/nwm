var game3 = angular.module('nwmApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('game3', {
        url: '/game3/:id',
        templateUrl: 'app/game3/game3.html',
        controller: 'game3Controller'
      });
  });

game3.directive('ngRightClick', function($parse) {
  return function(scope, element, attrs) {
    var fn = $parse(attrs.ngRightClick);
    element.bind('contextmenu', function(event) {
      scope.$apply(function() {
        event.preventDefault();
        fn(scope, {$event:event});
      });
    });
  };
});
