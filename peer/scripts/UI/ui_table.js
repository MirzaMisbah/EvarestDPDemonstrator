var sortAscending = true;
function ui_create_table(divId, grp, data, columns, action, selectedChannels) {    
	
	if(!!!data)
	return;
	
	// we clear the given div first
	var svg = d34.select('#' + divId).html("");

	var table = svg.append('table').attr("class", "scroll");
	// create table
	var thead = table.append('thead');
	// append head
	var tbody = table.append('tbody');
	// append body
    
    

	thead.append('tr').selectAll('th').data(columns).enter().append('th').text(function(column) {		
		return column;

	}).on('click', function(d) {// Sorting
		thead.attr('class', 'header');
		//	clearsort(); // TODO: sorting affects selection here we have a bug!
		if (sortAscending) {
			rows.sort(function(a, b) {
				return d34.descending(b[d], a[d]);
			});
			sortAscending = false;
			this.className = 'aes';
		} else {
			rows.sort(function(a, b) {
				return d34.ascending(b[d], a[d]);
			});
			sortAscending = true;
			this.className = 'des';
		}

	});

	function clearsort() {
		thead.select('tr').selectAll('th').attr("class", "");
		rows.sort(function(a, b) {
			return d34.ascending(b[this], a[this]);
		});
	}


	// thead.select('tr').insert("th", ":first-child").text(function(col) {
		// return "Action";
	// });

	// create a row for each object in the data
	var rows = tbody.selectAll('tr').data(data).enter().append('tr');

	// create a cell in each row for each column
	var cells = rows.selectAll('td').data(function(row) {
		return columns.map(function(column) {
			//	console.log(row[column]);
			var val = row[column];
			if(typeof(row[column]) === 'number'){ // TODO: have a better way of checking if it is a date
				val = moment(new Date(val)).format(DATE_FORMAT);
			}			
			return {
				column : column,
				value : val
			};
		});
	}).enter().append('td').attr('data-th', function(d) {
		return d.column;
	}).text(function(d) {//.attr("class", "mdl-data-table__cell--non-numeric")
		return d.value;
	});
	rows.style("background-color", function(d, j) {
	           if(selectedChannels && selectedChannels.includes(d._dataChannel))	           
	               return "#ffffcc";
	});

	// try {
		// rows.selectAll("td.img").data(function(d) {
			// return [d];
		// }).enter().insert("td", ":first-child").append(function() {
			// var div = document.createElement("div");
			// var img = document.createElement("img");
// 			
			// var rowData = d34.select(this).data();
			// var Read = rowData && rowData.length > 0?  rowData[0].Read: false;
// 			
			// // TODO: HERE WE ARE TRYING TO CATCH A BUG!
			// if(!rowData || rowData.length == 0){
				// console.error("Error getting data .. ", rowData);
			// }
// 			
			// var imgclass = Read ? "msgopen" : "msgclose";
			// d34.select(img).attr("class", imgclass);			
			// div.appendChild(img);
			// return div;
		// });
	// } catch(error) {
		// console.warn(error);
	// }

	rows.on("click", function(d, i) {//correct index is passed here!
		var selectedRowIndex = i;
		var selectedMsgs = [];
		if(d.selected &&  d.selected == true){	
			d.selected = false;			
		}else{
			d.selected = true;
			d34.select(this).selectAll("td").select("img").attr("class", "msgopen");			
		}
		
		rows.each(function(d){
			if(d.selected){
				selectedMsgs.push(d);
			}
			
		});
		
		action(selectedMsgs);
		
		rows.style("background-color", function(d2, j) {
	
			if(d2.selected){				
				return "#ffffcc"; // TODO: may be have these values in the style sheet inseat
			}else{
				if(j % 2 != 0){					
					return "#eee";
				}else{					
					return "white";
				}
			}
		});
	});

	/*rows.selectAll("td.button")
	 //use a class so you don't re-select the existing <td> elements
	 .data(function(d) {
	 return [d];
	 }).enter().append("td").attr("class", "button").append("input").attr("type", "radio").attr("name", grp).on("change", function(d) {
	 action(d);
	 });*/
	return table;
};