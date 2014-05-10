poeApp.controller("NextRaceCtrl", function($scope, $http, $routeParams) {
    $scope.race_id  = $routeParams.race_id;
    $scope.datas = null;
    $scope.error = null;

    /**************************************************************************/
    $scope.main = function() {
	/*
	 * Entry point of the controller.
	 */
	if ($routeParams.race_id == undefined) {
	    return ;
	}
	$scope.fetch_datas();
    };

    /**************************************************************************/
    $scope.refresh = function() {
	/* 
	 * Clear the localStorage and fetch the datas from the web.
	 */
	localStorage.clear("poenextrace");
	$scope.main();
    };

    /**************************************************************************/
    $scope.fetch_datas = function() {
	/*
	 * Get the data from the localStorage if available
	 * or from the web.
	 *
	 * Also set the $scope.races variable with
	 * the races that need to be displayed.
	 */
	$scope.datas = localStorage.getItem("poenextrace");
	if ($scope.datas == null) {
	    $scope.datas = {};
	    $scope.fetch_datas_from_web();
	} else {
	    $scope.datas = JSON.parse($scope.datas);
	    $scope.set_race_to_show();
	}
    };

    /**************************************************************************/
    $scope.save_datas = function() {
	/*
	 * Save the datas in stringified JSON in the localStorage.
	 */
	localStorage.setItem("poenextrace", JSON.stringify($scope.datas));
    };

    /**************************************************************************/
    $scope.set_race_to_show = function() {
	/*
	 * Set the $scope.races variable with the races that need to be
	 * be displayed.
	 */
	if ($scope.race_id == "all") {
	    $scope.races = $scope.datas.calendar;
	} else {
	    $scope.races = [$scope.datas.calendar[$scope.race_id]];
	    $scope.next_id = parseInt($scope.race_id) + 1;
	    $scope.prev_id = parseInt($scope.race_id) - 1;
	}
    };

    /**************************************************************************/
    $scope.fetch_datas_from_web = function() {
	/*
	 * Fetch datas from the web and save them to localStorage.
	 */
	var url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20fro"
	    + "m%20html%20where%20url%3D%22http%3A%2F%2Fwww.pathofexile.com%2Fs"
	    + "easons%22&format=json&diagnostics=false";
	$http.get(url)
	    .success(function(data) {
		$scope.parse_races(data);
		$scope.save_datas();
		$scope.set_race_to_show();
	    })
	    .error(function(data, status) {
		$scope.error = "Error fetching the races.";
	    });
    };

    /**************************************************************************/
    $scope.parse_races = function(data) {
	/*
	 * Parse the datas got from yahooapis.com
	 * The goal is to extract the races & the general infos.
	 */
	var infos = data.query.results.body.script[4].content;
	var calendar = data.query.results.body.script[5].content;
	
	// get model in json
	var binfo = infos.indexOf("new M(");
	var minfo = infos.slice(binfo + 6).indexOf("htmlContent");
	var einfo = infos.slice(binfo + 6 + minfo).indexOf("\",");
	if (binfo == -1 || minfo == -1 || einfo == -1) {
	    $scope.error = "Error parsing the races."
	    $scope.datas.infos = {};
	} else {
	    var jinfo = infos.slice(binfo + 6, binfo + 6 + minfo + einfo)+"\"}";
	    $scope.datas.infos = JSON.parse(jinfo);
	}

	// get races in json
	var bcal = calendar.indexOf("new E(");
	var ecal = calendar.slice(bcal + 6).indexOf("])");
	if (bcal == -1 || ecal == -1) {
	    $scope.error = "Error parsing the races."
	    $scope.datas.calendar = [];
	} else {
	    var jcal = calendar.slice(bcal + 6, bcal + 7 + ecal);
	    $scope.datas.calendar = JSON.parse(jcal);
	}
    };	

    /*
     * Call the main entry point.
     */
    $scope.main(); 

});
