// This is highly restricted to the nPotato use case
// MQTT transfer still missing

(function (_this) {
    // Start the measure
    //TODO
    if (!navigator.userAgent.match(/Android/i)) {
        console.warn('No Android');
        return;
    }
    var necessaryThinkerMinions = ['Damage estimator'];
    var necessaryCommunicatorMinions = ['Live Motion', 'REST Gateway', 'MQTT Gateway'];
    var txtRound = "txtRound";

    if (_this) {
        var currentLap = _this.macroCommunication ? (_this.macroCommunication.lapName ? _this.macroCommunication.lapName : _this.getLapValue()) : _this.getLapValue() ;
        var dataChannelsToConnect = ['Accelerometer*' + currentLap];
        var outputChannels = ['Damage estimator*' + currentLap];


        // Reset internal sensors and thinker minion
        deactivate_sensors(_this);
        necessaryThinkerMinions.forEach(function (minName) {
            deactivate_minion(_this, minName);
        });
        necessaryCommunicatorMinions.forEach(function (minionName) {
            deactivate_minion(_this, minionName);
        });

        // Start internal sensors and thinker minion
        activate_sensors(_this, currentLap);
        necessaryThinkerMinions.forEach(function (minName) {
            activate_thinker_minion(_this, currentLap, minName, dataChannelsToConnect, outputChannels);
        });

        // Start communicators
        necessaryCommunicatorMinions.forEach(function (minionName) {
            switch (minionName) {
                case 'Live Motion':
                    activate_communicator_minion(_this, minionName, [dataChannelsToConnect[0]]);
                    break;
                case 'Hit Classify':
                    activate_communicator_minion(_this, minionName, [outputChannels[0]]);
                    break;
                case 'REST Gateway':
                    activate_communicator_minion(_this, minionName, [outputChannels[0]]);
                    break;
                case 'MQTT Gateway':
                    activate_communicator_minion(_this, minionName, [outputChannels[0]]);
                    activate_communicator_minion(_this, minionName, [dataChannelsToConnect[0]]);
                    break;
            }
        });


        necessaryThinkerMinions.forEach(function (minionName) {
            _this.app.minionManager.showMinion(minionName);
        });

        necessaryCommunicatorMinions.forEach(function (minionName) {
            _this.app.minionManager.showMinion(minionName);
        });

    } else {
        deactivate_sensors(window);
        necessaryThinkerMinions.forEach(function (minName) {
            deactivate_minion(window, minName);
            window.app.minionManager.hideMinion(minName);
        });

        necessaryCommunicatorMinions.forEach(function (minName) {
            deactivate_minion(window, minName);
            window.app.minionManager.hideMinion(minName);
        });
    }


    function activate_thinker_minion( _this, lap, minName, inputDataChannels, outputDataChannels) {
        var inputs = [];
        if (inputDataChannels)
            inputDataChannels.forEach(function (channelName) {
                inputs.push(_this.findDataChannel(channelName, _this.myContactInfo))
            });
        // var inputs = [ _this.findDataChannel('Gyroscope*' + lap,  _this.myContactInfo),  _this.findDataChannel('LinearAccelerationSensor*' + lap)];
        var outputs = [];
        if (outputDataChannels)
            outputDataChannels.forEach(function (channelName) {
                var channel = _this.findDataChannel(channelName, _this.myContactInfo);
                if (channel)
                    outputs.push(channel);
            });

        // var output = findDataChannel('Hit detection*' + lap);
        if (outputs.length === 0){
            outputs = [new DataChannel(lap, [], minName, null, _this.myContactInfo.email, 'streaming')];
            _this.myContactInfo.dataChannels.push(outputs[0]);
        }
        var instanceId = _this.app.minionManager.createNewInstance(minName, _this.myContactInfo.email);
        _this.app.minionManager.setDataChannelsOfSingleInstance(minName, instanceId, inputs, outputs);
    }

    function activate_communicator_minion(_this, minName, inputDataChannels) {
        var inputs = [];
        for (var i = 0; i < inputDataChannels.length; i++){
            var channel = _this.findDataChannel(inputDataChannels[i], _this.myContactInfo);
            if (channel) {
                inputs.push(channel)
            } else {
                return setTimeout(function () {
                    activate_communicator_minion(_this, minName, inputDataChannels);
                }, 1000);
            }
        }
        var instanceId = _this.app.minionManager.createNewInstance(minName);
        _this.app.minionManager.setDataChannelsOfSingleInstance(minName, instanceId, inputs);
    }

    function deactivate_minion(_this, minName) {
        _this.app.minionManager.killMinion(minName);
    }

    function activate_sensors(_this, lap){
        _this.sensors.forEach(function(sensor){
            var dataChannel = new DataChannel(lap, [], sensor.name, null, _this.myContactInfo.email, 'streaming');
            _this.myContactInfo.dataChannels.push(dataChannel);
            sensor.start(dataChannel);
        });
    }

    function deactivate_sensors(_this){
        _this.sensors.forEach(function(sensor){
            sensor.stop();
        });
        $('#' + txtRound).val('');
    }

});
