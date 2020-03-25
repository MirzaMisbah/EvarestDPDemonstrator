(function (divId, inputDataChannels) {
    var ressourceUris = ['../libs/thirdparty/mqttws31.js'];

    if (inputDataChannels instanceof Array) {
        var inputDataChannel = inputDataChannels[0];
    } else {
        var inputDataChannel = inputDataChannels;
    }

    var fetchScripts = function (uris, callback) {
        var fetchPromises = [];
        uris.forEach(function (uri) {
            fetchPromises.push(fetch(uri).then(function (res) {
                return res.text()
                    .then(function (script) {
                        eval(script);
                    });
            }));
        });

        Promise.all(fetchPromises)
            .then(function () {
                callback();
            })
    };

    var GLOBALS = {
        isLoaded : false,
        requestStack : [],
        subject : 'default',
        maxNumberOfReconnects : 10,
        numberOfReconnects : 0,
        postMessage : function(object) {
            if (!GLOBALS.isLoaded)
                GLOBALS.requestStack.push(object);
            else {
                var message = new Paho.MQTT.Message(JSON.stringify(object));
                message.destinationName = GLOBALS.subject;
                try {
                    GLOBALS.mqttClient.send(message)
                } catch (e) {
                    GLOBALS.requestStack.push(object);
                    GLOBALS.numberOfReconnects++;
                }
            }
        }
    };

    function prepareDiv() {
        var div = document.getElementById(divId);
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
        div.style.width = '100%';
        if (inputDataChannel) {
            inputDataChannel.removeEventListener(divId);
        }
        if (window.mqttSendingInterval && window.mqttSendingInterval[divId]){
            clearInterval(window.mqttSendingInterval[divId]);
        }
    }

    function checkStarted () {
        var isTrueSet = (document.getElementById(divId)) ? (document.getElementById(divId).getAttribute('data-active').toLowerCase() === 'true') : false;
        return isTrueSet;
    }


    class MQTTClient {
        constructor(adress, port, user, password, subject='default') {
            GLOBALS.subject = subject;
            var _this = this;
            if (! ('Paho' in window)) {
                fetchScripts(ressourceUris, function () {
                    _this.connectToClient (adress, port, user, password);
                });
            } else {
                this.connectToClient (adress, port, user, password);
            }

        }

        connectToClient (adress, port, user, password){
            var _this = this;
            if (window.mqttClient){
                GLOBALS.mqttClient = window.mqttClient;
                this.onConnect();
            } else {
                GLOBALS.mqttClient = new Paho.MQTT.Client(adress, port, '');
                GLOBALS.mqttClient.connect({
                    useSSL: true,
                    userName : user,
                    password : password,
                    onSuccess :_this.onConnect,
                    onFailure: function (err) {
                        console.log(err);
                    }
                });
                window.mqttClient = GLOBALS.mqttClient;
            }
        }

        postMessage (object) {
            GLOBALS.postMessage(object);
        }

        onConnect () {
            GLOBALS.isLoaded = true;
            if (!window.mqttSendingInterval){
                window.mqttSendingInterval = {};
            }
            window.mqttSendingInterval[divId] = setInterval(function () {
                while (GLOBALS.requestStack.length > 0 && GLOBALS.numberOfReconnects < GLOBALS.maxNumberOfReconnects){
                    var current = GLOBALS.requestStack.shift();
                    GLOBALS.postMessage(current);
                }
            }, 3000);
        }
    }

    if (!checkStarted()){
        prepareDiv();
    } else {
        // addStyles();
        prepareDiv();
        startApp();
    }


    function startApp() {
        var inputFieldChannel = document.createElement('input'),
            inputFieldDomain = document.createElement('input'),
            inputFieldPort = document.createElement('input'),
            button = document.createElement('button'),
            buttonTextStart = document.createTextNode('Start data transmission'),
            buttonTextStop = document.createTextNode('Stop data transmission'),
            container = document.getElementById(divId),
            currentButton = buttonTextStop;

        inputFieldChannel.setAttribute('value', 'default');
        inputFieldDomain.setAttribute('value', 'service-tucana.de');
        inputFieldPort.setAttribute('value', '8083');

        button.appendChild(currentButton);

        button.addEventListener('click', function (event) {
            button.replaceChild((currentButton == buttonTextStart) ? buttonTextStop : buttonTextStart, currentButton);
            currentButton = (currentButton == buttonTextStart) ? buttonTextStop : buttonTextStart;
            GLOBALS.isLoaded =  false;
            GLOBALS.requestStack = [];
            var client = new MQTTClient(inputFieldDomain.getAttribute('value'), parseInt(inputFieldPort.getAttribute('value')), 'smartfarming', 'smarf_npotato', inputFieldChannel.getAttribute('value'));
            if (currentButton == buttonTextStop) {
                if (inputDataChannel.ressourceType === 'streaming') {
                    inputDataChannel.addEventListener('add', function (value) {
                        var type = inputDataChannel.creator.split('_');
                        client.postMessage({
                            source: inputDataChannel.creator,
                            name: inputDataChannel.name,
                            dataObject: value,
                            relatedSubject: inputDataChannel.relatedSubject,
                            type: type[0]
                        });
                    }, divId);
                } else {
                    var data = inputDataChannel.values;
                    data.forEach(function (value) {
                        client.postMessage({source : inputDataChannel.creator, name : inputDataChannel.name, dataObject: value, relatedSubject : inputDataChannel.relatedSubject});
                    });
                }
            } else {
                if (inputDataChannel.ressourceType === 'streaming') {
                    inputDataChannel.removeEventListener(divId);
                }
                client = null;
            }
        });

        container.appendChild(inputFieldDomain);
        container.appendChild(inputFieldPort);
        container.appendChild(inputFieldChannel);
        container.appendChild(button);

        if (inputDataChannel){
            var client = new MQTTClient(inputFieldDomain.getAttribute('value'), parseInt(inputFieldPort.getAttribute('value')), 'smartfarming', 'smarf_npotato', inputFieldChannel.getAttribute('value'));

            if (inputDataChannel.ressourceType === 'streaming') {
                inputDataChannel.addEventListener('add', function (value) {
                    var type = inputDataChannel.creator.split('_');
                    client.postMessage({
                        source: inputDataChannel.creator,
                        name: inputDataChannel.name,
                        dataObject: value,
                        relatedSubject: inputDataChannel.relatedSubject,
                        type: type[0]
                    });
                }, divId);
            } else {
                var data = inputDataChannel.values;
                data.forEach(function (value) {
                    client.postMessage({source : inputDataChannel.creator, name : inputDataChannel.name, dataObject: value, relatedSubject : inputDataChannel.relatedSubject});
                });
            }
        }
    }
});

