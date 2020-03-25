/**
 * Created by Mirco on 30.03.2017.
 */

//TODO UI redefine UI integration to aim to an integratable TUCANA lib

'use strict';

(function (root) {

    function Auth0Configurator(clientID, domain, config = {auth: {params: {scope: 'openid email'}}, closable: false}) {
        this.lock = new Auth0Lock(clientID, domain, config);
        this.id_token = localStorage.getItem('id_token');
        this.profile = JSON.parse(localStorage.getItem('profile'));
    }

    const privateFunctions = {};

    // Public functions
    Auth0Configurator.prototype.connect = function (logoutButton, username, callbackFunction) {
        this.logoutButton = logoutButton;
        this.username = username;
        this.callback = callbackFunction;

        const _this = this;
        this.lock.on('authenticated', function (authResult) {
            localStorage.setItem('id_token', authResult.idToken);
            localStorage.setItem('access_token', authResult.accessToken);
            _this.id_token = authResult.idToken;
            _this.access_token = authResult.accessToken;
            // redirect
            privateFunctions.on_logged_in(_this);
        });

        document.querySelector('#' + this.logoutButton).addEventListener('click', function (e) {
            e.preventDefault();
            privateFunctions.logout();
        });

        if (!localStorage.getItem('id_token') && !localStorage.getItem('profile')) {
            document.querySelector('main').style.visibility = 'hidden';
            this.lock.show();
        } else {
            this.id_token = localStorage.getItem('id_token');
            privateFunctions.on_logged_in(this);
        }
    };

    Auth0Configurator.prototype.getRolePermissions = function () {
        var res = {
            requested : {
                accepted : [],
                declined : [],
                pending : []
            },
            requesting : {
                accepted : [],
                declined : [],
                pending : []
            }
        };
        if (this.profile.data_requests_in) {
            for (var i = 0; i < this.profile.data_requests_in.length; i++) {
                if (this.profile.data_requests_in[i].status === 'accepted') {
                    res.requested.accepted.push(this.profile.data_requests_in[i]);
                } else if (this.profile.data_requests_in[i].status === 'declined') {
                    res.requested.declined.push(this.profile.data_requests_in[i]);
                } else if (this.profile.data_requests_in[i].status === 'pending') {
                    res.requested.pending.push(this.profile.data_requests_in[i]);
                }
            }
        }
        if (this.profile.data_requests_out) {
            for (var i = 0; i < this.profile.data_requests_out.length; i++) {
                if (this.profile.data_requests_out[i].status === 'accepted') {
                    res.requesting.accepted.push(this.profile.data_requests_out[i]);
                } else if (this.profile.data_requests_out[i].status === 'declined') {
                    res.requesting.declined.push(this.profile.data_requests_out[i]);
                } else if (this.profile.data_requests_out[i].status === 'pending') {
                    res.requesting.pending.push(this.profile.data_requests_out[i]);
                }
            }
        }
        return res;
    };

    Auth0Configurator.prototype.sendAnswer = function (origin, email, answer, callback) {
        var authorization = 'Bearer ' + this.getToken();
        var payload = {
            requestId: email,
            answer: answer
        };
        var body = {
            method: 'POST',
            headers: {
                Authorization: authorization,
                'Content-type': 'application/json'
            },
            mode: 'cors',
            cache: 'default',
            body: JSON.stringify(payload)
        };
        fetch(origin + '/answerRequest', body).then(function (response) {
            if (response.ok)
                return response.json();
        }).then(function (json) {
            callback(json.message);
        });
    };

    Auth0Configurator.prototype.updateProfile = function (callback) {
        this.setCallback(callback);
        privateFunctions.retrieve_profile(this);
    };

    Auth0Configurator.prototype.getLock = function () {
        return this.lock;
    };

    Auth0Configurator.prototype.getProfile = function () {
        return this.profile ? this.profile : JSON.parse(localStorage.getItem('profile'));
    };

    Auth0Configurator.prototype.getToken = function () {
        return this.id_token ? this.id_token : localStorage.getItem('id_token');
    };

    Auth0Configurator.prototype.setCallback = function (callback) {
        this.callback = callback;
    };

    // Private Functions
    privateFunctions.on_logged_in = function (_this) {
        privateFunctions.retrieve_profile(_this);
        document.querySelector('main').style.visibility = 'visible';
        _this.lock.hide();
    };

    privateFunctions.retrieve_profile = function (_this) {
        const access_token = localStorage.getItem('access_token');
        if (access_token) {
            _this.lock.getUserInfo(access_token, function (err, profile) {
                if (err) {
                    privateFunctions.logout();
                } else {
                    localStorage.setItem('profile', JSON.stringify(profile));
                    _this.profile = profile;
                    // Display user information
                    privateFunctions.initializeProfileView(_this, profile);
                    _this.callback();
                }
            });
        } else {
            privateFunctions.logout();
        }
    };

    privateFunctions.logout = function () {
        localStorage.removeItem('id_token');
        localStorage.removeItem('profile');
        localStorage.removeItem('access_token');
        window.location.href = window.location.origin + window.location.pathname;
    };

    privateFunctions.initializeProfileView = function (_this, profile) {
        document.getElementById(_this.username).innerHTML = profile.email;
        document.querySelector('.avatar').setAttribute('src', profile.picture);
        document.querySelector('.avatar').style.visibility = 'visible';
    };

    /*
    Export the module for various environments.
     */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Auth0Configurator;
    } else if (typeof exports !== 'undefined') {
        exports.Auth0Configurator = Auth0Configurator;
    } else if (typeof define === 'function' && define.amd) {
        define([], function() {
            return Auth0Configurator;
        });
    } else {
        root.Auth0Configurator = Auth0Configurator;
    }
}(this));