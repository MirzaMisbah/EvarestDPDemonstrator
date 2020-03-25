/**
 * Startup script for example application which should slowly evolve to an app framework for analysing minions
 */

'use strict';

window.addEventListener('load', function (event) {

    // Create app object with all global variables
    var app = {
        // URL's of generic service for heartrate and step data used for synchronization
        syncApiAdress : 'http://iot01.iss.uni-saarland.de:81',
        syncHeartrateExtension : '/genericHeartRateService',
        syncStepExtension : '/genericStepDataService',

        // Location of the local storage center
        localStorageCenter : 'http://localhost:3000',

        // OAuth 2.0 variables
        oauthClientId : 'kMlSIl3Itqt6mQetzGXES6biAVFei6k8',
        oauthDomainName : 'app-iss.eu.auth0.com',

        // Frontend objects
        loadingSpinner : document.getElementById('spinner'),
        mainContainer : document.querySelector('main'),
        notificationSnackbar : document.querySelector('#notificationbar'),
        visitAppStoreButton : document.querySelector('#visit'),
        shareRequestInput : document.querySelector('#shareEmail')
    };

    // Initialization of all important objects of included scripts
    var stepSynchService = new DataSynchService(app.syncApiAdress + app.syncStepExtension);
    var heartrateSynchService = new DataSynchService(app.syncApiAdress + app.syncHeartrateExtension);
    var crossDataStorageClient = new CrossDataStorageClient(app.localStorageCenter);
    var authorizationManager = new Auth0Configurator(app.oauthClientId, app.oauthDomainName);
    var visalizationService = new VisualizationService('testChartContainer', Highcharts);

    app.showSynchResult = function(json) {
        document.querySelector('#data-view').style.visibility = 'visible';
        document.querySelector(
            '#data-view .full-data'
        ).innerHTML = JSON.stringify(json, null, 4);
    };

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

    app.startSync = function (synchService, callback) {
        app.mainContainer.style.visibility = 'hidden';
        app.loadingSpinner.style.visibility = 'visible';
        document.querySelector('#data-view').style.visibility = 'hidden';

        // Config for the synchronization process
        var headers = {
            Authorization: 'Bearer ' + localStorage.id_token,
            'Content-type': 'application/json'
        };
        var body = {
            userId: JSON.parse(localStorage.profile).email,
            bson: true
        };
        synchService.synchronizeData('POST', headers, body)
            .then(function (data) {
                console.log(data);
                // Store the step data after synch
                if (data)
                    synchService.storeSynchedData(crossDataStorageClient, {'userToken': headers.Authorization.split(' ')[1], callbackMethod: function (req, res) {
                            console.log('Request', req);
                            console.log('Response', res);
                            app.mainContainer.style.visibility = 'visible';
                            app.loadingSpinner.style.visibility = 'hidden';
                            app.showSynchResult(data);
                            app.showNotification(res.message, 5000);
                            if (callback)
                                callback();
                        }
                    }, false);
                else {
                    app.mainContainer.style.visibility = 'visible';
                    app.loadingSpinner.style.visibility = 'hidden';
                    app.showSynchResult(data);
                    if (callback)
                        callback();
                }
            });
    };

    app.initializeRoleManagementView = function () {
        authorizationManager.updateProfile(function () {
            var sharedRessources = authorizationManager.getRolePermissions();
            app._createSharingPermissionTable('requested-pending', sharedRessources.requested.pending, true);
            app._createSharingPermissionTable('requested', sharedRessources.requested.accepted.concat(sharedRessources.requested.declined), true);
            app._createSharingPermissionTable('requesting', sharedRessources.requesting.accepted.concat(sharedRessources.requesting.declined).concat(sharedRessources.requesting.pending), false);
        });
    };

    app._createSharingPermissionTable = function (tableId, sharingOptions, withButtons) {
        var container = document.querySelector('#' + tableId + '-container');
        var tbody = document.querySelector('#' + tableId + ' tbody');
        tbody.innerHTML = '';
        if (sharingOptions && sharingOptions.length > 0){
            container.style.display = 'block';
            for (var i = 0; i < sharingOptions.length; i++) {
                var email = sharingOptions[i].email;

                var status = sharingOptions[i].status;
                var id = email.split('.').join('').split('@').join('');


                var htmlCode = '<tr id="' + id + '">' +
                    '  <td class="mdl-data-table__cell--non-numeric">' + email + '</td>' +
                    '  <td class="mdl-data-table__cell--non-numeric">' + status + '</td>';
                if (withButtons) {
                    var buttonCodeAccept = '<button id="' + id + 'Accept" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"  data-ref="' + email + '">' +
                        'Accept' +
                        '</button>';
                    var buttonCodeDecline = '<button id="' + id + 'Decline" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"  data-ref="' + email + '">' +
                        'Decline' +
                        '</button>';

                    htmlCode += '  <td class="mdl-data-table__cell--non-numeric">' + buttonCodeAccept + '</td>' +
                    '  <td class="mdl-data-table__cell--non-numeric">' + buttonCodeDecline + '</td>';
                }
                htmlCode += '</tr>';
                tbody.innerHTML += htmlCode;
            }
            if (withButtons){
                for (var i = 0; i < tbody.childNodes.length; i++) {
                    var identity = tbody.childNodes[i].id;
                    if (identity){
                        document.querySelector('#' + identity + 'Accept').addEventListener('click', (function (e) {
                            e.preventDefault();
                            app._share(e.target.getAttribute('data-ref'), 'accepted');
                        }));
                        document.querySelector('#' + identity + 'Decline').addEventListener('click', (function (e) {
                            app._share(e.target.getAttribute('data-ref'), 'declined');
                        }));
                    }
                }
            }
        } else {
            container.style.display = 'none';
        }
    };

    app._initializeShareRequest = function () {
        var input = app.shareRequestInput.value;
        if (input === ''){
            app.showNotification('Please enter an email adress!');
            return;
        }
        else if (app._validateEmail(input)){
            var authorization = 'Bearer ' + localStorage.getItem('id_token');
            var payload = {
                requestId : input
            };
            var body = { method: 'POST',
                headers: {
                    Authorization : authorization,
                    'Content-type' : 'application/json'
                },
                mode: 'cors',
                cache: 'default',
                body : JSON.stringify(payload)
            };
            fetch(app.syncApiAdress + '/requestAccess', body).then(function (response) {
                if(response.ok)
                    return response.json();
            }).then(function (json) {
                app.showNotification(json.message);
                app.initializeRoleManagementView();
            });
        } else {
            app.showNotification('Please type in email adress correctly!');
            return;
        }
    };

    app._validateEmail = function (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    app._share = function (email, answer) {
        var authorization = 'Bearer ' + authorizationManager.getToken();
        var payload = {
            requestId: email,
            answer: answer
        };
        var body = {
            method: 'POST',
            headers: {
                Authorization: authorization,
                'Content-type': 'application/json'
            },
            mode: 'cors',
            cache: 'default',
            body: JSON.stringify(payload)
        };
        fetch(app.syncApiAdress + '/answerRequest', body).then(function (response) {
            if (response.ok)
                return response.json();
        }).then(function (json) {
            app.showNotification(json.message);
            app.initializeRoleManagementView();
        });
    };

    // initialization function of the app shell
    app.init = function () {
        // Attach step synchronization function to button
        document.querySelector('#synchStepData').addEventListener('click', function (event) {
            app.startSync(stepSynchService);
        });

        document.querySelector('#synchHeartrateData').addEventListener('click', function (event) {
            app.startSync(heartrateSynchService);
        });

        document.querySelector('#requestEmail').addEventListener('click', function (event) {
            app._initializeShareRequest();
        });

        document.querySelector('#tab-profile-information').addEventListener('click', function (event) {
            app.initializeRoleManagementView();
        });

        // Start the authorization service
        authorizationManager.connect('btn-logout', 'username', function () {
            // Initialize important frontend connections
            app.mainContainer.style.visibility = 'visible';
            app.loadingSpinner.style.visibility = 'hidden';
            app.visitAppStoreButton.href = app.localStorageCenter;
            app.initializeRoleManagementView();

            // This is only for testing of the visualization lib
            crossDataStorageClient.sendReadRequest(localStorage.id_token, 'TrainingHR', function (req, res) {
                function arrayMin(arr) {
                    return arr.reduce(function (p, v) {
                        return ( p.getTimeStamp() < v.getTimeStamp() ? p : v );
                    });
                }
                for (var i = 0; i < res.dataObjects.length; i++) {
                    res.dataObjects[i] = new CustomDataScheme(res.dataObjects[i]);
                }
                var series = [];
                for (var j = 0; j < Math.min(10, res.dataObjects.length); j++) {
                    var dataObject = res.dataObjects[j];
                    var valueObjects = dataObject.getValues();
                    var data = [];
                    var min = arrayMin(valueObjects);
                    for (var i = 0; i < valueObjects.length; i++) {
                        data.push([valueObjects[i].getTimeStamp() - min.getTimeStamp(), valueObjects[i].getValue()]);
                    }
                    data.sort(function (a,b) { return a[0] - b[0]; });
                    if (data.length > 0) {
                        series.push({
                            name : 'Heartrate Chart ' + (j+1),
                            data : data
                        });
                    }
                }
                visalizationService.createTimelineVisualization('Heartrate Data', 'Heartrate (bpm)', ' bpm', series);
            })
        });
    };

    // Run the application with current settings
    app.init();
});