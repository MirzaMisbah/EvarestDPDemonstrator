/**
 * Startup script for example application which should slowly evolve to an app framework for analysing minions
 */

'use strict';

window.addEventListener('load', function (event) {

    // Add frontend objects to app object
    app.loadingSpinner = document.getElementById('spinner');
    app.mainContainer = document.querySelector('main');
    app.notificationSnackbar = document.querySelector('#notificationbar');
    app.visitAppStoreButton = document.querySelector('#visit');
    app.shareRequestInput = document.querySelector('#shareEmail');
    app.shareRequestButton = document.querySelector('#requestEmail');
    app.calendarLink = document.querySelector('#calendarLink');
    app.calendarInputField = document.querySelector('#shareCalendar');
    app.shareCalendarButton = document.querySelector('#shareCalendarLink');

    // Initialization of all important objects of included scripts
    var authorizationManager = new Auth0Configurator(app.oauthClientId, app.oauthDomainName);


    app.initializeProfileView = function(){
        var profile = authorizationManager.getProfile();
        if (profile.email){
            document.querySelector('#user-email span input').setAttribute('value', profile.email);
        }
        var lastname = document.querySelector('#user-lastname span input');
        var prename = document.querySelector('#user-prename span input');
        var sport = document.querySelector('#user-sport span input');
        if (!profile.user_metadata){
            document.querySelector('#profile-picture').setAttribute('src', profile.picture);
            document.querySelector('#profile-picture').style.visibility = 'visible';
            if (profile.family_name) {
                lastname.setAttribute('value', profile.family_name);
            }
            if (profile.given_name) {
                prename.setAttribute('value', profile.given_name);
            }
        } else {
            if (profile.user_metadata.picture){
                document.querySelector('#profile-picture').setAttribute('src', profile.user_metadata.picture);
                document.querySelector('#profile-picture').style.visibility = 'visible';
            } else {
                document.querySelector('#profile-picture').setAttribute('src', profile.picture);
                document.querySelector('#profile-picture').style.visibility = 'visible';
            }
            if (profile.user_metadata.sport){
                sport.setAttribute('value', profile.user_metadata.sport);
            }
            if (profile.user_metadata.family_name) {
                lastname.setAttribute('value', profile.user_metadata.family_name);
            } else {
                if (profile.family_name) {
                    lastname.setAttribute('value', profile.family_name);
                }
            }
            if (profile.user_metadata.given_name) {
                prename.setAttribute('value', profile.user_metadata.given_name);
            } else {
                if (profile.given_name) {
                    prename.setAttribute('value', profile.given_name);
                }
            }
        }
        var temp = new MaterialTextfield(document.querySelector('#user-sport div'));
        temp = new MaterialTextfield(document.querySelector('#user-email div'));
        temp = new MaterialTextfield(document.querySelector('#user-lastname div'));
        temp = new MaterialTextfield(document.querySelector('#user-prename div'));
        document.querySelector('#user-sport').style.visibility = 'visible';
        document.querySelector('#user-email').style.visibility = 'visible';
        document.querySelector('#user-lastname').style.visibility = 'visible';
        document.querySelector('#user-prename').style.visibility = 'visible';

        document.querySelector('#edit').addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector('#btn1').style.visibility = 'hidden';
            document.querySelector('#submit-profile').style.visibility = 'visible';
            document.querySelector('#user-sport input').removeAttribute('readonly');
            document.querySelector('#user-lastname input').removeAttribute('readonly');
            document.querySelector('#user-prename input').removeAttribute('readonly');
        });

        document.querySelector('#submit-profile').addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector('#user-sport input').setAttribute('readonly', 'true');
            document.querySelector('#user-lastname input').setAttribute('readonly', 'true');
            document.querySelector('#user-prename input').setAttribute('readonly','true');
            var authorization = 'Bearer ' + authorizationManager.getToken();
            var userMetadata = {};
            if (profile.user_metadata){
                userMetadata = profile.user_metadata;
            }
            userMetadata.family_name = lastname.value;
            userMetadata.given_name = prename.value;
            userMetadata.sport = sport.value;

            var payload = {
                user_metadata : userMetadata
            };
            var data = {
                method: 'PATCH',
                headers: {
                    Authorization : authorization,
                    'Content-type' : 'application/json'
                },
                mode: 'cors',
                cache: 'default',
                body : JSON.stringify(payload)
            };
            var url = "https://app-iss.eu.auth0.com/api/v2/users/" + profile.user_id;

            fetch(url, data)
                .then(function (res) {
                    app.showNotification('Successfully updated user profile');
                });
            document.querySelector('#submit-profile').style.visibility = 'hidden';
            document.querySelector('#btn1').style.visibility = 'visible';

        })
    };

    app.initializeRoleManagementView = function () {
        authorizationManager.updateProfile(function () {
            var sharedRessources = authorizationManager.getRolePermissions();
            app._createSharingPermissionTable('requested-pending', sharedRessources.requested.pending, true);
            app._createSharingPermissionTable('requested', sharedRessources.requested.accepted.concat(sharedRessources.requested.declined), true);
            app._createSharingPermissionTable('requesting', sharedRessources.requesting.accepted.concat(sharedRessources.requesting.declined).concat(sharedRessources.requesting.pending), false);
        });
    };

    app.initializeCalendarView = function () {
        if (authorizationManager.getProfile().user_metadata && authorizationManager.getProfile().user_metadata.calendarURL) {
            app.refreshCalendarLink(false);
        }
    };

    app.refreshCalendarLink = function (update) {
        app.changeLoadingStatus();
        var callback = function () {
            app.changeLoadingStatus();
            if (authorizationManager.getProfile().user_metadata && authorizationManager.getProfile().user_metadata.calendarURL) {
                while (app.calendarLink.firstChild) {
                    app.calendarLink.removeChild(app.calendarLink.firstChild);
                }
                app.calendarLink.innerHTML = '<a href="' + authorizationManager.getProfile().user_metadata.calendarURL + '" target="_blank" style="font-size: large;">' + authorizationManager.getProfile().user_metadata.calendarURL + '</a>';
            }
        };
        if (update)
            authorizationManager.updateProfile(callback);
        else
            callback();
    };

    app._createSharingPermissionTable = function (tableId, sharingOptions, withButtons) {
        var container = document.querySelector('#' + tableId + '-container');
        var tbody = document.querySelector('#' + tableId + ' tbody');
        tbody.innerHTML = '';
        if (sharingOptions && sharingOptions.length > 0){
            container.style.display = 'block';
            for (var i = 0; i < sharingOptions.length; i++) {
                var email = sharingOptions[i].email;

                var status = sharingOptions[i].status;
                var id = email.split('.').join('').split('@').join('');


                var htmlCode = '<tr id="' + id + '">' +
                    '  <td class="mdl-data-table__cell--non-numeric">' + email + '</td>' +
                    '  <td class="mdl-data-table__cell--non-numeric">' + status + '</td>';
                if (withButtons) {
                    var buttonCodeAccept = '<button id="' + id + 'Accept" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"  data-ref="' + email + '">' +
                        'Accept' +
                        '</button>';
                    var buttonCodeDecline = '<button id="' + id + 'Decline" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"  data-ref="' + email + '">' +
                        'Decline' +
                        '</button>';

                    htmlCode += '  <td class="mdl-data-table__cell--non-numeric">' + buttonCodeAccept + '</td>' +
                        '  <td class="mdl-data-table__cell--non-numeric">' + buttonCodeDecline + '</td>';
                }
                htmlCode += '</tr>';
                tbody.innerHTML += htmlCode;
            }
            if (withButtons){
                for (var i = 0; i < tbody.childNodes.length; i++) {
                    var identity = tbody.childNodes[i].id;
                    if (identity){
                        document.querySelector('#' + identity + 'Accept').addEventListener('click', (function (e) {
                            e.preventDefault();
                            app._share(e.target.getAttribute('data-ref'), 'accepted');
                        }));
                        document.querySelector('#' + identity + 'Decline').addEventListener('click', (function (e) {
                            app._share(e.target.getAttribute('data-ref'), 'declined');
                        }));
                    }
                }
            }
        } else {
            container.style.display = 'none';
        }
    };

    app._initializeShareRequest = function () {
        var input = app.shareRequestInput.value;
        if (input === ''){
            app.showNotification('Please enter an email adress!');
            return;
        }
        else if (app._validateEmail(input)){
            app.changeLoadingStatus();
            var authorization = 'Bearer ' + authorizationManager.getToken();
            var payload = {
                requestId : input
            };
            var data = { method: 'POST',
                headers: {
                    Authorization : authorization,
                    'Content-type' : 'application/json'
                },
                mode: 'cors',
                cache: 'default',
                body : JSON.stringify(payload)
            };
            fetch(app.syncApiAdress + '/requestAccess', data).then(function (response) {
                if(response.ok)
                    return response.json();
            }).then(function (json) {
                app.changeLoadingStatus();
                app.showNotification(json.message);
                app.initializeRoleManagementView();
            }).catch(function (err) {
                app.changeLoadingStatus();
            });
        } else {
            app.showNotification('Please type in email adress correctly!');
            return;
        }
    };

    app._validateEmail = function (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    app._share = function (email, answer) {
        var authorization = 'Bearer ' + authorizationManager.getToken();
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
        fetch(app.syncApiAdress + '/answerRequest', body).then(function (response) {
            if (response.ok)
                return response.json();
        }).then(function (json) {
            app.showNotification(json.message);
            app.initializeRoleManagementView();
        });
    };

    app._updateCalendarURL = function (calURL) {
        if (calURL && calURL !== '') {
            var authorization = 'Bearer ' + authorizationManager.getToken();
            var payload = {
                calendarURL: calURL
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
            fetch(app.syncApiAdress + '/shareCalendar', body).then(function (response) {
                if (response.ok)
                    return response.json();
            }).then(function (json) {
                app.showNotification(json.message);
                app.refreshCalendarLink(true);
            });
        } else {
            app.showNotification('Please enter a correct url string');
            return;
        }
    };

    // initialization function of the app shell
    app.init = function () {

        app.shareRequestButton.addEventListener('click', function (event) {
            app._initializeShareRequest();
        });

        app.shareCalendarButton.addEventListener('click', function () {
            app._updateCalendarURL(app.calendarInputField.value);
        });

        document.querySelector('#tab-profile-information').addEventListener('click', function (event) {
            app.initializeRoleManagementView();
        });


        // Start the authorization service
        authorizationManager.connect('btn-logout', 'username', function () {
            // Initialize important frontend properties
            app.changeLoadingStatus();
            app.initializeProfileView();
            app.initializeRoleManagementView();
            app.initializeCalendarView();
        });
    };

    // Run the application with current settings
    app.init();
});