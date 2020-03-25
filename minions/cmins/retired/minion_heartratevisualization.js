// test subMinion execution
var visualizeHeartrateCurve = function(divID, _data) {
	'use strict';	
	// var MOMENT_LIB = "https://cdn.jsdelivr.net/momentjs/latest/moment.min.js";
	// TODO: 		
	var dateTime = moment(new Date(_data.timestamp)).format("DD.MM.YY");
	var minionVisualizationService = new VisualizationService(divID, Highcharts);
	minionVisualizationService.setUTCUsage(false);
	var dataObject = new CustomDataScheme(_data);
	var series = [];
	var valueObjects = dataObject.getValues();
	var data = [];
	for (var i = 0; i < valueObjects.length; i++) {
		data.push([valueObjects[i].getTimeStamp(), valueObjects[i].getValue()]);
	}
	data.sort(function(a, b) {
		return a[0] - b[0];
	});
	if (data.length > 0) {
		series.push({
			name : 'Heartrate Chart for ' + dateTime,
			data : data
		});
	}
	minionVisualizationService.createTimelineVisualization('Heartrate Data', 'Heartrate (bpm)', ' bpm', series);
}; 