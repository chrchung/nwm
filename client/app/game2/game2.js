var game2 = angular.module('nwmApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('game2', {
        url: '/game2/:id',
        templateUrl: 'app/game2/game2.html',
        controller: 'game2Controller'
      });
  });

game2.directive('ngRightClick', function($parse) {
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
