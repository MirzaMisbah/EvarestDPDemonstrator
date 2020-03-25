window.addEventListener('load', function(event) {
	// Add frontend objects to app object
	app.loadingSpinner = document.getElementById('spinner');
	app.mainContainer = document.querySelector('main');
	app.notificationSnackbar = document.querySelector('#notificationbar');
	
	//app.visitAppStoreButton = document.querySelector('#visit');
    app.minionSearch = {pmin: document.querySelector('#pminMinionSearch'), cmin: document.querySelector('#cminMinionSearch'), tmin : document.querySelector('#tminMinionSearch'), macro : document.querySelector('#macroMinionSearch'), gmin : document.querySelector('#gminMinionSearch')};
    app.minionDropdown = {pmin: document.querySelector('#pminMinionDropdown'), cmin: document.querySelector('#cminMinionDropdown'), tmin : document.querySelector('#tminMinionDropdown'), macro : document.querySelector('#macroMinionDropdown'), gmin : document.querySelector('#gminMinionDropdown')};
    app.minionToggle = {pmin: document.querySelector('#togglePMinions'), cmin: document.querySelector('#toggleCMinions'), tmin : document.querySelector('#toggleTMinions'), macro : document.querySelector('#toggleMacroMinions'), gmin : document.querySelector('#toggleGMinions')};
	

	// Custom elements
	app.authorizationManager = new Auth0Configurator(app.oauthClientId, app.oauthDomainName);

	// initialization function of the app shell
	app.init = function() {

		// Start the authorization service
		app.authorizationManager.connect('btn-logout', 'username', function() {
			
			// Initialize important frontend properties
			app.changeLoadingStatus();
			
			// defined in control.js
			main(app.authorizationManager);
		});
		
		
	};
	// Run the application with current settings
	app.init();
});
