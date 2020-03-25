(function (root) {

    'use strict';

    /**
     * This class is used for the handling of a specific subMinion i.e. with a specific subMinion type
     */

    class Minion {

        constructor(name, type, config, containerId) {
            this.name = name;
            this.type = type;
            if (containerId){
                this.uiIntegration = true;
                this.minionId = containerId;
                this.parentContainer = document.getElementById(containerId);
            } else {
                this.uiIntegration = false;
                this.minionId = name.split(' ').join() + Math.round(Math.random()*1000);
            }
            this.instanceCount = 0;
            this.config = config;
            this.subMinion = (function (name, type, config) {
                switch (type) {
                    case Minion.MINION_TYPES.CMIN:
                        return new Cmin(name, config);
                    case Minion.MINION_TYPES.TMIN:
                        return new Tmin(name, config);
                    case Minion.MINION_TYPES.GMIN:
                        return new Gmin(name, config);
                    case Minion.MINION_TYPES.PMIN:
                        return new Pmin(name, config);
                    default:
                        console.warn('Not yet implemented:', config);
                        break;
                }
            })(this.name, this.type, this.config);
            this.instances = [];
            this.hide();
        }

        get inputs () {
            return this.config.inputs;
        }

        get owner () {
            return this.config.owner;
        }

        get subFunctions () {
            return this.subMinion;
        }

        generateInstanceId () {
            const id = this.minionId + 'Instance' + this.instanceCount;
            this.instanceCount++;
            return id;
        }

        createNewInstance (instanceOwner) {
            this.filterKilledInstances();
            var id =  this.generateInstanceId();
            if (this.uiIntegration) {
                const newContainer = document.createElement('section');
                newContainer.setAttribute('id', id);
                this.parentContainer.appendChild(newContainer);
                var newInstance = new MinionUIInstance(id, this.instanceCount-1, this, [],[], instanceOwner);
                this.instances.push(newInstance);
            }
            return this.instanceCount-1;
        }

        killAllInstances () {
            this.instances.forEach(function (instance) {
                instance.killInstance();
            });
            this.filterKilledInstances();
        }

        hide () {
            this.parentContainer.classList.add('hidden-container');
        }

        show () {
            this.parentContainer.classList.remove('hidden-container');
        }

        filterKilledInstances () {
            const activeInstances = [];
            this.instances.forEach(function (instance) {
                if (!instance.killed && instance.active) {
                    activeInstances.push(instance);
                }
            });
            this.instances = activeInstances;
        }

        updateDataChannels () {
            this.filterKilledInstances();
            this.instances.forEach(function (minionInstance) {
                minionInstance.updateDataChannels();
            })
        }

        updateDataChannelsOfSingleInstance (instanceId, inputDataChannels, outputDataChannels) {
            var _this = this;
            var instance = this.instances.find(function (singleInstance) {
                return singleInstance.instanceId === instanceId;
            });
            if (instance) {
                if (inputDataChannels) {
                    if (_this.uiIntegration)
                        instance.setInputDataChannelsUI(inputDataChannels);
                    else
                        instance.setOutputDataChannels(inputDataChannels);
                }
                if (outputDataChannels) {
                    instance.setOutputDataChannels(outputDataChannels);
                }
            }
        }
    }
    Minion.MINION_TYPES = {
        CMIN : 'cmin',
        TMIN: 'tmin',
        GMIN : 'gmin',
        PMIN : 'pmin',
        AMIN : 'amin'
    };


    /**
     * This class is an representation of a single subMinion instance
     */
    class MinionUIInstance {

        constructor (containerId, instanceId, minion, inputChannels=[], outputChannels=[], instanceOwner) {
            this.containerId = containerId;
            this.instanceId = instanceId;
            this.parentContainer = document.getElementById(containerId);
            this.executionContainer = document.createElement('div');
            this.executionContainer.setAttribute('id', containerId + 'ExecutiveContainer');
            this.minion = minion;
            this.subMinion = minion.subFunctions;
            this.instanceOwner = instanceOwner;

            this.active = false;
            this.killed = false;
            this.showClass = 'show';
            this.inputHandler = new DataChannel('MinionInstanceInputHandler', [], 'MinionInstance', null, null);
            this.outputHandler = new DataChannel('MinionInstanceOutputHandler', [], 'MinionInstance', null, null);

            this.exchangeObject = {
                inputDataChannels : inputChannels,
                outputDataChannels : outputChannels,
                instance : this
            };

            var _this = this;
            this.inputHandler.addEventListener('add', function (inputDataChannels) {
                if (_this.subMinion.type === Minion.MINION_TYPES.PMIN) {
                    return;
                }
                if (_this.checkInstanceStarted()){
                    _this.deactivateMinionInstance();
                    _this.exchangeObject = _this.subMinion.kill(_this.executionContainer.id, _this.exchangeObject);
                    _this.exchangeObject.inputDataChannels = inputDataChannels;
                    _this.activateMinionInstance();
                    _this.exchangeObject = _this.subMinion.do(_this.executionContainer.id, _this.exchangeObject);
                } else {
                    _this.exchangeObject.inputDataChannels = inputDataChannels;

                }
            });

            this.outputHandler.addEventListener('add', function (outputDataChannels) {
                if (_this.checkInstanceStarted()) {
                    _this.deactivateMinionInstance();
                    _this.exchangeObject = _this.subMinion.kill(_this.executionContainer.id, _this.exchangeObject);
                    _this.exchangeObject.outputDataChannels = outputDataChannels;
                    _this.activateMinionInstance();
                    _this.exchangeObject = _this.subMinion.do(_this.executionContainer.id, _this.exchangeObject);
                } else {
                    _this.exchangeObject.outputDataChannels = outputDataChannels;
                }
            });

            this.createMinionContainer();

            this.initInstance();
            this.activateMinionInstance();
            this.startInstance();
        }

        setInputDataChannels (inputDataChannels) {
            this.inputHandler.push(inputDataChannels);
        }

        setOutputDataChannels (outputDataChannels) {
            this.outputHandler.push(outputDataChannels);
        }

        setInputDataChannelsUI (channels, user) {
            const ddlid = this.executionContainer.id + "dc";
            ddlPopulateContacts(ddlid, this.numberOfInputs);
            if (!user) {
                if (channels && channels.length > 0) {
                    user = channels[0].relatedSubject;
                }
            }
            if (user) {
                ddl_setSelected(ddlid + 'User', user);
                ddlPopulateChannels(ddlid, this.numberOfInputs);
                if (channels) {
                    for (var i = 0; i < channels.length; i ++) {
                        ddl_setSelected(ddlid + 'Channel' + (i), channels[i].creator + '*' + channels[i].name);
                    }
                }
            }
            const userName = ddl_getSelected(ddlid + 'User');
            const newChannels = [];
            for (let i = 0; i < this.numberOfInputs; i++) {
                let dataChannelName = ddl_getSelected(ddlid + 'Channel' + i);
                newChannels.push(findDataChannel(dataChannelName, Contact.findContact(contacts, userName)));
            }
            this.setInputDataChannels(newChannels);
        }

        createMinionContainer () {
            this.activateMinionInstance();
            if (document.getElementById(this.executionContainer.id)) {
                return;
            }
            const div1 = document.createElement('div'),
                div2 = document.createElement('div'),
                divHeader = document.createElement('div'),
                divFooter = document.createElement('div'),
                h2Head   = document.createElement('h2'),
                textNode = document.createTextNode(this.minion.name),
                btnText =  document.createTextNode('Send Minion'),
                sendButton =  document.createElement('a'),
                killButton = document.createElement('button'),
                _this = this;
            this.parentContainer.setAttribute('class', 'section--center mdl-grid mdl-grid--no-spacing mdl-shadow--2dp');
            div1.setAttribute('class', 'demo-card-square mdl-card mdl-cell mdl-cell--12-col mdl-cell--4-col-phone');
            divHeader.setAttribute('class', 'mdl-card__title mdl-card--expand mdl-color--primary-dark');

            sendButton.setAttribute('class', "mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect");
            divFooter.setAttribute('class',"mdl-card__actions mdl-card--border");
            h2Head.setAttribute('class', "mdl-card__title-text");
            h2Head.appendChild(textNode);
            div2.setAttribute('class', 'mdl-card__supporting-text phone-card');
            this.executionContainer.style.width = '100%';
            this.executionContainer.setAttribute('data-active', this.active);
            div2.appendChild(this.executionContainer);
            divHeader.appendChild(h2Head);
            div1.appendChild(divHeader);
            div1.appendChild(div2);
            sendButton.appendChild(btnText);
            killButton.appendChild(document.createTextNode('Kill minion instance'));
            killButton.addEventListener('click', function (event) {
                _this.killInstance();
            });
            divFooter.appendChild(sendButton);
            divFooter.appendChild(killButton);
            div1.appendChild(divFooter);

            this.parentContainer.appendChild(div1);


            // TODO: refactor and reimplement
            const ddlid = this.executionContainer.id + "dc";

            const ddlDataChannel = ddlCreate2(ddlid, function (userName, dataChannelNames) {
                const newChannels = [];
                dataChannelNames.forEach(function (dataChannelName) {
                    newChannels.push(findDataChannel(dataChannelName, Contact.findContact(contacts, userName)));
                });
                _this.setInputDataChannels(newChannels);
            }, this.numberOfInputs);
            divFooter.appendChild(ddlDataChannel);
            ddlPopulateContacts(ddlid, this.numberOfInputs);
            const userName = ddl_getSelected(ddlid + 'User');
            const newChannels = [];
            for (let i = 0; i < this.numberOfInputs; i++) {
                let dataChannelName = ddl_getSelected(ddlid + 'Channel' + i);
                newChannels.push(findDataChannel(dataChannelName, Contact.findContact(contacts, userName)));
            }
            this.setInputDataChannels(newChannels);

            sendButton.addEventListener('click', function(){
                send_minion(_this.minion.config);
            });


        }

        initInstance () {
            switch (this.subMinion.type) {
                case Minion.MINION_TYPES.CMIN:
                    break;
                case Minion.MINION_TYPES.TMIN:
                    // TODO initialize output data channel + worker for each instance
                    if (this.instanceOwner) {
                        var contact = Contact.findContact(contacts, this.instanceOwner);
                    } else {
                        var contact = Contact.getSelectedContact(contacts);
                    }
                    if (!(this.exchangeObject.outputDataChannels.length > 0)) {
                        var currentChannel = new DataChannel(getLapValue(), [], this.minion.name + '_' + this.instanceId, null, contact.email);
                        this.setOutputDataChannels([currentChannel]);
                    }
                    var outputChannels = contact.dataChannels.values.filter(dc => dc.creator === this.minion.name + '_' + this.instanceId && dc.name === currentChannel.name);
                    if (!outputChannels.length > 0) {
                        contact.dataChannels.push(currentChannel);
                        this.updateDataChannels();
                    }
                    break;
                case Minion.MINION_TYPES.PMIN:
                    this.deactivateMinionInstance();
                    if (this.instanceOwner) {
                        var contact = Contact.findContact(contacts, this.instanceOwner);
                    } else {
                        var contact = Contact.getSelectedContact(contacts);
                    }
                    if (!(this.exchangeObject.outputDataChannels.length === this.minion.config.outputs.length)) {
                        this.exchangeObject.outputDataChannels = [];
                        for (var i = 0; i< this.minion.config.outputs.length; i++) {
                            var newChannel = new DataChannel(getLapValue(), [], this.minion.config.outputs[i] + '_' + this.instanceId, null, contact.email);
                            this.exchangeObject.outputDataChannels.push(newChannel);
                        }
                        this.setOutputDataChannels(this.exchangeObject.outputDataChannels);
                    }
                    var outputChannels = [];

                    for (var i = 0; i < this.exchangeObject.outputDataChannels.length; i++) {

                        var alreadyExisting = contact.values ? contact.values.filter(dc => dc.creator === this.exchangeObject.outputDataChannels[i].creator && dc.name === this.exchangeObject.outputDataChannels[i].name) : [];
                        if (!alreadyExisting.length > 0)
                            outputChannels = outputChannels.concat(this.exchangeObject.outputDataChannels[i]);
                    }
                    if (outputChannels.length > 0) {
                        outputChannels.forEach(function (chan) {
                            contact.dataChannels.push(chan);
                        });
                        this.updateDataChannels();
                    }
                    this.activateMinionInstance();

                    break;
                default:
                    break;
            }
        }

        toggleActivationMinionInstance () {
            this.active = !this.active;
            this.parentContainer.classList.toggle(this.showClass);
            this.executionContainer.setAttribute('data-active', this.active);
        }

        activateMinionInstance () {
            this.active = true;
            if (!this.parentContainer.classList.contains(this.showClass)) {
                this.parentContainer.classList.toggle(this.showClass);
            }
            this.executionContainer.setAttribute('data-active', this.active);
        }

        deactivateMinionInstance () {
            this.active = false;
            if (this.parentContainer.classList.contains(this.showClass)) {
                this.parentContainer.classList.toggle(this.showClass);
            }
            this.executionContainer.setAttribute('data-active', this.active);
        }

        startInstance () {
            this.subMinion.do(this.executionContainer.id, this.exchangeObject);
        }

        stopInstance () {
            this.subMinion.kill(this.executionContainer.id, this.exchangeObject);
        }

        checkInstanceStarted () {
            return this.active;
        }

        killInstance () {
            this.deactivateMinionInstance();
            this.stopInstance();
            cleanDiv(this.parentContainer);
            this.killed = true;
        }

        updateDataChannels () {
            var _this = this;
            const ddlid = this.executionContainer.id + "dc";
            const htmlObject = document.getElementById(ddlid);
            var initialValues = [];
            htmlObject.childNodes.forEach(function (selector) {
                if(selector.options[selector.selectedIndex])
                    initialValues.push(selector.options[selector.selectedIndex].value);
            });
            if (initialValues.length > 0) {
                var user = initialValues[0];
            }
            if (initialValues.length > 1) {
                var initialChannels = [];
                for (var i = 1; i < initialValues.length; i++) {
                    initialChannels.push(findDataChannel(initialValues[i], Contact.findContact(contacts, user)));
                }
            }

            cleanDiv(htmlObject, false);
            const ddlDataChannel = ddlCreate2(ddlid, function (userName, dataChannelNames) {
                const newChannels = [];
                dataChannelNames.forEach(function (dataChannelName) {
                    newChannels.push(findDataChannel(dataChannelName, Contact.findContact(contacts, userName)));
                });
                _this.setInputDataChannels(newChannels);
            }, this.numberOfInputs);
            this.setInputDataChannelsUI(initialChannels, user);
        }

        get numberOfInputs () {
            return this.subMinion.inputs;
        }

        get inputDataChannels () {
            return this.exchangeObject.inputDataChannels;
        }

        get outputDataChannels () {
            return this.exchangeObject.outputDataChannels;
        }

    }


    class Cmin {
        constructor(name, config) {
            this.name = name;
            this.config = config;
            this.ready = false;
            if (!!config.code) {
                this.executionFunction = eval(config.code);
                this.ready = true;
            } else {
                throw Error('No code or repository uri given');
            }
        }

        get technicalType() {
            return this.config.technicalType ? this.config.technicalType : 'main';
        }

        get inputs() {
            return this.config.inputs;
        }

        get code () {
            return this.config.code;
        }

        get type () {
            return this.config.type;
        }

        getExecutionFunction() {
            return this.executionFunction;
        }

        do(containerId, exchangeObject) {
            exchangeObject.instance.activateMinionInstance();
            if (exchangeObject.inputDataChannels.length > 0)
                this.getExecutionFunction()(containerId, exchangeObject.inputDataChannels);
            return exchangeObject;
        }

        kill(containerId, exchangeObject) {
            exchangeObject.instance.deactivateMinionInstance();
            if (exchangeObject.inputDataChannels.length > 0)
                this.getExecutionFunction()(containerId, exchangeObject.inputDataChannels);
            return exchangeObject;
        }

    }

    class Tmin {
        constructor(name, config) {
            this.name = name;
            this.config = config;
            this.ready = false;
            if (!!config.code ) {
                var _this = this;
                if (!!config.partner) {
                    this.partnerFunction = eval(config.partner);
                } else {
                    this.partnerFunction = function (_divId, _inputDataChannels) {};
                }
                this.executionFunction = function (_divId, _inputDataChannels, _outputDataChannels, worker){
                    _inputDataChannels.forEach(function (channel) {
                        if (channel){
                            if (channel.ressourceType === 'static') {
                                var data = channel.values.slice();
                                worker.postMessage({sourceChannel : channel.name, creator: channel.creator, value : data});
                            } else {
                                var eventListener = function (value) {
                                    worker.postMessage({sourceChannel : channel.name, creator: channel.creator, value : value});
                                };
                                channel.addEventListener('add', eventListener, _divId);
                            }
                        }

                    });

                    var callback = function (event) {
                        _outputDataChannels.forEach(function (outputDataChannel) {
                            outputDataChannel.push(event.data);
                        });
                    };
                    worker.addEventListener('message', callback);
                    _this.partnerFunction(_divId, _inputDataChannels);
                };
                this.ready = true;

            } else {
                throw Error('No code or repository uri given');
            }
        }

        get technicalType() {
            return this.config.technicalType ? this.config.technicalType : 'worker';
        }

        get inputs() {
            return this.config.inputs;
        }

        get code () {
            return this.config.code;
        }

        get type () {
            return this.config.type;
        }

        getExecutionFunction() {
            return this.executionFunction;
        }

        do(containerId, exchangeObject) {
            if ((exchangeObject.inputDataChannels.length > 0) && (exchangeObject.outputDataChannels.length > 0)){
                if (exchangeObject.worker) {
                    exchangeObject = this.kill(containerId, exchangeObject);
                }
                var blob = new Blob([this.code], {type : 'application/javascript'});
                exchangeObject.worker = new Worker(URL.createObjectURL(blob));
                this.getExecutionFunction()(containerId, exchangeObject.inputDataChannels, exchangeObject.outputDataChannels, exchangeObject.worker);
            }
            return exchangeObject;
        }

        kill(containerId, exchangeObject) {
            if (exchangeObject.worker){
                exchangeObject.worker = this._clearWorker(exchangeObject.worker);
            }
            var _this = this;
            if (exchangeObject.inputDataChannels.length > 0) {
                exchangeObject.inputDataChannels.forEach(function (channel) {
                    if (channel){
                        channel.removeEventListener(containerId);
                    }

                });
                this.partnerFunction(containerId, exchangeObject.inputDataChannels);
            }
            return exchangeObject;
        }

        _clearWorker(worker){
            worker.terminate();
            worker = undefined;
            return worker;
        }

    }

    class Gmin {
        constructor(name, config) {
            this.name = name;
            this.config = config;
            this.ready = false;
            if (!!config.code) {
                this.executionFunction = eval(config.code);
                this.ready = true;
            } else {
                throw Error('No code or repository uri given');
            }
        }

        get technicalType() {
            return this.config.technicalType ? this.config.technicalType : 'main';
        }

        get inputs() {
            return this.config.inputs;
        }

        get code () {
            return this.config.code;
        }

        get type () {
            return this.config.type;
        }

        getExecutionFunction() {
            return this.executionFunction;
        }

        do(containerId, exchangeObject) {
            if (exchangeObject.inputDataChannels.length > 0)
                this.getExecutionFunction()(containerId, exchangeObject.inputDataChannels);
            return exchangeObject;
        }

        kill(containerId, exchangeObject) {
            if (exchangeObject.inputDataChannels.length > 0)
                this.getExecutionFunction()(containerId, exchangeObject.inputDataChannels);
            return exchangeObject;
        }
    }

    class Pmin {
        constructor(name, config) {
            this.name = name;
            this.config = config;
            this.ready = false;
            if (!!config.code) {
                this.executionFunction = eval(config.code);
                this.ready = true;
            } else {
                throw Error('No code or repository uri given');
            }
        }

        get technicalType() {
            return this.config.technicalType ? this.config.technicalType : 'main';
        }

        get inputs() {
            return this.config.inputs;
        }

        get code () {
            return this.config.code;
        }

        get type () {
            return this.config.type;
        }

        getExecutionFunction() {
            return this.executionFunction;
        }

        do(containerId, exchangeObject) {
            exchangeObject.instance.activateMinionInstance();
            if (exchangeObject.outputDataChannels.length > 0)
                this.getExecutionFunction()(containerId, exchangeObject.outputDataChannels);
            return exchangeObject;
        }

        kill(containerId, exchangeObject) {
            exchangeObject.instance.deactivateMinionInstance();
            if (exchangeObject.outputDataChannels.length > 0)
                this.getExecutionFunction()(containerId, exchangeObject.outputDataChannels);
            return exchangeObject;
        }
    }

    function findParent (el, parentType) {
        while ((el = el.parentElement) && !(el.nodeName.toLowerCase() === parentType));
        return el;
    }

    function cleanDiv (div, selfDelete=true) {
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
        if (selfDelete)
            div.remove();
    }

    /*
    Export the module for various environments.
     */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Minion;
    } else if (typeof exports !== 'undefined') {
        exports.Minion = Minion;
    } else if (typeof define === 'function' && define.amd) {
        define([], function() {
            return Minion;
        });
    } else {
        root.Minion = Minion;
    }

}) (this);