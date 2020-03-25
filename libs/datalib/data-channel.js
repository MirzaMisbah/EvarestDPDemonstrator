(function (root) {

    class DataChannel{

        constructor(p_name, p_values, p_creator, p_lastUpdated, related_subject, ressourceType='static'){
            this.core = {
                name: p_name,
                creator: p_creator,
                relatedSubject : related_subject,
                ressourceType : ressourceType,
                lastUpdated: !!p_lastUpdated? p_lastUpdated : new Date().getTime(),
                values: !!p_values? p_values: [] // if defined reference it else create a new one!
            };
            // TODO: change this to dictionary we should have listener IDs that are used by the remove listener!
            this.addListeners = [];
        }


        addEventListener(type, listener, creator='default'){
            switch(type){
                case 'add':
                    this.addListeners.push({creator : creator, listener: listener});
                    break;
                default:
                    break;
            }
        }

        removeEventListener(creator) {
            for (var i = 0; i < this.addListeners.length; i++) {
                if (this.addListeners[i].creator === creator) {
                    this.addListeners.splice(i, 1);
                    i--;
                }
            }
        }

        get values(){
            return  this.core.values;
        }

        get name(){
            return  this.core.name;
        }

        get relatedSubject() {
            return this.core.relatedSubject;
        }

        set name(p_name){
            this.core.name = p_name;
        }

        get creator(){
            return  this.core.creator;
        }

        set creator(p_creator){
            this.core.creator = p_creator;
        }

        get length(){
            return !! this.core.values?  this.core.values.length: 0;
        }

        get lastUpdated(){
            return this.core.lastUpdated;
        }

        get ressourceType () {
            return this.core.ressourceType;
        }

        push(valObj){
            this.core.values.push(valObj);
            this.core.lastUpdated = new Date().getTime();
            var _this = this;
            this.addListeners.forEach(function(toBeNotified){
                toBeNotified.listener(valObj);
            });
        }

        concat(valArr){
            this.core.values = this.core.values.concat(valArr);
            this.core.lastUpdated = new Date().getTime();
            this.addListeners.forEach(function(toBeNotified){
                valArr.forEach(function(value){
                    toBeNotified.listener(value);
                });

            });
        }

    }

    /*
    Export the module for various environments.
     */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = DataChannel;
    } else if (typeof exports !== 'undefined') {
        exports.DataChannel = DataChannel;
    } else if (typeof define === 'function' && define.amd) {
        define([], function() {
            return DataChannel;
        });
    } else {
        root.DataChannel = DataChannel;
    }
})(this);