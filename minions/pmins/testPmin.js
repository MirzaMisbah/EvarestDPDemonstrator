(function (divId, outputChannels) {
    if (checkStarted()){
        outputChannels.forEach(function (chan) {
            if (chan.intervalObject) {
                clearInterval(chan.intervalObject);
            }
            chan.intervalObject = setInterval(function () {
                chan.push({timestamp : Date.now(), value : Math.random()});
            }, 100);
        });
    } else {
        outputChannels.forEach(function (chan) {
            if (chan.intervalObject) {
                clearInterval(chan.intervalObject);
            }
        });
    }



    function checkStarted () {
        var isTrueSet = (document.getElementById(divId)) ? (document.getElementById(divId).getAttribute('data-active').toLowerCase() === 'true') : false;
        return isTrueSet;
    }
});