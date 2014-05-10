var poeApp = angular.module("poeApp", ["ngRoute"])
    .filter('safe', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }]);

poeApp.config(function($routeProvider) {
    $routeProvider
	.when("/:race_id", {
	    templateUrl: "all.html",
	    controller: "NextRaceCtrl"
	})
	.otherwise({
	    redirectTo: "/all"
	});
});
