
(function (root) {

	class BrowserCheck {
		constructor (supportedBrowsers) {
			this.browsers = BrowserCheck.BROWSERS;
			this.supportedBrowsers = supportedBrowsers
		}

		checkCompatibility () {
			var _this = this;
			var supported = false;
			this.supportedBrowsers.forEach(function (browserConfig) {
				switch (browserConfig.name) {
					case _this.browsers.OPERA:
						if (_this.isOpera())
							supported = true;
						break;
					case _this.browsers.FIREFOX:
						if (_this.isFirefox())
							supported = true;
						break;
                    case _this.browsers.SAFARI:
                        if (_this.isSafari())
                            supported = true;
                        break;
                    case _this.browsers.IE:
                        if (_this.isIE())
                            supported = true;
                        break;
                    case _this.browsers.EDGE:
                        if (_this.isEdge())
                            supported = true;
                        break;
                    case _this.browsers.CHROME:
                        if (_this.isChrome(browserConfig.minVersion))
                            supported = true;
                        break;
					default:
						break;
				}
            });
			return supported;
		}

		isOpera () {
            // Opera 8.0+
            return ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0);
		}

		isFirefox () {
            // Firefox 1.0+
            return (typeof InstallTrigger !== 'undefined');
        }

        isSafari () {
            // Safari 3.0+ "[object HTMLElementConstructor]"
            return (/constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification)));
        }

        isIE () {
            // Internet Explorer 6-11
            return (/*@cc_on!@*/false || !!document.documentMode);
		}

		isEdge () {
            // Edge 20+
            return !this.isIE && !!window.StyleMedia;
		}

		isChrome (minVersion) {
            // Chrome 1+
            return (/*!!window.chrome && !!window.chrome.webstore ||*/ function (){
                var found = navigator.appVersion.match('Chrome/(([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+))');
                if(!!found){
                    var version = found[1];
                    if(found[2] >= minVersion)
                        return true;
                }
                return false;
            })();
        }

        isBlink () {
            // Blink engine detection
            return ((this.isChrome || this.isOpera) && !!window.CSS);
		}

	}
	BrowserCheck.BROWSERS = {
		OPERA : 'OPERA',
		SAFARI : 'SAFARI',
		FIREFOX : 'FIREFOX',
		IE : 'Internet Explorer',
		EDGE : 'EDGE',
		CHROME : 'CHROME'
	};

    /*
    Export the module for various environments.
     */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = BrowserCheck;
    } else if (typeof exports !== 'undefined') {
        exports.BrowserCheck = BrowserCheck;
    } else if (typeof define === 'function' && define.amd) {
        define([], function() {
            return BrowserCheck;
        });
    } else {
        root.BrowserCheck = BrowserCheck;
    }
})(this);