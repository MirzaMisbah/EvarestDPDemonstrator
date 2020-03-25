window.addEventListener('load', function (event) {

    // Add frontend objects to app object
    app.loadingSpinner = document.getElementById('spinner');
    app.mainContainer = document.querySelector('main');
    app.notificationSnackbar = document.querySelector('#notificationbar');
    app.visitAppStoreButton = document.querySelector('#visit');
    app.minionSearch = document.querySelector('#minionSearch');
    app.minionDropdown = document.querySelector('#minionDropdown');
    app.minionToggle = document.querySelector('#toggleMinions');
    app.dataLoad = document.querySelector('#testChartContainer');
    app.chartContainer = {
        "Line Visualization" : "testChartContainer",
        "Textual Visualization" : 'testDatatable',
        "Boxplot Analysis" : 'boxplot',
        "Linear Regression Analysis" : 'linearRegression'
    };

    // Initialization of all important objects of included scripts
    app.crossDataStorageClient = new CrossDataStorageClient(app.localStorageCenter);
    app.authorizationManager = new Auth0Configurator(app.oauthClientId, app.oauthDomainName);
    app.visalizationService = new VisualizationService('testChartContainer', Highcharts);
    app.minionLoader = new MinionLoader();


    // initialization function of the app shell
    app.init = function () {

        // Start the authorization service
        app.authorizationManager.connect('btn-logout', 'username', function () {
            // Initialize important frontend properties
            app.changeLoadingStatus();
            app.visitAppStoreButton.href = app.localStorageCenter;
            app.minionSearch.addEventListener('keyup', function (event) {
                app.searchDropdown();
            });
            app.minionToggle.addEventListener('click', function (event) {
                app.initializeDropdown();
            });
            var minionNames = app.minionLoader.getMinionNames();
            app.minionLoader.addMinionsToDropdown('minionDropdown');
            for (var i = 0; i < minionNames.length; i++) {
                app.minionLoader.attachMinionToButton('testInput', app.chartContainer[minionNames[i]], minionNames[i]);
            }

            // TODO Insert visualiuation and analysis functions
        });
    };

    // Run the application with current settings
    app.init();
});