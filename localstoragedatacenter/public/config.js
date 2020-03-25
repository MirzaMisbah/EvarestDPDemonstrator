/**
 * Configuration file for all requirejs dependencies
 * used in order to achieve dynamically loaded javascript files
 */

'use strict';

requirejs.config({
    baseUrl: 'scripts',
    paths: {
        'jquery':                 'lib/jquery-3.1.1',
        'pouchdb':                'lib/pouchdb-6.1.2',
        'ContentUtil' :           'custom/contentutil',
        'datastorage':            'custom/datastorage',
        'crossdatastoragehub' :   'custom/crossdatastoragehub',
        'auth0configurator' :     'custom/auth0connection',
        // 'auth0configurator2' :    'test/auth0connection',
        'dataloader':             'custom/dataloader'
    }
});

requirejs(['main']);
