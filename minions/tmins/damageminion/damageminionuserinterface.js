(function (_divId, _dataChannels) {

    var thirdPartyScripts = [];
    var objectCounter = 0;

    var divElement = document.createElement('h6');
    var divText = document.createTextNode('No data transfered yet, please choose LinearAccelerationSensor as input channel.');
    divElement.appendChild(divText);
    divElement.setAttribute('style', 'text-align : center; padding-top: 40px');
    var rightInputs = true;
    var updateUI = null;

    var channels = [];
    _dataChannels.forEach(function (channel) {
        if (channel){
            var newChannel = channel;
            if (!newChannel.channel) {
                newChannel = {channel : newChannel};
            }
            channels.push(newChannel);
        }

    });
    _dataChannels = channels;

/*    var showModelParams = function () {
        var div = document.createElement('div');

        div.innerHTML=`
        <style>
            .tucana_hit_table {
                border: 1px solid black;
                text-align: center;
                border-collapse: collapse;
                padding: 10px;
                margin-top: 20px;
            }

            .layout {
                table-layout: fixed;
            }

            .cell-width {
                width : 20%;
                font-size: 16px;
                font-size: 2vw;
            }

        </style>
        <table class="tucana_hit_table layout"  style="width: 100%">
            <tbody>
                <tr>
                    <th class="tucana_hit_table cell-width">Model Architecture</th>
                    <th class="tucana_hit_table cell-width">Layer count</th>
                    <th class="tucana_hit_table cell-width">Neuron count</th>
                    <th class="tucana_hit_table cell-width">Activation function</th>
                    <th class="tucana_hit_table cell-width">Backend used</th>
                </tr>
                <tr>
                    <td class="tucana_hit_table cell-width">MLP (Multilayer Perceptron)</td>
                    <td class="tucana_hit_table cell-width" >1</td>
                    <td class="tucana_hit_table cell-width">32</td>
                    <td class="tucana_hit_table cell-width">ReLU</td>
                    <td class="tucana_hit_table cell-width">Keras.js</td>
                </tr>
            </tbody>
        </table>`

        return div;
    };*/


    var increaseCount = function (dataValue) {
        objectCounter ++;
    };

    var startMinion = function () {
        document.getElementById(_divId).appendChild(divElement);


        _dataChannels.forEach(function (dataChannel) {
            if (dataChannel.channel && dataChannel.channel.creator === 'Accelerometer') {
                dataChannel.channel.addEventListener('add', increaseCount, _divId + 'Visualization');
            } else {
                rightInputs = false;
            }
        });

        // var spinner = document.createElement('spinner');
        // var spinnerImage = document.createElement('img');
        // spinner.setAttribute('class', 'subMinion-spinner');
        // spinnerImage.setAttribute('src', '../assets/loading.svg');
        // spinnerImage.setAttribute('alt', 'Loading spinner');
        // spinner.appendChild(spinnerImage);
        // document.getElementById(_divId).appendChild(spinner);

        if (rightInputs) {
            var progressBar = document.createElement('div');
            var progress = document.createElement('div');
            progressBar.setAttribute('style', 'width: 100%; background-color: grey;');
            progress.setAttribute('style', 'width : 0%; height: 30px; background-color: green;');

            progressBar.appendChild(progress);
            document.getElementById(_divId).appendChild(progressBar);
            //document.getElementById(_divId).appendChild(showModelParams());


            var timestampNow = Date.now();
            updateUI = setInterval(function () {
                var currentTimestamp = Date.now();
                var difference = currentTimestamp - timestampNow;
                if (difference > 1000) {
                    timestampNow = currentTimestamp;
                }
                var newDivText = document.createTextNode('Computing result: ' + Math.min(Math.round((difference/1000)*100), 100) + '%');
                divElement.replaceChild(newDivText, divText);
                divText = newDivText;
                progress.style.width = Math.min(Math.round((difference/1000)*100) , 100)+ '%';
            }, 100);
        } else {

        }

    };



    function clearDiv() {
        if (updateUI)
            clearInterval(updateUI);
        var div = document.getElementById(_divId);
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
        div.style.width = '100%';
        if (_dataChannels) {
            _dataChannels.forEach(function (dataChannel) {
                if (dataChannel.channel)
                    dataChannel.channel.removeEventListener(_divId + 'Visualization');
            });
        }
    }

    function checkStarted () {
        var isTrueSet = (document.getElementById(_divId).getAttribute('data-active').toLowerCase() === 'true');
        return isTrueSet;
    }

    var loadJS = function(lib, done, location= document.querySelector('body')){
        //url is URL of external file, implementationCode is the code
        //to be called from the file, location is the location to
        //insert the <script> element
        var scriptTag = document.createElement('script');
        scriptTag.src = lib;

        scriptTag.onload = function (success) {
            d3 = window.d3;
            done(success);
        };
        scriptTag.onreadystatechange = function (success) {
            d3 = window.d3;
            done(success);
        };

        location.appendChild(scriptTag);
    };
    if (!checkStarted()) {
        clearDiv();
    } else {
        clearDiv();
        startMinion();
    }
});