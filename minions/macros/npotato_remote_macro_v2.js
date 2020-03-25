// This is highly restricted to the nPotato use case
// MQTT transfer still missing

(function (_this) {
    // Start the measure
    //TODO
    var necessaryMinions = ['Live Motion'];
    var necessaryViews = ['Driver View'];
    var resultDataStreams = [];
    var txtRound = "txtRound";

    function copy (array) {
        var copy = [];
        for (var item of array) {
            copy.push(item);
        }
        return copy;
    }
    var aggregationChannels = [{inputName : 'LinearAccelerationSensor*' + getLapValue()}, {inputName : 'Damage estimator*' + getLapValue()}];



    if (_this) {
        var interval = 200;
        var currentLap = _this.getLapValue();
        var dataChannelsToConnect = ['LinearAccelerationSensor*' + _this.getLapValue(), 'Gyroscope*' + _this.getLapValue(), 'Damage estimator*' + _this.getLapValue()];
        var userRelatedDataChannels = {};
        var configObject = {};

        var hitAggregator = new DataChannel(currentLap, [], 'Damage estimator Aggregation', null, _this.myContactInfo.email, 'streaming');
        _this.myContactInfo.dataChannels.push(hitAggregator);

        var linAccAggregator = new DataChannel(currentLap, [], 'LinearAccelerationSensor Aggregation', null, _this.myContactInfo.email, 'streaming');
        _this.myContactInfo.dataChannels.push(linAccAggregator);

        for (var sub of aggregationChannels) {
            if (sub.inputName === 'LinearAccelerationSensor*' + _this.getLapValue()) {
                sub.aggregator = linAccAggregator;
                sub.name = 'LinearAccelerationSensor Aggregation*' + _this.getLapValue();
            } else if (sub.inputName === 'Damage estimator*' + _this.getLapValue()) {
                sub.aggregator = hitAggregator;
                sub.name = 'Damage estimator Aggregation*' + _this.getLapValue();
            }
        }

        // Remote Start for peers
        _this.communicationHelper.sendStartLap(_this.getEmailListMineExcluded(), currentLap, interval);


        // Start Minions
        configObject[_this.myContactInfo.email] = {};
        necessaryMinions.forEach(function (minionName) {
            configObject[_this.myContactInfo.email][minionName] = _this.app.minionManager.createNewInstance(minionName, _this.myContactInfo.email);
        });
        necessaryMinions.forEach(function (minionName) {
            _this.app.minionManager.showMinion(minionName);
        });

        // Set appropriate Data Channels
        function setDataChannels (necessaryMinions, contact = myContactInfo) {
            var contactId = contact.email;
            for (var i = 0; i < necessaryMinions.length; i++) {
                var minionName = necessaryMinions[i];
                switch (minionName) {
                    case 'Hit detection':
                        var dataChannels = [findDataChannel(dataChannelsToConnect[0], contact), findDataChannel(dataChannelsToConnect[1], contact)];
                        break;
                    case 'Live Motion':
                        var dataChannels = [findDataChannel(aggregationChannels[0].name, contact)];
                        break;
                    case 'Hit Classify':
                        var dataChannels = [findDataChannel(dataChannelsToConnect[2], contact)];
                        break;
                }
                for (var j = 0; j < dataChannels.length; j++) {
                    var dataChannel = dataChannels[j];
                    if (!dataChannel) {
                        return setTimeout(function () {
                            setDataChannels(necessaryMinions);
                        }, 3000);
                    }
                }
                necessaryMinions.splice(i, 1);
                _this.app.minionManager.setDataChannelsOfSingleInstance(minionName, configObject[contactId][minionName], dataChannels);
                if (minionName === 'Live Motion')
                    _this.app.minionManager.hideMinion('Live Motion');
                i--;
            }
        }

        function setupAggregationChannels(contact, channels) {
            if (channels.length > 0) {
                var currentChannel = channels[0];
                var dataChannel = findDataChannel(currentChannel.inputName, contact);
                if (!dataChannel) {
                    return setTimeout(function () {
                        setupAggregationChannels(contact, channels);
                    }, 3000);
                } else {
                    var aggregator = currentChannel.aggregator;
                    dataChannel.addEventListener('add', function (added_value) {
                        var copiedValue = JSON.parse(JSON.stringify(added_value));
                        copiedValue.source = contact.email;
                        aggregator.push(copiedValue);
                    }, 'Aggregation');
                    channels.splice(0,1);
                    setupAggregationChannels(contact, channels);
                }
            }
        }

        function setupViews(views) {
            if (views.length > 0) {
                var view = views[0];
                if (view === 'Driver View') {
                    var dataChannels = [aggregationChannels[1].aggregator];
                    if (dataChannels[0]) {
                        var instance = _this.app.minionManager.createNewInstance(view, myContactInfo.email);
                        views.splice(0,1);
                        _this.app.minionManager.showMinion(view);
                        _this.app.minionManager.setDataChannelsOfSingleInstance(view, instance, dataChannels);
                        setupViews(views);
                    } else {
                        setTimeout(function () {
                            setupViews(views)
                        }, 3000)
                    }
                }
            } else {
                return;
            }
        }

        for (var i = 0; i < contacts.length; i++) {
            if (contacts[i].online) {
                setupAggregationChannels(contacts[i], copy(aggregationChannels));
            }
        }
        setDataChannels(necessaryMinions.slice());
        setupViews(necessaryViews.slice());

    } else {
        window.communicationHelper.sendStopLap(window.getEmailListMineExcluded());
        contacts.forEach(function (contact) {
            if (contact.online) {
                for (var dataChannel of aggregationChannels) {
                    var chan = findDataChannel(dataChannel.inputName);
                    if (chan){
                        chan.removeEventListener('Aggregation');
                    }
                }
            }
        });
        necessaryMinions.forEach(function (minionName) {
            window.app.minionManager.hideMinion(minionName);
            window.app.minionManager.killMinion(minionName);
        });
        necessaryViews.forEach(function (viewName) {
            window.app.minionManager.hideMinion(viewName);
            window.app.minionManager.killMinion(viewName);
        });
        $('#' + txtRound).val('');
    }
});
