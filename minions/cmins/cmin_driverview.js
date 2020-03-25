/*this minion visualizes  the processed data such as computation of the total loss of crop
with the current configuration of the machine
where the user i.e driver can easily interprete it
Using colors(Red,Green,Yellow) to provide direct feedback to drivers
*/
/**
 * This file contains a template for the implementation of a visualization minion (cmin) of streaming data.
 * @namespace CommunicatorMinionStreamDataTemplate
 */

(function (divId, inputDataChannels){
    'use strict';
    /**
     * Defines all necessary data of a minion
     * @memberOf CommunicatorMinionStreamDataTemplate
     * @type {Object}
     */
    const minionObject ={
        // Define all libraries and dependencies of your current minion here, name is the name of the attached object to window, uir the ressource uri and source is the default name of the loaded library object.
        dependencies : [
                {"name": "d34", "uri": "https://d3js.org/d3.v4.min.js", source : "d3"}
            ],
        // Initialization of a container
        div : document.getElementById(divId),

        // Custom HTML elements
        jQuery : document.createElement('script'),
        AddjQuery : document.createElement('script'),

        // Custom visualization variables
        threshold_limit:20,
        input_buffer : [],
        is_doc_visible : true,
        TRANS_DURATION : 100,
        sources : [],
    };


    // Start the functionality of the minion
    if (checkStarted()){
        loadDependencies(function(success) {
            if (success) {
                clearMinionEnvironment();
                addStyles();
                startApp();
                build_chart();
                setThresholdBar();
            } else {
                console.log("no data found or no libs are loaded!");
            }
        }, minionObject.dependencies);
    } else {
        clearMinionEnvironment();
    }

    /**
     * Hanling of a new data point received by the minion
     * @memberOf CommunicatorMinionStreamDataTemplate
     * @inner
     * @param {Object} added_value The new value object
     */
    function newValue (added_value) {
        if(!isNaN(added_value.value)){

            updateChart(added_value);
            //check if the value did not cross the set threshold
            checkpost(added_value.value);
        }
    }

    function setColor(data_point) {
        var ret_val;
        if(data_point.source == minionObject.latest_source) {
            ret_val = "#42A5F5";
        }
        else {
            ret_val = "#9E9E9E";
        }

        return ret_val;
    }

    function draw(data) {
        const bar_width = 100/1.5;
        var val_max = d34.max(data, function(d){ return d.value; });

        var domain_max = ((val_max < 100) ? 100 : val_max);
        y.domain([0, domain_max]);
        svg.select('.y.axis').transition().duration(minionObject.TRANS_DURATION).call(yAxis);

        x.domain(data.map(function(d) { return d.source; }));
        svg.select('.x.axis').transition().duration(minionObject.TRANS_DURATION).call(xAxis);

        var damage = svg.selectAll(".damage").data(data, function(d) { return d.source; });

        damage.exit()
            .transition()
            .duration(100)//need to change
            .attr("y", y(0))
            .attr("height", height - y(0))
            .style('fill-opacity', 1e-6)
            .remove();

        // data that needs DOM = enter() (a set/selection, not an event!)
        var rect = damage.enter();
        rect.append("rect")
            .attr("class", "damage")
            .attr("y", y(0))
            .attr("height", height - y(0))
            .attr("fill", function(d) { return setColor(d); })
        .merge(damage) // E NTER + UPDATE. // (d) is one item from the data array, x is the scale object from above
            .transition().duration(80).attr("x", function(d) { return x(d.source) + (x.bandwidth() - bar_width)/2; })
            // constant, so no callback function(d) here
            .attr("width", bar_width)
            .attr("y", function(d) { return y(d.value); })
            // flip the height, because y's domain is bottom up, but SVG renders top down
            .attr("height", function(d) { return height - y(d.value); })
            .attr("fill", function(d) { return setColor(d); });
    }

    function updateChart(data) {
        // create a deep copy as objects are passed by reference
        var data_copy = Object.assign({}, data);

        var i;
        for(i=0; i<minionObject.input_buffer.length; i++) {
            if(minionObject.input_buffer[i].source == data.source) {
                minionObject.input_buffer[i].value = data.value;
                break;
            }
        }

        // if the source is not present, add it
        if(i == minionObject.input_buffer.length) {
            minionObject.input_buffer.push(data);
        }

        // save the source of the latest data point
        minionObject.latest_source = data.source;

        if(minionObject.is_doc_visible) {
            draw(minionObject.input_buffer);
        }
    }
    /**
     * Starts the main application.
     * @inner
     * @memberOf CommunicatorMinionStreamDataTemplate
     */
    function startApp() {
        inputDataChannels.forEach(function (dataChannel) {
            if (dataChannel) {
                dataChannel.removeEventListener(divId);
                dataChannel.addEventListener('add', newValue, divId);
            }
        });

        // Insert custom start code here

        PrepareDiv();
        //DisplayModel();
    }

    function PrepareDiv(){
    //insert the main html code for the view for chart and information to be displayed
        minionObject.div.innerHTML=`<div class="card-container">
                <div class="card">
                  <span  class="topcolorbar"></span>
                    <figure>
                        <img class="centerimg" id='imagedisplay' src="/assets/icons/like.png">
                    </figure>
                    <div id="statusmessage">
                        <h4>Status: OK</h4>
                    </div>
                    <span  class="topcolorbar"></span>
                </div>
            </div>
            <div class="card-container ">
              <div class="card">
                <div id="flip">
                    <strong>Show Graph</strong>&nbsp;<img src="/assets/icons/view.png" height="25px" width="25px">
                </div>
              </div>
            </div>
            <div class="threshold_center">Set Threshold (Damaging %) Value: &nbsp; <span id="demo"></span></br></br>
             <!--<input type='number' id='threshold_value'  value="20" />&nbsp;
             <input type='button' id='setthreshold_button' value="Set">-->
             <input type="range" min="1" max="100" value="20" class="_slider" id="myRange">
             </div>
            `;
        //below code snippt adds jquery code to perform the hide/show of the graph
        //scroll up and down
        minionObject.AddjQuery.type='text/javascript';

        minionObject.AddjQuery.text=`$('#flip').click(function(){
            $('.threshold_center').slideToggle('slow');
            $('#chartg').slideToggle('slow',function(){
                $('.svg-content').show('slow');
                $('.svg-content-responsive').show('slow');

                //This check to auto scroll to bar chart or to the thumbs up and down
                if($(this).is(":visible")){
                    document.getElementById("chartg").scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
                }else{
                    document.getElementById("imagedisplay").scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
                }
            });



        });`;
        document.getElementsByTagName('body')[0].appendChild(minionObject.AddjQuery);
    }

    var x, y, svg, xAxis, yAxis, height, width;

    /**
     * Builds the visualization
     * @inner
     * @memberOf CommunicatorMinionStreamDataTemplate
     */
    function build_chart() {
        // Insert visualization code here
    //    minionObject.width = minionObject.chartfullWidth - minionObject.margin.left - minionObject.margin.right;
        //minionObject.height = minionObject.chartfullHeight - minionObject.margin.top - minionObject.margin.bottom;
        var margin = {top: 10, right: 20, bottom: 30, left: 45};
         width = 960 - margin.left - margin.right,
         height = 500 - margin.top - margin.bottom;

        // D3 scales = just math
        // x is a function that transforms from "domain" (data) into "range" (usual pixels)
        // domain gets set after the data loads
        x = d34.scaleBand()
          .rangeRound([0, width]);

        y = d34.scaleLinear()
          .domain([0, 100])
          .range([height, 0]);

        // D3 Axis - renders a d3 scale in SVG
        xAxis = d34.axisBottom(x);

        yAxis = d34.axisLeft(y)
          .ticks(10);

        // create an SVG element (appended to body)
        // set size
        // add a "g" element (think "group")
        // annoying d3 gotcha - the 'svg' variable here is a 'g' element
        // the final line sets the transform on <g>, not on <svg>
        svg = d34.select('#'+divId)
        .append("div")
        .attr("id",'chartg')
          .classed("svg-container", true)
        .append("svg")
          .attr("preserveAspectRatio", "xMinYMin meet") // resizing responsive
          .attr("viewBox", "0 0 960 540") // resizing responsive
          .classed("svg-content-responsive", true)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")

        svg.append("g")
            .attr("class", "y axis")
          .append("text") // just for the title (ticks are automatic)
            .attr("transform", "rotate(-90)") // rotate the text!
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Damage %");

        // text label for the y axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text("Damage %");



        // text label for the x axis
        svg.append("text")
            .attr("transform",
                  "translate(" + (width/2) + " ," +
                                 (height + margin.top + 30) + ")")
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text("Source");


        svg.append('g')
            .attr('class', 'grid')
            .attr('transform', 'translate(0,'+height+')')
            .call(d34.axisBottom()
                .scale(x)
                .tickSize(-height, 0, 0)
                .tickFormat(''));

        svg.append('g')
            .attr('class', 'grid')
            .call(d34.axisLeft()
                .scale(y)
                .tickSize(-width, 0, 0)
                .tickFormat(''));



            svg.select('.x.axis').transition().duration(minionObject.TRANS_DURATION).call(xAxis);
            // same for yAxis but with more transform and a title
            svg.select(".y.axis").transition().duration(minionObject.TRANS_DURATION).call(yAxis);
    }


    //This function check if the value exceed the set threshold and then change
    // the UI for the playcard that display the status of the harvesting got from
    // npotatoes
    function checkpost(added_value = null){
      var msg = document.getElementById('statusmessage');
      var img=document.getElementById('imagedisplay');
      var topbar=document.getElementsByClassName('topcolorbar');
      //find the max value from array and check if it cross the threshold or not
        if (added_value === null){
            var max_bar_value=Math.max.apply(Math, minionObject.input_buffer.map(function(o) { return o.value; }))
        } else {
            var max_bar_value = added_value;
        }

      if(max_bar_value>minionObject.threshold_limit){
        msg.innerHTML=`<h4 id='displaymessage' style='color: red'>Status: Please Slow Down</h4>`;
        img.src='/assets/icons/danger.png';
        //img.style.WebkitAnimation='shake 4s';
        for(var i = 0; i < topbar.length; i++)
            {
            topbar[i].style.backgroundColor="red";
            //topbar[i].style.WebkitAnimation="glowing 3s";
            }

          }else{
            msg.innerHTML=`<h4 id='displaymessage' style='color: green'>Status: OK</h4>`;
            img.src='/assets/icons/like.png';
            //img.style.WebkitAnimation='shake 4s';
            for(var i = 0; i < topbar.length; i++)
                topbar[i].style.backgroundColor = "green";
      }
    }

    function drawThresholdLine() {
        //remove the curent horizontal line after new threshold is set
        // in order to make new horizontal line
        svg.selectAll('#limit').remove();

        svg.append('line')
            .attr('id', 'limit')
            .attr('x1', 0)
            .attr('y1', function(){ return y(minionObject.threshold_limit)})
            .attr('x2', width)
            .attr('y2', function(){ return y(minionObject.threshold_limit)})
            .attr('stroke', 'red')
            .attr("stroke-width", 5)
            .attr("stroke-dasharray", "0,0");
    }
    //This function  is used to set the threshold for the chart
    function setThresholdBar() {
        var slider = document.getElementById("myRange");
        var output = document.getElementById("demo");
        output.innerHTML = slider.value;
        drawThresholdLine();

        slider.oninput = function() {
            output.innerHTML = this.value;
            minionObject.threshold_limit=this.value;
            drawThresholdLine();
            //check if the value did not cross the set threshold
            checkpost();
        }
    }

    /**
     * Loads required libs dynamically
     * @inner
     * @memberOf CommunicatorMinionStreamDataTemplate
     * @param {function} callback The function to be called when loading is done, it takes a boolean which value is true if the library was loaded successfully.
     */
    function loadDependencies (callback, dependencies=minionObject.dependencies){
        if (dependencies.length > 0) {
            var dependency = dependencies.pop();
            if (!(dependency.name in window)) {
                var scriptTag = document.createElement('script');
                scriptTag.src = dependency.uri;
                var cb = function(){
                  window[dependency.name] = window[dependency.source];
                  window[dependency.source] = null;
                  loadDependencies(callback, dependencies);
                };
                scriptTag.onload = cb;
                scriptTag.onreadystatechange = cb;
                document.querySelector('body').appendChild(scriptTag);
            } else {
                loadDependencies(callback, dependencies);
            }
        } else {
            var cb = function(success) {
                callback(success);
            };
            cb(true);
        }
    }

    /**
     * Creates the required style classes and appends them to the document head
     * @inner
     * @memberOf CommunicatorMinionStreamDataTemplate
     */
    function addStyles() {
        var style = document.createElement('style');

        style.type = 'text/css';

        // Insert custom styles here
        style.innerHTML = `.card-container {
            padding: 10px;
            margin-left: auto;
            margin-right: auto;
            width: 50%;
        }
        .card {
            display: block;
        }
        .card {
            box-shadow: 0px 1px 5px #555;
            background-color: white;
        }

        .topcolorbar {
            display: block;
            background-color: green;
            padding: 20px 20px;
            color: white;
            text-decoration: none;
            text-align: center;
            transition: .3s ease-out;
            \&:hover {
                background-color: darken(tomato, 10%);
            }
        }

        #statusmessage{
          text-align: center;
          color: green;
          font-size: 30px;
          padding-bottom: 0px;
        }
        .centerimg {
            display: block;
            margin-left: auto;
            margin-right: auto;
            width: 100px;
            height: 100px;
            padding-top: 10px;
            -webkit-animation-name:shake;
        }
        #panel, #flip {
            padding: 10px;
            text-align: center;
            background-color: white;
            margin-left: 15px;
            margin-right: 15px;
        }
        #panel {
            padding: 80px;
            display: none;
            box-shadow:none;
        }

        .axis {
          font: 12px sans-serif;
        }
        .axis path,.axis line {
          fill: none;
          stroke: #000;
          shape-rendering: crispEdges;
        }
       .svg-container {
         display: none;
         position: relative;
         width: 55%;
         margin:auto;
         padding-bottom: 35%;
         /* aspect ratio */
         vertical-align: top;
         overflow: hidden;

       }
   	   .svg-content-responsive {
         display: none;
         position: absolute;
         top: 10px;
         left: 0;

       }
       .damaging{
         fill:#6494E2;
         stroke-width: 1.5px;
       }
       .damage {
         stroke-width: 1.5px;
       }
        #bttntext{
          font-size:20px;
        }
        .threshold_center{
          display: none;
          margin: auto;
          margin: auto;
          width: 35%;
          height: 35%;
          text-align:center;
          padding-top: 10px;
          padding-bottom: 10px;
        }
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        @-webkit-keyframes glowing {
          0% { background-color: #B20000; -webkit-box-shadow: 0 0 3px #B20000; }
          50% { background-color: #FF0000; -webkit-box-shadow: 0 0 40px #FF0000; }
          100% { background-color: #B20000; -webkit-box-shadow: 0 0 3px #B20000; }
        }

        @-moz-keyframes glowing {
          0% { background-color: #B20000; -moz-box-shadow: 0 0 3px #B20000; }
          50% { background-color: #FF0000; -moz-box-shadow: 0 0 40px #FF0000; }
          100% { background-color: #B20000; -moz-box-shadow: 0 0 3px #B20000; }
        }

        @-o-keyframes glowing {
          0% { background-color: #B20000; box-shadow: 0 0 3px #B20000; }
          50% { background-color: #FF0000; box-shadow: 0 0 40px #FF0000; }
          100% { background-color: #B20000; box-shadow: 0 0 3px #B20000; }
        }

        @keyframes glowing {
          0% { background-color: #B20000; box-shadow: 0 0 3px #B20000; }
          50% { background-color: #FF0000; box-shadow: 0 0 40px #FF0000; }
          100% { background-color: #B20000; box-shadow: 0 0 3px #B20000; }
        }
        #topbtnshow{
        position: absolute;
        float:right;
        }
        #threshold_value{
            border-radius: 4px;
        }
        #setthreshold_button{
            border-radius: 4px;
        }
        .grid line{
             stroke: lightgray;
        }
        ._slider {
            -webkit-appearance: none;
            width: 100%;
            height: 15px;
            border-radius: 5px;
            background: #d3d3d3;
            outline: none;
            opacity: 1;
            -webkit-transition: .2s;
            transition: opacity .2s;
        }

        ._slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background: rgb(121,85,72);
            cursor: pointer;
        }

        ._slider::-moz-range-thumb {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background: #4CAF50;
            cursor: pointer;
        }
        `;

        document.getElementsByTagName('head')[0].appendChild(style);

    }

    /**
     * Clear the div at the beginning of the minion start and remove all event listeners already registered at the inputDataChannels
     * @inner
     * @memberOf CommunicatorMinionStreamDataTemplate
     */
    function clearMinionEnvironment() {

        // Clear the frontend
        while (minionObject.div.firstChild) {
            minionObject.div.removeChild(minionObject.div.firstChild);
        }
        minionObject.div.style.width = '100%';

        // Clear the input data channels
        if (inputDataChannels){
            inputDataChannels.forEach(function (dataChannel) {
                if (dataChannel) {
                    dataChannel.removeEventListener(divId);
                }
            });
        }
    }

    /**
     * Checks if the minion is started of stopped.
     * @inner
     * @memberOf CommunicatorMinionStreamDataTemplate
     * @returns {boolean} True if started.
     */
    function checkStarted () {
        return (document.getElementById(divId)) ? (document.getElementById(divId).getAttribute('data-active').toLowerCase() === 'true') : false;
    }


    // for performace: if the tab/window is hidden, we want to stop the d3
    // chart from updating. when it becomes visible again, start updating the
    // chart
    document.onvisibilitychange = function(event) {
      if(document.hidden) {
        minionObject.is_doc_visible = false;
      }
      else {
        minionObject.is_doc_visible = true;
      }
    }
});
