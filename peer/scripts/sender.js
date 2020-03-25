class Sender {
    constructor(p_commHelper, p_dataChannels) {
        var I = this;
        this.dataChannels = p_dataChannels;
        this.commHelper = p_commHelper;
        this.sendingIntervalFunction;
        this.buffer = {};
        
        this.dataChannels.forEach(function(dc) {
            var entryname = dc.creator + '' + dc.name; 
            I.buffer[entryname] = {
                lap: dc.name,
                creator: dc.creator,
                values: [] 
            };
            // we merge the two arrays TODO: double check this is correct!
            I.buffer[entryname].values.concat(dc.values);
            
            dc.addEventListener('add', function(v) {                
                I.buffer[entryname].values.push(v);
            });
        
        });//foreach

    }
    clearBuffer(){
         Object.keys(this.buffer).forEach(function(key) {
             this.buffer[key].values = []; 
         });
    }
    start(p_targetPeerEmail, p_sendingIntervalMs, p_lap) {
        var I = this;
        this.targetEmail    = p_targetPeerEmail;
        this.lap            = p_lap;
        
        this.sendingIntervalFunction = setInterval(function() {
            I._send(I);
        }, p_sendingIntervalMs);
    }
    
    _send(_this){
        Object.keys(_this.buffer).forEach(function(key) {
            if (_this.buffer[key].values.length > 0) {
                console.assert(_this.buffer[key].lap === _this.lap, "channel lap is different than given lap", _this.buffer[key].lap, _this.lap, _this.buffer);
                 var sent = _this.commHelper.sendSensor([_this.targetEmail], _this.buffer[key].creator, _this.buffer[key].lap, _this.buffer[key].values);                 
                 if(sent){    
                    // TODO: empty the buffer only if the values reached the otherside!                    
                    _this.buffer[key].values = [];
                }
            }
        });
   
    }
    

    stop() {        
        clearInterval(this.sendingIntervalFunction);
        this._send(this);
    }



}
