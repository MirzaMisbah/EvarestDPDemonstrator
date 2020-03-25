/**
 * Configuration file for all requirejs dependencies
 * used in order to achieve dynamically loaded javascript files
 */

'use strict';

requirejs.config({
    baseUrl: 'scripts',
    paths: {
        'jquery':                   'lib/jquery-3.1.1',
        'pouchdb':                  'lib/pouchdb-6.1.2',
        'ContentUtil' :             'custom/contentutil',
        'datastorage':              'custom/datastorage',
        'crossdatastoragehub' :     'custom/crossdatastoragehub',
        'auth0configurator' :       'custom/auth0connection',
        'dataloader' :              'custom/dataloader'
    }
});

requirejs(['crossdatastoragehub', 'dataloader', 'datastorage', 'pouchdb'],function(CrossDataStorageHub, DataLoader, DataStorage, PouchDB){


    var DEBUGURL = 'https://service-tucana.de:81';
    var MAINURL = 'http://iot01.iss.uni-saarland.de:81';
    var DEBUG = true;
    var URL = DEBUG ? DEBUGURL : MAINURL;
    const crossDataStorageHub = new CrossDataStorageHub(URL);
    var makeResponse = function (event, request, response) {
        const res = {
            request: request,
            response: response
        };
        event.source.postMessage(JSON.stringify(res), '*');
    };
    crossDataStorageHub.connect();

    const dataLoader = new DataLoader(URL);
    // dataLoader.loadStepData();

    // send ready status to the parent window
    window.parent.postMessage(JSON.stringify({message : 'loaded'}), '*');
});
