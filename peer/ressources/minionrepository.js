(function () {
    const MINION_TYPE = {
        AMIN : "amin",
        CMIN : "cmin",
        GMIN : "gmin",
        PMIN : "pmin",
        TMIN : "tmin",
        MACRO : "macro"
    };

    const RESSOURCE_TYPES = {
        STREAM : 'streaming',
        STATIC : 'static',
        DYNAMIC : 'dynamic'
    };


    var getMinions = function () {
        var minions = [{
            name : 'Test Worker',
            uri : '../minions/tmins/testworkerminion.js',
            type : MINION_TYPE.TMIN,
            ressourceType : RESSOURCE_TYPES.STREAM,
            inputs : 2

        }, {
            name : 'Hit detection',
            uri : "../minions/tmins/hitdetectionminion/hitdetectionminion.js",
            type : MINION_TYPE.TMIN,
            ressourceType : RESSOURCE_TYPES.STREAM,
            inputs : 2,
            partner_uri : '../minions/tmins/hitdetectionminion/hitdetectionuserinterface.js'
        },{
            name : 'Damage estimator',
            uri : "../minions/tmins/damageminion/damageminion.js",
            type : MINION_TYPE.TMIN,
            ressourceType : RESSOURCE_TYPES.STREAM,
            inputs : 1,
            partner_uri : '../minions/tmins/damageminion/damageminionuserinterface.js'

        },{
            name : 'Potato price estimator',
            uri : "../minions/tmins/potato_price_estimation/minion.js",
            type : MINION_TYPE.TMIN,
            ressourceType : RESSOURCE_TYPES.STATIC,
            inputs : 1,
        },{
            name : 'Live Motion',
            uri : "../minions/cmins/cmin_liveline.js",
            type : MINION_TYPE.CMIN,
            ressourceType : RESSOURCE_TYPES.STREAM,
            inputs : 1
        },{
            name : 'Key Values',
            uri : "../minions/cmins/cmin_distribution.js",
            type : MINION_TYPE.CMIN,
            ressourceType : RESSOURCE_TYPES.STATIC,
            inputs : 1
        }, {
            name : 'Multiline Series',
            uri : "../minions/cmins/cmin_multiline.js",
            type : MINION_TYPE.CMIN,
            ressourceType : RESSOURCE_TYPES.STATIC,
            inputs : 1
        },{
            name : 'Line Series',
            uri : "../minions/cmins/cmin_line.js",
            type : MINION_TYPE.CMIN,
            ressourceType : RESSOURCE_TYPES.STATIC,
            inputs : 1
        },{
            name : 'Linear Regression',
            uri : "../minions/cmins/cmin_linearregression.js",
            type : MINION_TYPE.CMIN,
            ressourceType : RESSOURCE_TYPES.STATIC,
            inputs : 1
        },{
            name : 'Hit Classify',
            uri : "../minions/cmins/cmin_hitclassify.js",
            type : MINION_TYPE.CMIN,
            ressourceType : RESSOURCE_TYPES.STREAM,
            inputs : 1
        }, {
            name : 'MQTT Gateway',
            uri : '../minions/gmins/mqtt/gmin_mqttclient.js',
            type : MINION_TYPE.GMIN,
            ressourceType : RESSOURCE_TYPES.STREAM,
            inputs: 1
        }, {
            name : 'REST Gateway',
            uri : '../minions/gmins/rest/gmin_httpsinterface.js',
            type : MINION_TYPE.GMIN,
            ressourceType : RESSOURCE_TYPES.STREAM,
            inputs: 1
        }, {
            name : 'Crop Fin Data',
            uri : '../minions/pmins/pmin_cropfindata.js',
            type : MINION_TYPE.PMIN,
            ressourceType : RESSOURCE_TYPES.STREAM,
            inputs: 0,
            outputs : ['Crop Fin Data']
        },{
            name : 'nPotato Remote',
            uri : "../minions/macros/npotato_remote_macro_v2.js",
            type : MINION_TYPE.MACRO,
            ressourceType : RESSOURCE_TYPES.STREAM,
        },{
            name : 'nPotato Device',
            uri : "../minions/macros/npotato_device_macro.js",
            type : MINION_TYPE.MACRO,
            ressourceType : RESSOURCE_TYPES.STREAM,
        },{
            name : 'Fin Visualization',
            uri : "../minions/cmins/cmin_finhistoryvisualization.js",
            type : MINION_TYPE.CMIN,
            ressourceType : RESSOURCE_TYPES.STATIC,
            inputs : 1
        },{
            name : 'Financial Forecast',
            uri : "../minions/cmins/cmin_finforecastvisualization.js",
            type : MINION_TYPE.CMIN,
            ressourceType : RESSOURCE_TYPES.STATIC,
            inputs : 1
        },{
            name : 'Driver View',
            uri : "../minions/cmins/cmin_driverview.js",
            type : MINION_TYPE.CMIN,
            ressourceType : RESSOURCE_TYPES.STREAM,
            inputs : 1
        },{
            name : 'Farmer View',
            uri : "../minions/cmins/cmin_farmerview.js",
            type : MINION_TYPE.CMIN,
            ressourceType : RESSOURCE_TYPES.STREAM,
            inputs : 2
        }];

        return minions;
    };
    window.getMinions = getMinions;

})();
