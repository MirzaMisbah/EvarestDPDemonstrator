/**
 * Created by Mirco on 30.03.2017.
 */

'use strict';

define(function (require) {

    const $ = require('jquery');


    function Auth0Config(clientID, domain, config = {auth: {params: {scope: 'openid'}}, closable: false}) {
        this.lock = new Auth0Lock(clientID, domain, config);
        this.id_token = localStorage.getItem('id_token');
        this.profile = JSON.parse(localStorage.getItem('profile'));
    }

    const privateFunctions = {};

    // Public functions
    Auth0Config.prototype.connect = function (profileButton, logoutButton, username, callbackFunction) {
        this.profileButton = profileButton;
        this.logoutButton = logoutButton;
        this.username = username;
        this.callback = callbackFunction;
        const _this = this;
        $('#' + this.logoutButton).click(function (e) {
            e.preventDefault();
            privateFunctions.logout();
        });

            if (!localStorage.getItem('id_token')) {
                $('main').hide();
                $('#' + this.profileButton).hide();
                _this.lock.show();
            } else {
                privateFunctions.on_logged_in(_this);
            }
    };

    Auth0Config.prototype.setup = function () {
        const _this = this;
        this.lock.on("authenticated", function (authResult) {
            localStorage.setItem('id_token', authResult.idToken);
            localStorage.setItem('access_token', authResult.accessToken);
            _this.id_token = authResult.idToken;
            _this.access_token = authResult.accessToken;
            // redirect
            privateFunctions.on_logged_in(_this);
        });
        this.lock.on('authorization_error', function (err) {
            console.log(err);
        });
    };

    Auth0Config.prototype.getLock = function () {
        return this.lock;
    };

    // Private Functions
    privateFunctions.on_logged_in = function (_this) {
        document.getElementById(_this.profileButton).setAttribute('style', 'display: block');
        privateFunctions.retrieve_profile(_this);
        $('main').show();
        _this.lock.hide();
    };

    privateFunctions.retrieve_profile = function (_this) {
        const access_token = localStorage.getItem('access_token');
        if (access_token) {
            _this.lock.getProfile(access_token, function (err, profile) {
                if (err) {
                    privateFunctions.logout();
                } else {
                    localStorage.setItem('profile', JSON.stringify(profile));
                    // Display user information
                    privateFunctions.show_profile_info(_this, profile);
                    _this.callback();
                }
            });
        } else {
            privateFunctions.logout();
        }
    };

    privateFunctions.logout = function () {
        if (!localStorage.getItem('id_token') && localStorage.getItem('access_token')) {
            window.location.href = '/';
        } else {
            localStorage.removeItem('id_token');
            localStorage.removeItem('profile');
            localStorage.removeItem('access_token');
            window.location.href = '/';
        }
    };

    privateFunctions.show_profile_info = function (_this, profile) {
        document.getElementById(_this.username).innerHTML = profile.email;
        $('.avatar').attr('src', profile.picture).show();
    };

    return Auth0Config;

});
