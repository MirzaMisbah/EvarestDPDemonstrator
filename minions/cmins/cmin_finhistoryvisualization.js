(function (_divId, _dataChannel) {
  const D34_LIB_URL = "https://d3js.org/d3.v4.min.js";

  function barchart() {

    var margin = {top: 300, right: 30, bottom: 10, left: 5 },
        width = 620, height = 60, mname = "mbar1";

    var MValue = "TURNOVER";

    function barrender(selection) {
      selection.each(function(data) {

        var x = d34.scaleBand()
            .range([0, width]);

        var y = d34.scaleLinear()
            .rangeRound([height, 0]);

        var xAxis = d34.axisBottom(x)
            .tickFormat(d34.timeFormat(TFormat[TIntervals[TPeriod]]));

        var yAxis = d34.axisLeft(y)
            .ticks(Math.floor(height/50));

        var svg = d34.select(this).select("svg")
           .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        x.domain(data.map(function(d) { return d.TIMESTAMP; }));
        y.domain([0, d34.max(data, function(d) { return d[MValue]; })]).nice();

        var xtickdelta   = Math.ceil(60/(width/data.length))
        xAxis.tickValues(x.domain().filter(function(d, i) { return !((i+Math.floor(xtickdelta/2)) % xtickdelta); }));

        svg.append("g")
            .attr("class", "axis yaxis")
            .attr("transform", "translate(" + width + ",0)")
            .call(d34.axisRight(y).tickFormat("").tickSize(0));

        var barwidth    = x.bandwidth();
        var fillwidth   = (Math.floor(barwidth*0.9)/2)*2+1;
        var bardelta    = Math.round((barwidth-fillwidth)/2);

        var mbar = svg.selectAll("."+mname+"bar")
            .data([data])
          .enter().append("g")
            .attr("class", mname+"bar");

        mbar.selectAll("rect")
            .data(function(d) { return d; })
          .enter().append("rect")
            .attr("class", mname+"fill")
            .attr("x", function(d) { return x(d.TIMESTAMP) + bardelta; })
            .attr("y", function(d) { return y(d[MValue]); })
            .attr("class", function(d, i) { return mname+i; })
            .attr("height", function(d) { return y(0) - y(d[MValue]); })
            .attr("width", fillwidth);
      });
    } // barrender
    barrender.mname = function(value) {
            	if (!arguments.length) return mname;
            	mname = value;
            	return barrender;
        	};

    barrender.margin = function(value) {
            	if (!arguments.length) return margin.top;
            	margin.top = value;
            	return barrender;
        	};

    barrender.MValue = function(value) {
            	if (!arguments.length) return MValue;
            	MValue = value;
            	return barrender;
        	};

  return barrender;
  } // barchart

  function cschart() {

      var margin = {top: 0, right: 30, bottom: 40, left: 5},
          width = 620, height = 300, Bheight = 460;

      function csrender(selection) {
        selection.each(function() {

          var interval = TIntervals[TPeriod];

          var minimal  = d34.min(genData, function(d) { return d.LOW; });
          var maximal  = d34.max(genData, function(d) { return d.HIGH; });

          var extRight = width + margin.right
          var x = d34.scaleBand()
              .range([0, width]);

          var y = d34.scaleLinear()
              .rangeRound([height, 0]);

          var xAxis = d34.axisBottom(x)
              .tickFormat(d34.timeFormat(TFormat[interval]));

          var yAxis = d34.axisLeft(y)
              .ticks(Math.floor(height/50));

          x.domain(genData.map(function(d) { return d.TIMESTAMP; }));
          y.domain([minimal, maximal]).nice();

          var xtickdelta   = Math.ceil(60/(width/genData.length))
          xAxis.tickValues(x.domain().filter(function(d, i) { return !((i+Math.floor(xtickdelta/2)) % xtickdelta); }));

          var barwidth    = x.bandwidth();
          var candlewidth = Math.floor(d34.min([barwidth*0.8, 13])/2)*2+1;
          var delta       = Math.round((barwidth-candlewidth)/2);

          d34.select(this).select("svg").remove();
          var svg = d34.select(this)
            .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", Bheight + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          svg.append("text")
              .attr("font", "sans-serif")
              .attr("font-size", 9)
              .attr("fill", "black")
              .attr("transform", "translate(" + 1.01*width + "," + 1.26*height + ")")
              .text("Sales");

          svg.append("text")
              .attr("font", "sans-serif")
              .attr("font-size", 9)
              .attr("fill", "black")
              .attr("transform", "translate(" + width + "," + 1.53*height + ")")
              .text("Volume");

          svg.append("g")
              .attr("class", "axis xaxis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis.tickSizeOuter(0));

          svg.append("g")
              .attr("class", "axis yaxis")
              .attr("transform", "translate(" + width + ",0)")
              .call(d34.axisRight(y).tickSize(0));

          svg.append("g")
              .attr("class", "axis grid")
              .attr("transform", "translate(" + width + ",0)")
              .call(d34.axisLeft(y).tickFormat("").tickSize(width).tickSizeOuter(0));

          var bands = svg.selectAll(".bands")
              .data([genData])
            .enter().append("g")
              .attr("class", "bands");

          bands.selectAll("rect")
              .data(function(d) { return d; })
            .enter().append("rect")
              .attr("x", function(d) { return x(d.TIMESTAMP) + Math.floor(barwidth/2); })
              .attr("y", 0)
              .attr("height", Bheight)
              .attr("width", 1)
              .attr("class", function(d, i) { return "band"+i; })
              .style("stroke-width", Math.floor(barwidth));

          var stick = svg.selectAll(".sticks")
              .data([genData])
            .enter().append("g")
              .attr("class", "sticks");

          stick.selectAll("rect")
              .data(function(d) { return d; })
            .enter().append("rect")
              .attr("x", function(d) { return x(d.TIMESTAMP) + Math.floor(barwidth/2); })
              .attr("y", function(d) { return y(d.HIGH); })
              .attr("class", function(d, i) { return "stick"+i; })
              .attr("height", function(d) { return y(d.LOW) - y(d.HIGH); })
              .attr("width", 1)
              .classed("rise", function(d) { return (d.CLOSE>d.OPEN); })
              .classed("fall", function(d) { return (d.OPEN>d.CLOSE); });

          var candle = svg.selectAll(".candles")
              .data([genData])
            .enter().append("g")
              .attr("class", "candles");

          candle.selectAll("rect")
              .data(function(d) { return d; })
            .enter().append("rect")
              .attr("x", function(d) { return x(d.TIMESTAMP) + delta; })
              .attr("y", function(d) { return y(d34.max([d.OPEN, d.CLOSE])); })
              .attr("class", function(d, i) { return "candle"+i; })
              .attr("height", function(d) {
                if(d.OPEN == d.CLOSE){return 1;} else {return y(d34.min([d.OPEN, d.CLOSE])) - y(d34.max([d.OPEN, d.CLOSE])); }})
              .attr("width", candlewidth)
              .classed("rise", function(d) { return (d.CLOSE>d.OPEN); })
              .classed("fall", function(d) { return (d.OPEN>d.CLOSE); });

        });
      } // csrender

      csrender.Bheight = function(value) {
              	if (!arguments.length) return Bheight;
              	Bheight = value;
              	return csrender;
          	};

  return csrender;
  } // cschart

  function timeCompare(date, interval) {
    if (interval == "week")       { var durfn = d34.timeMonday(date); }
    else if (interval == "month") { var durfn = d34.timeMonth(date); }
    else { var durfn = d34.time.day(date); }
    return durfn;
  }

  function dataCompress(data, interval) {
    var compressedData  = d34.nest()
                   .key(function(d) { return timeCompare(d.TIMESTAMP, interval); })
                   .rollup(function(v) { return {
                           TIMESTAMP:   timeCompare(d34.values(v).pop().TIMESTAMP, interval),
                           OPEN:        d34.values(v).shift().OPEN,
                           LOW:         d34.min(v, function(d) { return d.LOW;  }),
                           HIGH:        d34.max(v, function(d) { return d.HIGH; }),
                           CLOSE:       d34.values(v).pop().CLOSE,
                           TURNOVER:    d34.mean(v, function(d) { return d.TURNOVER; }),
                           VOLATILITY:  d34.mean(v, function(d) { return d.VOLATILITY; })
                          }; })
                   .entries(data).map(function(d) { return d.value; });

    return compressedData;
  }

  function csheader() {

  function cshrender(selection) {
    selection.each(function(data) {

      var interval   = TIntervals[TPeriod];
      var format     = (interval=="month")?d34.timeFormat("%b %Y"):d34.timeFormat("%b %d %Y");
      var dateprefix = (interval=="month")?"Month of ":(interval=="week")?"Week of ":"";
      d34.select("#infodate").text(dateprefix + format(data.TIMESTAMP));
      d34.select("#infoopen").text("O " + data.OPEN);
      d34.select("#infohigh").text("H " + data.HIGH);
      d34.select("#infolow").text("L " + data.LOW);
      d34.select("#infoclose").text("C " + data.CLOSE);

    });
  } // cshrender

  return cshrender;
  } // csheader

  var parseDate    = d34.timeParse("%Y-%m-%d");
  var TPeriod      = "3M";
  var TDays        = {"1M":21, "3M":63, "6M":126, "1Y":252, "2Y":504, "4Y":1008 };
  var TIntervals   = {"1M":"day", "3M":"day", "6M":"day", "1Y":"week", "2Y":"week", "4Y":"month" };
  var TFormat      = {"day":"%d %b '%y", "week":"%d %b '%y", "month":"%b '%y" };
  var genRaw, genData;

  function startApp() {
      if (_dataChannel[0] &&_dataChannel[0].creator.split('_')[0] == 'Crop Fin Data'){
          var dataVals = _dataChannel[0].values.slice();
          if (dataVals && dataVals.length > 0) {
              var i = dataVals.length;
              while(i--) {
                  if( dataVals[i].value.LOW == null ||
                      dataVals[i].value.HIGH == null ||
                      dataVals[i].value.OPEN == null ||
                      dataVals[i].value.CLOSE == null ||
                      dataVals[i].value.TURNOVER == null ||
                      dataVals[i].value.VOLATILITY == null) {
                      dataVals.splice(i, 1);
                  }
              }
              var data = [];
              dataVals.forEach(function(d) {
                  var obj = {
                      TIMESTAMP: new Date(d.timestamp),
                      LOW: d.value.LOW,
                      HIGH: d.value.HIGH,
                      OPEN: d.value.OPEN,
                      CLOSE: d.value.CLOSE,
                      TURNOVER: d.value.TURNOVER,
                      VOLATILITY: d.value.VOLATILITY
                  };
                  data.push(obj);
              });
              genRaw         = data;
              mainjs();

          }
      }

    // d34.csv("stock_potato.csv", function(data) {
    //   // check data. if any of the fields is missing, remove that data point
    //   var i = data.length;
    //   while(i--) {
    //     if(data[[i]].TIMESTAMP == '' ||
    //     data[[i]].LOW == '' ||
    //     data[[i]].HIGH == '' ||
    //     data[[i]].OPEN == '' ||
    //     data[[i]].CLOSE == '' ||
    //     data[[i]].TURNOVER == '' ||
    //     data[[i]].VOLATILITY == '') {
    //       data.splice(i, 1);
    //     }
    //   }
    //
    //   // parse timestamp and (try to) convert val to int
    //   data.forEach(function(d) {
    //     d.TIMESTAMP  = parseDate(d.TIMESTAMP);
    //     d.LOW        = +d.LOW;
    //     d.HIGH       = +d.HIGH;
    //     d.OPEN       = +d.OPEN;
    //     d.CLOSE      = +d.CLOSE;
    //     d.TURNOVER   = +d.TURNOVER;
    //     d.VOLATILITY = +d.VOLATILITY;
    //   });
    //   genRaw         = data;
    //   mainjs();
    // });
  }

  function toSlice(data) { return data.slice(-TDays[TPeriod]); }

  function mainjs() {
    var toPress    = function() { genData = (TIntervals[TPeriod]!="day")?dataCompress(toSlice(genRaw), TIntervals[TPeriod]):toSlice(genRaw); };
    toPress(); displayAll();
    d34.select("#oneM").on("click",   function(){ TPeriod  = "1M"; toPress(); displayAll(); });
    d34.select("#threeM").on("click", function(){ TPeriod  = "3M"; toPress(); displayAll(); });
    d34.select("#sixM").on("click",   function(){ TPeriod  = "6M"; toPress(); displayAll(); });
    d34.select("#oneY").on("click",   function(){ TPeriod  = "1Y"; toPress(); displayAll(); });
    d34.select("#twoY").on("click",   function(){ TPeriod  = "2Y"; toPress(); displayAll(); });
    d34.select("#fourY").on("click",  function(){ TPeriod  = "4Y"; toPress(); displayAll(); });
  }

  function displayAll() {
      changeClass();
      displayCS();
      displayGen(genData.length-1);
  }

  function changeClass() {
      if (TPeriod =="1M") {
          d34.select("#oneM").classed("active", true);
          d34.select("#threeM").classed("active", false);
          d34.select("#sixM").classed("active", false);
          d34.select("#oneY").classed("active", false);
          d34.select("#twoY").classed("active", false);
          d34.select("#fourY").classed("active", false);
      } else if (TPeriod =="6M") {
          d34.select("#oneM").classed("active", false);
          d34.select("#threeM").classed("active", false);
          d34.select("#sixM").classed("active", true);
          d34.select("#oneY").classed("active", false);
          d34.select("#twoY").classed("active", false);
          d34.select("#fourY").classed("active", false);
      } else if (TPeriod =="1Y") {
          d34.select("#oneM").classed("active", false);
          d34.select("#threeM").classed("active", false);
          d34.select("#sixM").classed("active", false);
          d34.select("#oneY").classed("active", true);
          d34.select("#twoY").classed("active", false);
          d34.select("#fourY").classed("active", false);
      } else if (TPeriod =="2Y") {
          d34.select("#oneM").classed("active", false);
          d34.select("#threeM").classed("active", false);
          d34.select("#sixM").classed("active", false);
          d34.select("#oneY").classed("active", false);
          d34.select("#twoY").classed("active", true);
          d34.select("#fourY").classed("active", false);
      } else if (TPeriod =="4Y") {
          d34.select("#oneM").classed("active", false);
          d34.select("#threeM").classed("active", false);
          d34.select("#sixM").classed("active", false);
          d34.select("#oneY").classed("active", false);
          d34.select("#twoY").classed("active", false);
          d34.select("#fourY").classed("active", true);
      } else {
          d34.select("#oneM").classed("active", false);
          d34.select("#threeM").classed("active", true);
          d34.select("#sixM").classed("active", false);
          d34.select("#oneY").classed("active", false);
          d34.select("#twoY").classed("active", false);
          d34.select("#fourY").classed("active", false);
      }
  }

  function displayCS() {
      var chart       = cschart().Bheight(460);
      d34.select("#chart1").call(chart);
      var chart       = barchart().mname("volume").margin(320).MValue("TURNOVER");
      d34.select("#chart1").datum(genData).call(chart);
      var chart       = barchart().mname("sigma").margin(400).MValue("VOLATILITY");
      d34.select("#chart1").datum(genData).call(chart);

      // text
      hoverAll();
  }

  function hoverAll() {
      d34.select("#chart1").select(".bands").selectAll("rect")
            .on("mouseover", function(d, i) {
                d34.select(this).classed("hoved", true);
                d34.select(".stick"+i).classed("hoved", true);
                d34.select(".candle"+i).classed("hoved", true);
                d34.select(".volume"+i).classed("hoved", true);
                d34.select(".sigma"+i).classed("hoved", true);
                displayGen(i);
            })
            .on("mouseout", function(d, i) {
                d34.select(this).classed("hoved", false);
                d34.select(".stick"+i).classed("hoved", false);
                d34.select(".candle"+i).classed("hoved", false);
                d34.select(".volume"+i).classed("hoved", false);
                d34.select(".sigma"+i).classed("hoved", false);
                displayGen(genData.length-1);
            });
  }

  function displayGen(mark) {
      var header      = csheader();
      d34.select("#infobar").datum(genData.slice(mark)[0]).call(header);
  }

  function addStyles() {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
    /* Container
    /* =============================================== */
    #demobox {
      margin: auto;
      min-height: 310px;
      min-width: 700px;
      max-width: 800px;
      padding-left: 30px;
      color: #333; }

    #csbox {
      color: #fff;
      background: white;
      margin: 10px auto;
      width: 670px;
      height: 500px;
      font-size: small;
      text-align: center; }

    /* Candlestick Chart
    /* =============================================== */
    #chart1 .grid { stroke-opacity: .3; }
    #chart1 .axis line,
    #chart1 .axis.xaxis path { fill: none; stroke: black; shape-rendering: crispEdges; }
    #chart1 .tick text { font: 10px sans-serif; fill: black; stroke-opacity: .3; }
    #chart1 .axis.yaxis path { fill: none; stroke: #292f3b; }

    #chart1 .bands rect { fill: black; fill-opacity: 0; stroke-opacity: 0; pointer-events: all; shape-rendering: crispEdges; }
    #chart1 .bands .hoved { fill-opacity: .6; }
    #chart1 .sticks rect { pointer-events: none; shape-rendering: crispEdges; }
    #chart1 .sticks .rise, #chart1 .candles .rise { fill: green; }
    #chart1 .sticks .fall, #chart1 .candles .fall { fill: red; }
    #chart1 .sticks .hoved { stroke: black; }
    #chart1 .candles .hoved { stroke: black; }
    #chart1 .candles rect { pointer-events: none; shape-rendering: crispEdges; }

    #chart1 .bbmn { fill: none; stroke: cyan; stroke-width: 1.5px; pointer-events: none; }
    #chart1 .bbup { fill: none; stroke: green; stroke-width: 1.5px; pointer-events: none; }
    #chart1 .bbdn { fill: none; stroke: crimson; stroke-width: 1.5px; pointer-events: none; }

    #chart1 .volumebar { fill: black; }
    #chart1 .volumebar rect { pointer-events: none; }
    #chart1 .volumebar .hoved { stroke: black; }
    #chart1 .sigmabar { fill: black; }
    #chart1 .sigmabar rect { pointer-events: none; }
    #chart1 .sigmabar .hoved { stroke: black; }

    #option    { height: 25px; float: left; padding-top: 5px; }
    #option input { cursor: pointer; border-radius: 5px; color: #fff; background: #696d75; border: none; height: 25px; width: 50px; }
    #option input {
                  -webkit-box-shadow: 0px 1px 3px 0px rgba(0,0,0,0.75);
                  -moz-box-shadow: 0px 1px 3px 0px rgba(0,0,0,0.75);
                  box-shadow: 0px 1px 3px 0px rgba(0,0,0,0.75);
                }
    #option .active { cursor: auto; background: #94979d; }
    #option .active {
                  -webkit-box-shadow: none;
                  -moz-box-shadow: none;
                  box-shadow: none;
                }
    #infobar   { width: 350px; height: 25px; float: left; padding-top: 5px; text-align: left; font-family: sans-serif; }
    .infohead  { width: 90px; height: 25px; margin: 0px 2px; float: left; }
    .infobox   { width: 45px; height: 30px; margin: 0px 2px; float: left; }

    #infoopen, #infoclose, #infolow, #infohigh { color: black; }

    #volchart input { cursor: pointer; }
    `;

    document.getElementsByTagName('head')[0].appendChild(style);
  }

  function prepareDiv() {
    var div = document.getElementById(_divId);

    var demobox = document.createElement("div");
    demobox.setAttribute("id", "demobox");
    div.appendChild(demobox);

    var csbox = document.createElement("div");
    csbox.setAttribute("id", "csbox");
    demobox.appendChild(csbox);

    var option = document.createElement("div");
    option.setAttribute("id", "option");
    csbox.appendChild(option);

    var button = document.createElement("input");
    button.setAttribute("id", "oneM");
    button.setAttribute("name", "1M");
    button.setAttribute("type", "button");
    button.setAttribute("value", "1M");
    option.appendChild(button);

    button = document.createElement("input");
    button.setAttribute("id", "threeM");
    button.setAttribute("name", "3M");
    button.setAttribute("type", "button");
    button.setAttribute("value", "3M");
    option.appendChild(button);

    button = document.createElement("input");
    button.setAttribute("id", "sixM");
    button.setAttribute("name", "6M");
    button.setAttribute("type", "button");
    button.setAttribute("value", "6M");
    option.appendChild(button);

    button = document.createElement("input");
    button.setAttribute("id", "oneY");
    button.setAttribute("name", "1Y");
    button.setAttribute("type", "button");
    button.setAttribute("value", "1Y");
    option.appendChild(button);

    button = document.createElement("input");
    button.setAttribute("id", "twoY");
    button.setAttribute("name", "2Y");
    button.setAttribute("type", "button");
    button.setAttribute("value", "2Y");
    option.appendChild(button);

    button = document.createElement("input");
    button.setAttribute("id", "fourY");
    button.setAttribute("name", "4Y");
    button.setAttribute("type", "button");
    button.setAttribute("value", "4Y");
    option.appendChild(button);

    var infobar = document.createElement("div");
    infobar.setAttribute("id", "infobar")
    csbox.appendChild(infobar)

    var div_info = document.createElement("div");
    div_info.setAttribute("id", "infodate");
    div_info.setAttribute("class", "infohead");
    infobar.appendChild(div_info);

    div_info = document.createElement("div");
    div_info.setAttribute("id", "infoopen");
    div_info.setAttribute("class", "infobox");
    infobar.appendChild(div_info);

    div_info = document.createElement("div");
    div_info.setAttribute("id", "infohigh");
    div_info.setAttribute("class", "infobox");
    infobar.appendChild(div_info);

    div_info = document.createElement("div");
    div_info.setAttribute("id", "infolow");
    div_info.setAttribute("class", "infobox");
    infobar.appendChild(div_info);

    div_info = document.createElement("div");
    div_info.setAttribute("id", "infoclose");
    div_info.setAttribute("class", "infobox");
    infobar.appendChild(div_info);

    var chart = document.createElement("div");
    chart.setAttribute("id", "chart1");
    csbox.appendChild(chart);
  }

  function clearDiv() {
    var div = document.getElementById(_divId);
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
    div.style.width = '100%';
  }

  var callbackFunction = function(success) {
    if (success) {
      addStyles();
      clearDiv();
      //initializeChart();
      prepareDiv();
      startApp();
    } else {
      console.log("no libs are loaded!");
    }
  };

  /**
	 * Loads required libs dynamically
	 * @done: is the function to be called when loading is done, it takes a
   * boolean which value is true if the library was loaded successfully.
	 */
  function loadLibs(done) {
    if (typeof d34 === 'undefined') {
      $.getScript(D34_LIB_URL, function(data, textStatus, jqxhr) {
        d34 = window.d3;
        window.d3 = null;
        console.log("just loaded!", d34.version);
        done(textStatus === 'success');
      });
    } else {
        console.log(d34.version, ' is already loaded');
        done(true);
    }
  }

  // load libs
  if (!('d3' in window)) {
    loadLibs(D3_LIB_URL, callbackFunction);
  } else {
    callbackFunction(true);
  }
});
