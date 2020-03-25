var _self = self;
var ressourceUris = ['../libs/datalib/data-buffer.js', '../libs/datalib/data-channel.js', ];

var transformUris = function (origin, uris) {
    var res = [];
    uris.forEach(function (uri) {
        res.push(origin + '/' + uri);
    });
    return res;
};

var fetchScripts = function(uris, callback){
    fetch(uris.pop())
        .then(function (res) {
            res.text()
                .then(function (script) {
                    eval(script);
                    if (uris.length > 0)
                        fetchScripts(uris, callback);
                    else
                        callback();
                });
        });
};

ressourceUris = transformUris(_self.origin, ressourceUris);
fetchScripts(ressourceUris, function () {
    _self.dataBuffer = new DataBuffer(50, 20);
    _self.dataBuffer.addEventListener('add', function (values) {
        var avg = {
            x : 0,
            y : 0,
            z : 0
        };
        values.forEach(function (value) {
            avg.x += value.value.value.x;
            avg.y += value.value.value.y;
            avg.z += value.value.value.z;
        });
        avg.x /= values.length;
        avg.y /= values.length;
        avg.z /= values.length;
        _self.postMessage({value: avg, timestamp : Date.now()});
    });
    _self.addEventListener('message', function(e) {
        _self.dataBuffer.push(e.data);
    }, false);
});