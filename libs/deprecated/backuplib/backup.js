/***
 * mongodb
 *
 * in webpage folder in TuncanPlatform service
 * sudo python3 __init__.py
 * views.py
 * hr_services.py
 * dbextended.py
 * dbinserts.py
 *
 */
const fetch = require('node-fetch');

var syncApiAdress = 'http://iot01.iss.uni-saarland.de:81';
var syncHeartrateExtension = '/genericHeartRateService';
var syncStepExtension = '/genericStepDataService';
var endpoint = syncApiAdress + syncHeartrateExtension; 

// Config for the synchronization process
var headers = {
	Authorization : 'Bearer ' + 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImV2YWx1YXRpb25AdGVzdC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vYXBwLWlzcy5ldS5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NTkyZDYzNTM2ZDRjNzkxYjVhZWZlYWI0IiwiYXVkIjoia01sU0lsM0l0cXQ2bVFldHpHWEVTNmJpQVZGZWk2azgiLCJpYXQiOjE1MTg0MzkzMzksImV4cCI6MTUxODQ3NTMzOX0.BryK33hAUirfMKo9ZS5NoPhhELN_OLZJ8JFVmyvUU3k',
	'Content-type' : 'application/json'
};
var body = {
	userId : 'evaluation@test.com',
	bson : true
};
console.log("calling fetch now .. ");
callFetch('POST', headers, body);

function callFetch (method, headers, body) {
	console.log("Here we go ..");
	var settings = {
		method : method,
		headers : headers,
		mode : 'cors',
		cache : 'default',
		body : JSON.stringify(body)
	};

	var _this = this;
	
	console.log(endpoint);
	console.log(settings);

	fetch(endpoint, settings).then(function(value) {
		if (value.ok) {
			console.log(value);			
		} else {
			return null;
		}
	}).catch(function(err) {
		console.log(err);
		return null;
	}).then(function(value) {
		console.log("[Then ... ]", value);
		/*if (value) {
			value = _this._convertFromFHIR(value);
			_this._lastSynched = value;
		}
		return value;*/
	});
}