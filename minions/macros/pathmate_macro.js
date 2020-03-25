// This is highly restricted to the pathmate use case

(function (_this) {
    var necessaryPerceiverMinions = ['Heartrate watcher'];
    var necessaryThinkerMinions = ['Obese Estimator'];
    var necessaryCommunicatorMinions = ['TODO Cmin name'];

    if (_this) {
        var currentLap = _this.macroCommunication ? (_this.macroCommunication.lapName ? _this.macroCommunication.lapName : _this.getLapValue()) : _this.getLapValue() ;
        var dataChannelsToConnect = ['Load sample*' + currentLap];
        var outputChannels = ['Obese estimator*' + currentLap];


        // Reset minions
        necessaryThinkerMinions.forEach(function (minName) {
            deactivate_minion(_this, minName);
        });
        necessaryCommunicatorMinions.forEach(function (minionName) {
            deactivate_minion(_this, minionName);
        });

        necessaryPerceiverMinions.forEach(function (minionName) {
            deactivate_minion(_this, minionName);
        });

        // Start perceiver and thinker minion
        necessaryThinkerMinions.forEach(function (minName) {
            activate_thinker_minion(_this, currentLap, minName, dataChannelsToConnect, outputChannels);
        });
        necessaryPerceiverMinions.forEach(function (minName) {
            activate_perceiver_minion(_this, currentLap, minName, dataChannelsToConnect);
        });

        // Start communicators
        necessaryCommunicatorMinions.forEach(function (minionName) {
            switch (minionName) {
                case necessaryCommunicatorMinions[0]:
                    activate_communicator_minion(_this, minionName, [dataChannelsToConnect[0], outputChannels[0]]);
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
        necessaryThinkerMinions.forEach(function (minName) {
            deactivate_minion(window, minName);
            window.app.minionManager.hideMinion(minName);
        });

        necessaryCommunicatorMinions.forEach(function (minName) {
            deactivate_minion(window, minName);
            window.app.minionManager.hideMinion(minName);
        });

        necessaryPerceiverMinions.forEach(function (minName) {
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

    function activate_perceiver_minion( _this, lap, minName, outputDataChannels) {
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
        _this.app.minionManager.setDataChannelsOfSingleInstance(minName, instanceId, null, outputs);
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
});
