window.addEventListener('load', function (event) {

    // Add frontend objects to app object
    app.loadingSpinner = document.getElementById('spinner');
    app.mainContainer = document.querySelector('main');
    app.notificationSnackbar = document.querySelector('#notificationbar');
    app.visitAppStoreButton = document.querySelector('#visit');

    // Initialization of all important objects of included scripts
    var stepSynchService = new DataSynchService(app.syncApiAdress + app.syncStepExtension);
    var heartrateSynchService = new DataSynchService(app.syncApiAdress + app.syncHeartrateExtension);
    var crossDataStorageClient = new CrossDataStorageClient(app.localStorageCenter);
    var authorizationManager = new Auth0Configurator(app.oauthClientId, app.oauthDomainName);

    app.showSynchResult = function(json) {
        document.querySelector('#data-view').style.visibility = 'visible';
        document.querySelector(
            '#data-view .full-data'
        ).innerHTML = JSON.stringify(json, null, 4);
    };

    app.startSync = function (synchService, callback) {
        app.changeLoadingStatus();
        document.querySelector('#data-view').style.visibility = 'hidden';

        // Config for the synchronization process
        var headers = {
            Authorization: 'Bearer ' + authorizationManager.getToken(),
            'Content-type': 'application/json'
        };
        var body = {
            userId: authorizationManager.getProfile().email,
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
                            app.changeLoadingStatus();
                            app.showSynchResult(data);
                            app.showNotification(res.message, 5000);
                            if (callback)
                                callback();
                        }
                    }, false);
                else {
                    app.changeLoadingStatus();
                    app.showSynchResult(data);
                    if (callback)
                        callback();
                }
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

        // Start the authorization service
        authorizationManager.connect('btn-logout', 'username', function () {
            // Initialize important frontend properties
            app.changeLoadingStatus();
            app.visitAppStoreButton.href = app.localStorageCenter;
        });
    };

    // Run the application with current settings
    app.init();
});