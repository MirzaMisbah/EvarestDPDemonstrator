var visualizeTextualHeartrate = function(divID, _data) {
	'use strict';
	var minionVisualizationService = new VisualizationService(divID, Highcharts);
	minionVisualizationService.setUTCUsage(false);
	var dataObject = new CustomDataScheme(_data);
	var valueObjects = dataObject.getValues();
	var data = [];
	for (var i = 0; i < valueObjects.length; i++) {
		data.push([valueObjects[i].getTimeStamp(), valueObjects[i].getValue()]);
	}
	data.sort(function(a, b) {
		return a[0] - b[0];
	});
	var start = ((data[0][0].getHours() < 10) ? ('0' + data[0][0].getHours()) : data[0][0].getHours()) + ':' + ((data[0][0].getMinutes() < 10) ? ('0' + data[0][0].getMinutes()) : data[0][0].getMinutes());
	var stop = ((data[data.length - 1][0].getHours() < 10) ? ('0' + data[data.length - 1][0].getHours()) : data[data.length - 1][0].getHours()) + ':' + ((data[data.length - 1][0].getMinutes() < 10) ? ('0' + data[data.length - 1][0].getMinutes()) : data[data.length - 1][0].getMinutes());
	var avg = Math.round(data.map(function(a) {
		return a[1];
	}).reduce(function(a, b) {
		return a + b;
	}) / data.length);
	minionVisualizationService.createHTMLDataTable(divID, ['Start', 'Stop', 'average'], [[start, stop, avg]], {
		table : {
			'class' : 'mdl-data-table',
			'style' : 'width : 100%; margin: 0 auto;'
		}
	});
}; 