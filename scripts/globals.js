'use strict';

(function (root) {

    /**
     * Global app object that stores important parameters and functions to change the UI and run functionality.
     * @type {{syncApiAdress: string, syncHeartrateExtension: string, syncStepExtension: string, localStorageCenter: string, oauthClientId: string, oauthDomainName: string, loaded: boolean}}
     */
	var runOverHttps = true;
    var app = {
        // URL's of generic service for heartrate and step data used for synchronization
        syncApiAdress : runOverHttps?  'https://service-tucana.de:81' : 'http://iot01.iss.uni-saarland.de:81',
        syncHeartrateExtension : '/genericHeartRateService',
        syncStepExtension : '/genericStepDataService',

        // Location of the local storage center
        localStorageCenter : runOverHttps? 'https://service-tucana.de:3003': 'http://service-tucana.de:3000',

        // OAuth 2.0 variables
        oauthClientId : 'kMlSIl3Itqt6mQetzGXES6biAVFei6k8',
        oauthDomainName : 'app-iss.eu.auth0.com',

	    
        SIG_SERVER: runOverHttps? 'wss://service-tucana.de:9091': 'ws://service-tucana.de:9090',

        rtcConfig : {
			iceServers : [{
				url : 'stun:stun.l.google.com:19302'
			}, {
				url : 'turn:51.15.218.10:3478?transport=tcp',
				credential : 'test123',
				username : 'test123'
			}]
		},
        loaded : false,
        SUPPORTED_BROWSERS : [{name : 'CHROME', minVersion: 62}]
    };

    /**
     * Shows a notification inside the UI
     * @param message The message that should be displayed
     * @param duration Optional duration of the message.
     */
    app.showNotification = function (message, duration) {
        if (!message) {
            return;
        }
        if (!duration) {
            duration = 2000;
        }
        const data = {message: message, timeout: duration};
        app.notificationSnackbar.MaterialSnackbar.showSnackbar(data);
    };

    /**
     * Returns a parent of specified type if existing
     * @param el Current element
     * @param parentType Type of the nearest parent element
     * @returns {*} The parent if found or the root element if not
     */
    app.findParent = function (el, parentType) {
        while ((el = el.parentElement) && !(el.nodeName.toLowerCase() === parentType));
        return el;
    };


    /**
     * Changes the UI in loading of finished loading phases
     */
    app.changeLoadingStatus = function () {
        app.loaded = !app.loaded;
        if (app.loaded) {
            app.mainContainer.style.visibility = 'visible';
            app.loadingSpinner.style.visibility = 'hidden';
        } else {
            app.mainContainer.style.visibility = 'hidden';
            app.loadingSpinner.style.visibility = 'visible';
        }
    };

    /**
     * Initializes the datepicker to the specified datepickerInputField.
     * @param action Optional action function that gets called each time the value of the input field changes
     */
    app.initializeDatePicker = function (action) {
        if (app.datepickerInputField) {
            var date = moment();
            app.datepickerInputField.setAttribute('value', date.format(('DD.MM.YYYY')));
            var datepicker = new MaterialTextfield(app.datepickerId);

            var dialog = new mdDateTimePicker.default({
                type: 'date',
                init: date,
                future: moment()
            });

            app.datepickerInputField.addEventListener('click', function() {
                dialog.toggle();
            });

            dialog.trigger = app.datepickerInputField;
            app.datepickerInputField.addEventListener('onOk', function() {
                this.value = dialog.time.format('DD.MM.YYYY');
                action(this.value);
            });
            action(dialog.time.format('DD.MM.YYYY'));
        }
    };

    /**
     * Merges the value arrays of multiple measures passed
     * @param arrayOfMeasures List of multiple measures
     * @returns {*} Object with merged values
     */
    app.mergeValueArrays = function (arrayOfMeasures) {
        if (arrayOfMeasures && arrayOfMeasures.length > 0) {
            var res = arrayOfMeasures[0];
            for (var i = 1; i < arrayOfMeasures.length; i++) {
                res.addValues(arrayOfMeasures[i].getValues());
            }
            return res;
        } else
            return null;
    };

    /**
     * Default Handler for a message from another peer.
     * @param peerID The ID of the peer.
     * @param message The message object sent to the current user.
     */
    app.handlePeerMessage = function (peerID, message) {
        console.log(peerID, message);
        var dataTimeStamp = new Date(message.data.TS);
        var feedbacks = message.data.FB;
        for (var i = 0; i < feedbacks.length; i++) {
            feedbacks[i].timestamp = new Date();
        }
        var minionFunctions = [];
        var i = 0;
        while (feedbacks.length > 0 && i < feedbacks.length) {
            if (feedbacks[i].type === 'CODE') {
                minionFunctions.push(feedbacks[i].value);
                feedbacks.splice(i, 1);
            } else {
                i++;
            }
        }
        for (var i = 0; i < minionFunctions.length; i++) {
            if (!app.minionLoader.getMinionByName(minionFunctions[i]['m_name'])) {
                app.minionLoader.storeNewMinion(minionFunctions[i]['m_name'], minionFunctions[i]['m_function']);
                var container = app.minionLoader.createMinionContainer(minionFunctions[i].m_name);
                app.chartContainer[minionFunctions[i]['m_name']] = container;
                app.minionLoader.addMinionToDropdown(minionFunctions[i]['m_name']);
                app.minionLoader.attachMinionToButton(container, minionFunctions[i]['m_name']);
            } else {
                app.minionLoader.storeNewMinion(minionFunctions[i]['m_name'], minionFunctions[i]['m_function'], true, true);
            }
        }
        if (feedbacks.length > 0){
            app.crossDataStorageClient.sendReadRequest(app.authorizationManager.getToken(), 'TrainingHR', function (req, res) {
                if (res.status === 'success'){
                    for (var i = 0; i < res.dataObjects.length; i++) {
                        res.dataObjects[i] = new CustomDataScheme(res.dataObjects[i]);
                    }
                    var dataObjects = app.filterArrayByDay(dataTimeStamp, res.dataObjects);
                    if (dataObjects) {
                        var oldData = app.mergeValueArrays(dataObjects).getRawJSON();
                        var newData = JSON.parse(JSON.stringify(oldData));
                        if (!newData.feedback) {
                            newData.feedback = {};
                        }
                        if (!newData.feedback[peerID]) {
                            newData.feedback[peerID] = [];
                        }
                        newData.feedback[peerID] = newData.feedback[peerID].concat(feedbacks);
                        app.crossDataStorageClient.sendUpdateRequest(app.authorizationManager.getToken(), oldData, newData, function (req, res) {
                            console.log(res);
                            if (res.status === 'success') {
                                console.log(newData);
                                var feedbackobjects = Object.keys(newData.feedback);
                                for (var i = 0; i < feedbackobjects.length; i++) {
                                    for (var j = 0; j < newData.feedback[feedbackobjects[i]].length; j++) {
                                        if (typeof(newData.feedback[feedbackobjects[i]][j].timestamp) === 'object') {
                                            newData.feedback[feedbackobjects[i]][j].timestamp = newData.feedback[feedbackobjects[i]][j].timestamp.toISOString();
                                        }
                                    }
                                }
                                app.showFeedbackComments(newData.feedback, app.feedbackContainer.id)
                            }
                        });
                    }
                }
            });
        }
    };

    /**
     * @deprecated
     */
    app.insertFeedbacks = function (persons, selectorId, div_id) {
        var listItems = '';
        var initialValue = 'None';

        if (persons.length > 0) {
            // fill into step area
            for (var i = 0; i < persons.length; i++) {
                listItems += '<li class="mdl-menu__item" id="' + persons[i] +'" data-val="' + persons[i] +'">' + persons[i] + '</li>';
            }
            initialValue = persons[0];
        } else {
            listItems = '<li class="mdl-menu__item" id="None" data-val="None">None</li>';
        }
        var selector = '<div id="userSelect" class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select getmdl-select__fix-height getmdl-select__fullwidth">' +
            '    <input type="hidden" name="userSelect" value=""/>' +
            '    <input class="mdl-textfield__input" type="text" id="'+ selectorId + 'Input" value="' + initialValue + '" readonly tabindex="-1"/>' +
            '    <label for="'+ selectorId + 'Input" class="mdl-textfield__label" id="multiUserNameLabel" >Select your doctor\'s feedback</label>' +
            '    <ul for="'+ selectorId + 'Input" id="multiUserNameTable" class="mdl-menu mdl-menu--bottom-left mdl-js-menu">' +
            listItems +
            '    </ul>' +
            '</div>';
        document.querySelector('#' + div_id).innerHTML = selector;
        getmdlSelect.init('#userSelect');
        app.doctorSeletor = document.querySelector('#userSelect input');
        app.doctorSeletor.addEventListener('change', function (e) {
            // TODO change view for each doctor
            // display comments and code of him
            if (app.doctorSeletor.getAttribute('value') && app.doctorSeletor.getAttribute('value') !== 'None'){
                app.displayFeedback(app.rawObject.feedback[app.doctorSeletor.getAttribute('value')]);
            }
        });
    };

    /**
     * @deprecated
     * @param feedbackArray
     */
    app.displayFeedback = function (feedbackArray) {
        document.querySelector('#analysisChart').innerHTML = '';
        if (feedbackArray){
            for (var j = 0; j < feedbackArray.length; j++) {
                if (feedbackArray[j].type === 'CODE') {
                    document.querySelector('#analysisChart').innerHTML += '<div id="analysisChartContainer' + j + '"><h4>Analysis at:' + feedbackArray[j].timestamp + '</h4><div id="analysisChart' + j + '"></div></div> <hr>';
                    eval('(' +  feedbackArray[j].value + '(\'analysisChart' + j + '\', app.rawObject));');
                }
                if (feedbackArray[j].type === 'COMMENT') {
                    document.querySelector('#analysisChart').innerHTML += '<div id="analysisChartContainer' + j + '"><h4>Comment at: ' + feedbackArray[j].timestamp + '</h4><div id="analysisChart' + j + '"></div></div> <hr>';
                    document.querySelector('#analysisChart' + j).innerHTML = '<p>' + feedbackArray[j].value + '</p>';
                }
            }
        } else {
            document.querySelector('#analysisChart').innerHTML = '<div class="centralized"> <h3>There is no feedback available </h3></div>';
        }

    };


    /**
     * Shows COMMENT feedbacks passed in the container with passed ID in speech bubbles.
     * @param feedbacks Object containing feedbacks of different users and types.
     * @param containerID
     */
    app.showFeedbackComments = function (feedbacks, containerID) {
        var containerElement = document.getElementById(containerID);
        containerElement.innerHTML = '';
        if (feedbacks) {
            var list = document.createElement('div');
            list.setAttribute('class', 'mdl-list demo-list');
            var feedbackSubjects = Object.keys(feedbacks);
            for (var i = 0; i < feedbackSubjects.length; i++) {
                var singleSubject = feedbacks[feedbackSubjects[i]];
                var subjectDiv = document.createElement('div'),
                    listElement = document.createElement('div'),
                    singleContainerSpan = document.createElement('span'),
                    avatar = document.createElement('i'),
                    avatarText = document.createTextNode('person'),
                    nameSpan = document.createElement('span'),
                    nameText = document.createTextNode(feedbackSubjects[i]),
                    line = document.createElement('hr'),
                    commentsFolder = document.createElement('div');

                listElement.setAttribute('class', 'mdl-list__item');
                singleContainerSpan.setAttribute('class', 'mdl-list__item-primary-content');
                avatar.setAttribute('class', 'material-icons mdl-list__item-avatar');

                nameSpan.appendChild(nameText);
                avatar.appendChild(avatarText);
                singleContainerSpan.appendChild(avatar);
                singleContainerSpan.appendChild(nameSpan);
                listElement.appendChild(singleContainerSpan);
                subjectDiv.appendChild(listElement);
                for (var j = 0; j < singleSubject.length; j++) {
                    if (singleSubject[j].type === 'COMMENT') {
                        var subtitleSpan = document.createElement('p'),
                            subtitleText = document.createTextNode(singleSubject[j].timestamp.split('T')[0] + ' ' + singleSubject[j].timestamp.split('T')[1].split('.')[0]),
                            textSpan = document.createElement('p'),
                            textText = document.createTextNode(singleSubject[j].value),
                            commentList = document.createElement('div');
                        subtitleSpan.setAttribute('class', 'mdl-list__item-sub-title');
                        subtitleSpan.style.fontWeight = 'bold';
                        subtitleSpan.style.fontSize = '12px';
                        subtitleSpan.style.margin = '2px 0px';
                        subtitleSpan.style.lineHeight = '10px';

                        textSpan.setAttribute('class', 'mdl-list__item-text-body');
                        textSpan.style.fontSize = '11px';
                        textSpan.style.margin = '2px 0px';
                        commentList.setAttribute('class', 'triangle-right left');
                        commentsFolder.setAttribute('class', 'folder');
                        subtitleSpan.appendChild(subtitleText);
                        textSpan.appendChild(textText);
                        commentList.appendChild(subtitleSpan);
                        commentList.appendChild(textSpan);
                        commentsFolder.appendChild(commentList);
                    }
                }
                subjectDiv.appendChild(commentsFolder);
                list.appendChild(subjectDiv);
                list.appendChild(line);
            }
            containerElement.appendChild(list);
        } else {
            var div = document.createElement('div'),
                errorMessage = document.createElement('p'),
                errorText = document.createTextNode('There is no feedback given to this data');
            div.setAttribute('class', 'centralized warning');
            errorMessage.appendChild(errorText);
            div.appendChild(errorMessage);
            containerElement.appendChild(div);
        }
    };

    /**
     * Filters an array for the given day and returns all objects belonging to that day
     * @param day Dateobject specifying the interested day.
     * @param arrayOfObservations List of multiple dataobjects eauch in the CustomDataScheme.
     * @returns [*] Dataobjects belonging to that day.
     */
    app.filterArrayByDay = function (day, arrayOfObservations) {
        function _filterArrayByDay(arr, lowerBound, upperBound) {
            return arr.filter(function (value) {
                return value.getTimeStamp() >= lowerBound && value.getTimeStamp() < upperBound;
            });
        }
        var lowerBound = day;
        var upperBound = new Date(day);
        upperBound.setDate(upperBound.getDate()+1);
        return _filterArrayByDay(arrayOfObservations, lowerBound, upperBound);
    };

    /**
     * Initializes the toggle functionality of the subMinion dropdown.
     */
    app.initializeDropdown = function (key) {
        app.minionDropdown[key].classList.toggle("hide");
    };

    /**
     * Initializes the search functionality of the subMinion dropdown.
     */
    app.searchDropdown = function (key) {
        var input, filter, ul, li, a, i;
        input = app.minionSearch[key];
        filter = input.value.toUpperCase();
        var div = app.minionDropdown[key];
        a = div.getElementsByTagName("a");
        for (i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                a[i].style.display = "";
            } else {
                a[i].style.display = "none";
            }
        }
    };

    /*
    Export the module for various environments.
     */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = app;
    } else if (typeof exports !== 'undefined') {
        exports.app = app;
    } else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return app;
        });
    } else {
        root.app = app;
    }
})(this);