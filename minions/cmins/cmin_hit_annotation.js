(function(divId, _data) {
	'use strict';
	var div = document.getElementById(divId)
	div.innerHTML = `
	<button  id="logHeightMinionGenerate">Generate height</button>
	<p id="logHeightMinionOut"> Press 'generate' to make up the height!</p>	
	<button id="logHeightMinionHit">Record Hit</button>
	`
	var gen_button = document.getElementById("logHeightMinionGenerate");
	var hit_button = document.getElementById("logHeightMinionHit");
	gen_button.onclick = function(){
		var height = Math.random()*100.0
		var height = Math.round(height)
		document.getElementById('logHeightMinionOut').innerHTML = height
	}
	hit_button.onclick = function (){
		var height = "" + document.getElementById('logHeightMinionOut').innerHTML
		var date = (new Date()).toString()
		console.log('@@$$!!{"date":"' + date + '", "height":' + height + '}%%##^^')
	}
});

