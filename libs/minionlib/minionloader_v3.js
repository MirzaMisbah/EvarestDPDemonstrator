(function (root) {

    class MinionLoader {

        constructor(minionConfigurations=null, loadedMinions=null, database_minion=null, uiIntegration=true) {
            this.MINIONTYPES = mergeObjects(mergeObjects({}, Minion.MINION_TYPES), Macro.MACRO_TYPES);
            if (uiIntegration) {
                this.uiIntegration = true;
                var _this = this;
                this.dropdown = {};
                this.dropdownSearch = {};
                this.dropdownToggle = {};
                Object.keys(uiIntegration.dropdownIDS).forEach(function (minType) {
                    _this.dropdown[minType] = document.getElementById(uiIntegration.dropdownIDS[minType]);
                });
                Object.keys(uiIntegration.searchDropdownIDS).forEach(function (minType) {
                    _this.dropdownSearch[minType] = document.getElementById(uiIntegration.searchDropdownIDS[minType]);
                });
                Object.keys(uiIntegration.toggleDropdownIDS).forEach(function (minType) {
                    _this.dropdownToggle[minType] = document.getElementById(uiIntegration.toggleDropdownIDS[minType]);
                });

                this.parent = document.getElementById(uiIntegration.parentContainerID);
            }
            this.minions = minionConfigurations ? minionConfigurations : {};
            this.dbMinion = database_minion;
            this.readyLoaded = false;
            this.minionObjects = {};
            this.macroObjects = {};

            var components = {};
            var _this = this;
            Object.keys(this.minions).forEach(function (minionName) {
                components[minionName] = {code : _this.minions[minionName].uri};
                if (_this.minions[minionName].type === _this.MINIONTYPES.TMIN) {
                    if (_this.minions[minionName].partner_uri)
                        components[minionName].partner = _this.minions[minionName].partner_uri;
                }
            });
            fetchMinions(components).catch(function (err){
                return {};
            }).then(function (result) {
                Object.keys(result).forEach(function (minionName) {
                    Object.keys(result[minionName]).forEach(function (singleComponent) {
                        _this.minions[minionName][singleComponent] = result[minionName][singleComponent];
                    });
                });
                Object.keys(_this.minions).forEach(function (minionName) {
                    db_save_received_minion(_this.dbMinion, app.authorizationManager.getProfile().email, minionName, _this.minions[minionName].type, _this.minions[minionName].owner ? _this.minions[minionName].owner : app.authorizationManager.getProfile().email, _this.minions[minionName].code.toString(), _this.minions[minionName].inputs, _this.minions[minionName].partner);
                });
                if (loadedMinions) {
                    _this.minions = mergeObjects(_this.minions, loadedMinions);
                }
                _this.init();
                _this.readyLoaded = true;
            });
        }

        init () {
            var _this = this;
            Object.keys(this.minions).forEach(function (minionName) {
                if ((_this.minions[minionName].type === _this.MINIONTYPES.PMIN) || (_this.minions[minionName].type === _this.MINIONTYPES.CMIN) || (_this.minions[minionName].type === _this.MINIONTYPES.TMIN) || (_this.minions[minionName].type === _this.MINIONTYPES.GMIN)){
                    if (_this.minionObjects[minionName]){
                        _this.updateSingleMinion(minionName, _this.minions[minionName]);
                    } else {
                        var minionId = _this.uiIntegration ? _this.createMinionContainer(minionName).id : null;
                        _this.minionObjects[minionName] = new Minion(minionName, _this.minions[minionName].type, _this.minions[minionName], minionId);
                        if (_this.uiIntegration)
                            _this.createMinionButton(minionName);
                    }
                } else if (_this.minions[minionName].type === _this.MINIONTYPES.MACRO) {
                    _this.macroObjects[minionName] = new Macro(minionName, _this.minions[minionName]);
                    if (_this.uiIntegration)
                        _this.createMacroButton(minionName);
                }
            });
            if (this.uiIntegration)
                this.initializeDropdownMenu();
        }

        createMinionContainer (minionName) {
            var container = document.createElement('div');
            container.setAttribute('id', this._getContainerId(minionName));
            this.parent.appendChild(container);
            return container;
        }

        createMinionButton (minionName) {
            var _this = this;
            var minionButtonName = minionName.split(' ').join('_') + 'Button';
            var button = document.getElementById(minionButtonName);
            if (button) {
                return button;
            }
            var id = minionButtonName;

            var htmlElement = document.createElement('a'),
                span = document.createElement('span'),
                iconInactive = document.createElement('img'),
                icon = document.createElement('img'),
                textSpan = document.createElement('span'),
                textNode = document.createTextNode(minionName);

            var btnAddInstance = document.createElement('button'),
                btnAddInstanceI = document.createElement('i'),
                btnAddInstanceTxt = document.createTextNode('add_box');

            btnAddInstanceI.classList.add('material-icons');
            btnAddInstanceI.appendChild(btnAddInstanceTxt);
            btnAddInstance.classList.add("mdl-button");
            btnAddInstance.classList.add("mdl-js-button");
            btnAddInstance.classList.add("mdl-button--mini-fab");
            btnAddInstance.classList.add("mdl-button--colored");
            btnAddInstance.setAttribute('data-upgraded', ",MaterialButton");
            btnAddInstance.appendChild(btnAddInstanceI);
            btnAddInstance.style.position = "absolute";
            btnAddInstance.style.right = "30px";
            btnAddInstance.setAttribute("id", id + "add");
            btnAddInstance.setAttribute('title', "add minion instance");
            htmlElement.appendChild(btnAddInstance);


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

            switch (this.minions[minionName].type) {
                case this.MINIONTYPES.CMIN:
                    icon.classList.add('communicator-icon');
                    break;
                case this.MINIONTYPES.TMIN:
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
            var idm = id + "img";

            iconInactive.setAttribute('id', idm);
            iconInactive.setAttribute('title', "activate minion");
            span.appendChild(icon);
            span.appendChild(iconInactive);
            textSpan.style.position = 'relative';
            textSpan.style.left = '-40px';
            textSpan.appendChild(textNode);
            span.appendChild(textSpan);
            span.style.fontSize = "12px";
            span.style.marginRight = '0px';
            var spanId = id + "span";
            span.setAttribute('id', spanId);

            htmlElement.appendChild(span);
            htmlElement.appendChild(btnSendIcon);
            btnSendIcon.style.position = "absolute";
            btnSendIcon.style.right = "-10px";
            btnSendIcon.setAttribute("id", id + "send");
            btnSendIcon.setAttribute('title', "send minion");
            htmlElement.setAttribute('href', '#');
            htmlElement.setAttribute('id', id);
            htmlElement.setAttribute('data-main', minionName);

            span.addEventListener('click', function (event) {
                if (iconInactive.classList.contains('active-minion')) {
                    iconInactive.classList.remove('active-minion');
                    _this.minionObjects[minionName].hide();
                } else {
                    iconInactive.classList.add('active-minion');
                    _this.minionObjects[minionName].show();
                }
            });

            btnSendIcon.addEventListener('click', function (event) {
                send_minion(_this.minions[minionName]);
            });

            btnAddInstance.addEventListener('click', function (event) {
                _this.minionObjects[minionName].createNewInstance();
            });
            this.dropdown[this.minions[minionName].type].appendChild(htmlElement);
            return htmlElement;
        }

        createMacroButton (macroName) {
            var _this = this;
            var macroButtonName = macroName.split(' ').join('_') + 'Button';
            var button = document.getElementById(macroButtonName);
            if (button) {
                return button;
            }
            var id = macroButtonName;

            var htmlElement = document.createElement('a'),
                span = document.createElement('span'),
                iconInactive = document.createElement('img'),
                icon = document.createElement('img'),
                textSpan = document.createElement('span'),
                textNode = document.createTextNode(macroName);

            htmlElement.style.height = '50px';
            htmlElement.classList.add('bar');

            switch (this.minions[macroName].type) {
                case this.MINIONTYPES.CMIN:
                    icon.classList.add('communicator-icon');
                    break;
                case this.MINIONTYPES.TMIN:
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
            var idm = id + "img";

            iconInactive.setAttribute('id', idm);
            iconInactive.setAttribute('title', "activate minion");
            span.appendChild(icon);
            span.appendChild(iconInactive);
            textSpan.style.position = 'relative';
            textSpan.style.left = '-40px';
            textSpan.appendChild(textNode);
            span.appendChild(textSpan);
            span.style.fontSize = "12px";
            span.style.marginRight = '0px';
            var spanId = id + "span";
            span.setAttribute('id', spanId);

            htmlElement.appendChild(span);
            htmlElement.setAttribute('href', '#');
            htmlElement.setAttribute('id', id);
            htmlElement.setAttribute('data-main', macroName);

            span.addEventListener('click', function (event) {
                if (iconInactive.classList.contains('active-minion')) {
                    iconInactive.classList.remove('active-minion');
                    _this.macroObjects[macroName].kill();
                } else {
                    iconInactive.classList.add('active-minion');
                    _this.macroObjects[macroName].do();
                }
            });
            this.dropdown[this.minions[macroName].type].appendChild(htmlElement);
            return htmlElement;
        }

        updateSingleMinion (minionName, newConfig) {
            var minionId = null;
            if (this.minionObjects[minionName]){
                this.minionObjects[minionName].killAllInstances();
            } else {
                if (this.uiIntegration){
                    this.createMinionContainer(minionName);
                    minionId = this._getContainerId(minionName);
                }
            }
            this.minions[minionName] = newConfig;
            this.minionObjects[minionName] = new Minion(minionName, this.minions[minionName].type, this.minions[minionName], minionId);
        }

        updateInstanceDataChannels () {
            var _this = this;
            Object.keys(this.minionObjects).forEach(function (minionName) {
                _this.minionObjects[minionName].updateDataChannels();
            })
        }

        setDataChannelsOfSingleInstance (minionName, instanceId, inputDataChannels, outputDataChannels) {
            this.minionObjects[minionName].updateDataChannelsOfSingleInstance(instanceId, inputDataChannels, outputDataChannels);
        }

        storeNewMinion (minionOwner, minionUser, config) {
            const name = config.name;
            const type = config.type;
            const components = {};
            const _this = this;

            var returnToProcess = function (minionConfiguration) {
                if (!_this.readyLoaded){
                    _this.minions[minionConfiguration.name] = minionConfiguration;
                } else {
                    if ((minionConfiguration.type ===_this.MINIONTYPES.CMIN) || (minionConfiguration.type ===_this.MINIONTYPES.TMIN)){
                        if (_this.minions[minionConfiguration.name]) {
                            _this.updateSingleMinion(minionConfiguration.name, minionConfiguration);
                        } else {
                            _this.minions[minionConfiguration.name] = minionConfiguration;
                            var minionId = _this.uiIntegration ? _this.createMinionContainer(minionConfiguration.name).id : null;
                            _this.minionObjects[minionConfiguration.name] = new Minion(minionConfiguration.name, _this.minions[minionConfiguration.name].type, _this.minions[minionConfiguration.name], minionId);
                            if (_this.uiIntegration)
                                _this.createMinionButton(minionConfiguration.name);
                        }
                    }

                }
            };
            if (config.uri) {
                components[name] = {code : config.uri};
                if (type === this.MINIONTYPES.TMIN) {
                    if (config.partner_uri)
                        components[name].partner = config.partner_uri;
                }
                fetchMinions(components).catch(function(err){return {name : components}})
                    .then(function (result) {
                        console.log(result);
                        if (result){
                            Object.keys(result[name]).forEach(function (singleComponent) {
                                config[singleComponent] = result[name][singleComponent]
                            });
                        }
                        if (config.code){
                            db_save_received_minion(_this.dbMinion, minionUser, name, type, minionOwner, config.code.toString(), config.inputs?config.inputs:1, config.partner);
                            returnToProcess(config);
                        }
                    });
            } else {
                if (config.code){
                    db_save_received_minion(_this.dbMinion, minionUser, name, type, minionOwner, config.code.toString(), config.inputs?config.inputs:1, config.partner);
                    returnToProcess(config);
                }
            }

        }

        _searchDropdown (key) {
            var input, filter, ul, li, a, i;
            input = this.dropdownSearch[key];
            filter = input.value.toUpperCase();
            var div = this.dropdown[key];
            a = div.getElementsByTagName("a");
            for (i = 0; i < a.length; i++) {
                if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                    a[i].style.display = "";
                } else {
                    a[i].style.display = "none";
                }
            }
        }

        _toggleDropdown (key) {
            this.dropdown[key].classList.toggle("hide");
        }

        initializeDropdownMenu () {
            // TODO setup this functionality
            var _this = this;
            Object.keys(this.dropdownSearch).forEach(function (key) {
                _this.dropdownSearch[key].addEventListener('keyup', function (event) {
                    _this._searchDropdown(key);
                });
            });
            Object.keys(this.dropdownToggle).forEach(function (key) {
                _this.dropdownToggle[key].addEventListener('click', function () {
                    _this._toggleDropdown(key);
                })
            });
        }

        createNewInstance(minionName, instanceOwner) {
            return this.minionObjects[minionName].createNewInstance(instanceOwner);
        }

        startMacro(macroName) {
            this.macroObjects[macroName].do();
        }

        stopMacro(macroName) {
            this.macroObjects[macroName].kill();
        }

        showMinion(minionName){
            document.getElementById(this._getButtonId(minionName) + "img").classList.add('active-minion');
            this.minionObjects[minionName].show();
        }

        hideMinion(minionName){
            document.getElementById(this._getButtonId(minionName) + "img").classList.remove('active-minion');
            this.minionObjects[minionName].hide();
        }

        killMinion(minionName) {
            this.minionObjects[minionName].killAllInstances();
        }

        _getContainerId (minionName) {
            return minionName.split(' ').join('') + 'container';
        }

        _getButtonId (minionName) {
            return minionName.split(' ').join('_') + 'Button';
        }
    }

    function fetchMinions (minionComponents, result = {}) {
        if (minionComponents && Object.keys(minionComponents).length === 0) {
            return Promise.resolve(result);
        }
        var currentMinion = Object.keys(minionComponents).pop();
        result[currentMinion] = {};
        var components = Object.keys(minionComponents[currentMinion]);
        var promises = [];
        components.forEach(function (singleComponent) {
            if(minionComponents[currentMinion][singleComponent]) {
                promises.push(fetch(minionComponents[currentMinion][singleComponent])
                    .then(function (res) {
                        return res.text()
                            .then(function (script) {
                                result[currentMinion][singleComponent] = script;
                            });
                    }));
            }
        });
        return Promise.all(promises).then(function () {
            delete minionComponents[currentMinion];
            return fetchMinions(minionComponents, result);
        });
    }

    function mergeObjects(target, source) {
        Object.keys(source).forEach(function (comp) {
            if (!target[comp]) {
                target[comp] = source[comp];
            }
        });
        return target;
    }

    /*
    Export the module for various environments.
     */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = MinionLoader;
    } else if (typeof exports !== 'undefined') {
        exports.MinionLoader = MinionLoader;
    } else if (typeof define === 'function' && define.amd) {
        define([Minion, Macro], function() {
            return MinionLoader;
        });
    } else {
        root.MinionLoader = MinionLoader;
    }
})(this);

