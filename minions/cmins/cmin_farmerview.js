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
        ViewIconID:document.getElementById("cropsbtn"),
        // Custom HTML elements
        AddjQuery_Farmer : document.createElement('script'),

        // Custom visualization variables
        input_buffer : [],
        is_doc_visible : true,
        TRANS_DURATION : 100,
        MONTHS : ["January", "February", "March", "April", "May", "June", "July",
                  "August", "September", "October", "November", "December"],
        sources : [],
        acc_damage : 0,
        start_timestamp : Date.now(),
        prev_timestamp : Date.now(),
        highest_avg : 0,
        optimal_month : "",
        crop_amount : 1,
    };

    var sample_input = {
        "month1": {
            "min":12,
            "avg":15,
            "max":18
        },
        "month2": {
            "min":5,
            "avg":8,
            "max":12
        },
        "month3": {
            "min":25,
            "avg":28,
            "max":30
        }
    };
    // Start the functionality of the minion
    if (checkStarted()){
        loadDependencies(function(success) {
            if (success) {
                clearMinionEnvironment();
                addStyles();
                startApp();
                build_chart();
                onReceiveFinancialForecast(sample_input);
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
        // Insert handler here
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
    }

    function PrepareDiv(){
    //insert the main html code for the view for chart and information to be displayed
        minionObject.div.innerHTML=`
            <div id="cropsdiv" style="display:none;">
            Enter Amount of Crops (ton) &nbsp;<input type="text" style="text-align: center;" value="20" id="setNoCrops"/>
            <button id="cropsbtn" >Calculate Total Return</button>
            </div>
            <div class="_main-container">
                <div id="recommander_div">
                <img id="imgrecom" src="/assets/icons/recommended.png"/>
                <h5 style="padding-top: 3%;"> Best Month To Sell Potatoes<h5>
                <h4 id="optimal_month" style="color:#43A047;"> January <h4>
                <h5> Total Expected Return <span id='returnvalue_1_optimal_month'>0</span> <span style="color:#DAA520;">&euro;</span></h5>
                <h5 style="float:left;"> Total Expected Return For <br><br>  October <span id='returnvalue_2_month'>0</span> <span style="color:#DAA520;">&euro;</span></h5>
                <h5 style="float:right;"> Total Expected Return For<br><br>  September <span id='returnvalue_3_month'>0</span> <span style="color:#DAA520;">&euro;</span></h5>
                <br><br>
                <button class="viewbutton" style="font-size:24px"><i class="fa fa-eye"></i></button>
                </div>&nbsp;&nbsp;&nbsp;
                <div id="chart_div">
                </div>
            </div>
            `;
            minionObject.AddjQuery_Farmer.type='text/javascript';
            minionObject.AddjQuery_Farmer.text=`
                    $(".viewbutton").click(function(){
                        $('#chart_div').slideToggle('slow',function(){
                            if($(this).is(":visible")){
                                $("#chart_div").css("display","flex");
                                $("._main-container").css({"width":"99%"});
                            }else{
                                $("#chart_div").css("display","none");
                                $("._main-container").css({"width":"50%"});
                            }
                        });

                    });`;
            document.getElementsByTagName('body')[0].appendChild(minionObject.AddjQuery_Farmer);
            //set click event listner to calculate total return crops
            CalculateCropsReturn();
    }
    if(minionObject.ViewIconID){
        minionObject.ViewIconID.addEventListener("click", CalculateCropsReturn);
    }


    //Function set click event listner to calculate total return crops
    function CalculateCropsReturn(){
        var cropsAmount=document.getElementById("setNoCrops");
        var SetExpReturn_optimal_month=document.getElementById("returnvalue_1_optimal_month");
        var SetExpReturn_2_month=document.getElementById("returnvalue_2_month");
        var SetExpReturn_3_month=document.getElementById("returnvalue_3_month");
                if(cropsAmount.value){
                    minionObject.crop_amount=cropsAmount.value;
                    SetExpReturn_optimal_month.textContent=Math.round(calculateExpectedReturn());
                    SetExpReturn_2_month.textContent=Math.floor((Math.random() * 350) + 1);
                    SetExpReturn_3_month.textContent=Math.floor((Math.random() * 280) + 1);
                }

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
        svg = d34.select("#chart_div")
        .append("div")
        .attr("class",'_chartgraph')
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

    function calculateAccumulatedDamage(input_val) {
        var new_damage_val = input_val['value'];

        var t1 = minionObject.prev_timestamp - minionObject.start_timestamp;
        var t2 = input_val['timestamp'] - minionObject.prev_timestamp;

        minionObject.acc_damage = ((t1 * minionObject.acc_damage) + (t2 * (new_damage_val/100)))/(t1 + t2);

        minionObject.prev_timestamp = input_val['timestamp'];
    }

    function calculateExpectedReturn() {
        calculateHighestMonthAvg(sample_input);
        return (1 - minionObject.acc_damage) * minionObject.highest_avg * minionObject.crop_amount;
    }

    function getCurrentMonth() {
        var date = new Date();
        var month = date.getMonth();

        return month;
    }

    // called when input data received from fin forecast tmin
    function calculateHighestMonthAvg(input_val) {
        var highest_avg = -1;
        var optimal_month;
        var i;
        for(i=1; i<=3; i++) {
            var cur_avg = input_val["month"+i].avg;

            if(cur_avg > highest_avg) {
                highest_avg = cur_avg;

                optimal_month = i;
            }
        }

        minionObject.highest_avg = highest_avg;

        var cur_month = getCurrentMonth();

        minionObject.optimal_month = minionObject.MONTHS[cur_month+(i-1)];
    }

    // called when input data received from fin forecast tmin
    function onReceiveFinancialForecast(input_data) {
        calculateHighestMonthAvg(input_data);

        updateRecommendationUI();
    }

    function updateRecommendationUI() {
        var elem = document.getElementById("optimal_month");

        elem.innerHTML = minionObject.optimal_month;
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
        //include this library only for the icon
        var style_font = document.createElement('link');
        style_font.type = 'text/css';
        style_font.rel="stylesheet";
        style_font.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";
        document.getElementsByTagName('head')[0].appendChild(style_font);

        var style = document.createElement('style');

        style.type = 'text/css';

        // Insert custom styles here
        //Example: style.innerHTML = ".line {  fill: none;  stroke: steelblue;  stroke-width: 1.5px; }";
        style.innerHTML=`
        ._main-container{
        	width: 50%;
        	margin: 0 auto;
        	display: flex; /* Standard syntax */
            padding: 10px;
        	background: #ffffff;
        }
        #recommander_div, #chart_div{
            padding: 10px;
            text-align: center;
            background: #ffffff;
            -webkit-flex: 1; /* Safari */
            border-radius: 5px;
            box-shadow: 0px 1px 5px #555;
            /*position: relative;*/
        }
        #chart_div{
            display:none;
        }

        .viewbutton {
          /*background-color : #31B0D5;*/
          border-radius: 100%;
          float:right;
          bottom:0;
          right:0;
          /*position:absolute;*/
          margin: 20px;
          text-decoration: none;

        }
       .svg-container {
         display: block;
         position: relative;
         width: 100%;
         margin:auto;
         padding-bottom: 0%;
         /* aspect ratio */
         vertical-align: top;
         overflow: hidden;

       }
   	   .svg-content-responsive {
         display: block;
         position: relative;
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
       #imgrecom {
           display: block;
           margin-left: auto;
           margin-right: auto;
           width: 100px;
           height: 100px;
           padding-top: 10px;
       }
       #cropsdiv{
          text-align:center;
       }
       #setNoCrops{
           border-radius: 10px;
           }
       #cropsbtn{
           border-radius: 8px;
       }
       #returnvalue_1_optimal_month{
           color:#DAA520;
       }
        `;

        document.getElementsByTagName('head')[0].appendChild(style);

    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    var id = 0;
    window.temp = setInterval(function () {
        var obj=[];
        obj['source'] = "potato" + id;
        obj['value'] = getRandomInt(10, 25);
        obj['timestamp']=Date.now();
        updateChart(obj);
        calculateAccumulatedDamage(obj);
        CalculateCropsReturn();
        if(id == 0) {
            id = 1;
        }
        else {
            id = 0;
        }
    }, 3000);

    /**
     * Clear the div at the beginning of the minion start and remove all event listeners already registered at the inputDataChannels
     * @inner
     * @memberOf CommunicatorMinionStreamDataTemplate
     */
    function clearMinionEnvironment() {
        //
        clearInterval(window.temp);

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

        if(minionObject.ViewIconID){
            minionObject.ViewIconID.removeEventListener("click",function(){

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
