(function (root) {

    const MINION_TYPE = {
        AMIN : "amin",
        CMIN : "cmin",
        GMIN : "gmin",
        PMIN : "pmin",
        TMIN : "tmin",
        MACRO : "macro"
    };

    // Attention: this file is still under development

    function MinionLoader(dropdownIDS, parentContainerID, storedMinions, dbMinion) {
        this.minions = {};
        this.macroMinions = {};

        var _this = this;
        if (storedMinions){
            var mins = Object.keys(storedMinions).filter(function (minionName) {
                return storedMinions[minionName].type !== MINION_TYPE.MACRO;
            });
            mins.forEach(function (minionName) {
                _this.minions[minionName] = storedMinions[minionName];
            });
            var macros = Object.keys(storedMinions).filter(function (minionName) {
                return storedMinions[minionName].type === MINION_TYPE.MACRO;
            });
            macros.forEach(function (macroName) {
                _this.macroMinions[macroName] = storedMinions[macroName];
            });
        }
        this.dropdown = {cmin : document.getElementById(dropdownIDS.cmin), tmin : document.getElementById(dropdownIDS.tmin), macro : document.getElementById(dropdownIDS.macro), gmin : document.getElementById(dropdownIDS.gmin)};
        this.parentContainer = document.getElementById(parentContainerID);
        this.chosenClass = 'active-minion';
        this.showClass = 'show';
        this.dbMinion = dbMinion;
        if(this.minions){
            var keys = this.getMinionNames();
            for (var i = 0; i < keys.length; i++){
                if (!this._checkInitialization(this._getMinionByName(keys[i]))) {
                    this._initMinion(keys[i]);
                }
                if (!this._checkMinionIntegration(this._getMinionByName(keys[i]))) {
                    this.integrateMinionIntoUserInterface(keys[i]);
                }
            }
        }
        if (this.macroMinions){
            var keys = this.getMacroNames();
            for (var i = 0; i < keys.length; i++) {
                var macro = this._getMacroByName(keys[i]);
                if (!this._checkMacroInitialization(macro)){
                    this._initMacro(macro);
                }
                if (!this._checkMacroIntegration(macro))
                    this.integrateMacroIntoUserInterface(macro.name);
            }
        }
        
    }

    MinionLoader.prototype.storeNewMinion = function(minionName, minionType, minionCode, minionOwner, minionUser, numberOfInputs = 1, partner=null) {
        if (minionName && minionType && minionCode) {
            if (!this.minions) {
                this.minions = {};
            }
            if (!this.macroMinions) {
                this.macroMinions = {};
            }
            var newMinion = {
                'name' : minionName,
                'type' : minionType,
                'code' : minionCode,
                'button' : this._getButtonID(minionName),
                'container' : this._getContainerID(minionName),
                'inputs' : numberOfInputs,
                'partner' : partner
            };
            if (minionType === MINION_TYPE.MACRO) {
                this.macroMinions[minionName] = newMinion;
                if (!this._checkMacroInitialization(newMinion)){
                    this._initMacro(newMinion);
                } else {
                    this._initMacro(newMinion, true)
                }
                if (!this._checkMacroIntegration(newMinion))
                    this.integrateMacroIntoUserInterface(newMinion.name);
            } else {
                this.minions[minionName] = newMinion;
                if (!this._checkInitialization(newMinion)) {
                    this._initMinion(minionName);
                } else {
                    this._initMinion(minionName, true);
                }
                if (!this._checkMinionIntegration(newMinion)) {
                    this.integrateMinionIntoUserInterface(minionName);
                }
            }

            db_save_received_minion(this.dbMinion, minionUser, minionName, minionType, minionOwner, minionCode.toString(), numberOfInputs, partner);
        }
    };

    MinionLoader.prototype.integrateMinionIntoUserInterface = function (minionName) {
        if (this.minions) {
            var minion = this.minions[minionName];
            if (minion) {
                var buttonID = minion.button;
                var _this = this;

                this._addMinionToDropdown2(minion);
                this._createMinionContainer(minion);

                document.querySelector('#' + buttonID + ' span').addEventListener('click', function (event) {
                    var min = _this._getMinionByName(minion.name);
                    _this._toggleStarted(minion);
                    if (_this._checkStarted(minion)) {
                        _this.executeMinionsFunctionality(min);
                    } else {
                        _this.killMinionsFunctionality(min);
                    }
                });

                document.querySelector('#' + buttonID + ' button').addEventListener('click', function (event) {
                   send_minion(minion);
                })
            }

        }
    };

    MinionLoader.prototype.integrateMacroIntoUserInterface = function (macroName) {
        if (this.macroMinions) {
            var macro = this.macroMinions[macroName];
            if (macro) {
                this._addMinionToDropdown2(macro);
                var _this = this;
                var buttonID = macro.button;


                document.querySelector('#' + buttonID + ' span').addEventListener('click', function (event) {
                    var min = _this._getMacroByName(macro.name);
                    _this._toggleButton(min);
                    _this.macros[macroName].active = !_this.macros[macroName].active;
                    if (_this._checkMacroStarted(min)) {
                        _this.executeMacro(min);
                    } else {
                        _this.killMacro(min);
                    }
                });
                document.querySelector('#' + buttonID + ' button').addEventListener('click', function (event) {
                    send_minion(newMinion);
                });
            }

        }
    };

    MinionLoader.prototype.executeMinionsFunctionality = function (minion) {
        // TODO write an execution function for minions that differenciates different minion types
        
        var type = minion.type;
        this._setStartedTrue(minion);
        switch (type) {
            case MINION_TYPE.AMIN:
            case MINION_TYPE.PMIN:
                console.error('Minion type ' + type + ' is NOT IMPLEMENTED');
                break;
            case MINION_TYPE.TMIN:
                if ('Worker' in window) {
                    this.getExecutionFunction(minion.name)(minion.container, this.getInputDataChannel(minion.name));
                } else {
                    //TODO what if worker functionality is not available?
                    console.error('Worker is not supported!');
                }
                break;
            case MINION_TYPE.CMIN:
                this.getExecutionFunction(minion.name)(minion.container, this.getInputDataChannel(minion.name).channel);
                break;
            case MINION_TYPE.GMIN:
                this.getExecutionFunction(minion.name)(minion.container, this.getInputDataChannel(minion.name).channel);
                break;
            default:
                return;
        }
    };

    MinionLoader.prototype.killMinionsFunctionality = function (minion) {
        // TODO write a kill function for the execution of a minion that gets fired if the minion is closed once
        var type = minion.type;
        var _this = this;
        this._setStartedFalse(minion);
        switch (type) {
            case MINION_TYPE.PMIN:
            case MINION_TYPE.AMIN:
                // TODO specify kill this type of a minion
                console.error('NOT IMPLEMENTED for this type', minion.type);
                break;
            case MINION_TYPE.TMIN:
                if (this.getWorker(minion.name)){
                    this.clearWorker(minion);
                }
                this.getInputDataChannel(minion.name).forEach(function (channel) {
                    if (channel.channel)
                        channel.channel.removeEventListener(minion.name);
                });
                this.getPartner(minion.name)(this._getContainerID(minion.name), this.getInputDataChannel(minion.name));
                break;
            case MINION_TYPE.CMIN:
                // TODO specify kill of a communicator minion
                this.getExecutionFunction(minion.name)(this._getContainerID(minion.name),  this.getInputDataChannel(minion.name).channel);
                break;
            case MINION_TYPE.MACRO:
                this.macros[minion.name](null);
                break;
            case MINION_TYPE.GMIN:
                this.getExecutionFunction(minion.name)(this._getContainerID(minion.name),  this.getInputDataChannel(minion.name).channel);
                break;
            default:
                return;

        }
    };

    MinionLoader.prototype.executeMacro = function(minion) {
        if (!document.querySelector('#' + minion.button + 'img').classList.contains(this.chosenClass)) {
            this._toggleButton(minion);
        }
        this.macros[minion.name].active = true;
        this.macros[minion.name].do(window);
    };

    MinionLoader.prototype.killMacro = function(minion) {
        if (document.querySelector('#' + minion.button + 'img').classList.contains(this.chosenClass)) {
            this._toggleButton(minion);
        }
        this.macros[minion.name].active = false;
        this.macros[minion.name].do(null);
    };

    MinionLoader.prototype.getMinionNames = function () {
        if (this.minions) {
            return Object.keys(this.minions);
        } else {
            return [];
        }
    };

    MinionLoader.prototype.getMacroNames = function () {
        if (this.macroMinions) {
            return Object.keys(this.macroMinions);
        } else {
            return [];
        }
    };

    MinionLoader.prototype._getMinionByName = function (minionName) {
        if (this.minions) {
            return this.minions[minionName];
        }
    };

    MinionLoader.prototype._getMacroByName = function (macroName) {
        if (this.macroMinions) {
            return this.macroMinions[macroName];
        }
    };

    MinionLoader.prototype.getWorker = function (minionName) {
        if (this[minionName]){
            return this[minionName].worker;
        } else {
            return null;
        }
    };


    MinionLoader.prototype._initMinion = function (minionName, update=false) {
       var minion = this._getMinionByName(minionName);
       if (!update) {
           this[minionName] = {
               do : null,
               channel: null,
               active: false
           };
           this._initDataChannel(minion);
       }
       this._initExecutionFunction(minion);
    };

    MinionLoader.prototype._initMacro = function (macro, update=false) {
        if (!update) {
            if (!this.macros){
                this.macros = {};
            }
            this.macros[macro.name] = {
                do : null,
                active : false
            };
        }
        this._initExecutionFunction(macro);
    };

    MinionLoader.prototype._checkMinionIntegration = function (minion) {        
        if(!minion.button){
            minion.button = this._getButtonID(minion.name); 
        }
        if(!minion.container){
            minion.container = this._getContainerID(minion.name);
        }
        if (document.getElementById(minion.button)) {
            return true;
        }
        if (document.getElementById(minion.container)) {
            return true;
        }

        return false;
    };

    MinionLoader.prototype._checkMacroIntegration = function (macro) {
        if(!macro.button){
            macro.button = this._getButtonID(macro.name);
        }
        if (document.getElementById(macro.button)) {
            return true;
        }

        return false;
    };

    MinionLoader.prototype._checkInitialization = function (minion) {
        return (this.getInputDataChannel(minion.name) && this.getExecutionFunction(minion.name))
    };

    MinionLoader.prototype._checkMacroInitialization = function (macro) {
        return this.macros && this.macros[macro.name] ? (this.macros[macro.name].do ? true : false) : false;
    };

    MinionLoader.prototype._checkStarted = function (minion) {
        if (this[minion.name])
            return this[minion.name].active;
        else
            return false;
    };

    MinionLoader.prototype._checkMacroStarted = function (minion) {
        return this.macros[minion.name].active;
    };


    MinionLoader.prototype._toggleStarted = function (minion) {
        this._toggleButton(minion);
        this._toggleSection(minion);
        this[minion.name].active = !this[minion.name].active;
        document.getElementById(minion.container).setAttribute('data-active', this[minion.name].active);
    };

    MinionLoader.prototype._toggleButton = function (minion) {
        document.querySelectorAll('#' + minion.button + ' img')[1].classList.toggle(this.chosenClass);
    };

    MinionLoader.prototype._toggleSection = function (minion) {
        if (!(minion.type === MINION_TYPE.MACRO))
            this._findParent(document.getElementById(minion.container), 'section').classList.toggle(this.showClass);
    };

    MinionLoader.prototype._setStartedTrue = function (minion) {
        if (!document.querySelector('#' + minion.button + 'img').classList.contains(this.chosenClass)) {
            this._toggleButton(minion);
        }
        if (!this._findParent(document.getElementById(minion.container), 'section').classList.contains(this.showClass)) {
            this._toggleSection(minion);
        }
        this[minion.name].active = true;
        document.getElementById(minion.container).setAttribute('data-active', this[minion.name].active);
    };

    MinionLoader.prototype._setStartedFalse = function (minion) {
        if (document.querySelector('#' + minion.button + 'img').classList.contains(this.chosenClass)) {
            this._toggleButton(minion);
        }
        if (this._findParent(document.getElementById(minion.container), 'section').classList.contains(this.showClass)) {
            this._toggleSection(minion);
        }
        this[minion.name].active = false;
        document.getElementById(minion.container).setAttribute('data-active', this[minion.name].active);
    };


    MinionLoader.prototype._initDataChannel = function (minion) {
        var channel;
        if (minion.inputs > 1) {
            channel = [{channelName : minion.name, channel: new DataChannel(minion.name, [], minion.name, null, myContactInfo.email, 'streaming')}];
        } else {
            channel = new DataChannel(minion.name, [], minion.name, null, myContactInfo.email, 'streaming');
        }
        if (minion.type === MINION_TYPE.CMIN && this[minion.name]) {
            this[minion.name].channel = {
                channelName : minion.name + ' Input',
                channel: channel
            };
        } else if (minion.type === MINION_TYPE.TMIN && this[minion.name]) {
            this[minion.name].channel = channel;
        }
    };

    MinionLoader.prototype._initExecutionFunction = function (minion) {
        var _this = this;
        if (this[minion.name] || this.macros[minion.name]){
            switch (minion.type) {
                case MINION_TYPE.CMIN:
                    this[minion.name].do = eval(minion.code);
                    break;
                case MINION_TYPE.GMIN:
                    this[minion.name].do = eval(minion.code);
                    break;
                case MINION_TYPE.TMIN:
                  //  this[minion.name].do = function() {
                    if (minion.partner){
                        this.setPartner(minion);
                    } else {
                        this.setPartner(minion, function (_divId, _dataChannels) {
                            return;
                        });
                    }
                    this[minion.name].do = function(_divId, _dataChannels) {
                        var script = minion.code;
                        _this.getInputDataChannel(minion.name).forEach(function (channel) {
                            _this[minion.name].eventListener = function (value) {
                                _this[minion.name].worker.postMessage({sourceChannel : channel.channelName, creator: channel.channel.creator, value : value});
                            };
                            if (channel.channel){
                                channel.channel.addEventListener('add', _this[minion.name].eventListener, minion.name);
                            }

                        });
                        var contact = Contact.getSelectedContact(contacts);
                        var currentChannel = _this.getOutputDataChannel(minion.name);
                        if (!currentChannel) {
                            _this.setOutputDataChannel(minion.name);
                            currentChannel = _this.getOutputDataChannel(minion.name);
                        }
                        var outputChannels = contact.dataChannels.values.filter(dc => dc.creator === minion.name && dc.name === currentChannel.channel.name);
                        if (!outputChannels.length > 0) {
                            contact.dataChannels.push(_this.getOutputDataChannel(minion.name).channel);
                        }
                        var callback = _this.getWorkerCallback(minion.name) ? _this.getWorkerCallback(minion.name) : function (event) {
                            _this.getOutputDataChannel(minion.name).channel.push(event.data);
                        };
                        if (!_this.getWorker(minion.name)){
                            _this[minion.name].blob = new Blob([script], {type : 'application/javascript'});
                            _this[minion.name].worker = new Worker(URL.createObjectURL(_this[minion.name].blob));
                            _this[minion.name].worker.addEventListener('message', callback);
                        }
                        if (_this.getPartner(minion.name)) {
                            _this.getPartner(minion.name)(_divId, _this.getInputDataChannel(minion.name));
                        }
                    };
                    break;
                case MINION_TYPE.MACRO:
                    this.macros[minion.name].do = eval(minion.code);
                    break;
                default:
                    break;
            }
        }
    };

    MinionLoader.prototype._findParent = function (el, parentType) {
        while ((el = el.parentElement) && !(el.nodeName.toLowerCase() === parentType));
        return el;
    };

    MinionLoader.prototype._getButtonID = function (minionName) {
        return minionName.split(' ').join('_') + 'Button';
    };

    MinionLoader.prototype.getPartner = function(minionName) {
        return this[minionName].partner ? this[minionName].partner : null;
    };

    MinionLoader.prototype.setPartner = function(minion, defaultFunction=null) {
        if (defaultFunction) {
            minion.partner = '(' + defaultFunction.toLocaleString() + ')';
        }
        this[minion.name].partner = eval(minion.partner);
    };

    MinionLoader.prototype._getContainerID = function (minionName) {
        return minionName.split(' ').join('') + 'Container';
    };

    MinionLoader.prototype.getInputDataChannel = function (minionName) {
        return this[minionName] ? this[minionName].channel : null;
    };

    MinionLoader.prototype.setInputDataChannel = function (minionName, channelName, dataChannel) {               
        if(this[minionName]) {
            this[minionName].channel = {
                channelName: channelName,
                channel: dataChannel
            };
        } else {
            this[minionName] = {
                channel : {
                    channelName: channelName,
                    channel: dataChannel
                }
            }
        }  
    };

    MinionLoader.prototype.resetInputDataChannel = function(minionName) {
        if(this[minionName]) {
            this[minionName].channel = null;
        } else {
            this[minionName] = {
                channel: null
            }
        }
    };

    MinionLoader.prototype.clearWorker = function(minion) {
        this[minion.name].worker.terminate();
        this[minion.name].worker = undefined;
    };

    MinionLoader.prototype.getOutputDataChannel = function(minionName, relatedSubject=Contact.getSelectedContact(contacts).email) {
        if (this[minionName] && this[minionName].outputChannel) {
            return this[minionName].outputChannel[relatedSubject];
        } else {
            return null;
        }
    };


    MinionLoader.prototype.setOutputDataChannel = function(minionName, relatedSubject=Contact.getSelectedContact(contacts).email) {
        if (this[minionName]) {
            if (!this[minionName].outputChannel){
                this[minionName].outputChannel = {};
            }
            this[minionName].outputChannel[relatedSubject] = {
                channelName : minionName + ' Output',
                channel: new DataChannel(getLapValue(), [], minionName, null, relatedSubject, 'streaming')
            };
        } else {
            this[minionName] = {
                outputChannel: {}
            };
            this[minionName].outputChannel[relatedSubject] = {
                    channelName : minionName + ' Output',
                    channel: new DataChannel(getLapValue(), [], minionName, relatedSubject, 'streaming')
            };
        }
    };

    MinionLoader.prototype.addInputDataChannel = function (minionName, channelName, dataChannel) {
        var inputDataChannel = this.getInputDataChannel(minionName);
        if (this[minionName]) {
            if(inputDataChannel) {
                if (Array.isArray(inputDataChannel)) {
                    inputDataChannel.push({
                        channelName : channelName,
                        channel: dataChannel
                    });
                } else {
                    this[minionName].channel = [{
                        channelName: channelName,
                        channel : dataChannel
                    }];
                }
            } else {
                this[minionName].channel = [{
                    channelName: channelName,
                    channel : dataChannel
                }];
            }
        } else {
            this[minionName]= {
                channel : [{
                    channelName: channelName,
                    channel : dataChannel
                }]
            };
        }

    };

    MinionLoader.prototype.setWorkerCallback = function (minionName, callback) {
        if (this[minionName]) {
            this[minionName].workerCallback = callback;
        } else {
            this[minionName] = {
                workerCallback : callback
            };
        }
    };
    MinionLoader.prototype.getWorkerCallback = function (minionName) {
        return this[minionName] ? this[minionName].workerCallback : null;
    };

    MinionLoader.prototype.getExecutionFunction = function (minionName) {
        return this[minionName] ? this[minionName].do : null;
    };

    MinionLoader.prototype.getNumberOfInputs = function(minion) {
        return minion.inputs;
    };

    // MinionLoader.prototype._addMinionToDropdown = function (minion) {
    //     var dropdown = this.dropdown;
    //     var buttonID = minion.button;
    //     if (document.getElementById(buttonID)) {
    //         return;
    //     }
    //     var htmlElement = document.createElement('a'),
    //         span = document.createElement('span'),
    //         icon = document.createElement('img'),
    //         textNode = document.createTextNode(minion.name);
    //     htmlElement.style.height = '50px';
    //     htmlElement.setAttribute('data-main', minion.name);
    //     icon.setAttribute('src', 'assets/icons/minion.png');
    //     icon.style.height = '90%';
    //     span.appendChild(icon);
    //     span.style.marginRight = '10px';
    //     htmlElement.appendChild(span);
    //     htmlElement.appendChild(textNode);
    //     htmlElement.setAttribute('href', '#');
    //     htmlElement.setAttribute('id', buttonID);
    //     dropdown.appendChild(htmlElement);
    // };

    MinionLoader.prototype._addMinionToDropdown2 = function (minion) {

        var id = minion.button;
        if (document.getElementById(id)) {
            return;
        }

        var htmlElement = document.createElement('a'),
            span = document.createElement('span'),
            iconInactive = document.createElement('img'),
            icon = document.createElement('img'),
            textSpan = document.createElement('span');
            textNode = document.createTextNode(minion.name);


        var btnSendIcon = document.createElement('button'),
            btnSendI =  document.createElement('i'),
            btnSendIconTxt = document.createTextNode('send');

        btnSendI.classList.add("material-icons");
        btnSendI.appendChild(btnSendIconTxt);

        btnSendIcon.classList.add("mdl-button");
        btnSendIcon.classList.add("mdl-js-button");
        btnSendIcon.classList.add("mdl-button--mini-fab");
        btnSendIcon.classList.add("mdl-button--colored");
        btnSendIcon.setAttribute('data-upgraded', ",MaterialButton");

        btnSendIcon.appendChild(btnSendI);


        htmlElement.style.height = '50px';
        htmlElement.classList.add('bar');

        switch (minion.type) {
            case MINION_TYPE.CMIN:
                icon.classList.add('communicator-icon');
                break;
            case MINION_TYPE.TMIN:
                icon.classList.add('thinker-icon');
                break;
            default:
                icon.classList.add('communicator-icon');
                break;
        }
        icon.style.height = '100%';
        iconInactive.style.height = '100%';
        iconInactive.classList.add('inactive-minion');

        iconInactive.style.height = '90%';
        var idm =id + "img";

        iconInactive.setAttribute('id', idm);
        iconInactive.setAttribute('title', "activate minion");
        span.appendChild(icon);
        span.appendChild(iconInactive);
        textSpan.style.position = 'relative';
        textSpan.style.left = '-20px';
        textSpan.appendChild(textNode);
        span.appendChild(textSpan);
        span.style.fontSize = "12px";
        span.style.marginRight = '0px';
        var spanId = id + "span";
        span.setAttribute('id', spanId);

        htmlElement.appendChild(span);
        htmlElement.appendChild(btnSendIcon);
        btnSendIcon.style.position = "absolute";
        btnSendIcon.style.right = "0px";
        btnSendIcon.setAttribute("id", id + "send");
        btnSendIcon.setAttribute('title', "send minion");
        htmlElement.setAttribute('href', '#');
        htmlElement.setAttribute('id', id);
        htmlElement.setAttribute('data-main', minion.name);
        this.dropdown[minion.type].appendChild(htmlElement);
    };

    MinionLoader.prototype._createMinionContainer = function (minion) {
        var containerID = minion.container;
        if (document.getElementById(containerID)) {
            return containerID;
        }
        var section = document.createElement('section'),
            div1 = document.createElement('div'),
            div2 = document.createElement('div'),
            divHeader = document.createElement('div'),
            divFooter = document.createElement('div'),
            h2Head   = document.createElement('h2'),
            textNode = document.createTextNode(minion.name),
            btnText =  document.createTextNode('Send Minion'),
            sendButton =  document.createElement('a'),
            divContainer = document.createElement('div');
        section.setAttribute('class', 'section--center mdl-grid mdl-grid--no-spacing mdl-shadow--2dp hidden-container');
        div1.setAttribute('class', 'demo-card-square mdl-card mdl-cell mdl-cell--12-col mdl-cell--4-col-phone');
        divHeader.setAttribute('class', 'mdl-card__title mdl-card--expand mdl-color--primary-dark');
        
        sendButton.setAttribute('class', "mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect");
        divFooter.setAttribute('class',"mdl-card__actions mdl-card--border");
        h2Head.setAttribute('class', "mdl-card__title-text");        
        h2Head.appendChild(textNode);
        div2.setAttribute('class', 'mdl-card__supporting-text phone-card');
        divContainer.style.width = '100%';
        divContainer.setAttribute('id', containerID);
        divContainer.setAttribute('data-active', this._checkStarted(minion));
        div2.appendChild(divContainer);
        divHeader.appendChild(h2Head);
        div1.appendChild(divHeader);
        div1.appendChild(div2);
        sendButton.appendChild(btnText);        
        divFooter.appendChild(sendButton);
        div1.appendChild(divFooter);
        section.appendChild(div1);
        this.parentContainer.appendChild(section);

        // TODO: refactor and reimplement
        var ddlid = containerID + "dc";

        var _this = this;

        var numberOfInputs = this.getNumberOfInputs(minion);
        if (numberOfInputs > 1) {
            var ddlDataChannel = ddlCreate2(ddlid, function (userName, dataChannelNames) {
                _this.killMinionsFunctionality(minion);
                _this.resetInputDataChannel(minion.name);
                dataChannelNames.forEach(function (dataChannelName) {
                    var dataChannel = findDataChannel(dataChannelName, Contact.findContact(contacts, userName));
                    _this.addInputDataChannel(minion.name, dataChannelName, dataChannel);
                });
                _this.executeMinionsFunctionality(minion);
            }, numberOfInputs);
            divFooter.appendChild(ddlDataChannel);
            ddlPopulateContacts(ddlid, numberOfInputs);
            this.resetInputDataChannel(minion.name);
            var userName = ddl_getSelected(ddlid + 'User');
            for (var i = 0; i < numberOfInputs; i++) {
                var dataChannelName = ddl_getSelected(ddlid + 'Channel' + i);
                var dataChannel = findDataChannel(dataChannelName, Contact.findContact(contacts, userName));
                this.addInputDataChannel(minion.name, dataChannelName, dataChannel);
            }
        } else {

            var ddlDataChannel = ddlCreate2(ddlid, function (userName, channels) {
                var dataChannel = findDataChannel(channels[0], Contact.findContact(contacts, userName));
                _this.killMinionsFunctionality(minion);
                _this.setInputDataChannel(minion.name, dataChannelName, dataChannel);
                _this.executeMinionsFunctionality(minion);
            });
            // var ddlDataChannel = ddl_create(ddlid, function(dataChannelName){
            //     var dataChannel = findDataChannel(dataChannelName);
            //     _this.killMinionsFunctionality(minion);
            //     _this.setInputDataChannel(minion.name, dataChannelName, dataChannel);
            //     _this.executeMinionsFunctionality(minion);
            // });
            // set the default datachannel

            divFooter.appendChild(ddlDataChannel);
            ddlPopulateContacts(ddlid);
            var dataChannelName = ddl_getSelected(ddlid + 'Channel' + 0);
            var userName = ddl_getSelected(ddlid + 'User');
            var dataChannel = findDataChannel(dataChannelName, Contact.findContact(contacts, userName));

            this.setInputDataChannel(minion.name, dataChannelName, dataChannel);
        }

        

        sendButton.addEventListener('click', function(){
              send_minion(minion);
        });
        return containerID;
    };


    /**
     * Export the module for various environemnts
     */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = MinionLoader;
    } else if (typeof exports !== 'undefined') {
        exports.MinionLoader = MinionLoader;
    } else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return MinionLoader;
        });
    } else {
        root.MinionLoader = MinionLoader;
    }

}(this));