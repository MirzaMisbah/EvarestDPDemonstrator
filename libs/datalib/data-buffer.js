(function (root) {

    class DataBuffer{
        constructor (bufferCapacity, maxNumberOfBuffers, dataChannels=[{channelName : 'internal', channel: new DataChannel('Internal Channel', [], 'DataBuffer')}]) {
            var _this = this;
            this.data = [[]];
            this.listeners = [];
            this.bufferCapacity = bufferCapacity;
            if (maxNumberOfBuffers){
                this.maxNumberOfBuffers = maxNumberOfBuffers;
            }
            this.dataChannels = dataChannels;
            this.dataChannels.forEach(function (channel) {
                channel.channel.addEventListener('add', function (value) {
                    _this.push({'sourceChannel' : channel.channelName, 'value' : value});
                })
            });

        }

        addEventListener (event, fun) {
            switch (event) {
                case 'add':
                    this.listeners.push(fun);
                    break;
                case 'remove':
                    for (var i = 0; i < this.listeners.length; i++) {
                        if (this.listeners[i].toLocaleString() == fun.toLocaleString()) {
                            this.listeners.splice(i, 1);
                            break;
                        }
                    }
                    break;
                default:
                    break;
            }
        }

        addDataChannel (event, channel) {
            var _this = this;
            switch (event) {
                case 'add':
                    this.dataChannels.push(channel);
                    channel.addEventListener('add', function (value) {
                        _this.push(value);
                    });
                    break;
                default:
                    break;
                // TODO remove data channel from channel list
            }
        }

        push (dataPoint) {
            this.data[this.data.length-1].push(dataPoint);
            if(this.checkBuffering()){
                for (var i = 0; i < this.listeners.length; i++) {
                    this.listeners[i](this.data[this.data.length-1]);
                }
                this.data.push([]);
            }
            if (this.checkMaxNumberOfBuffers()) {
                this.data.shift();
            }
        }

        checkBuffering () {
            if (this.data[this.data.length - 1].length >= this.bufferCapacity) {
                return true
            }
            return false;
        }

        checkMaxNumberOfBuffers(){
            if (this.maxNumberOfBuffers){
                if (this.data.length > this.maxNumberOfBuffers){
                    return true;
                }
            }
            return false;
        }

        getData () {
            return this.data;
        }

    }

    /*
    Export the module for various environments.
     */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = DataBuffer;
    } else if (typeof exports !== 'undefined') {
        exports.DataBuffer = DataBuffer;
    } else if (typeof define === 'function' && define.amd) {
        define([DataChannel], function() {
            return DataBuffer;
        });
    } else {
        root.DataBuffer = DataBuffer;
    }
})(this);
