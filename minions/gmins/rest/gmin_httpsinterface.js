(function (divId, inputDataChannels) {
    var requestStack = [];
    var timeOut = null;
    var sending = false;
    var maxNumberOfReconnects = 5;
    var numberOfConnectionFailures = 0;
    var adress = 'apps.box';
    var port = 443;

    function prepareDiv() {
        var div = document.getElementById(divId);
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
        div.style.width = '100%';
        if (inputDataChannels[0]) {
            inputDataChannels[0].removeEventListener(divId);
        }
    }

    function checkStarted () {
        var isTrueSet = (document.getElementById(divId)) ? (document.getElementById(divId).getAttribute('data-active').toLowerCase() === 'true') : false;
        return isTrueSet;
    }

    if (!checkStarted()){
        prepareDiv();
    } else {
        prepareDiv();
        startApp();
    }

    function startApp() {



        var inputFieldDomain = document.createElement('input'),
            inputFieldPort = document.createElement('input'),
            button = document.createElement('button'),
            buttonTextStart = document.createTextNode('Start data transmission'),
            buttonTextStop = document.createTextNode('Stop data transmission'),
            container = document.getElementById(divId),
            currentButton = buttonTextStop;



        inputFieldDomain.setAttribute('value', adress);
        inputFieldPort.setAttribute('value', port);

        button.appendChild(currentButton);

        button.addEventListener('click', function (event) {
            button.replaceChild((currentButton == buttonTextStart) ? buttonTextStop : buttonTextStart, currentButton);
            currentButton = (currentButton == buttonTextStart) ? buttonTextStop : buttonTextStart;
            if (currentButton == buttonTextStop) {
                if (inputDataChannels[0]) {
                    if (inputDataChannels[0].ressourceType === 'streaming') {
                        inputDataChannels[0].addEventListener('add', function (value) {
                            requestStack.push(value);
                            sendObjects(inputFieldDomain.value, inputFieldPort.value);
                        }, divId);
                    } else {
                        requestStack = inputDataChannels[0].values;
                        sendObjects(inputFieldDomain.value, inputFieldPort.value);
                        button.replaceChild((currentButton == buttonTextStart) ? buttonTextStop : buttonTextStart, currentButton);
                        currentButton = (currentButton == buttonTextStart) ? buttonTextStop : buttonTextStart;
                    }
                }
            } else if (inputDataChannels[0].ressourceType === 'streaming') {
                inputDataChannels[0].removeEventListener(divId);
            }
        });
        container.appendChild(inputFieldDomain);
        container.appendChild(inputFieldPort);
        container.appendChild(button);

        if (inputDataChannels[0]){
            if (inputDataChannels[0].ressourceType === 'streaming') {
                inputDataChannels[0].addEventListener('add', function (value) {
                    requestStack.push(value);
                    sendObjects(inputFieldDomain.value, inputFieldPort.value);
                }, divId);
            } else {
                requestStack = inputDataChannels[0].values;
                sendObjects(inputFieldDomain.value, inputFieldPort.value);
                button.replaceChild((currentButton == buttonTextStart) ? buttonTextStop : buttonTextStart, currentButton);
                currentButton = (currentButton == buttonTextStart) ? buttonTextStop : buttonTextStart;

            }
        }
    }

    function sendObjects(domain, port) {
        if (numberOfConnectionFailures < maxNumberOfReconnects-1){
            if (!sending) {
                sending = true;
                while (requestStack.length > 0) {
                    var value = requestStack.shift();
                    sendValue(value, domain, port);
                }
                sending = false;
            }
        } else {
            console.warn('Connectivity is not available');
        }

    }

    function sendValue (valueObject, domain, port) {
        if (valueObject) {
            if (valueObject.value == 0) {
                return;
            }
        }
        var type = inputDataChannels[0].creator.split('_');
        var object = {
            source: inputDataChannels[0].creator,
            name: inputDataChannels[0].name,
            dataObject: valueObject,
            relatedSubject: inputDataChannels[0].relatedSubject,
            type: type[0]
        };

        var uri = 'https://' + domain + ':' + port + '/npotato';

        var config = { method: 'POST',
            rejectUnauthorized: false,
            mode:'cors',
            cache: 'default',
            headers: {
                'content-type' : 'application/json',
            },
            body : JSON.stringify(object)
        };

        fetch(uri, config)
            .catch(function (err) {
                numberOfConnectionFailures++;
                console.warn('Failed: ' + numberOfConnectionFailures + ' times; Number of trials left: ' + (maxNumberOfReconnects-numberOfConnectionFailures) );
                if (err) {
                    console.error(err);
                    requestStack.push(valueObject);
                }
                return null;
            }).then(function (res) {
                if (res)
                    numberOfConnectionFailures = 0;
        });
    }
});