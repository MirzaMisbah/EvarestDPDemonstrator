(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.tucana = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*
* Fingerprintjs2 2.0.5 - Modern & flexible browser fingerprint library v2
* https://github.com/Valve/fingerprintjs2
* Copyright (c) 2015 Valentin Vasilyev (valentin.vasilyev@outlook.com)
* Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
* AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
* ARE DISCLAIMED. IN NO EVENT SHALL VALENTIN VASILYEV BE LIABLE FOR ANY
* DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
* LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
* ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
* THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/* global define */
(function (name, context, definition) {
  'use strict'
  if (typeof window !== 'undefined' && typeof define === 'function' && define.amd) { define(definition) } else if (typeof module !== 'undefined' && module.exports) { module.exports = definition() } else if (context.exports) { context.exports = definition() } else { context[name] = definition() }
})('Fingerprint2', this, function () {
  'use strict'

/// MurmurHash3 related functions

//
// Given two 64bit ints (as an array of two 32bit ints) returns the two
// added together as a 64bit int (as an array of two 32bit ints).
//
  var x64Add = function (m, n) {
    m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff]
    n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff]
    var o = [0, 0, 0, 0]
    o[3] += m[3] + n[3]
    o[2] += o[3] >>> 16
    o[3] &= 0xffff
    o[2] += m[2] + n[2]
    o[1] += o[2] >>> 16
    o[2] &= 0xffff
    o[1] += m[1] + n[1]
    o[0] += o[1] >>> 16
    o[1] &= 0xffff
    o[0] += m[0] + n[0]
    o[0] &= 0xffff
    return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]]
  }

//
// Given two 64bit ints (as an array of two 32bit ints) returns the two
// multiplied together as a 64bit int (as an array of two 32bit ints).
//
  var x64Multiply = function (m, n) {
    m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff]
    n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff]
    var o = [0, 0, 0, 0]
    o[3] += m[3] * n[3]
    o[2] += o[3] >>> 16
    o[3] &= 0xffff
    o[2] += m[2] * n[3]
    o[1] += o[2] >>> 16
    o[2] &= 0xffff
    o[2] += m[3] * n[2]
    o[1] += o[2] >>> 16
    o[2] &= 0xffff
    o[1] += m[1] * n[3]
    o[0] += o[1] >>> 16
    o[1] &= 0xffff
    o[1] += m[2] * n[2]
    o[0] += o[1] >>> 16
    o[1] &= 0xffff
    o[1] += m[3] * n[1]
    o[0] += o[1] >>> 16
    o[1] &= 0xffff
    o[0] += (m[0] * n[3]) + (m[1] * n[2]) + (m[2] * n[1]) + (m[3] * n[0])
    o[0] &= 0xffff
    return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]]
  }
//
// Given a 64bit int (as an array of two 32bit ints) and an int
// representing a number of bit positions, returns the 64bit int (as an
// array of two 32bit ints) rotated left by that number of positions.
//
  var x64Rotl = function (m, n) {
    n %= 64
    if (n === 32) {
      return [m[1], m[0]]
    } else if (n < 32) {
      return [(m[0] << n) | (m[1] >>> (32 - n)), (m[1] << n) | (m[0] >>> (32 - n))]
    } else {
      n -= 32
      return [(m[1] << n) | (m[0] >>> (32 - n)), (m[0] << n) | (m[1] >>> (32 - n))]
    }
  }
//
// Given a 64bit int (as an array of two 32bit ints) and an int
// representing a number of bit positions, returns the 64bit int (as an
// array of two 32bit ints) shifted left by that number of positions.
//
  var x64LeftShift = function (m, n) {
    n %= 64
    if (n === 0) {
      return m
    } else if (n < 32) {
      return [(m[0] << n) | (m[1] >>> (32 - n)), m[1] << n]
    } else {
      return [m[1] << (n - 32), 0]
    }
  }
//
// Given two 64bit ints (as an array of two 32bit ints) returns the two
// xored together as a 64bit int (as an array of two 32bit ints).
//
  var x64Xor = function (m, n) {
    return [m[0] ^ n[0], m[1] ^ n[1]]
  }
//
// Given a block, returns murmurHash3's final x64 mix of that block.
// (`[0, h[0] >>> 1]` is a 33 bit unsigned right shift. This is the
// only place where we need to right shift 64bit ints.)
//
  var x64Fmix = function (h) {
    h = x64Xor(h, [0, h[0] >>> 1])
    h = x64Multiply(h, [0xff51afd7, 0xed558ccd])
    h = x64Xor(h, [0, h[0] >>> 1])
    h = x64Multiply(h, [0xc4ceb9fe, 0x1a85ec53])
    h = x64Xor(h, [0, h[0] >>> 1])
    return h
  }

//
// Given a string and an optional seed as an int, returns a 128 bit
// hash using the x64 flavor of MurmurHash3, as an unsigned hex.
//
  var x64hash128 = function (key, seed) {
    key = key || ''
    seed = seed || 0
    var remainder = key.length % 16
    var bytes = key.length - remainder
    var h1 = [0, seed]
    var h2 = [0, seed]
    var k1 = [0, 0]
    var k2 = [0, 0]
    var c1 = [0x87c37b91, 0x114253d5]
    var c2 = [0x4cf5ad43, 0x2745937f]
    for (var i = 0; i < bytes; i = i + 16) {
      k1 = [((key.charCodeAt(i + 4) & 0xff)) | ((key.charCodeAt(i + 5) & 0xff) << 8) | ((key.charCodeAt(i + 6) & 0xff) << 16) | ((key.charCodeAt(i + 7) & 0xff) << 24), ((key.charCodeAt(i) & 0xff)) | ((key.charCodeAt(i + 1) & 0xff) << 8) | ((key.charCodeAt(i + 2) & 0xff) << 16) | ((key.charCodeAt(i + 3) & 0xff) << 24)]
      k2 = [((key.charCodeAt(i + 12) & 0xff)) | ((key.charCodeAt(i + 13) & 0xff) << 8) | ((key.charCodeAt(i + 14) & 0xff) << 16) | ((key.charCodeAt(i + 15) & 0xff) << 24), ((key.charCodeAt(i + 8) & 0xff)) | ((key.charCodeAt(i + 9) & 0xff) << 8) | ((key.charCodeAt(i + 10) & 0xff) << 16) | ((key.charCodeAt(i + 11) & 0xff) << 24)]
      k1 = x64Multiply(k1, c1)
      k1 = x64Rotl(k1, 31)
      k1 = x64Multiply(k1, c2)
      h1 = x64Xor(h1, k1)
      h1 = x64Rotl(h1, 27)
      h1 = x64Add(h1, h2)
      h1 = x64Add(x64Multiply(h1, [0, 5]), [0, 0x52dce729])
      k2 = x64Multiply(k2, c2)
      k2 = x64Rotl(k2, 33)
      k2 = x64Multiply(k2, c1)
      h2 = x64Xor(h2, k2)
      h2 = x64Rotl(h2, 31)
      h2 = x64Add(h2, h1)
      h2 = x64Add(x64Multiply(h2, [0, 5]), [0, 0x38495ab5])
    }
    k1 = [0, 0]
    k2 = [0, 0]
    switch (remainder) {
      case 15:
        k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 14)], 48))
      // fallthrough
      case 14:
        k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 13)], 40))
      // fallthrough
      case 13:
        k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 12)], 32))
      // fallthrough
      case 12:
        k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 11)], 24))
      // fallthrough
      case 11:
        k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 10)], 16))
      // fallthrough
      case 10:
        k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 9)], 8))
      // fallthrough
      case 9:
        k2 = x64Xor(k2, [0, key.charCodeAt(i + 8)])
        k2 = x64Multiply(k2, c2)
        k2 = x64Rotl(k2, 33)
        k2 = x64Multiply(k2, c1)
        h2 = x64Xor(h2, k2)
      // fallthrough
      case 8:
        k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 7)], 56))
      // fallthrough
      case 7:
        k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 6)], 48))
      // fallthrough
      case 6:
        k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 5)], 40))
      // fallthrough
      case 5:
        k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 4)], 32))
      // fallthrough
      case 4:
        k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 3)], 24))
      // fallthrough
      case 3:
        k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 2)], 16))
      // fallthrough
      case 2:
        k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 1)], 8))
      // fallthrough
      case 1:
        k1 = x64Xor(k1, [0, key.charCodeAt(i)])
        k1 = x64Multiply(k1, c1)
        k1 = x64Rotl(k1, 31)
        k1 = x64Multiply(k1, c2)
        h1 = x64Xor(h1, k1)
      // fallthrough
    }
    h1 = x64Xor(h1, [0, key.length])
    h2 = x64Xor(h2, [0, key.length])
    h1 = x64Add(h1, h2)
    h2 = x64Add(h2, h1)
    h1 = x64Fmix(h1)
    h2 = x64Fmix(h2)
    h1 = x64Add(h1, h2)
    h2 = x64Add(h2, h1)
    return ('00000000' + (h1[0] >>> 0).toString(16)).slice(-8) + ('00000000' + (h1[1] >>> 0).toString(16)).slice(-8) + ('00000000' + (h2[0] >>> 0).toString(16)).slice(-8) + ('00000000' + (h2[1] >>> 0).toString(16)).slice(-8)
  }

  var defaultOptions = {
    preprocessor: null,
    audio: {
      timeout: 1000,
        // On iOS 11, audio context can only be used in response to user interaction.
        // We require users to explicitly enable audio fingerprinting on iOS 11.
        // See https://stackoverflow.com/questions/46363048/onaudioprocess-not-called-on-ios11#46534088
      excludeIOS11: true
    },
    fonts: {
      swfContainerId: 'fingerprintjs2',
      swfPath: 'flash/compiled/FontList.swf',
      userDefinedFonts: [],
      extendedJsFonts: false
    },
    screen: {
       // To ensure consistent fingerprints when users rotate their mobile devices
      detectScreenOrientation: true
    },
    plugins: {
      sortPluginsFor: [/palemoon/i],
      excludeIE: false
    },
    extraComponents: [],
    excludes: {
      // Unreliable on Windows, see https://github.com/Valve/fingerprintjs2/issues/375
      'enumerateDevices': true,
      // devicePixelRatio depends on browser zoom, and it's impossible to detect browser zoom
      'pixelRatio': true,
      // DNT depends on incognito mode for some browsers (Chrome) and it's impossible to detect incognito mode
      'doNotTrack': true,
      // uses js fonts already
      'fontsFlash': true
    },
    NOT_AVAILABLE: 'not available',
    ERROR: 'error',
    EXCLUDED: 'excluded'
  }

  var each = function (obj, iterator) {
    if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
      obj.forEach(iterator)
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        iterator(obj[i], i, obj)
      }
    } else {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          iterator(obj[key], key, obj)
        }
      }
    }
  }

  var map = function (obj, iterator) {
    var results = []
    // Not using strict equality so that this acts as a
    // shortcut to checking for `null` and `undefined`.
    if (obj == null) {
      return results
    }
    if (Array.prototype.map && obj.map === Array.prototype.map) { return obj.map(iterator) }
    each(obj, function (value, index, list) {
      results.push(iterator(value, index, list))
    })
    return results
  }

  var extendSoft = function (target, source) {
    if (source == null) { return target }
    var value
    var key
    for (key in source) {
      value = source[key]
      if (value != null && !(Object.prototype.hasOwnProperty.call(target, key))) {
        target[key] = value
      }
    }
    return target
  }

// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
  var enumerateDevicesKey = function (done, options) {
    if (!isEnumerateDevicesSupported()) {
      return done(options.NOT_AVAILABLE)
    }
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
      done(devices.map(function (device) {
        return 'id=' + device.deviceId + ';gid=' + device.groupId + ';' + device.kind + ';' + device.label
      }))
    })
      .catch(function (error) {
        done(error)
      })
  }

  var isEnumerateDevicesSupported = function () {
    return (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices)
  }
// Inspired by and based on https://github.com/cozylife/audio-fingerprint
  var audioKey = function (done, options) {
    var audioOptions = options.audio
    if (audioOptions.excludeIOS11 && navigator.userAgent.match(/OS 11.+Version\/11.+Safari/)) {
        // See comment for excludeUserAgent and https://stackoverflow.com/questions/46363048/onaudioprocess-not-called-on-ios11#46534088
      return done(options.EXCLUDED)
    }

    var AudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext

    if (AudioContext == null) {
      return done(options.NOT_AVAILABLE)
    }

    var context = new AudioContext(1, 44100, 44100)

    var oscillator = context.createOscillator()
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(10000, context.currentTime)

    var compressor = context.createDynamicsCompressor()
    each([
        ['threshold', -50],
        ['knee', 40],
        ['ratio', 12],
        ['reduction', -20],
        ['attack', 0],
        ['release', 0.25]
    ], function (item) {
      if (compressor[item[0]] !== undefined && typeof compressor[item[0]].setValueAtTime === 'function') {
        compressor[item[0]].setValueAtTime(item[1], context.currentTime)
      }
    })

    oscillator.connect(compressor)
    compressor.connect(context.destination)
    oscillator.start(0)
    context.startRendering()

    var audioTimeoutId = setTimeout(function () {
      console.warn('Audio fingerprint timed out. Please report bug at https://github.com/Valve/fingerprintjs2 with your user agent: "' + navigator.userAgent + '".')
      context.oncomplete = function () {}
      context = null
      return done('audioTimeout')
    }, audioOptions.timeout)

    context.oncomplete = function (event) {
      var fingerprint
      try {
        clearTimeout(audioTimeoutId)
        fingerprint = event.renderedBuffer.getChannelData(0)
            .slice(4500, 5000)
            .reduce(function (acc, val) { return acc + Math.abs(val) }, 0)
            .toString()
        oscillator.disconnect()
        compressor.disconnect()
      } catch (error) {
        done(error)
        return
      }
      done(fingerprint)
    }
  }
  var UserAgent = function (done) {
    done(navigator.userAgent)
  }
  var languageKey = function (done, options) {
    done(navigator.language || navigator.userLanguage || navigator.browserLanguage || navigator.systemLanguage || options.NOT_AVAILABLE)
  }
  var colorDepthKey = function (done, options) {
    done(window.screen.colorDepth || options.NOT_AVAILABLE)
  }
  var deviceMemoryKey = function (done, options) {
    done(navigator.deviceMemory || options.NOT_AVAILABLE)
  }
  var pixelRatioKey = function (done, options) {
    done(window.devicePixelRatio || options.NOT_AVAILABLE)
  }
  var screenResolutionKey = function (done, options) {
    done(getScreenResolution(options))
  }
  var getScreenResolution = function (options) {
    var resolution = [window.screen.width, window.screen.height]
    if (options.screen.detectScreenOrientation) {
      resolution.sort().reverse()
    }
    return resolution
  }
  var availableScreenResolutionKey = function (done, options) {
    done(getAvailableScreenResolution(options))
  }
  var getAvailableScreenResolution = function (options) {
    if (window.screen.availWidth && window.screen.availHeight) {
      var available = [window.screen.availHeight, window.screen.availWidth]
      if (options.screen.detectScreenOrientation) {
        available.sort().reverse()
      }
      return available
    }
    // headless browsers
    return options.NOT_AVAILABLE
  }
  var timezoneOffset = function (done) {
    done(new Date().getTimezoneOffset())
  }
  var timezone = function (done, options) {
    if (window.Intl && window.Intl.DateTimeFormat) {
      done(new window.Intl.DateTimeFormat().resolvedOptions().timeZone)
      return
    }
    done(options.NOT_AVAILABLE)
  }
  var sessionStorageKey = function (done, options) {
    done(hasSessionStorage(options))
  }
  var localStorageKey = function (done, options) {
    done(hasLocalStorage(options))
  }
  var indexedDbKey = function (done, options) {
    done(hasIndexedDB(options))
  }
  var addBehaviorKey = function (done) {
      // body might not be defined at this point or removed programmatically
    done(!!(document.body && document.body.addBehavior))
  }
  var openDatabaseKey = function (done) {
    done(!!window.openDatabase)
  }
  var cpuClassKey = function (done, options) {
    done(getNavigatorCpuClass(options))
  }
  var platformKey = function (done, options) {
    done(getNavigatorPlatform(options))
  }
  var doNotTrackKey = function (done, options) {
    done(getDoNotTrack(options))
  }
  var canvasKey = function (done, options) {
    if (isCanvasSupported()) {
      done(getCanvasFp(options))
      return
    }
    done(options.NOT_AVAILABLE)
  }
  var webglKey = function (done, options) {
    if (isWebGlSupported()) {
      done(getWebglFp())
      return
    }
    done(options.NOT_AVAILABLE)
  }
  var webglVendorAndRendererKey = function (done) {
    if (isWebGlSupported()) {
      done(getWebglVendorAndRenderer())
      return
    }
    done()
  }
  var adBlockKey = function (done) {
    done(getAdBlock())
  }
  var hasLiedLanguagesKey = function (done) {
    done(getHasLiedLanguages())
  }
  var hasLiedResolutionKey = function (done) {
    done(getHasLiedResolution())
  }
  var hasLiedOsKey = function (done) {
    done(getHasLiedOs())
  }
  var hasLiedBrowserKey = function (done) {
    done(getHasLiedBrowser())
  }
// flash fonts (will increase fingerprinting time 20X to ~ 130-150ms)
  var flashFontsKey = function (done, options) {
    // we do flash if swfobject is loaded
    if (!hasSwfObjectLoaded()) {
      return done('swf object not loaded')
    }
    if (!hasMinFlashInstalled()) {
      return done('flash not installed')
    }
    if (!options.fonts.swfPath) {
      return done('missing options.fonts.swfPath')
    }
    loadSwfAndDetectFonts(function (fonts) {
      done(fonts)
    }, options)
  }
// kudos to http://www.lalit.org/lab/javascript-css-font-detect/
  var jsFontsKey = function (done, options) {
      // a font will be compared against all the three default fonts.
      // and if it doesn't match all 3 then that font is not available.
    var baseFonts = ['monospace', 'sans-serif', 'serif']

    var fontList = [
      'Andale Mono', 'Arial', 'Arial Black', 'Arial Hebrew', 'Arial MT', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS',
      'Bitstream Vera Sans Mono', 'Book Antiqua', 'Bookman Old Style',
      'Calibri', 'Cambria', 'Cambria Math', 'Century', 'Century Gothic', 'Century Schoolbook', 'Comic Sans', 'Comic Sans MS', 'Consolas', 'Courier', 'Courier New',
      'Geneva', 'Georgia',
      'Helvetica', 'Helvetica Neue',
      'Impact',
      'Lucida Bright', 'Lucida Calligraphy', 'Lucida Console', 'Lucida Fax', 'LUCIDA GRANDE', 'Lucida Handwriting', 'Lucida Sans', 'Lucida Sans Typewriter', 'Lucida Sans Unicode',
      'Microsoft Sans Serif', 'Monaco', 'Monotype Corsiva', 'MS Gothic', 'MS Outlook', 'MS PGothic', 'MS Reference Sans Serif', 'MS Sans Serif', 'MS Serif', 'MYRIAD', 'MYRIAD PRO',
      'Palatino', 'Palatino Linotype',
      'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Light', 'Segoe UI Semibold', 'Segoe UI Symbol',
      'Tahoma', 'Times', 'Times New Roman', 'Times New Roman PS', 'Trebuchet MS',
      'Verdana', 'Wingdings', 'Wingdings 2', 'Wingdings 3'
    ]

    if (options.fonts.extendedJsFonts) {
      var extendedFontList = [
        'Abadi MT Condensed Light', 'Academy Engraved LET', 'ADOBE CASLON PRO', 'Adobe Garamond', 'ADOBE GARAMOND PRO', 'Agency FB', 'Aharoni', 'Albertus Extra Bold', 'Albertus Medium', 'Algerian', 'Amazone BT', 'American Typewriter',
        'American Typewriter Condensed', 'AmerType Md BT', 'Andalus', 'Angsana New', 'AngsanaUPC', 'Antique Olive', 'Aparajita', 'Apple Chancery', 'Apple Color Emoji', 'Apple SD Gothic Neo', 'Arabic Typesetting', 'ARCHER',
        'ARNO PRO', 'Arrus BT', 'Aurora Cn BT', 'AvantGarde Bk BT', 'AvantGarde Md BT', 'AVENIR', 'Ayuthaya', 'Bandy', 'Bangla Sangam MN', 'Bank Gothic', 'BankGothic Md BT', 'Baskerville',
        'Baskerville Old Face', 'Batang', 'BatangChe', 'Bauer Bodoni', 'Bauhaus 93', 'Bazooka', 'Bell MT', 'Bembo', 'Benguiat Bk BT', 'Berlin Sans FB', 'Berlin Sans FB Demi', 'Bernard MT Condensed', 'BernhardFashion BT', 'BernhardMod BT', 'Big Caslon', 'BinnerD',
        'Blackadder ITC', 'BlairMdITC TT', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bodoni MT', 'Bodoni MT Black', 'Bodoni MT Condensed', 'Bodoni MT Poster Compressed',
        'Bookshelf Symbol 7', 'Boulder', 'Bradley Hand', 'Bradley Hand ITC', 'Bremen Bd BT', 'Britannic Bold', 'Broadway', 'Browallia New', 'BrowalliaUPC', 'Brush Script MT', 'Californian FB', 'Calisto MT', 'Calligrapher', 'Candara',
        'CaslonOpnface BT', 'Castellar', 'Centaur', 'Cezanne', 'CG Omega', 'CG Times', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charlesworth', 'Charter Bd BT', 'Charter BT', 'Chaucer',
        'ChelthmITC Bk BT', 'Chiller', 'Clarendon', 'Clarendon Condensed', 'CloisterBlack BT', 'Cochin', 'Colonna MT', 'Constantia', 'Cooper Black', 'Copperplate', 'Copperplate Gothic', 'Copperplate Gothic Bold',
        'Copperplate Gothic Light', 'CopperplGoth Bd BT', 'Corbel', 'Cordia New', 'CordiaUPC', 'Cornerstone', 'Coronet', 'Cuckoo', 'Curlz MT', 'DaunPenh', 'Dauphin', 'David', 'DB LCD Temp', 'DELICIOUS', 'Denmark',
        'DFKai-SB', 'Didot', 'DilleniaUPC', 'DIN', 'DokChampa', 'Dotum', 'DotumChe', 'Ebrima', 'Edwardian Script ITC', 'Elephant', 'English 111 Vivace BT', 'Engravers MT', 'EngraversGothic BT', 'Eras Bold ITC', 'Eras Demi ITC', 'Eras Light ITC', 'Eras Medium ITC',
        'EucrosiaUPC', 'Euphemia', 'Euphemia UCAS', 'EUROSTILE', 'Exotc350 Bd BT', 'FangSong', 'Felix Titling', 'Fixedsys', 'FONTIN', 'Footlight MT Light', 'Forte',
        'FrankRuehl', 'Fransiscan', 'Freefrm721 Blk BT', 'FreesiaUPC', 'Freestyle Script', 'French Script MT', 'FrnkGothITC Bk BT', 'Fruitger', 'FRUTIGER',
        'Futura', 'Futura Bk BT', 'Futura Lt BT', 'Futura Md BT', 'Futura ZBlk BT', 'FuturaBlack BT', 'Gabriola', 'Galliard BT', 'Gautami', 'Geeza Pro', 'Geometr231 BT', 'Geometr231 Hv BT', 'Geometr231 Lt BT', 'GeoSlab 703 Lt BT',
        'GeoSlab 703 XBd BT', 'Gigi', 'Gill Sans', 'Gill Sans MT', 'Gill Sans MT Condensed', 'Gill Sans MT Ext Condensed Bold', 'Gill Sans Ultra Bold', 'Gill Sans Ultra Bold Condensed', 'Gisha', 'Gloucester MT Extra Condensed', 'GOTHAM', 'GOTHAM BOLD',
        'Goudy Old Style', 'Goudy Stout', 'GoudyHandtooled BT', 'GoudyOLSt BT', 'Gujarati Sangam MN', 'Gulim', 'GulimChe', 'Gungsuh', 'GungsuhChe', 'Gurmukhi MN', 'Haettenschweiler', 'Harlow Solid Italic', 'Harrington', 'Heather', 'Heiti SC', 'Heiti TC', 'HELV',
        'Herald', 'High Tower Text', 'Hiragino Kaku Gothic ProN', 'Hiragino Mincho ProN', 'Hoefler Text', 'Humanst 521 Cn BT', 'Humanst521 BT', 'Humanst521 Lt BT', 'Imprint MT Shadow', 'Incised901 Bd BT', 'Incised901 BT',
        'Incised901 Lt BT', 'INCONSOLATA', 'Informal Roman', 'Informal011 BT', 'INTERSTATE', 'IrisUPC', 'Iskoola Pota', 'JasmineUPC', 'Jazz LET', 'Jenson', 'Jester', 'Jokerman', 'Juice ITC', 'Kabel Bk BT', 'Kabel Ult BT', 'Kailasa', 'KaiTi', 'Kalinga', 'Kannada Sangam MN',
        'Kartika', 'Kaufmann Bd BT', 'Kaufmann BT', 'Khmer UI', 'KodchiangUPC', 'Kokila', 'Korinna BT', 'Kristen ITC', 'Krungthep', 'Kunstler Script', 'Lao UI', 'Latha', 'Leelawadee', 'Letter Gothic', 'Levenim MT', 'LilyUPC', 'Lithograph', 'Lithograph Light', 'Long Island',
        'Lydian BT', 'Magneto', 'Maiandra GD', 'Malayalam Sangam MN', 'Malgun Gothic',
        'Mangal', 'Marigold', 'Marion', 'Marker Felt', 'Market', 'Marlett', 'Matisse ITC', 'Matura MT Script Capitals', 'Meiryo', 'Meiryo UI', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Tai Le',
        'Microsoft Uighur', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU', 'MingLiU_HKSCS', 'MingLiU_HKSCS-ExtB', 'MingLiU-ExtB', 'Minion', 'Minion Pro', 'Miriam', 'Miriam Fixed', 'Mistral', 'Modern', 'Modern No. 20', 'Mona Lisa Solid ITC TT', 'Mongolian Baiti',
        'MONO', 'MoolBoran', 'Mrs Eaves', 'MS LineDraw', 'MS Mincho', 'MS PMincho', 'MS Reference Specialty', 'MS UI Gothic', 'MT Extra', 'MUSEO', 'MV Boli',
        'Nadeem', 'Narkisim', 'NEVIS', 'News Gothic', 'News GothicMT', 'NewsGoth BT', 'Niagara Engraved', 'Niagara Solid', 'Noteworthy', 'NSimSun', 'Nyala', 'OCR A Extended', 'Old Century', 'Old English Text MT', 'Onyx', 'Onyx BT', 'OPTIMA', 'Oriya Sangam MN',
        'OSAKA', 'OzHandicraft BT', 'Palace Script MT', 'Papyrus', 'Parchment', 'Party LET', 'Pegasus', 'Perpetua', 'Perpetua Titling MT', 'PetitaBold', 'Pickwick', 'Plantagenet Cherokee', 'Playbill', 'PMingLiU', 'PMingLiU-ExtB',
        'Poor Richard', 'Poster', 'PosterBodoni BT', 'PRINCETOWN LET', 'Pristina', 'PTBarnum BT', 'Pythagoras', 'Raavi', 'Rage Italic', 'Ravie', 'Ribbon131 Bd BT', 'Rockwell', 'Rockwell Condensed', 'Rockwell Extra Bold', 'Rod', 'Roman', 'Sakkal Majalla',
        'Santa Fe LET', 'Savoye LET', 'Sceptre', 'Script', 'Script MT Bold', 'SCRIPTINA', 'Serifa', 'Serifa BT', 'Serifa Th BT', 'ShelleyVolante BT', 'Sherwood',
        'Shonar Bangla', 'Showcard Gothic', 'Shruti', 'Signboard', 'SILKSCREEN', 'SimHei', 'Simplified Arabic', 'Simplified Arabic Fixed', 'SimSun', 'SimSun-ExtB', 'Sinhala Sangam MN', 'Sketch Rockwell', 'Skia', 'Small Fonts', 'Snap ITC', 'Snell Roundhand', 'Socket',
        'Souvenir Lt BT', 'Staccato222 BT', 'Steamer', 'Stencil', 'Storybook', 'Styllo', 'Subway', 'Swis721 BlkEx BT', 'Swiss911 XCm BT', 'Sylfaen', 'Synchro LET', 'System', 'Tamil Sangam MN', 'Technical', 'Teletype', 'Telugu Sangam MN', 'Tempus Sans ITC',
        'Terminal', 'Thonburi', 'Traditional Arabic', 'Trajan', 'TRAJAN PRO', 'Tristan', 'Tubular', 'Tunga', 'Tw Cen MT', 'Tw Cen MT Condensed', 'Tw Cen MT Condensed Extra Bold',
        'TypoUpright BT', 'Unicorn', 'Univers', 'Univers CE 55 Medium', 'Univers Condensed', 'Utsaah', 'Vagabond', 'Vani', 'Vijaya', 'Viner Hand ITC', 'VisualUI', 'Vivaldi', 'Vladimir Script', 'Vrinda', 'Westminster', 'WHITNEY', 'Wide Latin',
        'ZapfEllipt BT', 'ZapfHumnst BT', 'ZapfHumnst Dm BT', 'Zapfino', 'Zurich BlkEx BT', 'Zurich Ex BT', 'ZWAdobeF']
      fontList = fontList.concat(extendedFontList)
    }

    fontList = fontList.concat(options.fonts.userDefinedFonts)

      // remove duplicate fonts
    fontList = fontList.filter(function (font, position) {
      return fontList.indexOf(font) === position
    })

      // we use m or w because these two characters take up the maximum width.
      // And we use a LLi so that the same matching fonts can get separated
    var testString = 'mmmmmmmmmmlli'

      // we test using 72px font size, we may use any size. I guess larger the better.
    var testSize = '72px'

    var h = document.getElementsByTagName('body')[0]

      // div to load spans for the base fonts
    var baseFontsDiv = document.createElement('div')

      // div to load spans for the fonts to detect
    var fontsDiv = document.createElement('div')

    var defaultWidth = {}
    var defaultHeight = {}

      // creates a span where the fonts will be loaded
    var createSpan = function () {
      var s = document.createElement('span')
        /*
         * We need this css as in some weird browser this
         * span elements shows up for a microSec which creates a
         * bad user experience
         */
      s.style.position = 'absolute'
      s.style.left = '-9999px'
      s.style.fontSize = testSize

        // css font reset to reset external styles
      s.style.fontStyle = 'normal'
      s.style.fontWeight = 'normal'
      s.style.letterSpacing = 'normal'
      s.style.lineBreak = 'auto'
      s.style.lineHeight = 'normal'
      s.style.textTransform = 'none'
      s.style.textAlign = 'left'
      s.style.textDecoration = 'none'
      s.style.textShadow = 'none'
      s.style.whiteSpace = 'normal'
      s.style.wordBreak = 'normal'
      s.style.wordSpacing = 'normal'

      s.innerHTML = testString
      return s
    }

      // creates a span and load the font to detect and a base font for fallback
    var createSpanWithFonts = function (fontToDetect, baseFont) {
      var s = createSpan()
      s.style.fontFamily = "'" + fontToDetect + "'," + baseFont
      return s
    }

      // creates spans for the base fonts and adds them to baseFontsDiv
    var initializeBaseFontsSpans = function () {
      var spans = []
      for (var index = 0, length = baseFonts.length; index < length; index++) {
        var s = createSpan()
        s.style.fontFamily = baseFonts[index]
        baseFontsDiv.appendChild(s)
        spans.push(s)
      }
      return spans
    }

      // creates spans for the fonts to detect and adds them to fontsDiv
    var initializeFontsSpans = function () {
      var spans = {}
      for (var i = 0, l = fontList.length; i < l; i++) {
        var fontSpans = []
        for (var j = 0, numDefaultFonts = baseFonts.length; j < numDefaultFonts; j++) {
          var s = createSpanWithFonts(fontList[i], baseFonts[j])
          fontsDiv.appendChild(s)
          fontSpans.push(s)
        }
        spans[fontList[i]] = fontSpans // Stores {fontName : [spans for that font]}
      }
      return spans
    }

      // checks if a font is available
    var isFontAvailable = function (fontSpans) {
      var detected = false
      for (var i = 0; i < baseFonts.length; i++) {
        detected = (fontSpans[i].offsetWidth !== defaultWidth[baseFonts[i]] || fontSpans[i].offsetHeight !== defaultHeight[baseFonts[i]])
        if (detected) {
          return detected
        }
      }
      return detected
    }

      // create spans for base fonts
    var baseFontsSpans = initializeBaseFontsSpans()

      // add the spans to the DOM
    h.appendChild(baseFontsDiv)

      // get the default width for the three base fonts
    for (var index = 0, length = baseFonts.length; index < length; index++) {
      defaultWidth[baseFonts[index]] = baseFontsSpans[index].offsetWidth // width for the default font
      defaultHeight[baseFonts[index]] = baseFontsSpans[index].offsetHeight // height for the default font
    }

      // create spans for fonts to detect
    var fontsSpans = initializeFontsSpans()

      // add all the spans to the DOM
    h.appendChild(fontsDiv)

      // check available fonts
    var available = []
    for (var i = 0, l = fontList.length; i < l; i++) {
      if (isFontAvailable(fontsSpans[fontList[i]])) {
        available.push(fontList[i])
      }
    }

      // remove spans from DOM
    h.removeChild(fontsDiv)
    h.removeChild(baseFontsDiv)
    done(available)
  }
  var pluginsComponent = function (done, options) {
    if (isIE()) {
      if (!options.plugins.excludeIE) {
        done(getIEPlugins(options))
      } else {
        done(options.EXCLUDED)
      }
    } else {
      done(getRegularPlugins(options))
    }
  }
  var getRegularPlugins = function (options) {
    if (navigator.plugins == null) {
      return options.NOT_AVAILABLE
    }

    var plugins = []
      // plugins isn't defined in Node envs.
    for (var i = 0, l = navigator.plugins.length; i < l; i++) {
      if (navigator.plugins[i]) { plugins.push(navigator.plugins[i]) }
    }

      // sorting plugins only for those user agents, that we know randomize the plugins
      // every time we try to enumerate them
    if (pluginsShouldBeSorted(options)) {
      plugins = plugins.sort(function (a, b) {
        if (a.name > b.name) { return 1 }
        if (a.name < b.name) { return -1 }
        return 0
      })
    }
    return map(plugins, function (p) {
      var mimeTypes = map(p, function (mt) {
        return [mt.type, mt.suffixes]
      })
      return [p.name, p.description, mimeTypes]
    })
  }
  var getIEPlugins = function (options) {
    var result = []
    if ((Object.getOwnPropertyDescriptor && Object.getOwnPropertyDescriptor(window, 'ActiveXObject')) || ('ActiveXObject' in window)) {
      var names = [
        'AcroPDF.PDF', // Adobe PDF reader 7+
        'Adodb.Stream',
        'AgControl.AgControl', // Silverlight
        'DevalVRXCtrl.DevalVRXCtrl.1',
        'MacromediaFlashPaper.MacromediaFlashPaper',
        'Msxml2.DOMDocument',
        'Msxml2.XMLHTTP',
        'PDF.PdfCtrl', // Adobe PDF reader 6 and earlier, brrr
        'QuickTime.QuickTime', // QuickTime
        'QuickTimeCheckObject.QuickTimeCheck.1',
        'RealPlayer',
        'RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)',
        'RealVideo.RealVideo(tm) ActiveX Control (32-bit)',
        'Scripting.Dictionary',
        'SWCtl.SWCtl', // ShockWave player
        'Shell.UIHelper',
        'ShockwaveFlash.ShockwaveFlash', // flash plugin
        'Skype.Detection',
        'TDCCtl.TDCCtl',
        'WMPlayer.OCX', // Windows media player
        'rmocx.RealPlayer G2 Control',
        'rmocx.RealPlayer G2 Control.1'
      ]
        // starting to detect plugins in IE
      result = map(names, function (name) {
        try {
            // eslint-disable-next-line no-new
          new window.ActiveXObject(name)
          return name
        } catch (e) {
          return options.ERROR
        }
      })
    } else {
      result.push(options.NOT_AVAILABLE)
    }
    if (navigator.plugins) {
      result = result.concat(getRegularPlugins(options))
    }
    return result
  }
  var pluginsShouldBeSorted = function (options) {
    var should = false
    for (var i = 0, l = options.plugins.sortPluginsFor.length; i < l; i++) {
      var re = options.plugins.sortPluginsFor[i]
      if (navigator.userAgent.match(re)) {
        should = true
        break
      }
    }
    return should
  }
  var touchSupportKey = function (done) {
    done(getTouchSupport())
  }
  var hardwareConcurrencyKey = function (done, options) {
    done(getHardwareConcurrency(options))
  }
  var hasSessionStorage = function (options) {
    try {
      return !!window.sessionStorage
    } catch (e) {
      return options.ERROR // SecurityError when referencing it means it exists
    }
  }

// https://bugzilla.mozilla.org/show_bug.cgi?id=781447
  var hasLocalStorage = function (options) {
    try {
      return !!window.localStorage
    } catch (e) {
      return options.ERROR // SecurityError when referencing it means it exists
    }
  }
  var hasIndexedDB = function (options) {
    try {
      return !!window.indexedDB
    } catch (e) {
      return options.ERROR // SecurityError when referencing it means it exists
    }
  }
  var getHardwareConcurrency = function (options) {
    if (navigator.hardwareConcurrency) {
      return navigator.hardwareConcurrency
    }
    return options.NOT_AVAILABLE
  }
  var getNavigatorCpuClass = function (options) {
    return navigator.cpuClass || options.NOT_AVAILABLE
  }
  var getNavigatorPlatform = function (options) {
    if (navigator.platform) {
      return navigator.platform
    } else {
      return options.NOT_AVAILABLE
    }
  }
  var getDoNotTrack = function (options) {
    if (navigator.doNotTrack) {
      return navigator.doNotTrack
    } else if (navigator.msDoNotTrack) {
      return navigator.msDoNotTrack
    } else if (window.doNotTrack) {
      return window.doNotTrack
    } else {
      return options.NOT_AVAILABLE
    }
  }
// This is a crude and primitive touch screen detection.
// It's not possible to currently reliably detect the  availability of a touch screen
// with a JS, without actually subscribing to a touch event.
// http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
// https://github.com/Modernizr/Modernizr/issues/548
// method returns an array of 3 values:
// maxTouchPoints, the success or failure of creating a TouchEvent,
// and the availability of the 'ontouchstart' property

  var getTouchSupport = function () {
    var maxTouchPoints = 0
    var touchEvent
    if (typeof navigator.maxTouchPoints !== 'undefined') {
      maxTouchPoints = navigator.maxTouchPoints
    } else if (typeof navigator.msMaxTouchPoints !== 'undefined') {
      maxTouchPoints = navigator.msMaxTouchPoints
    }
    try {
      document.createEvent('TouchEvent')
      touchEvent = true
    } catch (_) {
      touchEvent = false
    }
    var touchStart = 'ontouchstart' in window
    return [maxTouchPoints, touchEvent, touchStart]
  }
// https://www.browserleaks.com/canvas#how-does-it-work

  var getCanvasFp = function (options) {
    var result = []
      // Very simple now, need to make it more complex (geo shapes etc)
    var canvas = document.createElement('canvas')
    canvas.width = 2000
    canvas.height = 200
    canvas.style.display = 'inline'
    var ctx = canvas.getContext('2d')
      // detect browser support of canvas winding
      // http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
      // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/canvas/winding.js
    ctx.rect(0, 0, 10, 10)
    ctx.rect(2, 2, 6, 6)
    result.push('canvas winding:' + ((ctx.isPointInPath(5, 5, 'evenodd') === false) ? 'yes' : 'no'))

    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
      // https://github.com/Valve/fingerprintjs2/issues/66
    if (options.dontUseFakeFontInCanvas) {
      ctx.font = '11pt Arial'
    } else {
      ctx.font = '11pt no-real-font-123'
    }
    ctx.fillText('Cwm fjordbank glyphs vext quiz, \ud83d\ude03', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.2)'
    ctx.font = '18pt Arial'
    ctx.fillText('Cwm fjordbank glyphs vext quiz, \ud83d\ude03', 4, 45)

      // canvas blending
      // http://blogs.adobe.com/webplatform/2013/01/28/blending-features-in-canvas/
      // http://jsfiddle.net/NDYV8/16/
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = 'rgb(255,0,255)'
    ctx.beginPath()
    ctx.arc(50, 50, 50, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = 'rgb(0,255,255)'
    ctx.beginPath()
    ctx.arc(100, 50, 50, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = 'rgb(255,255,0)'
    ctx.beginPath()
    ctx.arc(75, 100, 50, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = 'rgb(255,0,255)'
      // canvas winding
      // http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
      // http://jsfiddle.net/NDYV8/19/
    ctx.arc(75, 75, 75, 0, Math.PI * 2, true)
    ctx.arc(75, 75, 25, 0, Math.PI * 2, true)
    ctx.fill('evenodd')

    if (canvas.toDataURL) { result.push('canvas fp:' + canvas.toDataURL()) }
    return result
  }
  var getWebglFp = function () {
    var gl
    var fa2s = function (fa) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      gl.enable(gl.DEPTH_TEST)
      gl.depthFunc(gl.LEQUAL)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      return '[' + fa[0] + ', ' + fa[1] + ']'
    }
    var maxAnisotropy = function (gl) {
      var ext = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') || gl.getExtension('MOZ_EXT_texture_filter_anisotropic')
      if (ext) {
        var anisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
        if (anisotropy === 0) {
          anisotropy = 2
        }
        return anisotropy
      } else {
        return null
      }
    }

    gl = getWebglCanvas()
    if (!gl) { return null }
      // WebGL fingerprinting is a combination of techniques, found in MaxMind antifraud script & Augur fingerprinting.
      // First it draws a gradient object with shaders and convers the image to the Base64 string.
      // Then it enumerates all WebGL extensions & capabilities and appends them to the Base64 string, resulting in a huge WebGL string, potentially very unique on each device
      // Since iOS supports webgl starting from version 8.1 and 8.1 runs on several graphics chips, the results may be different across ios devices, but we need to verify it.
    var result = []
    var vShaderTemplate = 'attribute vec2 attrVertex;varying vec2 varyinTexCoordinate;uniform vec2 uniformOffset;void main(){varyinTexCoordinate=attrVertex+uniformOffset;gl_Position=vec4(attrVertex,0,1);}'
    var fShaderTemplate = 'precision mediump float;varying vec2 varyinTexCoordinate;void main() {gl_FragColor=vec4(varyinTexCoordinate,0,1);}'
    var vertexPosBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer)
    var vertices = new Float32Array([-0.2, -0.9, 0, 0.4, -0.26, 0, 0, 0.732134444, 0])
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    vertexPosBuffer.itemSize = 3
    vertexPosBuffer.numItems = 3
    var program = gl.createProgram()
    var vshader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vshader, vShaderTemplate)
    gl.compileShader(vshader)
    var fshader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fshader, fShaderTemplate)
    gl.compileShader(fshader)
    gl.attachShader(program, vshader)
    gl.attachShader(program, fshader)
    gl.linkProgram(program)
    gl.useProgram(program)
    program.vertexPosAttrib = gl.getAttribLocation(program, 'attrVertex')
    program.offsetUniform = gl.getUniformLocation(program, 'uniformOffset')
    gl.enableVertexAttribArray(program.vertexPosArray)
    gl.vertexAttribPointer(program.vertexPosAttrib, vertexPosBuffer.itemSize, gl.FLOAT, !1, 0, 0)
    gl.uniform2f(program.offsetUniform, 1, 1)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPosBuffer.numItems)
    try {
      result.push(gl.canvas.toDataURL())
    } catch (e) {
        /* .toDataURL may be absent or broken (blocked by extension) */
    }
    result.push('extensions:' + (gl.getSupportedExtensions() || []).join(';'))
    result.push('webgl aliased line width range:' + fa2s(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)))
    result.push('webgl aliased point size range:' + fa2s(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)))
    result.push('webgl alpha bits:' + gl.getParameter(gl.ALPHA_BITS))
    result.push('webgl antialiasing:' + (gl.getContextAttributes().antialias ? 'yes' : 'no'))
    result.push('webgl blue bits:' + gl.getParameter(gl.BLUE_BITS))
    result.push('webgl depth bits:' + gl.getParameter(gl.DEPTH_BITS))
    result.push('webgl green bits:' + gl.getParameter(gl.GREEN_BITS))
    result.push('webgl max anisotropy:' + maxAnisotropy(gl))
    result.push('webgl max combined texture image units:' + gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS))
    result.push('webgl max cube map texture size:' + gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE))
    result.push('webgl max fragment uniform vectors:' + gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS))
    result.push('webgl max render buffer size:' + gl.getParameter(gl.MAX_RENDERBUFFER_SIZE))
    result.push('webgl max texture image units:' + gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS))
    result.push('webgl max texture size:' + gl.getParameter(gl.MAX_TEXTURE_SIZE))
    result.push('webgl max varying vectors:' + gl.getParameter(gl.MAX_VARYING_VECTORS))
    result.push('webgl max vertex attribs:' + gl.getParameter(gl.MAX_VERTEX_ATTRIBS))
    result.push('webgl max vertex texture image units:' + gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS))
    result.push('webgl max vertex uniform vectors:' + gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS))
    result.push('webgl max viewport dims:' + fa2s(gl.getParameter(gl.MAX_VIEWPORT_DIMS)))
    result.push('webgl red bits:' + gl.getParameter(gl.RED_BITS))
    result.push('webgl renderer:' + gl.getParameter(gl.RENDERER))
    result.push('webgl shading language version:' + gl.getParameter(gl.SHADING_LANGUAGE_VERSION))
    result.push('webgl stencil bits:' + gl.getParameter(gl.STENCIL_BITS))
    result.push('webgl vendor:' + gl.getParameter(gl.VENDOR))
    result.push('webgl version:' + gl.getParameter(gl.VERSION))

    try {
        // Add the unmasked vendor and unmasked renderer if the debug_renderer_info extension is available
      var extensionDebugRendererInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (extensionDebugRendererInfo) {
        result.push('webgl unmasked vendor:' + gl.getParameter(extensionDebugRendererInfo.UNMASKED_VENDOR_WEBGL))
        result.push('webgl unmasked renderer:' + gl.getParameter(extensionDebugRendererInfo.UNMASKED_RENDERER_WEBGL))
      }
    } catch (e) { /* squelch */ }

    if (!gl.getShaderPrecisionFormat) {
      return result
    }

    each(['FLOAT', 'INT'], function (numType) {
      each(['VERTEX', 'FRAGMENT'], function (shader) {
        each(['HIGH', 'MEDIUM', 'LOW'], function (numSize) {
          each(['precision', 'rangeMin', 'rangeMax'], function (key) {
            var format = gl.getShaderPrecisionFormat(gl[shader + '_SHADER'], gl[numSize + '_' + numType])[key]
            if (key !== 'precision') {
              key = 'precision ' + key
            }
            var line = ['webgl ', shader.toLowerCase(), ' shader ', numSize.toLowerCase(), ' ', numType.toLowerCase(), ' ', key, ':', format].join('')
            result.push(line)
          })
        })
      })
    })
    return result
  }
  var getWebglVendorAndRenderer = function () {
      /* This a subset of the WebGL fingerprint with a lot of entropy, while being reasonably browser-independent */
    try {
      var glContext = getWebglCanvas()
      var extensionDebugRendererInfo = glContext.getExtension('WEBGL_debug_renderer_info')
      return glContext.getParameter(extensionDebugRendererInfo.UNMASKED_VENDOR_WEBGL) + '~' + glContext.getParameter(extensionDebugRendererInfo.UNMASKED_RENDERER_WEBGL)
    } catch (e) {
      return null
    }
  }
  var getAdBlock = function () {
    var ads = document.createElement('div')
    ads.innerHTML = '&nbsp;'
    ads.className = 'adsbox'
    var result = false
    try {
        // body may not exist, that's why we need try/catch
      document.body.appendChild(ads)
      result = document.getElementsByClassName('adsbox')[0].offsetHeight === 0
      document.body.removeChild(ads)
    } catch (e) {
      result = false
    }
    return result
  }
  var getHasLiedLanguages = function () {
      // We check if navigator.language is equal to the first language of navigator.languages
    if (typeof navigator.languages !== 'undefined') {
      try {
        var firstLanguages = navigator.languages[0].substr(0, 2)
        if (firstLanguages !== navigator.language.substr(0, 2)) {
          return true
        }
      } catch (err) {
        return true
      }
    }
    return false
  }
  var getHasLiedResolution = function () {
    return window.screen.width < window.screen.availWidth || window.screen.height < window.screen.availHeight
  }
  var getHasLiedOs = function () {
    var userAgent = navigator.userAgent.toLowerCase()
    var oscpu = navigator.oscpu
    var platform = navigator.platform.toLowerCase()
    var os
      // We extract the OS from the user agent (respect the order of the if else if statement)
    if (userAgent.indexOf('windows phone') >= 0) {
      os = 'Windows Phone'
    } else if (userAgent.indexOf('win') >= 0) {
      os = 'Windows'
    } else if (userAgent.indexOf('android') >= 0) {
      os = 'Android'
    } else if (userAgent.indexOf('linux') >= 0) {
      os = 'Linux'
    } else if (userAgent.indexOf('iphone') >= 0 || userAgent.indexOf('ipad') >= 0) {
      os = 'iOS'
    } else if (userAgent.indexOf('mac') >= 0) {
      os = 'Mac'
    } else {
      os = 'Other'
    }
      // We detect if the person uses a mobile device
    var mobileDevice = (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0))

    if (mobileDevice && os !== 'Windows Phone' && os !== 'Android' && os !== 'iOS' && os !== 'Other') {
      return true
    }

      // We compare oscpu with the OS extracted from the UA
    if (typeof oscpu !== 'undefined') {
      oscpu = oscpu.toLowerCase()
      if (oscpu.indexOf('win') >= 0 && os !== 'Windows' && os !== 'Windows Phone') {
        return true
      } else if (oscpu.indexOf('linux') >= 0 && os !== 'Linux' && os !== 'Android') {
        return true
      } else if (oscpu.indexOf('mac') >= 0 && os !== 'Mac' && os !== 'iOS') {
        return true
      } else if ((oscpu.indexOf('win') === -1 && oscpu.indexOf('linux') === -1 && oscpu.indexOf('mac') === -1) !== (os === 'Other')) {
        return true
      }
    }

      // We compare platform with the OS extracted from the UA
    if (platform.indexOf('win') >= 0 && os !== 'Windows' && os !== 'Windows Phone') {
      return true
    } else if ((platform.indexOf('linux') >= 0 || platform.indexOf('android') >= 0 || platform.indexOf('pike') >= 0) && os !== 'Linux' && os !== 'Android') {
      return true
    } else if ((platform.indexOf('mac') >= 0 || platform.indexOf('ipad') >= 0 || platform.indexOf('ipod') >= 0 || platform.indexOf('iphone') >= 0) && os !== 'Mac' && os !== 'iOS') {
      return true
    } else if ((platform.indexOf('win') === -1 && platform.indexOf('linux') === -1 && platform.indexOf('mac') === -1) !== (os === 'Other')) {
      return true
    }

    return typeof navigator.plugins === 'undefined' && os !== 'Windows' && os !== 'Windows Phone'
  }
  var getHasLiedBrowser = function () {
    var userAgent = navigator.userAgent.toLowerCase()
    var productSub = navigator.productSub

      // we extract the browser from the user agent (respect the order of the tests)
    var browser
    if (userAgent.indexOf('firefox') >= 0) {
      browser = 'Firefox'
    } else if (userAgent.indexOf('opera') >= 0 || userAgent.indexOf('opr') >= 0) {
      browser = 'Opera'
    } else if (userAgent.indexOf('chrome') >= 0) {
      browser = 'Chrome'
    } else if (userAgent.indexOf('safari') >= 0) {
      browser = 'Safari'
    } else if (userAgent.indexOf('trident') >= 0) {
      browser = 'Internet Explorer'
    } else {
      browser = 'Other'
    }

    if ((browser === 'Chrome' || browser === 'Safari' || browser === 'Opera') && productSub !== '20030107') {
      return true
    }

      // eslint-disable-next-line no-eval
    var tempRes = eval.toString().length
    if (tempRes === 37 && browser !== 'Safari' && browser !== 'Firefox' && browser !== 'Other') {
      return true
    } else if (tempRes === 39 && browser !== 'Internet Explorer' && browser !== 'Other') {
      return true
    } else if (tempRes === 33 && browser !== 'Chrome' && browser !== 'Opera' && browser !== 'Other') {
      return true
    }

      // We create an error to see how it is handled
    var errFirefox
    try {
        // eslint-disable-next-line no-throw-literal
      throw 'a'
    } catch (err) {
      try {
        err.toSource()
        errFirefox = true
      } catch (errOfErr) {
        errFirefox = false
      }
    }
    return errFirefox && browser !== 'Firefox' && browser !== 'Other'
  }
  var isCanvasSupported = function () {
    var elem = document.createElement('canvas')
    return !!(elem.getContext && elem.getContext('2d'))
  }
  var isWebGlSupported = function () {
      // code taken from Modernizr
    if (!isCanvasSupported()) {
      return false
    }

    var glContext = getWebglCanvas()
    return !!window.WebGLRenderingContext && !!glContext
  }
  var isIE = function () {
    if (navigator.appName === 'Microsoft Internet Explorer') {
      return true
    } else if (navigator.appName === 'Netscape' && /Trident/.test(navigator.userAgent)) { // IE 11
      return true
    }
    return false
  }
  var hasSwfObjectLoaded = function () {
    return typeof window.swfobject !== 'undefined'
  }
  var hasMinFlashInstalled = function () {
    return window.swfobject.hasFlashPlayerVersion('9.0.0')
  }
  var addFlashDivNode = function (options) {
    var node = document.createElement('div')
    node.setAttribute('id', options.fonts.swfContainerId)
    document.body.appendChild(node)
  }
  var loadSwfAndDetectFonts = function (done, options) {
    var hiddenCallback = '___fp_swf_loaded'
    window[hiddenCallback] = function (fonts) {
      done(fonts)
    }
    var id = options.fonts.swfContainerId
    addFlashDivNode()
    var flashvars = { onReady: hiddenCallback }
    var flashparams = { allowScriptAccess: 'always', menu: 'false' }
    window.swfobject.embedSWF(options.fonts.swfPath, id, '1', '1', '9.0.0', false, flashvars, flashparams, {})
  }
  var getWebglCanvas = function () {
    var canvas = document.createElement('canvas')
    var gl = null
    try {
      gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    } catch (e) { /* squelch */ }
    if (!gl) { gl = null }
    return gl
  }

  var components = [
    {key: 'userAgent', getData: UserAgent},
    {key: 'language', getData: languageKey},
    {key: 'colorDepth', getData: colorDepthKey},
    {key: 'deviceMemory', getData: deviceMemoryKey},
    {key: 'pixelRatio', getData: pixelRatioKey},
    {key: 'hardwareConcurrency', getData: hardwareConcurrencyKey},
    {key: 'screenResolution', getData: screenResolutionKey},
    {key: 'availableScreenResolution', getData: availableScreenResolutionKey},
    {key: 'timezoneOffset', getData: timezoneOffset},
    {key: 'timezone', getData: timezone},
    {key: 'sessionStorage', getData: sessionStorageKey},
    {key: 'localStorage', getData: localStorageKey},
    {key: 'indexedDb', getData: indexedDbKey},
    {key: 'addBehavior', getData: addBehaviorKey},
    {key: 'openDatabase', getData: openDatabaseKey},
    {key: 'cpuClass', getData: cpuClassKey},
    {key: 'platform', getData: platformKey},
    {key: 'doNotTrack', getData: doNotTrackKey},
    {key: 'plugins', getData: pluginsComponent},
    {key: 'canvas', getData: canvasKey},
    {key: 'webgl', getData: webglKey},
    {key: 'webglVendorAndRenderer', getData: webglVendorAndRendererKey},
    {key: 'adBlock', getData: adBlockKey},
    {key: 'hasLiedLanguages', getData: hasLiedLanguagesKey},
    {key: 'hasLiedResolution', getData: hasLiedResolutionKey},
    {key: 'hasLiedOs', getData: hasLiedOsKey},
    {key: 'hasLiedBrowser', getData: hasLiedBrowserKey},
    {key: 'touchSupport', getData: touchSupportKey},
    {key: 'fonts', getData: jsFontsKey, pauseBefore: true},
    {key: 'fontsFlash', getData: flashFontsKey, pauseBefore: true},
    {key: 'audio', getData: audioKey},
    {key: 'enumerateDevices', getData: enumerateDevicesKey}
  ]

  var Fingerprint2 = function (options) {
    throw new Error("'new Fingerprint()' is deprecated, see https://github.com/Valve/fingerprintjs2#upgrade-guide-from-182-to-200")
  }

  Fingerprint2.get = function (options, callback) {
    if (!callback) {
      callback = options
      options = {}
    } else if (!options) {
      options = {}
    }
    extendSoft(options, defaultOptions)
    options.components = options.extraComponents.concat(components)

    var keys = {
      data: [],
      addPreprocessedComponent: function (key, value) {
        if (typeof options.preprocessor === 'function') {
          value = options.preprocessor(key, value)
        }
        keys.data.push({key: key, value: value})
      }
    }

    var i = -1
    var chainComponents = function (alreadyWaited) {
      i += 1
      if (i >= options.components.length) { // on finish
        callback(keys.data)
        return
      }
      var component = options.components[i]

      if (options.excludes[component.key]) {
        chainComponents(false) // skip
        return
      }

      if (!alreadyWaited && component.pauseBefore) {
        i -= 1
        setTimeout(function () {
          chainComponents(true)
        }, 1)
        return
      }

      try {
        component.getData(function (value) {
          keys.addPreprocessedComponent(component.key, value)
          chainComponents(false)
        }, options)
      } catch (error) {
        // main body error
        keys.addPreprocessedComponent(component.key, String(error))
        chainComponents(false)
      }
    }

    chainComponents(false)
  }

  Fingerprint2.getPromise = function (options) {
    return new Promise(function (resolve, reject) {
      Fingerprint2.get(options, resolve)
    })
  }

  Fingerprint2.getV18 = function (options, callback) {
    if (callback == null) {
      callback = options
      options = {}
    }
    return Fingerprint2.get(options, function (components) {
      var newComponents = []
      for (var i = 0; i < components.length; i++) {
        var component = components[i]
        if (component.value === (options.NOT_AVAILABLE || 'not available')) {
          newComponents.push({key: component.key, value: 'unknown'})
        } else if (component.key === 'plugins') {
          newComponents.push({key: 'plugins',
            value: map(component.value, function (p) {
              var mimeTypes = map(p[2], function (mt) {
                if (mt.join) { return mt.join('~') }
                return mt
              }).join(',')
              return [p[0], p[1], mimeTypes].join('::')
            })})
        } else if (['canvas', 'webgl'].indexOf(component.key) !== -1) {
          newComponents.push({key: component.key, value: component.value.join('~')})
        } else if (['sessionStorage', 'localStorage', 'indexedDb', 'addBehavior', 'openDatabase'].indexOf(component.key) !== -1) {
          if (component.value) {
            newComponents.push({key: component.key, value: 1})
          } else {
            // skip
            continue
          }
        } else {
          if (component.value) {
            newComponents.push(component.value.join ? {key: component.key, value: component.value.join(';')} : component)
          } else {
            newComponents.push({key: component.key, value: component.value})
          }
        }
      }
      var murmur = x64hash128(map(newComponents, function (component) { return component.value }).join('~~~'), 31)
      callback(murmur, newComponents)
    })
  }

  Fingerprint2.x64hash128 = x64hash128
  Fingerprint2.VERSION = '2.0.0'
  return Fingerprint2
})

},{}],2:[function(require,module,exports){
/*!
 * jQuery JavaScript Library v3.4.1
 * https://jquery.com/
 *
 * Includes Sizzle.js
 * https://sizzlejs.com/
 *
 * Copyright JS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2019-05-01T21:04Z
 */
( function( global, factory ) {

	"use strict";

	if ( typeof module === "object" && typeof module.exports === "object" ) {

		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
// throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
// arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
// enough that all such attempts are guarded in a try block.
"use strict";

var arr = [];

var document = window.document;

var getProto = Object.getPrototypeOf;

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var fnToString = hasOwn.toString;

var ObjectFunctionString = fnToString.call( Object );

var support = {};

var isFunction = function isFunction( obj ) {

      // Support: Chrome <=57, Firefox <=52
      // In some browsers, typeof returns "function" for HTML <object> elements
      // (i.e., `typeof document.createElement( "object" ) === "function"`).
      // We don't want to classify *any* DOM node as a function.
      return typeof obj === "function" && typeof obj.nodeType !== "number";
  };


var isWindow = function isWindow( obj ) {
		return obj != null && obj === obj.window;
	};




	var preservedScriptAttributes = {
		type: true,
		src: true,
		nonce: true,
		noModule: true
	};

	function DOMEval( code, node, doc ) {
		doc = doc || document;

		var i, val,
			script = doc.createElement( "script" );

		script.text = code;
		if ( node ) {
			for ( i in preservedScriptAttributes ) {

				// Support: Firefox 64+, Edge 18+
				// Some browsers don't support the "nonce" property on scripts.
				// On the other hand, just using `getAttribute` is not enough as
				// the `nonce` attribute is reset to an empty string whenever it
				// becomes browsing-context connected.
				// See https://github.com/whatwg/html/issues/2369
				// See https://html.spec.whatwg.org/#nonce-attributes
				// The `node.getAttribute` check was added for the sake of
				// `jQuery.globalEval` so that it can fake a nonce-containing node
				// via an object.
				val = node[ i ] || node.getAttribute && node.getAttribute( i );
				if ( val ) {
					script.setAttribute( i, val );
				}
			}
		}
		doc.head.appendChild( script ).parentNode.removeChild( script );
	}


function toType( obj ) {
	if ( obj == null ) {
		return obj + "";
	}

	// Support: Android <=2.3 only (functionish RegExp)
	return typeof obj === "object" || typeof obj === "function" ?
		class2type[ toString.call( obj ) ] || "object" :
		typeof obj;
}
/* global Symbol */
// Defining this global in .eslintrc.json would create a danger of using the global
// unguarded in another place, it seems safer to define global only for this module



var
	version = "3.4.1",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android <=4.0 only
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {

		// Return all the elements in a clean array
		if ( num == null ) {
			return slice.call( this );
		}

		// Return just the one element from the set
		return num < 0 ? this[ num + this.length ] : this[ num ];
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !isFunction( target ) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				copy = options[ name ];

				// Prevent Object.prototype pollution
				// Prevent never-ending loop
				if ( name === "__proto__" || target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = Array.isArray( copy ) ) ) ) {
					src = target[ name ];

					// Ensure proper type for the source value
					if ( copyIsArray && !Array.isArray( src ) ) {
						clone = [];
					} else if ( !copyIsArray && !jQuery.isPlainObject( src ) ) {
						clone = {};
					} else {
						clone = src;
					}
					copyIsArray = false;

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isPlainObject: function( obj ) {
		var proto, Ctor;

		// Detect obvious negatives
		// Use toString instead of jQuery.type to catch host objects
		if ( !obj || toString.call( obj ) !== "[object Object]" ) {
			return false;
		}

		proto = getProto( obj );

		// Objects with no prototype (e.g., `Object.create( null )`) are plain
		if ( !proto ) {
			return true;
		}

		// Objects with prototype are plain iff they were constructed by a global Object function
		Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
		return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
	},

	isEmptyObject: function( obj ) {
		var name;

		for ( name in obj ) {
			return false;
		}
		return true;
	},

	// Evaluates a script in a global context
	globalEval: function( code, options ) {
		DOMEval( code, { nonce: options && options.nonce } );
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android <=4.0 only
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	// Support: Android <=4.0 only, PhantomJS 1 only
	// push.apply(_, arraylike) throws on ancient WebKit
	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
}

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: real iOS 8.2 only (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = toType( obj );

	if ( isFunction( obj ) || isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.3.4
 * https://sizzlejs.com/
 *
 * Copyright JS Foundation and other contributors
 * Released under the MIT license
 * https://js.foundation/
 *
 * Date: 2019-04-08
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	nonnativeSelectorCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// https://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),
	rdescend = new RegExp( whitespace + "|>" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rhtml = /HTML$/i,
	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,

	// CSS escapes
	// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// CSS string/identifier serialization
	// https://drafts.csswg.org/cssom/#common-serializing-idioms
	rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
	fcssescape = function( ch, asCodePoint ) {
		if ( asCodePoint ) {

			// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
			if ( ch === "\0" ) {
				return "\uFFFD";
			}

			// Control characters and (dependent upon position) numbers get escaped as code points
			return ch.slice( 0, -1 ) + "\\" + ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
		}

		// Other potentially-special ASCII characters get backslash-escaped
		return "\\" + ch;
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	},

	inDisabledFieldset = addCombinator(
		function( elem ) {
			return elem.disabled === true && elem.nodeName.toLowerCase() === "fieldset";
		},
		{ dir: "parentNode", next: "legend" }
	);

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {

		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
			setDocument( context );
		}
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

				// ID selector
				if ( (m = match[1]) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( (elem = context.getElementById( m )) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && (elem = newContext.getElementById( m )) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[2] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( (m = match[3]) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!nonnativeSelectorCache[ selector + " " ] &&
				(!rbuggyQSA || !rbuggyQSA.test( selector )) &&

				// Support: IE 8 only
				// Exclude object elements
				(nodeType !== 1 || context.nodeName.toLowerCase() !== "object") ) {

				newSelector = selector;
				newContext = context;

				// qSA considers elements outside a scoping root when evaluating child or
				// descendant combinators, which is not what we want.
				// In such cases, we work around the behavior by prefixing every selector in the
				// list with an ID selector referencing the scope context.
				// Thanks to Andrew Dupont for this technique.
				if ( nodeType === 1 && rdescend.test( selector ) ) {

					// Capture the context ID, setting it first if necessary
					if ( (nid = context.getAttribute( "id" )) ) {
						nid = nid.replace( rcssescape, fcssescape );
					} else {
						context.setAttribute( "id", (nid = expando) );
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					while ( i-- ) {
						groups[i] = "#" + nid + " " + toSelector( groups[i] );
					}
					newSelector = groups.join( "," );

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;
				}

				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch ( qsaError ) {
					nonnativeSelectorCache( selector, true );
				} finally {
					if ( nid === expando ) {
						context.removeAttribute( "id" );
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created element and returns a boolean result
 */
function assert( fn ) {
	var el = document.createElement("fieldset");

	try {
		return !!fn( el );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( el.parentNode ) {
			el.parentNode.removeChild( el );
		}
		// release memory in IE
		el = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			a.sourceIndex - b.sourceIndex;

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for :enabled/:disabled
 * @param {Boolean} disabled true for :disabled; false for :enabled
 */
function createDisabledPseudo( disabled ) {

	// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
	return function( elem ) {

		// Only certain elements can match :enabled or :disabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
		if ( "form" in elem ) {

			// Check for inherited disabledness on relevant non-disabled elements:
			// * listed form-associated elements in a disabled fieldset
			//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
			// * option elements in a disabled optgroup
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
			// All such elements have a "form" property.
			if ( elem.parentNode && elem.disabled === false ) {

				// Option elements defer to a parent optgroup if present
				if ( "label" in elem ) {
					if ( "label" in elem.parentNode ) {
						return elem.parentNode.disabled === disabled;
					} else {
						return elem.disabled === disabled;
					}
				}

				// Support: IE 6 - 11
				// Use the isDisabled shortcut property to check for disabled fieldset ancestors
				return elem.isDisabled === disabled ||

					// Where there is no isDisabled, check manually
					/* jshint -W018 */
					elem.isDisabled !== !disabled &&
						inDisabledFieldset( elem ) === disabled;
			}

			return elem.disabled === disabled;

		// Try to winnow out elements that can't be disabled before trusting the disabled property.
		// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
		// even exist on them, let alone have a boolean value.
		} else if ( "label" in elem ) {
			return elem.disabled === disabled;
		}

		// Remaining elements are neither :enabled nor :disabled
		return false;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	var namespace = elem.namespaceURI,
		docElem = (elem.ownerDocument || elem).documentElement;

	// Support: IE <=8
	// Assume HTML when documentElement doesn't yet exist, such as inside loading iframes
	// https://bugs.jquery.com/ticket/4833
	return !rhtml.test( namespace || docElem && docElem.nodeName || "HTML" );
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, subWindow,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if ( preferredDoc !== document &&
		(subWindow = document.defaultView) && subWindow.top !== subWindow ) {

		// Support: IE 11, Edge
		if ( subWindow.addEventListener ) {
			subWindow.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( subWindow.attachEvent ) {
			subWindow.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( el ) {
		el.className = "i";
		return !el.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( el ) {
		el.appendChild( document.createComment("") );
		return !el.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programmatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( el ) {
		docElem.appendChild( el ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	});

	// ID filter and find
	if ( support.getById ) {
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var elem = context.getElementById( id );
				return elem ? [ elem ] : [];
			}
		};
	} else {
		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};

		// Support: IE 6 - 7 only
		// getElementById is not reliable as a find shortcut
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var node, i, elems,
					elem = context.getElementById( id );

				if ( elem ) {

					// Verify the id attribute
					node = elem.getAttributeNode("id");
					if ( node && node.value === id ) {
						return [ elem ];
					}

					// Fall back on getElementsByName
					elems = context.getElementsByName( id );
					i = 0;
					while ( (elem = elems[i++]) ) {
						node = elem.getAttributeNode("id");
						if ( node && node.value === id ) {
							return [ elem ];
						}
					}
				}

				return [];
			}
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See https://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( el ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// https://bugs.jquery.com/ticket/12359
			docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( el.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !el.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !el.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibling-combinator selector` fails
			if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( el ) {
			el.innerHTML = "<a href='' disabled='disabled'></a>" +
				"<select disabled='disabled'><option/></select>";

			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			el.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( el.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( el.querySelectorAll(":enabled").length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Support: IE9-11+
			// IE's :disabled selector does not pick up the children of disabled fieldsets
			docElem.appendChild( el ).disabled = true;
			if ( el.querySelectorAll(":disabled").length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			el.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( el ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( el, "*" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( el, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === document ? -1 :
				b === document ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	if ( support.matchesSelector && documentIsHTML &&
		!nonnativeSelectorCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {
			nonnativeSelectorCache( expr, true );
		}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.escape = function( sel ) {
	return (sel + "").replace( rcssescape, fcssescape );
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || (node[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								(outerCache[ node.uniqueID ] = {});

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {
							// Use previously-cached element index if available
							if ( useCache ) {
								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {
								// Use the same loop as above to seek `elem` from the start
								while ( (node = ++nodeIndex && node && node[ dir ] ||
									(diff = nodeIndex = 0) || start.pop()) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] || (node[ expando ] = {});

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												(outerCache[ node.uniqueID ] = {});

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": createDisabledPseudo( false ),
		"disabled": createDisabledPseudo( true ),

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ?
				argument + length :
				argument > length ?
					length :
					argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		skip = combinator.next,
		key = skip || dir,
		checkNonElements = base && key === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
			return false;
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

						if ( skip && skip === elem.nodeName.toLowerCase() ) {
							elem = elem[ dir ] || elem;
						} else if ( (oldCache = uniqueCache[ key ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ key ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
			return false;
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context === document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					if ( !context && elem.ownerDocument !== document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context || document, xml) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( el ) {
	// Should return 1, but returns 4 (following)
	return el.compareDocumentPosition( document.createElement("fieldset") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( el ) {
	el.innerHTML = "<a href='#'></a>";
	return el.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( el ) {
	el.innerHTML = "<input/>";
	el.firstChild.setAttribute( "value", "" );
	return el.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( el ) {
	return el.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;

// Deprecated
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;
jQuery.escapeSelector = Sizzle.escape;




var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;



function nodeName( elem, name ) {

  return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();

};
var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			return !!qualifier.call( elem, i, elem ) !== not;
		} );
	}

	// Single element
	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );
	}

	// Arraylike of elements (jQuery, arguments, Array)
	if ( typeof qualifier !== "string" ) {
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}

	// Filtered directly for both simple and complex selectors
	return jQuery.filter( qualifier, elements, not );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	if ( elems.length === 1 && elem.nodeType === 1 ) {
		return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
	}

	return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
		return elem.nodeType === 1;
	} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i, ret,
			len = this.length,
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		ret = this.pushStack( [] );

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		return len > 1 ? jQuery.uniqueSort( ret ) : ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	// Shortcut simple #id case for speed
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Method init() accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[ 0 ] === "<" &&
				selector[ selector.length - 1 ] === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					if ( elem ) {

						// Inject the element directly into the jQuery object
						this[ 0 ] = elem;
						this.length = 1;
					}
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( isFunction( selector ) ) {
			return root.ready !== undefined ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter( function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			targets = typeof selectors !== "string" && jQuery( selectors );

		// Positional selectors never match, since there's no _selection_ context
		if ( !rneedsContext.test( selectors ) ) {
			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

					// Always skip document fragments
					if ( cur.nodeType < 11 && ( targets ?
						targets.index( cur ) > -1 :

						// Don't pass non-elements to Sizzle
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {

						matched.push( cur );
						break;
					}
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		if ( typeof elem.contentDocument !== "undefined" ) {
			return elem.contentDocument;
		}

		// Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
		// Treat the template element as a regular one in browsers that
		// don't support it.
		if ( nodeName( elem, "template" ) ) {
			elem = elem.content || elem;
		}

		return jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.uniqueSort( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
} );
var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = locked || options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && toType( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = queue = [];
				if ( !memory && !firing ) {
					list = memory = "";
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


function Identity( v ) {
	return v;
}
function Thrower( ex ) {
	throw ex;
}

function adoptValue( value, resolve, reject, noValue ) {
	var method;

	try {

		// Check for promise aspect first to privilege synchronous behavior
		if ( value && isFunction( ( method = value.promise ) ) ) {
			method.call( value ).done( resolve ).fail( reject );

		// Other thenables
		} else if ( value && isFunction( ( method = value.then ) ) ) {
			method.call( value, resolve, reject );

		// Other non-thenables
		} else {

			// Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
			// * false: [ value ].slice( 0 ) => resolve( value )
			// * true: [ value ].slice( 1 ) => resolve()
			resolve.apply( undefined, [ value ].slice( noValue ) );
		}

	// For Promises/A+, convert exceptions into rejections
	// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
	// Deferred#then to conditionally suppress rejection.
	} catch ( value ) {

		// Support: Android 4.0 only
		// Strict mode functions invoked without .call/.apply get global-object context
		reject.apply( undefined, [ value ] );
	}
}

jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, callbacks,
				// ... .then handlers, argument index, [final state]
				[ "notify", "progress", jQuery.Callbacks( "memory" ),
					jQuery.Callbacks( "memory" ), 2 ],
				[ "resolve", "done", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 0, "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 1, "rejected" ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				"catch": function( fn ) {
					return promise.then( null, fn );
				},

				// Keep pipe for back-compat
				pipe: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;

					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {

							// Map tuples (progress, done, fail) to arguments (done, fail, progress)
							var fn = isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

							// deferred.progress(function() { bind to newDefer or newDefer.notify })
							// deferred.done(function() { bind to newDefer or newDefer.resolve })
							// deferred.fail(function() { bind to newDefer or newDefer.reject })
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},
				then: function( onFulfilled, onRejected, onProgress ) {
					var maxDepth = 0;
					function resolve( depth, deferred, handler, special ) {
						return function() {
							var that = this,
								args = arguments,
								mightThrow = function() {
									var returned, then;

									// Support: Promises/A+ section 2.3.3.3.3
									// https://promisesaplus.com/#point-59
									// Ignore double-resolution attempts
									if ( depth < maxDepth ) {
										return;
									}

									returned = handler.apply( that, args );

									// Support: Promises/A+ section 2.3.1
									// https://promisesaplus.com/#point-48
									if ( returned === deferred.promise() ) {
										throw new TypeError( "Thenable self-resolution" );
									}

									// Support: Promises/A+ sections 2.3.3.1, 3.5
									// https://promisesaplus.com/#point-54
									// https://promisesaplus.com/#point-75
									// Retrieve `then` only once
									then = returned &&

										// Support: Promises/A+ section 2.3.4
										// https://promisesaplus.com/#point-64
										// Only check objects and functions for thenability
										( typeof returned === "object" ||
											typeof returned === "function" ) &&
										returned.then;

									// Handle a returned thenable
									if ( isFunction( then ) ) {

										// Special processors (notify) just wait for resolution
										if ( special ) {
											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special )
											);

										// Normal processors (resolve) also hook into progress
										} else {

											// ...and disregard older resolution values
											maxDepth++;

											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special ),
												resolve( maxDepth, deferred, Identity,
													deferred.notifyWith )
											);
										}

									// Handle all other returned values
									} else {

										// Only substitute handlers pass on context
										// and multiple values (non-spec behavior)
										if ( handler !== Identity ) {
											that = undefined;
											args = [ returned ];
										}

										// Process the value(s)
										// Default process is resolve
										( special || deferred.resolveWith )( that, args );
									}
								},

								// Only normal processors (resolve) catch and reject exceptions
								process = special ?
									mightThrow :
									function() {
										try {
											mightThrow();
										} catch ( e ) {

											if ( jQuery.Deferred.exceptionHook ) {
												jQuery.Deferred.exceptionHook( e,
													process.stackTrace );
											}

											// Support: Promises/A+ section 2.3.3.3.4.1
											// https://promisesaplus.com/#point-61
											// Ignore post-resolution exceptions
											if ( depth + 1 >= maxDepth ) {

												// Only substitute handlers pass on context
												// and multiple values (non-spec behavior)
												if ( handler !== Thrower ) {
													that = undefined;
													args = [ e ];
												}

												deferred.rejectWith( that, args );
											}
										}
									};

							// Support: Promises/A+ section 2.3.3.3.1
							// https://promisesaplus.com/#point-57
							// Re-resolve promises immediately to dodge false rejection from
							// subsequent errors
							if ( depth ) {
								process();
							} else {

								// Call an optional hook to record the stack, in case of exception
								// since it's otherwise lost when execution goes async
								if ( jQuery.Deferred.getStackHook ) {
									process.stackTrace = jQuery.Deferred.getStackHook();
								}
								window.setTimeout( process );
							}
						};
					}

					return jQuery.Deferred( function( newDefer ) {

						// progress_handlers.add( ... )
						tuples[ 0 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onProgress ) ?
									onProgress :
									Identity,
								newDefer.notifyWith
							)
						);

						// fulfilled_handlers.add( ... )
						tuples[ 1 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onFulfilled ) ?
									onFulfilled :
									Identity
							)
						);

						// rejected_handlers.add( ... )
						tuples[ 2 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onRejected ) ?
									onRejected :
									Thrower
							)
						);
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 5 ];

			// promise.progress = list.add
			// promise.done = list.add
			// promise.fail = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(
					function() {

						// state = "resolved" (i.e., fulfilled)
						// state = "rejected"
						state = stateString;
					},

					// rejected_callbacks.disable
					// fulfilled_callbacks.disable
					tuples[ 3 - i ][ 2 ].disable,

					// rejected_handlers.disable
					// fulfilled_handlers.disable
					tuples[ 3 - i ][ 3 ].disable,

					// progress_callbacks.lock
					tuples[ 0 ][ 2 ].lock,

					// progress_handlers.lock
					tuples[ 0 ][ 3 ].lock
				);
			}

			// progress_handlers.fire
			// fulfilled_handlers.fire
			// rejected_handlers.fire
			list.add( tuple[ 3 ].fire );

			// deferred.notify = function() { deferred.notifyWith(...) }
			// deferred.resolve = function() { deferred.resolveWith(...) }
			// deferred.reject = function() { deferred.rejectWith(...) }
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
				return this;
			};

			// deferred.notifyWith = list.fireWith
			// deferred.resolveWith = list.fireWith
			// deferred.rejectWith = list.fireWith
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( singleValue ) {
		var

			// count of uncompleted subordinates
			remaining = arguments.length,

			// count of unprocessed arguments
			i = remaining,

			// subordinate fulfillment data
			resolveContexts = Array( i ),
			resolveValues = slice.call( arguments ),

			// the master Deferred
			master = jQuery.Deferred(),

			// subordinate callback factory
			updateFunc = function( i ) {
				return function( value ) {
					resolveContexts[ i ] = this;
					resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( !( --remaining ) ) {
						master.resolveWith( resolveContexts, resolveValues );
					}
				};
			};

		// Single- and empty arguments are adopted like Promise.resolve
		if ( remaining <= 1 ) {
			adoptValue( singleValue, master.done( updateFunc( i ) ).resolve, master.reject,
				!remaining );

			// Use .then() to unwrap secondary thenables (cf. gh-3000)
			if ( master.state() === "pending" ||
				isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

				return master.then();
			}
		}

		// Multiple arguments are aggregated like Promise.all array elements
		while ( i-- ) {
			adoptValue( resolveValues[ i ], updateFunc( i ), master.reject );
		}

		return master.promise();
	}
} );


// These usually indicate a programmer mistake during development,
// warn about them ASAP rather than swallowing them by default.
var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

jQuery.Deferred.exceptionHook = function( error, stack ) {

	// Support: IE 8 - 9 only
	// Console exists when dev tools are open, which can happen at any time
	if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
		window.console.warn( "jQuery.Deferred exception: " + error.message, error.stack, stack );
	}
};




jQuery.readyException = function( error ) {
	window.setTimeout( function() {
		throw error;
	} );
};




// The deferred used on DOM ready
var readyList = jQuery.Deferred();

jQuery.fn.ready = function( fn ) {

	readyList
		.then( fn )

		// Wrap jQuery.readyException in a function so that the lookup
		// happens at the time of error handling instead of callback
		// registration.
		.catch( function( error ) {
			jQuery.readyException( error );
		} );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );
	}
} );

jQuery.ready.then = readyList.then;

// The ready event handler and self cleanup method
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed );
	window.removeEventListener( "load", completed );
	jQuery.ready();
}

// Catch cases where $(document).ready() is called
// after the browser event has already occurred.
// Support: IE <=9 - 10 only
// Older IE sometimes signals "interactive" too soon
if ( document.readyState === "complete" ||
	( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

	// Handle it asynchronously to allow scripts the opportunity to delay ready
	window.setTimeout( jQuery.ready );

} else {

	// Use the handy event callback
	document.addEventListener( "DOMContentLoaded", completed );

	// A fallback to window.onload, that will always work
	window.addEventListener( "load", completed );
}




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( toType( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
					value :
					value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	if ( chainable ) {
		return elems;
	}

	// Gets
	if ( bulk ) {
		return fn.call( elems );
	}

	return len ? fn( elems[ 0 ], key ) : emptyGet;
};


// Matches dashed string for camelizing
var rmsPrefix = /^-ms-/,
	rdashAlpha = /-([a-z])/g;

// Used by camelCase as callback to replace()
function fcamelCase( all, letter ) {
	return letter.toUpperCase();
}

// Convert dashed to camelCase; used by the css and data modules
// Support: IE <=9 - 11, Edge 12 - 15
// Microsoft forgot to hump their vendor prefix (#9572)
function camelCase( string ) {
	return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
}
var acceptData = function( owner ) {

	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};




function Data() {
	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {

	cache: function( owner ) {

		// Check if the owner object already has a cache
		var value = owner[ this.expando ];

		// If not, create one
		if ( !value ) {
			value = {};

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( acceptData( owner ) ) {

				// If it is a node unlikely to be stringify-ed or looped over
				// use plain assignment
				if ( owner.nodeType ) {
					owner[ this.expando ] = value;

				// Otherwise secure it in a non-enumerable property
				// configurable must be true to allow the property to be
				// deleted when data is removed
				} else {
					Object.defineProperty( owner, this.expando, {
						value: value,
						configurable: true
					} );
				}
			}
		}

		return value;
	},
	set: function( owner, data, value ) {
		var prop,
			cache = this.cache( owner );

		// Handle: [ owner, key, value ] args
		// Always use camelCase key (gh-2257)
		if ( typeof data === "string" ) {
			cache[ camelCase( data ) ] = value;

		// Handle: [ owner, { properties } ] args
		} else {

			// Copy the properties one-by-one to the cache object
			for ( prop in data ) {
				cache[ camelCase( prop ) ] = data[ prop ];
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		return key === undefined ?
			this.cache( owner ) :

			// Always use camelCase key (gh-2257)
			owner[ this.expando ] && owner[ this.expando ][ camelCase( key ) ];
	},
	access: function( owner, key, value ) {

		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				( ( key && typeof key === "string" ) && value === undefined ) ) {

			return this.get( owner, key );
		}

		// When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i,
			cache = owner[ this.expando ];

		if ( cache === undefined ) {
			return;
		}

		if ( key !== undefined ) {

			// Support array or space separated string of keys
			if ( Array.isArray( key ) ) {

				// If key is an array of keys...
				// We always set camelCase keys, so remove that.
				key = key.map( camelCase );
			} else {
				key = camelCase( key );

				// If a key with the spaces exists, use it.
				// Otherwise, create an array by matching non-whitespace
				key = key in cache ?
					[ key ] :
					( key.match( rnothtmlwhite ) || [] );
			}

			i = key.length;

			while ( i-- ) {
				delete cache[ key[ i ] ];
			}
		}

		// Remove the expando if there's no more data
		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

			// Support: Chrome <=35 - 45
			// Webkit & Blink performance suffers when deleting properties
			// from DOM nodes, so set to undefined instead
			// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
			if ( owner.nodeType ) {
				owner[ this.expando ] = undefined;
			} else {
				delete owner[ this.expando ];
			}
		}
	},
	hasData: function( owner ) {
		var cache = owner[ this.expando ];
		return cache !== undefined && !jQuery.isEmptyObject( cache );
	}
};
var dataPriv = new Data();

var dataUser = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /[A-Z]/g;

function getData( data ) {
	if ( data === "true" ) {
		return true;
	}

	if ( data === "false" ) {
		return false;
	}

	if ( data === "null" ) {
		return null;
	}

	// Only convert to a number if it doesn't change the string
	if ( data === +data + "" ) {
		return +data;
	}

	if ( rbrace.test( data ) ) {
		return JSON.parse( data );
	}

	return data;
}

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = getData( data );
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend( {
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = dataUser.get( elem );

				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE 11 only
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				dataUser.set( this, key );
			} );
		}

		return access( this, function( value ) {
			var data;

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {

				// Attempt to get data from the cache
				// The key will always be camelCased in Data
				data = dataUser.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each( function() {

				// We always store the camelCased key
				dataUser.set( this, key, value );
			} );
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = dataPriv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || Array.isArray( data ) ) {
					queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				dataPriv.remove( elem, [ type + "queue", key ] );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var documentElement = document.documentElement;



	var isAttached = function( elem ) {
			return jQuery.contains( elem.ownerDocument, elem );
		},
		composed = { composed: true };

	// Support: IE 9 - 11+, Edge 12 - 18+, iOS 10.0 - 10.2 only
	// Check attachment across shadow DOM boundaries when possible (gh-3504)
	// Support: iOS 10.0-10.2 only
	// Early iOS 10 versions support `attachShadow` but not `getRootNode`,
	// leading to errors. We need to check for `getRootNode`.
	if ( documentElement.getRootNode ) {
		isAttached = function( elem ) {
			return jQuery.contains( elem.ownerDocument, elem ) ||
				elem.getRootNode( composed ) === elem.ownerDocument;
		};
	}
var isHiddenWithinTree = function( elem, el ) {

		// isHiddenWithinTree might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;

		// Inline style trumps all
		return elem.style.display === "none" ||
			elem.style.display === "" &&

			// Otherwise, check computed style
			// Support: Firefox <=43 - 45
			// Disconnected elements can have computed display: none, so first confirm that elem is
			// in the document.
			isAttached( elem ) &&

			jQuery.css( elem, "display" ) === "none";
	};

var swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};




function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted, scale,
		maxIterations = 20,
		currentValue = tween ?
			function() {
				return tween.cur();
			} :
			function() {
				return jQuery.css( elem, prop, "" );
			},
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = elem.nodeType &&
			( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Support: Firefox <=54
		// Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
		initial = initial / 2;

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		while ( maxIterations-- ) {

			// Evaluate and update our best guess (doubling guesses that zero out).
			// Finish if the scale equals or crosses 1 (making the old*new product non-positive).
			jQuery.style( elem, prop, initialInUnit + unit );
			if ( ( 1 - scale ) * ( 1 - ( scale = currentValue() / initial || 0.5 ) ) <= 0 ) {
				maxIterations = 0;
			}
			initialInUnit = initialInUnit / scale;

		}

		initialInUnit = initialInUnit * 2;
		jQuery.style( elem, prop, initialInUnit + unit );

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


var defaultDisplayMap = {};

function getDefaultDisplay( elem ) {
	var temp,
		doc = elem.ownerDocument,
		nodeName = elem.nodeName,
		display = defaultDisplayMap[ nodeName ];

	if ( display ) {
		return display;
	}

	temp = doc.body.appendChild( doc.createElement( nodeName ) );
	display = jQuery.css( temp, "display" );

	temp.parentNode.removeChild( temp );

	if ( display === "none" ) {
		display = "block";
	}
	defaultDisplayMap[ nodeName ] = display;

	return display;
}

function showHide( elements, show ) {
	var display, elem,
		values = [],
		index = 0,
		length = elements.length;

	// Determine new display value for elements that need to change
	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		display = elem.style.display;
		if ( show ) {

			// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
			// check is required in this first loop unless we have a nonempty display value (either
			// inline or about-to-be-restored)
			if ( display === "none" ) {
				values[ index ] = dataPriv.get( elem, "display" ) || null;
				if ( !values[ index ] ) {
					elem.style.display = "";
				}
			}
			if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
				values[ index ] = getDefaultDisplay( elem );
			}
		} else {
			if ( display !== "none" ) {
				values[ index ] = "none";

				// Remember what we're overwriting
				dataPriv.set( elem, "display", display );
			}
		}
	}

	// Set the display of the elements in a second loop to avoid constant reflow
	for ( index = 0; index < length; index++ ) {
		if ( values[ index ] != null ) {
			elements[ index ].style.display = values[ index ];
		}
	}

	return elements;
}

jQuery.fn.extend( {
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHiddenWithinTree( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]*)/i );

var rscriptType = ( /^$|^module$|\/(?:java|ecma)script/i );



// We have to close these tags to support XHTML (#13200)
var wrapMap = {

	// Support: IE <=9 only
	option: [ 1, "<select multiple='multiple'>", "</select>" ],

	// XHTML parsers do not magically insert elements in the
	// same way that tag soup parsers do. So we cannot shorten
	// this by omitting <tbody> or other required elements.
	thead: [ 1, "<table>", "</table>" ],
	col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	_default: [ 0, "", "" ]
};

// Support: IE <=9 only
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;


function getAll( context, tag ) {

	// Support: IE <=9 - 11 only
	// Use typeof to avoid zero-argument method invocation on host objects (#15151)
	var ret;

	if ( typeof context.getElementsByTagName !== "undefined" ) {
		ret = context.getElementsByTagName( tag || "*" );

	} else if ( typeof context.querySelectorAll !== "undefined" ) {
		ret = context.querySelectorAll( tag || "*" );

	} else {
		ret = [];
	}

	if ( tag === undefined || tag && nodeName( context, tag ) ) {
		return jQuery.merge( [ context ], ret );
	}

	return ret;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		dataPriv.set(
			elems[ i ],
			"globalEval",
			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/;

function buildFragment( elems, context, scripts, selection, ignored ) {
	var elem, tmp, tag, wrap, attached, j,
		fragment = context.createDocumentFragment(),
		nodes = [],
		i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( toType( elem ) === "object" ) {

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;
				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, tmp.childNodes );

				// Remember the top-level container
				tmp = fragment.firstChild;

				// Ensure the created nodes are orphaned (#12392)
				tmp.textContent = "";
			}
		}
	}

	// Remove wrapper from fragment
	fragment.textContent = "";

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}
			continue;
		}

		attached = isAttached( elem );

		// Append to fragment
		tmp = getAll( fragment.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( attached ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	return fragment;
}


( function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Android 4.0 - 4.3 only
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Android <=4.1 only
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE <=11 only
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
} )();


var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE <=9 - 11+
// focus() and blur() are asynchronous, except when they are no-op.
// So expect focus to be synchronous when the element is already active,
// and blur to be synchronous when the element is not already active.
// (focus and blur are always synchronous in other supported browsers,
// this just defines when we can count on it).
function expectSync( elem, type ) {
	return ( elem === safeActiveElement() ) === ( type === "focus" );
}

// Support: IE <=9 only
// Accessing document.activeElement can throw unexpectedly
// https://bugs.jquery.com/ticket/13393
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Ensure that invalid selectors throw exceptions at attach time
		// Evaluate against documentElement in case elem is a non-element node (e.g., document)
		if ( selector ) {
			jQuery.find.matchesSelector( documentElement, selector );
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = {};
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove data and the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( nativeEvent ) {

		// Make a writable jQuery.Event from the native event object
		var event = jQuery.event.fix( nativeEvent );

		var i, j, ret, matched, handleObj, handlerQueue,
			args = new Array( arguments.length ),
			handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;

		for ( i = 1; i < arguments.length; i++ ) {
			args[ i ] = arguments[ i ];
		}

		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// If the event is namespaced, then each handler is only invoked if it is
				// specially universal or its namespaces are a superset of the event's.
				if ( !event.rnamespace || handleObj.namespace === false ||
					event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, handleObj, sel, matchedHandlers, matchedSelectors,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		if ( delegateCount &&

			// Support: IE <=9
			// Black-hole SVG <use> instance trees (trac-13180)
			cur.nodeType &&

			// Support: Firefox <=42
			// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
			// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
			// Support: IE 11 only
			// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
			!( event.type === "click" && event.button >= 1 ) ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
					matchedHandlers = [];
					matchedSelectors = {};
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matchedSelectors[ sel ] === undefined ) {
							matchedSelectors[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matchedSelectors[ sel ] ) {
							matchedHandlers.push( handleObj );
						}
					}
					if ( matchedHandlers.length ) {
						handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		cur = this;
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	addProp: function( name, hook ) {
		Object.defineProperty( jQuery.Event.prototype, name, {
			enumerable: true,
			configurable: true,

			get: isFunction( hook ) ?
				function() {
					if ( this.originalEvent ) {
							return hook( this.originalEvent );
					}
				} :
				function() {
					if ( this.originalEvent ) {
							return this.originalEvent[ name ];
					}
				},

			set: function( value ) {
				Object.defineProperty( this, name, {
					enumerable: true,
					configurable: true,
					writable: true,
					value: value
				} );
			}
		} );
	},

	fix: function( originalEvent ) {
		return originalEvent[ jQuery.expando ] ?
			originalEvent :
			new jQuery.Event( originalEvent );
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		click: {

			// Utilize native event to ensure correct state for checkable inputs
			setup: function( data ) {

				// For mutual compressibility with _default, replace `this` access with a local var.
				// `|| data` is dead code meant only to preserve the variable through minification.
				var el = this || data;

				// Claim the first handler
				if ( rcheckableType.test( el.type ) &&
					el.click && nodeName( el, "input" ) ) {

					// dataPriv.set( el, "click", ... )
					leverageNative( el, "click", returnTrue );
				}

				// Return false to allow normal processing in the caller
				return false;
			},
			trigger: function( data ) {

				// For mutual compressibility with _default, replace `this` access with a local var.
				// `|| data` is dead code meant only to preserve the variable through minification.
				var el = this || data;

				// Force setup before triggering a click
				if ( rcheckableType.test( el.type ) &&
					el.click && nodeName( el, "input" ) ) {

					leverageNative( el, "click" );
				}

				// Return non-false to allow normal event-path propagation
				return true;
			},

			// For cross-browser consistency, suppress native .click() on links
			// Also prevent it if we're currently inside a leveraged native-event stack
			_default: function( event ) {
				var target = event.target;
				return rcheckableType.test( target.type ) &&
					target.click && nodeName( target, "input" ) &&
					dataPriv.get( target, "click" ) ||
					nodeName( target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	}
};

// Ensure the presence of an event listener that handles manually-triggered
// synthetic events by interrupting progress until reinvoked in response to
// *native* events that it fires directly, ensuring that state changes have
// already occurred before other listeners are invoked.
function leverageNative( el, type, expectSync ) {

	// Missing expectSync indicates a trigger call, which must force setup through jQuery.event.add
	if ( !expectSync ) {
		if ( dataPriv.get( el, type ) === undefined ) {
			jQuery.event.add( el, type, returnTrue );
		}
		return;
	}

	// Register the controller as a special universal handler for all event namespaces
	dataPriv.set( el, type, false );
	jQuery.event.add( el, type, {
		namespace: false,
		handler: function( event ) {
			var notAsync, result,
				saved = dataPriv.get( this, type );

			if ( ( event.isTrigger & 1 ) && this[ type ] ) {

				// Interrupt processing of the outer synthetic .trigger()ed event
				// Saved data should be false in such cases, but might be a leftover capture object
				// from an async native handler (gh-4350)
				if ( !saved.length ) {

					// Store arguments for use when handling the inner native event
					// There will always be at least one argument (an event object), so this array
					// will not be confused with a leftover capture object.
					saved = slice.call( arguments );
					dataPriv.set( this, type, saved );

					// Trigger the native event and capture its result
					// Support: IE <=9 - 11+
					// focus() and blur() are asynchronous
					notAsync = expectSync( this, type );
					this[ type ]();
					result = dataPriv.get( this, type );
					if ( saved !== result || notAsync ) {
						dataPriv.set( this, type, false );
					} else {
						result = {};
					}
					if ( saved !== result ) {

						// Cancel the outer synthetic event
						event.stopImmediatePropagation();
						event.preventDefault();
						return result.value;
					}

				// If this is an inner synthetic event for an event with a bubbling surrogate
				// (focus or blur), assume that the surrogate already propagated from triggering the
				// native event and prevent that from happening again here.
				// This technically gets the ordering wrong w.r.t. to `.trigger()` (in which the
				// bubbling surrogate propagates *after* the non-bubbling base), but that seems
				// less bad than duplication.
				} else if ( ( jQuery.event.special[ type ] || {} ).delegateType ) {
					event.stopPropagation();
				}

			// If this is a native event triggered above, everything is now in order
			// Fire an inner synthetic event with the original arguments
			} else if ( saved.length ) {

				// ...and capture the result
				dataPriv.set( this, type, {
					value: jQuery.event.trigger(

						// Support: IE <=9 - 11+
						// Extend with the prototype to reset the above stopImmediatePropagation()
						jQuery.extend( saved[ 0 ], jQuery.Event.prototype ),
						saved.slice( 1 ),
						this
					)
				} );

				// Abort handling of the native event
				event.stopImmediatePropagation();
			}
		}
	} );
}

jQuery.removeEvent = function( elem, type, handle ) {

	// This "if" is needed for plain objects
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle );
	}
};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: Android <=2.3 only
				src.returnValue === false ?
			returnTrue :
			returnFalse;

		// Create target properties
		// Support: Safari <=6 - 7 only
		// Target should not be a text node (#504, #13143)
		this.target = ( src.target && src.target.nodeType === 3 ) ?
			src.target.parentNode :
			src.target;

		this.currentTarget = src.currentTarget;
		this.relatedTarget = src.relatedTarget;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || Date.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,
	isSimulated: false,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && !this.isSimulated ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Includes all common event props including KeyEvent and MouseEvent specific props
jQuery.each( {
	altKey: true,
	bubbles: true,
	cancelable: true,
	changedTouches: true,
	ctrlKey: true,
	detail: true,
	eventPhase: true,
	metaKey: true,
	pageX: true,
	pageY: true,
	shiftKey: true,
	view: true,
	"char": true,
	code: true,
	charCode: true,
	key: true,
	keyCode: true,
	button: true,
	buttons: true,
	clientX: true,
	clientY: true,
	offsetX: true,
	offsetY: true,
	pointerId: true,
	pointerType: true,
	screenX: true,
	screenY: true,
	targetTouches: true,
	toElement: true,
	touches: true,

	which: function( event ) {
		var button = event.button;

		// Add which for key events
		if ( event.which == null && rkeyEvent.test( event.type ) ) {
			return event.charCode != null ? event.charCode : event.keyCode;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		if ( !event.which && button !== undefined && rmouseEvent.test( event.type ) ) {
			if ( button & 1 ) {
				return 1;
			}

			if ( button & 2 ) {
				return 3;
			}

			if ( button & 4 ) {
				return 2;
			}

			return 0;
		}

		return event.which;
	}
}, jQuery.event.addProp );

jQuery.each( { focus: "focusin", blur: "focusout" }, function( type, delegateType ) {
	jQuery.event.special[ type ] = {

		// Utilize native event if possible so blur/focus sequence is correct
		setup: function() {

			// Claim the first handler
			// dataPriv.set( this, "focus", ... )
			// dataPriv.set( this, "blur", ... )
			leverageNative( this, type, expectSync );

			// Return false to allow normal processing in the caller
			return false;
		},
		trigger: function() {

			// Force setup before trigger
			leverageNative( this, type );

			// Return non-false to allow normal event-path propagation
			return true;
		},

		delegateType: delegateType
	};
} );

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	}
} );


var

	/* eslint-disable max-len */

	// See https://github.com/eslint/eslint/issues/3229
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,

	/* eslint-enable */

	// Support: IE <=10 - 11, Edge 12 - 13 only
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

// Prefer a tbody over its parent table for containing new rows
function manipulationTarget( elem, content ) {
	if ( nodeName( elem, "table" ) &&
		nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

		return jQuery( elem ).children( "tbody" )[ 0 ] || elem;
	}

	return elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	if ( ( elem.type || "" ).slice( 0, 5 ) === "true/" ) {
		elem.type = elem.type.slice( 5 );
	} else {
		elem.removeAttribute( "type" );
	}

	return elem;
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( dataPriv.hasData( src ) ) {
		pdataOld = dataPriv.access( src );
		pdataCur = dataPriv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( dataUser.hasData( src ) ) {
		udataOld = dataUser.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		dataUser.set( dest, udataCur );
	}
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = concat.apply( [], args );

	var fragment, first, scripts, hasScripts, node, doc,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		valueIsFunction = isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( valueIsFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( valueIsFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android <=4.0 only, PhantomJS 1 only
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!dataPriv.access( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src && ( node.type || "" ).toLowerCase()  !== "module" ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl && !node.noModule ) {
								jQuery._evalUrl( node.src, {
									nonce: node.nonce || node.getAttribute( "nonce" )
								} );
							}
						} else {
							DOMEval( node.textContent.replace( rcleanScript, "" ), node, doc );
						}
					}
				}
			}
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		nodes = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && isAttached( node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = isAttached( elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			special = jQuery.event.special,
			i = 0;

		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
			if ( acceptData( elem ) ) {
				if ( ( data = elem[ dataPriv.expando ] ) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataPriv.expando ] = undefined;
				}
				if ( elem[ dataUser.expando ] ) {

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataUser.expando ] = undefined;
				}
			}
		}
	}
} );

jQuery.fn.extend( {
	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each( function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				} );
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: Android <=4.0 only, PhantomJS 1 only
			// .get() because push.apply(_, arraylike) throws on ancient WebKit
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );
var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {

		// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

var rboxStyle = new RegExp( cssExpand.join( "|" ), "i" );



( function() {

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computeStyleTests() {

		// This is a singleton, we need to execute it only once
		if ( !div ) {
			return;
		}

		container.style.cssText = "position:absolute;left:-11111px;width:60px;" +
			"margin-top:1px;padding:0;border:0";
		div.style.cssText =
			"position:relative;display:block;box-sizing:border-box;overflow:scroll;" +
			"margin:auto;border:1px;padding:1px;" +
			"width:60%;top:1%";
		documentElement.appendChild( container ).appendChild( div );

		var divStyle = window.getComputedStyle( div );
		pixelPositionVal = divStyle.top !== "1%";

		// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
		reliableMarginLeftVal = roundPixelMeasures( divStyle.marginLeft ) === 12;

		// Support: Android 4.0 - 4.3 only, Safari <=9.1 - 10.1, iOS <=7.0 - 9.3
		// Some styles come back with percentage values, even though they shouldn't
		div.style.right = "60%";
		pixelBoxStylesVal = roundPixelMeasures( divStyle.right ) === 36;

		// Support: IE 9 - 11 only
		// Detect misreporting of content dimensions for box-sizing:border-box elements
		boxSizingReliableVal = roundPixelMeasures( divStyle.width ) === 36;

		// Support: IE 9 only
		// Detect overflow:scroll screwiness (gh-3699)
		// Support: Chrome <=64
		// Don't get tricked when zoom affects offsetWidth (gh-4029)
		div.style.position = "absolute";
		scrollboxSizeVal = roundPixelMeasures( div.offsetWidth / 3 ) === 12;

		documentElement.removeChild( container );

		// Nullify the div so it wouldn't be stored in the memory and
		// it will also be a sign that checks already performed
		div = null;
	}

	function roundPixelMeasures( measure ) {
		return Math.round( parseFloat( measure ) );
	}

	var pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal,
		reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	// Support: IE <=9 - 11 only
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	jQuery.extend( support, {
		boxSizingReliable: function() {
			computeStyleTests();
			return boxSizingReliableVal;
		},
		pixelBoxStyles: function() {
			computeStyleTests();
			return pixelBoxStylesVal;
		},
		pixelPosition: function() {
			computeStyleTests();
			return pixelPositionVal;
		},
		reliableMarginLeft: function() {
			computeStyleTests();
			return reliableMarginLeftVal;
		},
		scrollboxSize: function() {
			computeStyleTests();
			return scrollboxSizeVal;
		}
	} );
} )();


function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,

		// Support: Firefox 51+
		// Retrieving style before computed somehow
		// fixes an issue with getting wrong values
		// on detached elements
		style = elem.style;

	computed = computed || getStyles( elem );

	// getPropertyValue is needed for:
	//   .css('filter') (IE 9 only, #12537)
	//   .css('--customProperty) (#3144)
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];

		if ( ret === "" && !isAttached( elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// A tribute to the "awesome hack by Dean Edwards"
		// Android Browser returns percentage for some values,
		// but width seems to be reliably pixels.
		// This is against the CSSOM draft spec:
		// https://drafts.csswg.org/cssom/#resolved-values
		if ( !support.pixelBoxStyles() && rnumnonpx.test( ret ) && rboxStyle.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?

		// Support: IE <=9 - 11 only
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var cssPrefixes = [ "Webkit", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style,
	vendorProps = {};

// Return a vendor-prefixed property or undefined
function vendorPropName( name ) {

	// Check for vendor prefixed names
	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

// Return a potentially-mapped jQuery.cssProps or vendor prefixed property
function finalPropName( name ) {
	var final = jQuery.cssProps[ name ] || vendorProps[ name ];

	if ( final ) {
		return final;
	}
	if ( name in emptyStyle ) {
		return name;
	}
	return vendorProps[ name ] = vendorPropName( name ) || name;
}


var

	// Swappable if display is none or starts with table
	// except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rcustomProp = /^--/,
	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	};

function setPositiveNumber( elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
		value;
}

function boxModelAdjustment( elem, dimension, box, isBorderBox, styles, computedVal ) {
	var i = dimension === "width" ? 1 : 0,
		extra = 0,
		delta = 0;

	// Adjustment may not be necessary
	if ( box === ( isBorderBox ? "border" : "content" ) ) {
		return 0;
	}

	for ( ; i < 4; i += 2 ) {

		// Both box models exclude margin
		if ( box === "margin" ) {
			delta += jQuery.css( elem, box + cssExpand[ i ], true, styles );
		}

		// If we get here with a content-box, we're seeking "padding" or "border" or "margin"
		if ( !isBorderBox ) {

			// Add padding
			delta += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// For "border" or "margin", add border
			if ( box !== "padding" ) {
				delta += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );

			// But still keep track of it otherwise
			} else {
				extra += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}

		// If we get here with a border-box (content + padding + border), we're seeking "content" or
		// "padding" or "margin"
		} else {

			// For "content", subtract padding
			if ( box === "content" ) {
				delta -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// For "content" or "padding", subtract border
			if ( box !== "margin" ) {
				delta -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	// Account for positive content-box scroll gutter when requested by providing computedVal
	if ( !isBorderBox && computedVal >= 0 ) {

		// offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
		// Assuming integer scroll gutter, subtract the rest and round down
		delta += Math.max( 0, Math.ceil(
			elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
			computedVal -
			delta -
			extra -
			0.5

		// If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
		// Use an explicit zero to avoid NaN (gh-3964)
		) ) || 0;
	}

	return delta;
}

function getWidthOrHeight( elem, dimension, extra ) {

	// Start with computed style
	var styles = getStyles( elem ),

		// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-4322).
		// Fake content-box until we know it's needed to know the true value.
		boxSizingNeeded = !support.boxSizingReliable() || extra,
		isBorderBox = boxSizingNeeded &&
			jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
		valueIsBorderBox = isBorderBox,

		val = curCSS( elem, dimension, styles ),
		offsetProp = "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 );

	// Support: Firefox <=54
	// Return a confounding non-pixel value or feign ignorance, as appropriate.
	if ( rnumnonpx.test( val ) ) {
		if ( !extra ) {
			return val;
		}
		val = "auto";
	}


	// Fall back to offsetWidth/offsetHeight when value is "auto"
	// This happens for inline elements with no explicit setting (gh-3571)
	// Support: Android <=4.1 - 4.3 only
	// Also use offsetWidth/offsetHeight for misreported inline dimensions (gh-3602)
	// Support: IE 9-11 only
	// Also use offsetWidth/offsetHeight for when box sizing is unreliable
	// We use getClientRects() to check for hidden/disconnected.
	// In those cases, the computed value can be trusted to be border-box
	if ( ( !support.boxSizingReliable() && isBorderBox ||
		val === "auto" ||
		!parseFloat( val ) && jQuery.css( elem, "display", false, styles ) === "inline" ) &&
		elem.getClientRects().length ) {

		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

		// Where available, offsetWidth/offsetHeight approximate border box dimensions.
		// Where not available (e.g., SVG), assume unreliable box-sizing and interpret the
		// retrieved value as a content box dimension.
		valueIsBorderBox = offsetProp in elem;
		if ( valueIsBorderBox ) {
			val = elem[ offsetProp ];
		}
	}

	// Normalize "" and auto
	val = parseFloat( val ) || 0;

	// Adjust for the element's box model
	return ( val +
		boxModelAdjustment(
			elem,
			dimension,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles,

			// Provide the current computed size to request scroll gutter calculation (gh-3589)
			val
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"gridArea": true,
		"gridColumn": true,
		"gridColumnEnd": true,
		"gridColumnStart": true,
		"gridRow": true,
		"gridRowEnd": true,
		"gridRowStart": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name ),
			style = elem.style;

		// Make sure that we're working with the right name. We don't
		// want to query the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			// The isCustomProp check can be removed in jQuery 4.0 when we only auto-append
			// "px" to a few hardcoded values.
			if ( type === "number" && !isCustomProp ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				if ( isCustomProp ) {
					style.setProperty( name, value );
				} else {
					style[ name ] = value;
				}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name );

		// Make sure that we're working with the right name. We don't
		// want to modify the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}

		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( i, dimension ) {
	jQuery.cssHooks[ dimension ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

					// Support: Safari 8+
					// Table columns in Safari have non-zero offsetWidth & zero
					// getBoundingClientRect().width unless display is changed.
					// Support: IE <=11 only
					// Running getBoundingClientRect on a disconnected node
					// in IE throws an error.
					( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, dimension, extra );
						} ) :
						getWidthOrHeight( elem, dimension, extra );
			}
		},

		set: function( elem, value, extra ) {
			var matches,
				styles = getStyles( elem ),

				// Only read styles.position if the test has a chance to fail
				// to avoid forcing a reflow.
				scrollboxSizeBuggy = !support.scrollboxSize() &&
					styles.position === "absolute",

				// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-3991)
				boxSizingNeeded = scrollboxSizeBuggy || extra,
				isBorderBox = boxSizingNeeded &&
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
				subtract = extra ?
					boxModelAdjustment(
						elem,
						dimension,
						extra,
						isBorderBox,
						styles
					) :
					0;

			// Account for unreliable border-box dimensions by comparing offset* to computed and
			// faking a content-box to get border and padding (gh-3699)
			if ( isBorderBox && scrollboxSizeBuggy ) {
				subtract -= Math.ceil(
					elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
					parseFloat( styles[ dimension ] ) -
					boxModelAdjustment( elem, dimension, "border", false, styles ) -
					0.5
				);
			}

			// Convert to pixels if value adjustment is needed
			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
				( matches[ 3 ] || "px" ) !== "px" ) {

				elem.style[ dimension ] = value;
				value = jQuery.css( elem, dimension );
			}

			return setPositiveNumber( elem, value, subtract );
		}
	};
} );

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
				elem.getBoundingClientRect().left -
					swap( elem, { marginLeft: 0 }, function() {
						return elem.getBoundingClientRect().left;
					} )
				) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( prefix !== "margin" ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( Array.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 && (
					jQuery.cssHooks[ tween.prop ] ||
					tween.elem.style[ finalPropName( tween.prop ) ] != null ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9 only
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, inProgress,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

function schedule() {
	if ( inProgress ) {
		if ( document.hidden === false && window.requestAnimationFrame ) {
			window.requestAnimationFrame( schedule );
		} else {
			window.setTimeout( schedule, jQuery.fx.interval );
		}

		jQuery.fx.tick();
	}
}

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = Date.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
		isBox = "width" in props || "height" in props,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHiddenWithinTree( elem ),
		dataShow = dataPriv.get( elem, "fxshow" );

	// Queue-skipping animations hijack the fx hooks
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// Ensure the complete handler is called before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// Detect show/hide animations
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.test( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// Pretend to be hidden if this is a "show" and
				// there is still data from a stopped show/hide
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;

				// Ignore all other no-op show/hide data
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
		}
	}

	// Bail out if this is a no-op like .hide().hide()
	propTween = !jQuery.isEmptyObject( props );
	if ( !propTween && jQuery.isEmptyObject( orig ) ) {
		return;
	}

	// Restrict "overflow" and "display" styles during box animations
	if ( isBox && elem.nodeType === 1 ) {

		// Support: IE <=9 - 11, Edge 12 - 15
		// Record all 3 overflow attributes because IE does not infer the shorthand
		// from identically-valued overflowX and overflowY and Edge just mirrors
		// the overflowX value there.
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Identify a display type, preferring old show/hide data over the CSS cascade
		restoreDisplay = dataShow && dataShow.display;
		if ( restoreDisplay == null ) {
			restoreDisplay = dataPriv.get( elem, "display" );
		}
		display = jQuery.css( elem, "display" );
		if ( display === "none" ) {
			if ( restoreDisplay ) {
				display = restoreDisplay;
			} else {

				// Get nonempty value(s) by temporarily forcing visibility
				showHide( [ elem ], true );
				restoreDisplay = elem.style.display || restoreDisplay;
				display = jQuery.css( elem, "display" );
				showHide( [ elem ] );
			}
		}

		// Animate inline elements as inline-block
		if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
			if ( jQuery.css( elem, "float" ) === "none" ) {

				// Restore the original display value at the end of pure show/hide animations
				if ( !propTween ) {
					anim.done( function() {
						style.display = restoreDisplay;
					} );
					if ( restoreDisplay == null ) {
						display = style.display;
						restoreDisplay = display === "none" ? "" : display;
					}
				}
				style.display = "inline-block";
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always( function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		} );
	}

	// Implement show/hide animations
	propTween = false;
	for ( prop in orig ) {

		// General show/hide setup for this element animation
		if ( !propTween ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
			}

			// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}

			// Show elements before animating them
			if ( hidden ) {
				showHide( [ elem ], true );
			}

			/* eslint-disable no-loop-func */

			anim.done( function() {

			/* eslint-enable no-loop-func */

				// The final step of a "hide" animation is actually hiding the element
				if ( !hidden ) {
					showHide( [ elem ] );
				}
				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
		}

		// Per-property setup
		propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
		if ( !( prop in dataShow ) ) {
			dataShow[ prop ] = propTween.start;
			if ( hidden ) {
				propTween.end = propTween.start;
				propTween.start = 0;
			}
		}
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( Array.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// Don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3 only
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			// If there's more to do, yield
			if ( percent < 1 && length ) {
				return remaining;
			}

			// If this was an empty animation, synthesize a final progress notification
			if ( !length ) {
				deferred.notifyWith( elem, [ animation, 1, 0 ] );
			}

			// Resolve the animation and report its conclusion
			deferred.resolveWith( elem, [ animation ] );
			return false;
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					result.stop.bind( result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	// Attach callbacks from options
	animation
		.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	return animation;
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnothtmlwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !isFunction( easing ) && easing
	};

	// Go to the end state if fx are off
	if ( jQuery.fx.off ) {
		opt.duration = 0;

	} else {
		if ( typeof opt.duration !== "number" ) {
			if ( opt.duration in jQuery.fx.speeds ) {
				opt.duration = jQuery.fx.speeds[ opt.duration ];

			} else {
				opt.duration = jQuery.fx.speeds._default;
			}
		}
	}

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || dataPriv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = dataPriv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = dataPriv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = Date.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Run the timer and safely remove it when done (allowing for external removal)
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	jQuery.fx.start();
};

jQuery.fx.interval = 13;
jQuery.fx.start = function() {
	if ( inProgress ) {
		return;
	}

	inProgress = true;
	schedule();
};

jQuery.fx.stop = function() {
	inProgress = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: Android <=4.3 only
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE <=11 only
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: IE <=11 only
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
} )();


var boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// Attribute hooks are determined by the lowercase version
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name,
			i = 0,

			// Attribute names can contain non-HTML whitespace characters
			// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
			attrNames = value && value.match( rnothtmlwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				elem.removeAttribute( name );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle,
			lowercaseName = name.toLowerCase();

		if ( !isXML ) {

			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ lowercaseName ];
			attrHandle[ lowercaseName ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				lowercaseName :
				null;
			attrHandle[ lowercaseName ] = handle;
		}
		return ret;
	};
} );




var rfocusable = /^(?:input|select|textarea|button)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each( function() {
			delete this[ jQuery.propFix[ name ] || name ];
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// Support: IE <=9 - 11 only
				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				if ( tabindex ) {
					return parseInt( tabindex, 10 );
				}

				if (
					rfocusable.test( elem.nodeName ) ||
					rclickable.test( elem.nodeName ) &&
					elem.href
				) {
					return 0;
				}

				return -1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Support: IE <=11 only
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
// eslint rule "no-unused-expressions" is disabled for this code
// since it considers such accessions noop
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		},
		set: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );




	// Strip and collapse whitespace according to HTML spec
	// https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
	function stripAndCollapse( value ) {
		var tokens = value.match( rnothtmlwhite ) || [];
		return tokens.join( " " );
	}


function getClass( elem ) {
	return elem.getAttribute && elem.getAttribute( "class" ) || "";
}

function classesToArray( value ) {
	if ( Array.isArray( value ) ) {
		return value;
	}
	if ( typeof value === "string" ) {
		return value.match( rnothtmlwhite ) || [];
	}
	return [];
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		classes = classesToArray( value );

		if ( classes.length ) {
			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		classes = classesToArray( value );

		if ( classes.length ) {
			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isValidValue = type === "string" || Array.isArray( value );

		if ( typeof stateVal === "boolean" && isValidValue ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( isValidValue ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = classesToArray( value );

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// Store className if set
					dataPriv.set( this, "__className__", className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				if ( this.setAttribute ) {
					this.setAttribute( "class",
						className || value === false ?
						"" :
						dataPriv.get( this, "__className__" ) || ""
					);
				}
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
					return true;
			}
		}

		return false;
	}
} );




var rreturn = /\r/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, valueIsFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				// Handle most common string cases
				if ( typeof ret === "string" ) {
					return ret.replace( rreturn, "" );
				}

				// Handle cases where value is null/undef or number
				return ret == null ? "" : ret;
			}

			return;
		}

		valueIsFunction = isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( valueIsFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( Array.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {

				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE <=10 - 11 only
					// option.text throws exceptions (#14686, #14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					stripAndCollapse( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option, i,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one",
					values = one ? null : [],
					max = one ? index + 1 : options.length;

				if ( index < 0 ) {
					i = max;

				} else {
					i = one ? index : 0;
				}

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Support: IE <=9 only
					// IE8-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							!option.disabled &&
							( !option.parentNode.disabled ||
								!nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					/* eslint-disable no-cond-assign */

					if ( option.selected =
						jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
					) {
						optionSet = true;
					}

					/* eslint-enable no-cond-assign */
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( Array.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




// Return jQuery for attributes-only inclusion


support.focusin = "onfocusin" in window;


var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	stopPropagationCallback = function( e ) {
		e.stopPropagation();
	};

jQuery.extend( jQuery.event, {

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special, lastElement,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = lastElement = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {
			lastElement = cur;
			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
				dataPriv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( ( !special._default ||
				special._default.apply( eventPath.pop(), data ) === false ) &&
				acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && isFunction( elem[ type ] ) && !isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;

					if ( event.isPropagationStopped() ) {
						lastElement.addEventListener( type, stopPropagationCallback );
					}

					elem[ type ]();

					if ( event.isPropagationStopped() ) {
						lastElement.removeEventListener( type, stopPropagationCallback );
					}

					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	// Piggyback on a donor event to simulate a different one
	// Used only for `focus(in | out)` events
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true
			}
		);

		jQuery.event.trigger( e, null, elem );
	}

} );

jQuery.fn.extend( {

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


// Support: Firefox <=44
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					dataPriv.remove( doc, fix );

				} else {
					dataPriv.access( doc, fix, attaches );
				}
			}
		};
	} );
}
var location = window.location;

var nonce = Date.now();

var rquery = ( /\?/ );



// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE 9 - 11 only
	// IE throws on parseFromString with invalid input.
	try {
		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( Array.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && toType( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, valueOrFunction ) {

			// If value is a function, invoke it and use its return value
			var value = isFunction( valueOrFunction ) ?
				valueOrFunction() :
				valueOrFunction;

			s[ s.length ] = encodeURIComponent( key ) + "=" +
				encodeURIComponent( value == null ? "" : value );
		};

	if ( a == null ) {
		return "";
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( Array.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( i, elem ) {
			var val = jQuery( this ).val();

			if ( val == null ) {
				return null;
			}

			if ( Array.isArray( val ) ) {
				return jQuery.map( val, function( val ) {
					return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
				} );
			}

			return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


var
	r20 = /%20/g,
	rhash = /#.*$/,
	rantiCache = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Anchor tag for parsing the document origin
	originAnchor = document.createElement( "a" );
	originAnchor.href = location.href;

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

		if ( isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType[ 0 ] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s.throws ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: location.href,
		type: "GET",
		isLocal: rlocalProtocol.test( location.protocol ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",

		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": JSON.parse,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,

			// URL without anti-cache param
			cacheURL,

			// Response headers
			responseHeadersString,
			responseHeaders,

			// timeout handle
			timeoutTimer,

			// Url cleanup var
			urlAnchor,

			// Request state (becomes false upon send and true upon completion)
			completed,

			// To know if global events are to be dispatched
			fireGlobals,

			// Loop variable
			i,

			// uncached part of the url
			uncached,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( completed ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() + " " ] =
									( responseHeaders[ match[ 1 ].toLowerCase() + " " ] || [] )
										.concat( match[ 2 ] );
							}
						}
						match = responseHeaders[ key.toLowerCase() + " " ];
					}
					return match == null ? null : match.join( ", " );
				},

				// Raw string
				getAllResponseHeaders: function() {
					return completed ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( completed == null ) {
						name = requestHeadersNames[ name.toLowerCase() ] =
							requestHeadersNames[ name.toLowerCase() ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( completed == null ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( completed ) {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						} else {

							// Lazy-add the new callbacks in a way that preserves old ones
							for ( code in map ) {
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR );

		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || location.href ) + "" )
			.replace( rprotocol, location.protocol + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

		// A cross-domain request is in order when the origin doesn't match the current origin.
		if ( s.crossDomain == null ) {
			urlAnchor = document.createElement( "a" );

			// Support: IE <=8 - 11, Edge 12 - 15
			// IE throws exception on accessing the href property if url is malformed,
			// e.g. http://example.com:80x/
			try {
				urlAnchor.href = s.url;

				// Support: IE <=8 - 11 only
				// Anchor's host property isn't correctly set when s.url is relative
				urlAnchor.href = urlAnchor.href;
				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
					urlAnchor.protocol + "//" + urlAnchor.host;
			} catch ( e ) {

				// If there is an error parsing the URL, assume it is crossDomain,
				// it can be rejected by the transport if it is invalid
				s.crossDomain = true;
			}
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( completed ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		// Remove hash to simplify url manipulation
		cacheURL = s.url.replace( rhash, "" );

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// Remember the hash so we can put it back
			uncached = s.url.slice( cacheURL.length );

			// If data is available and should be processed, append data to url
			if ( s.data && ( s.processData || typeof s.data === "string" ) ) {
				cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add or update anti-cache param if needed
			if ( s.cache === false ) {
				cacheURL = cacheURL.replace( rantiCache, "$1" );
				uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce++ ) + uncached;
			}

			// Put hash and anti-cache on the URL that will be requested (gh-1732)
			s.url = cacheURL + uncached;

		// Change '%20' to '+' if this is encoded form body content (gh-2658)
		} else if ( s.data && s.processData &&
			( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
			s.data = s.data.replace( r20, "+" );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		completeDeferred.add( s.complete );
		jqXHR.done( s.success );
		jqXHR.fail( s.error );

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( completed ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				completed = false;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Rethrow post-completion exceptions
				if ( completed ) {
					throw e;
				}

				// Propagate others as results
				done( -1, e );
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Ignore repeat invocations
			if ( completed ) {
				return;
			}

			completed = true;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// Shift arguments if data argument was omitted
		if ( isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );


jQuery._evalUrl = function( url, options ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,

		// Only evaluate the response if it is successful (gh-4126)
		// dataFilter is not invoked for failure responses, so using it instead
		// of the default converter is kludgy but it works.
		converters: {
			"text script": function() {}
		},
		dataFilter: function( response ) {
			jQuery.globalEval( response, options );
		}
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		var wrap;

		if ( this[ 0 ] ) {
			if ( isFunction( html ) ) {
				html = html.call( this[ 0 ] );
			}

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var htmlIsFunction = isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( htmlIsFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function( selector ) {
		this.parent( selector ).not( "body" ).each( function() {
			jQuery( this ).replaceWith( this.childNodes );
		} );
		return this;
	}
} );


jQuery.expr.pseudos.hidden = function( elem ) {
	return !jQuery.expr.pseudos.visible( elem );
};
jQuery.expr.pseudos.visible = function( elem ) {
	return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
};




jQuery.ajaxSettings.xhr = function() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
};

var xhrSuccessStatus = {

		// File protocol always yields status code 0, assume 200
		0: 200,

		// Support: IE <=9 only
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport( function( options ) {
	var callback, errorCallback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr();

				xhr.open(
					options.type,
					options.url,
					options.async,
					options.username,
					options.password
				);

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
					headers[ "X-Requested-With" ] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							callback = errorCallback = xhr.onload =
								xhr.onerror = xhr.onabort = xhr.ontimeout =
									xhr.onreadystatechange = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {

								// Support: IE <=9 only
								// On a manual native abort, IE9 throws
								// errors on any property access that is not readyState
								if ( typeof xhr.status !== "number" ) {
									complete( 0, "error" );
								} else {
									complete(

										// File: protocol always yields status 0; see #8605, #14207
										xhr.status,
										xhr.statusText
									);
								}
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,

									// Support: IE <=9 only
									// IE9 has no XHR2 but throws on binary (trac-11426)
									// For XHR2 non-text, let the caller handle it (gh-2498)
									( xhr.responseType || "text" ) !== "text"  ||
									typeof xhr.responseText !== "string" ?
										{ binary: xhr.response } :
										{ text: xhr.responseText },
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				errorCallback = xhr.onerror = xhr.ontimeout = callback( "error" );

				// Support: IE 9 only
				// Use onreadystatechange to replace onabort
				// to handle uncaught aborts
				if ( xhr.onabort !== undefined ) {
					xhr.onabort = errorCallback;
				} else {
					xhr.onreadystatechange = function() {

						// Check readyState before timeout as it changes
						if ( xhr.readyState === 4 ) {

							// Allow onerror to be called first,
							// but that will not handle a native abort
							// Also, save errorCallback to a variable
							// as xhr.onerror cannot be accessed
							window.setTimeout( function() {
								if ( callback ) {
									errorCallback();
								}
							} );
						}
					};
				}

				// Create the abort callback
				callback = callback( "abort" );

				try {

					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {

					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
jQuery.ajaxPrefilter( function( s ) {
	if ( s.crossDomain ) {
		s.contents.script = false;
	}
} );

// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain or forced-by-attrs requests
	if ( s.crossDomain || s.scriptAttrs ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery( "<script>" )
					.attr( s.scriptAttrs || {} )
					.prop( { charset: s.scriptCharset, src: s.url } )
					.on( "load error", callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					} );

				// Use native DOM manipulation to avoid our domManip AJAX trickery
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// Force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// Make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// Save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// Support: Safari 8 only
// In Safari 8 documents created via document.implementation.createHTMLDocument
// collapse sibling forms: the second one becomes a child of the first one.
// Because of that, this security measure has to be disabled in Safari 8.
// https://bugs.webkit.org/show_bug.cgi?id=137337
support.createHTMLDocument = ( function() {
	var body = document.implementation.createHTMLDocument( "" ).body;
	body.innerHTML = "<form></form><form></form>";
	return body.childNodes.length === 2;
} )();


// Argument "data" should be string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( typeof data !== "string" ) {
		return [];
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}

	var base, parsed, scripts;

	if ( !context ) {

		// Stop scripts or inline event handlers from being executed immediately
		// by using document.implementation
		if ( support.createHTMLDocument ) {
			context = document.implementation.createHTMLDocument( "" );

			// Set the base href for the created document
			// so any parsed elements with URLs
			// are based on the document's URL (gh-2965)
			base = context.createElement( "base" );
			base.href = document.location.href;
			context.head.appendChild( base );
		} else {
			context = document;
		}
	}

	parsed = rsingleTag.exec( data );
	scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = stripAndCollapse( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.expr.pseudos.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};




jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {

	// offset() relates an element's border box to the document origin
	offset: function( options ) {

		// Preserve chaining for setter
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var rect, win,
			elem = this[ 0 ];

		if ( !elem ) {
			return;
		}

		// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
		// Support: IE <=11 only
		// Running getBoundingClientRect on a
		// disconnected node in IE throws an error
		if ( !elem.getClientRects().length ) {
			return { top: 0, left: 0 };
		}

		// Get document-relative position by adding viewport scroll to viewport-relative gBCR
		rect = elem.getBoundingClientRect();
		win = elem.ownerDocument.defaultView;
		return {
			top: rect.top + win.pageYOffset,
			left: rect.left + win.pageXOffset
		};
	},

	// position() relates an element's margin box to its offset parent's padding box
	// This corresponds to the behavior of CSS absolute positioning
	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset, doc,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// position:fixed elements are offset from the viewport, which itself always has zero offset
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// Assume position:fixed implies availability of getBoundingClientRect
			offset = elem.getBoundingClientRect();

		} else {
			offset = this.offset();

			// Account for the *real* offset parent, which can be the document or its root element
			// when a statically positioned element is identified
			doc = elem.ownerDocument;
			offsetParent = elem.offsetParent || doc.documentElement;
			while ( offsetParent &&
				( offsetParent === doc.body || offsetParent === doc.documentElement ) &&
				jQuery.css( offsetParent, "position" ) === "static" ) {

				offsetParent = offsetParent.parentNode;
			}
			if ( offsetParent && offsetParent !== elem && offsetParent.nodeType === 1 ) {

				// Incorporate borders into its offset, since they are outside its content origin
				parentOffset = jQuery( offsetParent ).offset();
				parentOffset.top += jQuery.css( offsetParent, "borderTopWidth", true );
				parentOffset.left += jQuery.css( offsetParent, "borderLeftWidth", true );
			}
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	// This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {

			// Coalesce documents and windows
			var win;
			if ( isWindow( elem ) ) {
				win = elem;
			} else if ( elem.nodeType === 9 ) {
				win = elem.defaultView;
			}

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : win.pageXOffset,
					top ? val : win.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length );
	};
} );

// Support: Safari <=7 - 9.1, Chrome <=37 - 49
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
		function( defaultExtra, funcName ) {

		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( isWindow( elem ) ) {

					// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
					return funcName.indexOf( "outer" ) === 0 ?
						elem[ "inner" + name ] :
						elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable );
		};
	} );
} );


jQuery.each( ( "blur focus focusin focusout resize scroll click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup contextmenu" ).split( " " ),
	function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
} );

jQuery.fn.extend( {
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );




jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	}
} );

// Bind a function to a context, optionally partially applying any
// arguments.
// jQuery.proxy is deprecated to promote standards (specifically Function#bind)
// However, it is not slated for removal any time soon
jQuery.proxy = function( fn, context ) {
	var tmp, args, proxy;

	if ( typeof context === "string" ) {
		tmp = fn[ context ];
		context = fn;
		fn = tmp;
	}

	// Quick check to determine if target is callable, in the spec
	// this throws a TypeError, but we will just return undefined.
	if ( !isFunction( fn ) ) {
		return undefined;
	}

	// Simulated bind
	args = slice.call( arguments, 2 );
	proxy = function() {
		return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
	};

	// Set the guid of unique handler to the same of original handler, so it can be removed
	proxy.guid = fn.guid = fn.guid || jQuery.guid++;

	return proxy;
};

jQuery.holdReady = function( hold ) {
	if ( hold ) {
		jQuery.readyWait++;
	} else {
		jQuery.ready( true );
	}
};
jQuery.isArray = Array.isArray;
jQuery.parseJSON = JSON.parse;
jQuery.nodeName = nodeName;
jQuery.isFunction = isFunction;
jQuery.isWindow = isWindow;
jQuery.camelCase = camelCase;
jQuery.type = toType;

jQuery.now = Date.now;

jQuery.isNumeric = function( obj ) {

	// As of jQuery 3.0, isNumeric is limited to
	// strings and numbers (primitives or objects)
	// that can be coerced to finite numbers (gh-2662)
	var type = jQuery.type( obj );
	return ( type === "number" || type === "string" ) &&

		// parseFloat NaNs numeric-cast false positives ("")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		!isNaN( obj - parseFloat( obj ) );
};




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}




var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;
} );

},{}],3:[function(require,module,exports){
const DatabaseHandler = require('./dataallocation/handler/databasehandler').DatabaseHandler;
const UPeerCommunicationHandler = require('./dataallocation/handler/peercommunicationhandler').UPeerCommunicationHandler;
const BaaSCommunicationHandler = require('./dataallocation/handler/baascommunicationhandler').BaaSCommunicationHandler;
const TENVIdentificationHandler = require('./dataallocation/handler/tenvidentificationhandler').TENVIdentificationHandler;
const model = require('./model');
const Fingerprint2 = require('fingerprintjs2');

// TODO: Revise functionality i.e. are all necessary methods already overwritten?
/*
we can make use of Jsdata library for example here to
store/read/update/delete the data using localstorage
*/

class IndexedDBDatabaseHandler extends DatabaseHandler {
    constructor() {
        super();
        this.dataDB = 'data';
        this.modelDB = 'model';
        this.swCompDB = 'swComponent';
        this.sscItemDB = 'sscItem';

        this.dataTable = 'data';
        this.modelTable = 'model';
        this.softwareComponentsTable = 'swComponent';
        this.smartServiceConfigurationTable = 'sscItem';
    }


    /**
     * Creates a new model object.
     * @param object: The object to create.
     * @return {Promise<boolean>} Success or not
     */
    async _createModel(object){
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                if (object.id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.modelDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.modelTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{    
                        var transaction   = database.transaction([_this.modelTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.modelTable);
                        var objectRequest = objectStore.put(object);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }


    /**
     * Creates a new data object.
     * @param object: The object to create.
     * @return {Promise<boolean>} Success or not
     */
    async _createData(object){
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                if (object.id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.dataDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.dataTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{    
                        var transaction   = database.transaction([_this.dataTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.dataTable);
                        var objectRequest = objectStore.put(object);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }



    /**
     * Creates a new software component object.

     * @param object: The object to create.
     * @return {Promise<boolean>} Success or not
     */
    async _createSoftwareComponent(object){
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                if (object.id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.swCompDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.softwareComponentsTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.softwareComponentsTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.softwareComponentsTable);
                        var objectRequest = objectStore.put(object);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }


    /**
     * Creates a new smart service configuration item.
     * @param object: The object to create.
     * @return {Promise<boolean>} Success or not
     */
    async _createSmartServiceConfiguration(object){
        const _this = this;

        return new Promise(
            function(resolve, reject) {
                if (object.id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.sscItemDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.smartServiceConfigurationTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.smartServiceConfigurationTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.smartServiceConfigurationTable);
                        var objectRequest = objectStore.put(object);
                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }


    /**
     * Returns all cached model item IDs accessible withing the database.
     * @return {Promise<Array>} The IDs of the stored model items.
     */
    async getModelItemIDs(){
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                var dbRequest = indexedDB.open(_this.modelDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    event.target.transaction.abort();
                    resolve(null);
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.modelTable]);
                        var objectStore   = transaction.objectStore(_this.modelTable);
                        var objectRequest = objectStore.getAll();

                        objectRequest.onerror = function(event) {
                            resolve(null);
                        };

                        objectRequest.onsuccess = function(event) {
                            if (objectRequest.result) resolve(objectRequest.result);
                            else resolve(null);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }

    /**
     * Returns all cached domain item IDs accessible withing the database.
     * @return {Promise<Array>} The IDs of the stored domain items.
     */
    async getDomainItemIDs(){
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                var dbRequest = indexedDB.open(_this.dataDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    event.target.transaction.abort();
                    resolve(null);
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{    
                        var transaction   = database.transaction([_this.modelTable]);
                        var objectStore   = transaction.objectStore(_this.modelTable);
                        var objectRequest = objectStore.getAll();

                        objectRequest.onerror = function(event) {
                            resolve(null);
                        };

                        objectRequest.onsuccess = function(event) {
                            if (objectRequest.result) resolve(objectRequest.result);
                            else resolve(null);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }

    /**
     * Returns all cached software item names accessible withing the database.
     * @return {Promise<Array>} The names of the cached software items.
     */
    async getSoftwareItemIDs(){
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                var dbRequest = indexedDB.open(_this.swCompDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    // Objectstore does not exist. Nothing to load
                    event.target.transaction.abort();
                    resolve(null);
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.softwareComponentsTable]);
                        var objectStore   = transaction.objectStore(_this.softwareComponentsTable);
                        var objectRequest = objectStore.getAll();

                        objectRequest.onerror = function(event) {
                            resolve(null);
                        };

                        objectRequest.onsuccess = function(event) {
                            if (objectRequest.result) resolve(objectRequest.result);
                            else resolve(null);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }


    /**
     * Returns all cached Smart Service Configuration Item IDs accessible withing the database.
     * @return {Promise<Array>} The IDs of the stored Smart Service Configuration Items.
     */
    async getSmartServiceConfigurationItemIDs(){
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                var dbRequest = indexedDB.open(_this.sscItemDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    event.target.transaction.abort();
                    resolve(null);
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{    
                        var transaction   = database.transaction([_this.smartServiceConfigurationTable]);
                        var objectStore   = transaction.objectStore(_this.smartServiceConfigurationTable);
                        var objectRequest = objectStore.getAll();

                        objectRequest.onerror = function(event) {
                            resolve(null);
                        };

                        objectRequest.onsuccess = function(event) {
                            if (objectRequest.result) resolve(objectRequest.result);
                            else resolve(null);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }


    /**
     * Reads a new model object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @returns {Promise<Array>} Array of objects.
     */
    async _readModel(query){
        const _this = this;
        const id = query.ressource;
        return new Promise(
            function(resolve, reject) {
                var dbRequest = indexedDB.open(_this.modelDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {

                    event.target.transaction.abort();
                    resolve(null);
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{    
                        var transaction   = database.transaction([_this.modelTable]);
                        var objectStore   = transaction.objectStore(_this.modelTable);
                        var objectRequest = objectStore.get(id);

                        objectRequest.onerror = function(event) {
                            resolve(null);
                        };

                        objectRequest.onsuccess = function(event) {
                            if (objectRequest.result) resolve(objectRequest.result);
                            else resolve(null);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }


    /**
     * Updates a model object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param object: The object to be updated.
     * @return {Promise<boolean>} Success or not
     */
    async _updateModel(query, object){
        const _this = this;
        const id = query.ressource;
        return new Promise(
            function(resolve, reject) {
                if (id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.modelDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.modelTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.modelTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.modelTable);
                        var objectRequest = objectStore.put(object);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }




    /**
     * Reads a new data object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @returns {Promise<Array>} Array of objects.
     */
    async _readData(query){
        const id = query.ressource;
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                var dbRequest = indexedDB.open(_this.dataDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    // Objectstore does not exist. Nothing to load
                    event.target.transaction.abort();
                    resolve(null);
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{    
                        var transaction   = database.transaction([_this.dataTable]);
                        var objectStore   = transaction.objectStore(_this.dataTable);
                        var objectRequest = objectStore.get(id);

                        objectRequest.onerror = function(event) {
                            resolve(null);
                        };

                        objectRequest.onsuccess = function(event) {
                            if (objectRequest.result) resolve(objectRequest.result);
                            else resolve(null);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }

    /**
     * Reads a new software component object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @returns {Promise<Array>} Array of objects.
     */
    async _readSoftwareComponent(query){
        const id = query.ressource;
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                var dbRequest = indexedDB.open(_this.swCompDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    // Objectstore does not exist. Nothing to load
                    event.target.transaction.abort();
                    resolve(null);
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try {
                        var transaction   = database.transaction([_this.softwareComponentsTable]);
                        var objectStore   = transaction.objectStore(_this.softwareComponentsTable);
                        var objectRequest = objectStore.get(id);

                        objectRequest.onerror = function(event) {
                            resolve(null);
                        };

                        objectRequest.onsuccess = function(event) {
                            if (objectRequest.result) resolve(objectRequest.result);
                            else {
                                resolve(null);
                            }
                        };
                    } catch (e) {
                        resolve(null);
                    }

                };
            }
        );
    }



    /**
     * Reads a new smart service configuration item.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @returns {Promise<Array>} Array of objects.
     */
    async _readSmartServiceConfiguration(query){
        const id = query.ressource;
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                var dbRequest = indexedDB.open(_this.sscItemDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    // Objectstore does not exist. Nothing to load
                    event.target.transaction.abort();
                    resolve(null);
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.smartServiceConfigurationTable]);
                        var objectStore   = transaction.objectStore(_this.smartServiceConfigurationTable);
                        var objectRequest = objectStore.get(id);

                        objectRequest.onerror = function(event) {
                            resolve(null);
                        };

                        objectRequest.onsuccess = function(event) {
                            if (objectRequest.result) resolve(objectRequest.result);
                            else resolve(null);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }

    /**
     * Updates a data object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param object: The object to be updated.
     * @return {Promise<boolean>} Success or not
     */
    async _updateData(query, object){
        const _this = this;
        const id = query.ressource;
        return new Promise(
            function(resolve, reject) {
                if (id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.dataDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.dataTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.dataTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.dataTable);
                        var objectRequest = objectStore.put(object);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }

    /**
     * Updates a software component object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param object: The object to be updated.
     * @return {Promise<boolean>} Success or not
     */
    async _updateSoftwareComponent(query, object){
        const _this = this;
        const id = query.ressource;
        return new Promise(
            function(resolve, reject) {
                if (id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.swCompDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.softwareComponentsTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.softwareComponentsTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.softwareComponentsTable);
                        var objectRequest = objectStore.put(object);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }


    /**
     * Updates a new smart service configuration item.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param object: The object to be updated.
     * @return {Promise<boolean>} Success or not
     */
    async _updateSmartServiceConfiguration(query, object){
        const _this = this;
        const id = query.ressource;
        return new Promise(
            function(resolve, reject) {
                if (id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.sscItemDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.smartServiceConfigurationTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.smartServiceConfigurationTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.smartServiceConfigurationTable);
                        var objectRequest = objectStore.put(object);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }

    /**
     * Deletes a data object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @return {Promise<boolean>} Success or not
     */
    async _deleteData(query){
        const id = query.ressource;
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                if (id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.dataDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.dataTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.dataTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.dataTable);
                        var objectRequest = objectStore.delete(id);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }

    /**
     * Deletes a software component object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @return {Promise<boolean>} Success or not
     */
    async _deleteSoftwareComponent(query){
        const id = query.ressource;
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                if (id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.swCompDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.softwareComponentsTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.softwareComponentsTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.softwareComponentsTable);
                        var objectRequest = objectStore.delete(id);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }

    /**
     * Deletes a model object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @return {Promise<boolean>} Success or not
     */
    async _deleteModel(query){
        const id = query.ressource;
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                if (id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.modelDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.modelTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.modelTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.modelTable);
                        var objectRequest = objectStore.delete(id);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }

    /**
     * Deletes a smart service configuration item.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @return {Promise<boolean>} Success or not
     */
    async _deleteSmartServiceConfiguration(query){
        const id = query.ressource;
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                if (id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.sscItemDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.smartServiceConfigurationTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.smartServiceConfigurationTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.smartServiceConfigurationTable);
                        var objectRequest = objectStore.delete(id);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }
}

class WebRTCUPeerCommunicationHandler extends UPeerCommunicationHandler {
    constructor(webRTCConfiguration) {
        super();
        this.connectedPeers = {};
        // this dict maintains the list of peers that sent the initial offer. on ICE restart, this peer will try to
        // send the offer again to create connection
        this.initiatedOffer = {};
        // the list of peers that are in webrtc:failed state
        this.failedConn = {};
        // this buffer contains msgs to be sent to the signalling server. if conn to the signalling server fails, the
        // msgs are buffered and on reconnection, sent to the server
        this.bufferSS = [];
        this.webRTCConfiguration = webRTCConfiguration;
        var rtcConfig = {
            "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }]
        }
        var localConn;
        var dataChannel;
        var sendChannel;
        this.MSG_TAGS = {
            START: "<START>",
            END: "<END>",
        };


    }

    send(message, I) {

        I.ssConn.send(JSON.stringify(message));
    }
    transfer(targetID, json) {
        const I = this;
        var returnonfailure = false;
        // already connected to the peer?
        if (this.connectedPeers[targetID]) {
            var sendChannel = this.connectedPeers[targetID].sendChannel;
            if (sendChannel) {
                if (sendChannel.readyState === "open") {// we can only send if the send channel is open
                    try {
                        sendChannel.send(json);
                        //this.sendChunckedToPeer(sendChannel, json);  add smaller packets for large message
                        this.issueStatusUpdate(this, "PEER MESSAGE SEND" + targetID);
                        return true;
                    } catch (err) {
                        console.error(err);
                    }
                } else {
                    I.issueStatusUpdate(I, "PEER SEND CHANNEL STATUS: " + sendChannel.readyState);
                    if (returnonfailure)
                        return false;
                    I.connectedPeers[targetID].onSendChannelOpen = function () {
                        I.issueStatusUpdate(I, "PEER SEND CHANNEL STATUS " + sendChannel.readyState);
                        I.transfer(targetID, json);
                    };
                }
            } else {
                I.issueStatusUpdate(I, "send channel is not defined");
            }
        } else {
            // attempt to connect to the peer!
            var peer = this.connectToPeer(this, targetID);

            I.onReady = function () {

                I.transfer(targetID, json);
            };
            // we creat an offer
            peer.localConnection.createOffer({
                iceRestart: false	// https://medium.com/the-making-of-appear-in/ice-restarts-5d759caceda6
            }).then(function (offer) {
                I.initiatedOffer[targetID] = true;
                peer.localConnection.setLocalDescription(offer);
                // we forward the offer to the signaling server
                var msg = I.formatServerMsg("offer", I.identificationHandler.getLocalID(), targetID, offer, null);
                I.send(msg, I);

            }, function (error) {
                I.issueStatusUpdate(I, "Encountered an error while creating offer ", error);

            });
        }
    }
    formatServerMsg(m_type, m_from, m_to, m_content, properties) {
        return {
            type: m_type,
            from: m_from,
            length: m_content.length,
            to: m_to,
            content: m_content,
            properties: properties
        };
    }
    setupEventListener() {
        const I = this;
        this.ssConn = new WebSocket('wss://service-tucana.de:9091');
        //this.ssConn = new WebSocket('ws://localhost:9090');
        this.ssConn.onopen = function () {
            if (I.identificationHandler.getLocalID() != null) {
                var msgLogin = I.formatServerMsg("login",
                    I.identificationHandler.getLocalID(),
                    null, "login", I.identificationHandler.getProperties());
                I.send(msgLogin, I);
            }

        };

        this.ssConn.onmessage = function (msg) {
            //console.log("Got message", msg.data);
            var msgObj = JSON.parse(msg.data);
            switch (msgObj.type) {
                case "login":
                    I.handleLogin(I, msgObj.success);
                    break;
                case "offer":
                    I.handleOffer(I, msgObj.offer, msgObj.from);
                    break;
                case "answer":
                    I.handleAnswer(I, msgObj.answer, msgObj.from);
                    break;
                case "candidate":
                    I.handleCandidate(I, msgObj.candidate, msgObj.from);
                    break;
                case "leave":
                    I.handleLeave(I, msgObj.from);
                    break;
                case "greetings":
                    I.issueStatusUpdate(I, "SS connection available");
                    break;
                case "error":
                    I.onSSError(I, msgObj.error);
                    break;
                case "properties":
                    I.issueStatusUpdate(I, msgObj.content);
                    break;
                default:
                    break;
            }
        };
        this.ssConn.onerror = function (err) {
            console.log("Error in Login to Signaling Server ", err);
        };


    }
    handleCandidate(I, candidate, from) {
        I.issueStatusUpdate(I, "SS candidate" + from);
        var candidateObj = new RTCIceCandidate(candidate);
        if (I.connectedPeers[from] == null) {
            console.log("Received Candidate from not connected user");
            return;
        }
        I.connectedPeers[from].localConnection.addIceCandidate(candidateObj).then(function () {
            // this value is only for debugging
            I.connectedPeers[from].noCand = I.connectedPeers[from].noCand + 1;
            I.connectedPeers[from].ready = true;
            if (I.onReady)
                I.onReady();
        }, function (error) {
            console.log(error);
        });
    }
    handleLeave(I, from) {
        I.issueStatusUpdate(I, "SS LEAVE" + from);
        if (I.connectedPeers[from]) {
            I.connectedPeers[from].localConnection.onicecandidate = null;
            I.connectedPeers[from].localConnection.close();
            delete I.connectedPeers[from];
            if (I.onPeerDisconnected)
                I.onPeerDisconnected(from);
        }
    }
    handleAnswer(I, answer, from) {
        if (from in I.failedConn) {
            I.failedConn[from] = false
        }
        I.issueStatusUpdate(I, "SS Answer" + from);
        // we set the remote description of the channel we previously created to the answer
        I.connectedPeers[from].localConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
    handleOffer(I, offer, peerId) {
        var to_connect = true;
        I.initiatedOffer[peerId] = false;

        var peer;
        if (peerId in I.failedConn) {
            if (I.failedConn[peerId] == true) {
                peer = I.connectedPeers[peerId];

                //set to false again
                I.failedConn[peerId] = false;
                to_connect = false;
            }
        }
        if (to_connect) {
            // we received an offer from a peer we create the RTC connection
            peer = I.connectToPeer(I, peerId);
        }

        I.issueStatusUpdate(I, " SS OFFER " + peerId);
        // we set the connection remote description to the given offer!
        peer.localConnection.setRemoteDescription(new RTCSessionDescription(offer));
        peer.localConnection.createAnswer(function (answer) {
            // we creat an answer and set the channel local description to the answer!
            peer.localConnection.setLocalDescription(answer);
            var msg = I.formatServerMsg("answer", I.identificationHandler.getLocalID(), peerId, answer, null);
            I.send(msg, I);
        }, function (error) {
            I.issueStatusUpdate(I, "create answer: " + error);
        });

    }
    handleLogin(I, success) {
        if (success) {
            I.issueStatusUpdate(I, "SS LOGGED IN");
        } else {
            I.onSSError(I, "Failed to Login");
        }
    }
    onSSError(I, err) {
        console.log(err);
    }
    issueStatusUpdate(I, status) {
        if (I && I.onStatusUpdate) {
            I.onStatusUpdate(status);
        }
        console.log("[PeerCommunication] ", status);
    }
    connectToPeer(I, peerId) {
        var peer = I.connectedPeers[peerId] = new Object();
        peer.ready = false;
        peer.noCand = 0;
        // Creating local channel for it
        peer.localConnection = new RTCPeerConnection(this.rtcConfig);
        peer.localConnection.onicecandidate = function (event) {
            if (event.candidate) {
                I.issueStatusUpdate(I, "candidate " + peerId);
                var msg = I.formatServerMsg("candidate", I.identificationHandler.getLocalID(), peerId, event.candidate, null);
                I.send(msg, I);

            }
        };
        peer.localConnection.oniceconnectionstatechange = function (event) {
            I.issueStatusUpdate(I, " PEER CONNECTION STATUS " + peerId + " is " + peer.localConnection.iceConnectionState);

            if (peer.localConnection.iceConnectionState == "connected") {// notify that this peer is connected now!
                if (I.onPeerConnected) {
                    I.onPeerConnected(peerId);
                }
            }
            if (peer.localConnection.iceConnectionState == "failed") {
                I.failedConn[peerId] = true;
                // wait for a small amount of time before initiating ice restart.
                setTimeout(function () {

                    if (peerId in I.initiatedOffer) {
                        if (I.initiatedOffer[peerId]) {
                            peer.localConnection.createOffer({
                                iceRestart: true	// https://medium.com/the-making-of-appear-in/ice-restarts-5d759caceda6
                            }).then(function (offer) {
                                peer.localConnection.setLocalDescription(offer);
                                var msg = I.formatServerMsg("offer", I.identificationHandler.getLocalID(), peerId, offer, null);
                                I.send(msg, I);
                            }, function (error) {
                                I.issueStatusUpdate(I, "Encountered an error while performing ICE restart ", error);
                            });
                        }
                    }
                }, 1000);
            }
        };

        //  when receiving data
        peer.localConnection.ondatachannel = function (event) {
            peer.receiveChannel = event.channel;
            var receivedData = new Object();
            peer.receiveChannel.onmessage = function (event) {
                if (event.data === I.MSG_TAGS.START) {
                    receivedData = "";
                }
                else if (event.data !== I.MSG_TAGS.END && event.data !== I.MSG_TAGS.START) {              
                    receivedData += event.data;
                }//TODO TEST with real request and response data
                else{
                  receivedData = JSON.parse(receivedData);
                  console.log("Complete message received :  "+JSON.stringify(receivedData));
                }
                
                if (receivedData.res == null) {
                    UPeerCommunicationHandler.handleRequest(receivedData.req);
                }
                else {
                    UPeerCommunicationHandler.handleResponse(receivedData.req, receivedData.res);
                }

            };
            peer.receiveChannel.onclose = function () {
                I.issueStatusUpdate(I, "PEER RECEIEVE CHANNEL STATUS " + peerId + " CLOSED ");
            };
        };

        peer.sendChannel = peer.localConnection.createDataChannel(peerId + "_channel", {
            reliable: true
        });

        peer.sendChannel.onerror = function (error) {
            I.issueStatusUpdate(I, "error on send channel of peer " + peerId + " " + error);
        };

        peer.sendChannel.onopen = function () {
            I.issueStatusUpdate(I, "PEER SEND CHANNEL STATUS: " + peerId + " OPEN ");
            if (I.connectedPeers[peerId].onSendChannelOpen)
                I.connectedPeers[peerId].onSendChannelOpen();
        };

        peer.sendChannel.onclose = function () {
            I.issueStatusUpdate(I, "PEER SEND CHANNEL STATUS: " + peerId + " CLOSED ");
        };
        return peer;

    }
    sendChunckedToPeer(sendChannel, msg){
        const I = this;
        var data = msg;
        var sendMax = data.length;
        var sendValue = 0;
        var curIndex = 0;
        var endIndex = 0;

        var chunkSize = 16384;
        var bufferFullThreshold = 5 * chunkSize;
        var usePolling = true;
        if ( typeof sendChannel.bufferedAmountLowThreshold === 'number') {
            usePolling = false;

            bufferFullThreshold = chunkSize / 2;

            // This is "overcontrol": our high and low thresholds are the same.
            sendChannel.bufferedAmountLowThreshold = bufferFullThreshold;
        }//if

        // Listen for one bufferedamountlow event.
        var listener = function() {
            sendChannel.removeEventListener('bufferedamountlow', listener);
            sendAllData();
        };
        var sendAllData = function() {
            while (sendValue < sendMax) {
                if (sendChannel.bufferedAmount > bufferFullThreshold) {
                    if (usePolling) {
                        setTimeout(sendAllData, 250);
                    } else {
                        sendChannel.addEventListener('bufferedamountlow', listener);
                    }
                    return;
                }
                sendValue += chunkSize;

                endIndex = curIndex + chunkSize > data.length ? data.length : curIndex + chunkSize;
                var msg = data.substring(curIndex, endIndex);
                if (curIndex == 0) {
                    sendChannel.send(I.MSG_TAGS.START);
                }
                sendChannel.send(msg);
                if (endIndex >= data.length) {
                    sendChannel.send(I.MSG_TAGS.END);
                }
                curIndex = endIndex;
            }
        };
        setTimeout(sendAllData, 0);
    }


    async getFilteredPeerIds(properties) {
        const I = this;
        var msg = I.formatServerMsg("properties", this.identificationHandler.getLocalID(), null, properties);
        I.send(msg, I)

    }
}

class RESTAPIBaaSCommunicationHandler extends BaaSCommunicationHandler {
    constructor() {
        super();
    }

    /**
     * This function can be used to fetch software items via REST API.
     * @param {CRUDOperation} crudOperation
     * @return {Array<Promise<SoftwareItem>>}
     */
    async broadcastSBaaS(crudOperation) {
        const targets = crudOperation.getBroadcastConfiguration().getTargets();
        const promises = [];
        for (let ressource of targets) {
            const options = {
                'headers' : {
                    'Accept' : 'application/javascript'
                }
            };
            promises.push(
                fetch(ressource, options)
                    .then(response => {
                        return response.text();
                    }).then(jsCode => {
                    return new model.SoftwareItem(ressource, jsCode);
                })
            );
        }
        return {
            req : crudOperation,
            res : {
                status: model.RESPONSE_STATUS.PROVIDED,
                sc: await Promise.all(promises)
            }
        }
    }

    /**
     * This function can be used to fetch domain items via REST API.
     * @param {CRUDOperation} crudOperation
     * @return {Array<Promise<DomainItem>>}
     */
    async broadcastDBaaS(crudOperation) {
        const targets = crudOperation.getBroadcastConfiguration().getTargets();
        const promises = [];
        for (let ressource of targets) {
            const options = {
                'headers' : {
                    'Accept' : 'application/json'
                }
            };

            promises.push(
                fetch(ressource, options)
                    .then(response => {
                        return response.json();
                    }) .then(jsonObject => {
                    return new model.DomainItem(ressource, jsonObject);
                })
            );
        }
        return await Promise.all(promises);
    }

    /**
     * This function can be used to fetch smart service configuration items via REST API.
     * @param {CRUDOperation} crudOperation
     * @return {Array<Promise<SmartServiceConfigurationItem>>}
     */
    async broadcastSSCBaaS(crudOperation) {
        const targets = crudOperation.getBroadcastConfiguration().getTargets();
        const promises = [];
        for (let ressource of targets) {
            const options = {
                'headers' : {
                    'Accept' : 'application/json'
                }
            };
            promises.push(
                fetch(ressource, options)
                    .then(response => {
                        return response.json();
                    }) .then(jsonObject => {
                    return new model.SmartServiceConfigurationItem(ressource, jsonObject.version, jsonObject.configuration, jsonObject.context);
                })
            );
        }
        return await Promise.all(promises);
    }

    /**
     * This function can be used to fetch model items via REST API.
     * @param {CRUDOperation} crudOperation
     * @return {Array<Promise<ModelItem>>}
     */
    async broadcastMBaaS(crudOperation) {
        const targets = crudOperation.getBroadcastConfiguration().getTargets();
        const promises = [];
        for (let ressource of targets) {
            const options = {
                'headers' : {
                    'Accept' : 'application/json'
                }
            };
            promises.push(
                fetch(ressource, options)
                    .then(response => {
                        return response.json();
                    }) .then(jsonObject => {
                    return new model.ModelItem(ressource, jsonObject);
                })
            );
        }
        return await Promise.all(promises);
    }
}

class BrowserFingerprintIdentificationHandler extends TENVIdentificationHandler {


    /**
     *
     * @param signUpFormId
     * @param logoutButtonId
     */

    constructor(signUpFormId, logoutButtonId) {
        super();

        var signUpForm = document.getElementById(signUpFormId);
        var logoutButton = document.getElementById(logoutButtonId);
        var span = document.createElement("SPAN");

        span.className = "close";
        span.title = "Close Modal";
        span.innerHTML = '&times';
        span.onclick = function () {
            signUpForm.style.display = 'none';
            localStorage.setItem("id", null);

        };

        signUpForm.appendChild(span);

        var form = document.createElement("form");
        form.className = "modal-content";

        var container = document.createElement("id");
        container.className = "container";
        signUpForm.appendChild(form);


        var container = document.createElement("div");
        container.className = "container";
        container.id = "signUpContainer";
        form.appendChild(container);

        signUpForm.style.display = 'block';

        function createCheckbox(labelContent, id, container) {
            var d = document.createElement("div");
            var v = document.createElement("input");
            v.type = "checkbox";
            v.id = id;

            var label = document.createElement('label');
            label.htmlFor = "id";
            label.appendChild(document.createTextNode(labelContent));
            d.appendChild(v);
            d.appendChild(label);
            container.appendChild(d);

        }

        function createTextField(id, container, placeholder, labelContent) {
            var keywordsFieldLabel = document.createElement("label");
            keywordsFieldLabel.innerText = labelContent;

            var keywordField = document.createElement("input");
            keywordField.type = "text";
            keywordField.id = id;
            keywordField.placeholder = placeholder;

            container.appendChild(keywordsFieldLabel);
            container.appendChild(keywordField);
        }


        var p = document.createElement("P");
        p.innerText = "Please fill in this form to create an account.";
        container.appendChild(p);

        var h1 = document.createElement("h2");
        h1.innerText = "Sign Up";
        container.appendChild(h1);


        createTextField("nameField", container, "Name", "Name");
        createTextField("keywordField", container, "Keywords of your peer", "Keywords");
        createCheckbox("Commercial use", "commercialBox", container);
        createCheckbox("Content Offering", "contentOffering", container);
        createCheckbox("Model Offering", "modelOffering", container);
        createCheckbox("Software Offering", "softwareOffering", container);


        var cancelLabel = document.createElement('label');
        cancelLabel.innerText = "Cancel";
        var cancelButton = document.createElement("button");
        cancelButton.onclick = "document.getElementById('" + signUpFormId + "').style.display='none'";
        cancelButton.type = "button";
        cancelButton.className = "cancelbtn";
        cancelButton.appendChild(cancelLabel);


        var submitLabel = document.createElement('label');
        submitLabel.innerText = "Submit";
        var submitButton = document.createElement("button");
        submitButton.onclick = "document.getElementById('" + signUpFormId + "').style.display='none'";
        submitButton.id = "submitButton";
        submitButton.className = "signupbtn";
        submitButton.appendChild(submitLabel);

        var buttonDiv = document.createElement("div");
        buttonDiv.className = "clearfix";

        buttonDiv.appendChild(cancelButton);
        buttonDiv.appendChild(submitButton);
        container.appendChild(buttonDiv);


        this.localId = localStorage.getItem("id");
        this.name = localStorage.getItem("name");
        this.modelOffering = localStorage.getItem("modelOffering");
        this.contentOffering = localStorage.getItem("contentOffering");
        this.commercial = localStorage.getItem("commercial");
        this.softwareOffering = localStorage.getItem("softwareOffering");
        this.keywords = localStorage.getItem("keywords");


        logoutButton.addEventListener("click", function (e) {
            localStorage.clear();
            this.localId = null;
            localStorage.setItem("id", null);
            location.reload(true);

        });


        Fingerprint2.get(function (components) {
            let localId = Fingerprint2.x64hash128(components.map(function (pair) { // create an ID from the hashed components
                return pair.value;
            }).join(), 31);
            if (localId !== localStorage.getItem("id")) {
                console.log("Id changed from: " + localStorage.getItem("id") + " to: " + localId);
                localStorage.setItem("id", localId);
            }

            for (var i in components) {
                var obj = components[i];
                var line = obj.key + " = " + String(obj.value).substr(0, 200);
                //console.log(line);
            }

        });


        if (localStorage.getItem("id") && localStorage.getItem("name")) {

            console.log("User already logged in with id: " + localStorage.getItem("id"));

            document.getElementById(signUpFormId).style.display = 'none';

        } else {
           submitButton.addEventListener("click", function (e) {

                this.name = document.getElementById("nameField").value;
                localStorage.setItem("name", this.name);
                this.keywords = document.getElementById("keywordField").value;
                localStorage.setItem("keywords", this.keywords);
                if (document.getElementById("modelOffering").checked) {
                    localStorage.setItem("modelOffering", true);
                    this.modelOffering = true;
                } else {
                    localStorage.setItem("modelOffering", false);
                    this.modelOffering = false;
                }
                if (document.getElementById("contentOffering").checked) {
                    localStorage.setItem("contentOffering", true);
                    this.contentOffering = true;
                } else {
                    localStorage.setItem("contentOffering", false);
                    this.contentOffering = false;
                }
                if (document.getElementById("softwareOffering").checked) {
                    localStorage.setItem("softwareOffering", true);
                    this.softwareOffering = true;
                } else {
                    localStorage.setItem("softwareOffering", false);
                    this.softwareOffering = false;
                }
                if (document.getElementById("commercialBox").checked) {
                    localStorage.setItem("commercial", true);
                    this.commercial = true;
                } else {
                    localStorage.setItem("commercial", false);
                    this.commercial = false;
                }
                this.localId = localStorage.getItem("id");
                location.reload(true);


            });


            /*show register form*/
            signUpForm.style.display = 'block';


        }
        this.properties = {
            localId: this.localId,
            commercial: this.commercial,
            software: this.softwareOffering,
            content: this.contentOffering,
            model: this.modelOffering,
            keywords: this.keywords,
            name: this.name

        }
    }

    /**
     * Returns the local id of the peer.
     * @return {String}: The local id of the peer.
     */
    getLocalID() {
        return this.localId;
    }

    /**
     * Returns the properties of the Peer.
     * @return {Array}: All properties of the peer.
     */
    getProperties() {
        return this.properties;
    }

    /**
     * Returns the name of the peer.
     * @return {String}: The name of the peer.
     */
    getName() {
        return this.name;
    }

    /**
     * Returns the type of the peer.
     * @return {String}: The type of the peer.
     */
    getType() {
        return this.commercial;
    }

    /**
     * Returns the geographic information of the peer.
     * @return {String}: The geographic information of the peer.
     */
    async getGeography() {

        var result = {};

        function reverseGeocode(latitude, longitude, res) {


            var settings = {
                "async": true,
                "crossDomain": true,
                "url": "https://us1.locationiq.com/v1/reverse.php?key=95a3c547a4d595&lat=" + latitude + "&lon=" + longitude + "&format=json",
                "method": "GET"
            }

            return $.ajax(settings).done(function (response) {

                res();
            });

        }

        let promise = new Promise(function (res, rej) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    result.geo = reverseGeocode(position.coords.latitude, position.coords.longitude, res);
                })
            }
        );

        await promise;

        console.log(result.geo.responseJSON);

        return result.geo;
    }

    /**
     * Returns the software offering of the peer.
     * @return {String}: The software offering of the peer.
     */
    getSoftwareOffering() {
        return this.softwareOffering;
    }

    /**
     * Returns the model offering of the peer.
     * @return {String}: The model offering of the peer.
     */
    getModelOffering() {
        return this.modelOffering;
    }

    /**
     * Returns the content offering of the peer.
     * @return {String}: The content offering of the peer.
     */
    getContentOffering() {
        return this.contentOffering;
    }

    /**
     * Returns the keywords of the peer.
     * @return {Array}: The keywords of the peer.
     */
    getKeywords() {
        return this.keywords;
    }
}


module.exports.DOMUIAdapter = require('./coreplatform/ui_adapters/uiAdapter').domAdapter;
module.exports.BrowserFingerprintIdentificationHandler = BrowserFingerprintIdentificationHandler;
module.exports.IndexedDBDatabaseHandler = IndexedDBDatabaseHandler;
module.exports.RESTAPIBaaSCommunicationHandler = RESTAPIBaaSCommunicationHandler;
module.exports.WebRTCUPeerCommunicationHandler = WebRTCUPeerCommunicationHandler;


},{"./coreplatform/ui_adapters/uiAdapter":8,"./dataallocation/handler/baascommunicationhandler":12,"./dataallocation/handler/databasehandler":13,"./dataallocation/handler/peercommunicationhandler":14,"./dataallocation/handler/tenvidentificationhandler":15,"./model":16,"fingerprintjs2":1}],4:[function(require,module,exports){
const model = require('../model');

/**
 * Interface of classes that represent a Minion.
 * @interface
 */
class Minion {
    /**
     * Interface for an executable software component called minion.
     * @param {DataAccessService} dataAccessService: Interface for data access.
     * @param {MinionController} minionController: The minion controller to interact with.
     * @param {String} id: The id of the minion.
     * @param {Array<Object>} dependencies: List of required libraries of the minion with their URI and name within the object.
     */
    constructor(dataAccessService, minionController, id, dependencies) {
        if (new.target === Minion) {
            throw new Error('Abstract Class cannot be instantiated.');
        }
        this.instId = null;
        this.run = false;

        Object.defineProperty(this, 'dataAccessService', {
            get: function () {
                return dataAccessService;
            }
        });
        Object.defineProperty(this, 'dependencies', {
            get: function () {
                return dependencies;
            }
        });

        Object.defineProperty(this, 'minionController', {
            get: function () {
                return minionController;
            }
        });

        Object.defineProperty(this, 'running', {
            get: function () {
                return this.run;
            },
            set : function (v) {
                this.run = v;
            }
        });

        Object.defineProperty(this, 'id', {
            get: function () {
                return id;
            }
        });

        Object.defineProperty(this, 'instanceId', {
            get: function () {
                return this.instId;
            },

            set(v) {
                this.instId = v;
            }
        });
    }

    /**
     * Initializes the minion first while loading the required dependencies.
     * @return {Promise<void>}
     */
    async initialize() {
        await this._loadJSDependencies();
    }


    /**
     * Avticates a minion by loading the required dependencies and starting the minion runtime (e.g. measurement, dedicated threads etc.)
     * @return {Promise<void>}
     */
    async activate() {
        await this.initialize();
        this.running = true;
        throw new Error('You have to implement the method activate!');
    }

    /**
     * Terminates a running minion by clearing the runtime environment.
     */
    terminate() {
        this.running = false;
        throw new Error('You have to implement the method terminate!');
    }

    /**
     * Saves a minion in the local storage of the TUCANA environment.
     * @return {Promise<Object>} The status of the operation.
     */
    async saveMinionLocally() {
        let operationType = model.CRUD.CREATE;
        const code = this.getCode();
        const id = this.getId();
        const swComponent = new model.SoftwareItem(id, code);
        const crudOperation = new model.CRUDOperation(operationType, model.OBJECTTYPE.SOFTWARE, swComponent, null, null);
        return await this.dataAccessService.requestCRUDOperation(crudOperation);
    }

    /**
     * Loads a minion specified by its ID from the database.
     * @param {DataAccessService} dataAccessService: The DataAccessService.
     * @param {String} softwareItemId: The ID of the minion to load.
     * @return {Promise<Object>} The request result with the software item.
     */
    static async loadMinion(dataAccessService, softwareItemId) {
        const query = new model.DatabaseQuery(model.QUERYTYPE.STATIC, softwareItemId, []);
        const operation = new model.CRUDOperation(model.CRUD.READ, model.OBJECTTYPE.SOFTWARE, null, query, null);
        return await dataAccessService.requestCRUDOperation(operation);
    }


    /**
     * Interprets the code of the software item.
     * @param {SoftwareItem} softwareItem: The software item.
     * @return {Class} The interpreted minion.
     */
    static interpretMinionCode(softwareItem) {
        return softwareItem.getClass();
    }


    /**
     * Notifies a minion whenever there is new data provided as input.
     * @param {*} newData: Data generated by the previous minion.
     */
    notify(newData) {
        throw new Error('You have to implement the method notify!');
    }


    /**
     * Returns the running status of the minion.
     * @return {boolean} Running or not.
     */
    getRunning() {
        return this.running;
    }

    /**
     * Sets the running status of a minion.
     * @param {boolean} running: The new running status.
     */
    setRunning(running) {
        this.running = running;
    }

    /**
     * Returns the constructor of the minion.
     * @return {Class} The constructor.
     */
    getConstructor() {
        return this.constructor;
    }

    /**
     * Loads the dependecies i.e. libraries necessary for the minion execution.
     * @return {Promise<void>}
     * @private
     */
    async _loadJSDependencies() {
        if (this.dependencies instanceof Array && this.dependencies.length > 0) {
            const fetchPromises = [];
            for (let dependency of this.dependencies) {
                try {
                    fetchPromises.push(self.fetch(dependency.uri, {
                        method: 'GET',
                        headers: {'Accept': 'application/javascript'},
                        mode: 'cors',
                        cache: 'default'
                    })
                        .then(function (res) {
                            return res.text()
                                .then(function (script) {
                                    if (script.toLowerCase() !== 'not found') {
                                        eval(script);
                                        console.log('Loaded: ' + dependency.name);
                                    }
                                });
                        }));
                } catch (e) {
                    return new Error('Not possible to load: ' + dependency.uri);
                }
            }
            return Promise.all(fetchPromises);
        } else {
            return Promise.resolve();
        }
    }

    /**
     * Returns the code i.e. the class of the minion as a string.
     * @return {String} The class string.
     */
    getCode() {
        return this.constructor.toString();
    }

    /**
     * Returns the name of the particular minion i.e. the name of the class.
     * @return {String} The minion name.
     */
    getName() {
        return this.constructor.name;
    }

    /**
     * Returns the unique ID of the particular minion
     * @return {String} The minion ID.
     */
    getId() {
        return this.id;
    }

    /**
     * Returns the unique ID of a running instance of a minion.
     * @return {String} The Instance ID.
     */
    getInstanceId() {
        return this.instanceId;
    }

    /**
     * Sets the ID of the minion.
     * @param {String} newID: The new ID
     */
    setId(newID) {
        this.id = newID;
    }

    /**
     * Sets the instance ID of the running minion.
     * @param {String} newInstanceID: The new instance ID.
     */
    setInstanceId(newInstanceID) {
        this.instanceId = newInstanceID;
    }

}

/**
 * Interface of a minion performing local data storage operations.
 * @interface
 */
class LocalDSOMinion extends Minion {

    /**
     * Abstract class for all minion types performing local data storage operations i.e. local CRUD Operations.
     * @param {DataAccessService} dataAccessService: The data access service object.
     * @param {MinionController} minionController: The minion controller.
     * @param {String} id: The id of the minion.
     * @param {Array<Object>} dependencies: The dependant libraries of this minion.
     */
    constructor(dataAccessService, minionController, id, dependencies) {
        super(dataAccessService, minionController, id, dependencies);
        if (new.target === LocalDSOMinion) {
            throw new Error('Abstract Class cannot be instantiated.');
        }
    }

    /**
     * Performs a CREATE storage operation for newly produced data
     * @param {String} id: The id of the new object.
     * @param {Object} dataObject: The data object to be created.
     * @return {Promise<Object>} The result of the storage request.
     */
    async saveData(id, dataObject) {
        const domainItem = new model.DomainItem(id, dataObject);
        const crudOperation = new model.CRUDOperation(model.CRUD.CREATE, model.OBJECTTYPE.DATA, domainItem, null, null);
        return await this.dataAccessService.requestCRUDOperation(crudOperation);
    }

    /**
     * Performs a READ storage operation on the local database.
     * @param {String} id: The identifier of the object to be read.
     * @return {Promise<Object>} The result of the operation.
     */
    async readData(id) {
        const databaseQuery = new model.DatabaseQuery(model.QUERYTYPE.STATIC, id, []);
        const crudOperation = new model.CRUDOperation(model.CRUD.READ, model.OBJECTTYPE.DATA, null, databaseQuery, null);
        return await this.dataAccessService.requestCRUDOperation(crudOperation);
    }

    /**
     * Performs an UPDATE storage operation for produced data output.
     * @param {String} id: The identifier of the initial object.
     * @param {Object} dataObject: The updated version of the data object.
     * @return {Promise<Object>} The result of the executed operation.
     */
    async updateData(id, dataObject) {
        const databaseQuery = new model.DatabaseQuery(model.QUERYTYPE.STATIC, id, []);
        const domainItem = new model.DomainItem(id, dataObject);
        const crudOperation = new model.CRUDOperation(model.CRUD.UPDATE, model.OBJECTTYPE.DATA, domainItem, databaseQuery, null);
        return await this.dataAccessService.requestCRUDOperation(crudOperation);
    }

    /**
     * Performs an DELETE storage operation.
     * @param {String} id: The identifier of the object to be deleted.
     * @return {Promise<Object>} The result of the executed operation.
     */
    async deleteData(id) {
        const databaseQuery = new model.DatabaseQuery(model.QUERYTYPE.STATIC, id, []);
        const crudOperation = new model.CRUDOperation(model.CRUD.DELETE, model.OBJECTTYPE.DATA, null, databaseQuery, null);
        return await this.dataAccessService.requestCRUDOperation(crudOperation);
    }
}


/**
 * Interface of a Communicator Minion.
 * @interface
 */
class Cmin extends Minion {

    /**
     * Class for Communicator Minions with no data storage operations.
     * @param {DataAccessService} dataAccessService: The data access service object.
     * @param {MinionController} minionController: The minion controller.
     * @param {String} id: The id of the minion.
     * @param {Array<Object>} dependencies: The dependant libraries of this minion.
     */
    constructor(dataAccessService, minionController, id, dependencies) {
        super(dataAccessService, minionController, id, dependencies);
        if (new.target === Cmin) {
            throw new Error('Abstract Class cannot be instantiated.');
        }
    }

    /**
     * Broadcasts a CREATE operation.
     * @param {String} id: The identifier of the data object.
     * @param {Object} dataObject: The data object to be broadcasted.
     * @param {BroadcastConfiguration} broadcastConfiguration: The configuration of the broadcasting channels.
     * @return {Promise<Object>} The result of the operation.
     */
    async broadcastDataCreateOperation(id, dataObject, broadcastConfiguration) {
        const domainItem = new model.DomainItem(id, dataObject);
        const crudOperation = new model.CRUDOperation(model.CRUD.CREATE, model.OBJECTTYPE.DATA, domainItem, null, broadcastConfiguration);
        return await this.dataAccessService.requestCRUDOperation(crudOperation);
    }

    /**
     * Broadcasts a READ operation.
     * @param {String} id: The identifier of the data object.
     * @param {BroadcastConfiguration} broadcastConfiguration: The configuration of the broadcasting channels.
     * @return {Promise<Object>} The result of the operation.
     */
    async broadcastDataReadOperation(id, broadcastConfiguration) {
        const databaseQuery = new model.DatabaseQuery(model.QUERYTYPE.STATIC, id, []);
        const crudOperation = new model.CRUDOperation(model.CRUD.READ, model.OBJECTTYPE.DATA, null, databaseQuery, broadcastConfiguration);
        return await this.dataAccessService.requestCRUDOperation(crudOperation);
    }

    /**
     * Broadcasts an UPDATE operation.
     * @param {String} id: The identifier of the data object.
     * @param {Object} dataObject: The new data object to be broadcasted.
     * @param {BroadcastConfiguration} broadcastConfiguration: The configuration of the broadcasting channels.
     * @return {Promise<Object>} The result of the operation.
     */
    async broadcastDataUpdateOperation(id, dataObject, broadcastConfiguration) {
        const domainItem = new model.DomainItem(id, dataObject);
        const databaseQuery = new model.DatabaseQuery(model.QUERYTYPE.STATIC, id, []);
        const crudOperation = new model.CRUDOperation(model.CRUD.UPDATE, model.OBJECTTYPE.DATA, domainItem, databaseQuery, broadcastConfiguration);
        return await this.dataAccessService.requestCRUDOperation(crudOperation);
    }

    /**
     * Broadcasts a DELETE operation.
     * @param {String} id: The identifier of the data object.
     * @param {BroadcastConfiguration} broadcastConfiguration: The configuration of the broadcasting channels.
     * @return {Promise<Object>} The result of the operation.
     */
    async broadcastDataDeleteOperation(id, broadcastConfiguration) {
        const databaseQuery = new model.DatabaseQuery(model.QUERYTYPE.STATIC, id, []);
        const crudOperation = new model.CRUDOperation(model.CRUD.DELETE, model.OBJECTTYPE.DATA, null, databaseQuery, broadcastConfiguration);
        return await this.dataAccessService.requestCRUDOperation(crudOperation);
    }
}

/**
 * Interface of a special class of Cmin with additional visualization purposes.
 * @interface
 */
class VisualizationCmin extends Cmin {
    /**
     * Contructor of the Visualization Cmin.
     * @param {DataAccessService} dataAccessService: The data access service object.
     * @param {MinionController} minionController: The minion controller.
     * @param {String} id: The id of the minion.
     * @param {*} uiAdapter
     * @param {Array<Object>} dependencies: The dependant libraries of this minion.
     */
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies) {
        super(dataAccessService, minionController, id, dependencies);
        if (new.target === VisualizationCmin) {
            throw new Error('Abstract Class cannot be instantiated.');
        }
        Object.defineProperty(this, 'uiAdapter', {
            get: function () {
                return uiAdapter;
            }
        });
    }

    /**
     * Clears the user interface.
     */
    clearUserInterface() {
        throw new Error('You have to implement the method clearUserInterface!');
    }
}

/**
 * Interface of a Thinker Minion containing local EdgeAI.
 * @interface
 */
class Tmin extends LocalDSOMinion {

    /**
     * Class for Thinker Minions supporting data storage operations.
     * @param {DataAccessService} dataAccessService: The data access service object.
     * @param {MinionController} minionController: The minion controller.
     * @param {String} id: The id of the minion.
     * @param {Array<Object>} dependencies: The dependant libraries of this minion.
     */
    constructor(dataAccessService, minionController, id, dependencies) {
        super(dataAccessService, minionController, id, dependencies);
        if (new.target === Tmin) {
            throw new Error('Abstract Class cannot be instantiated.');
        }
    }

    /**
     * Configures the input parameter of the model e.g. hyperparameter.
     * Needs to be called by activation function if implemented.
     * @param {*} configurationParameter: The configuration parameter of the local model.
     */
    configureModel(configurationParameter) {
        throw new Error('You have to implement the method configureModel!');
    }

    /**
     * Saves a model in the local database.
     * @param {String} id: The identifier of the model to be saved.
     * @param {ModelItem} edgeAIModel: The model to be saved.
     * @return {Promise<Object>} The result of the operation.
     */
    async createModel(id, edgeAIModel) {
        const modelItem = new model.ModelItem(id, edgeAIModel);
        const crudOperation = new model.CRUDOperation(model.CRUD.CREATE, model.OBJECTTYPE.MODEL, modelItem, null, null);
        return await this.dataAccessService.requestCRUDOperation(crudOperation);
    }

    /**
     * Loads a model from the local database.
     * @param {String} id: The identifier of the model to be loaded.
     * @return {Promise<Object>} The result of the operation.
     */
    async readModel(id) {
        const databaseQuery = new model.DatabaseQuery(model.QUERYTYPE.STATIC, id, []);
        const crudOperation = new model.CRUDOperation(model.CRUD.READ, model.OBJECTTYPE.MODEL, null, databaseQuery, null);
        return await this.dataAccessService.requestCRUDOperation(crudOperation);
    }

    /**
     * Updates an existing model in the local database.
     * @param {String} id: The identifier of the model to be updated.
     * @param {ModelItem} edgeAIModel: The updated version of the model.
     * @return {Promise<Object>} The result of the operation.
     */
    async updateModel(id, edgeAIModel) {
        const databaseQuery = new model.DatabaseQuery(model.QUERYTYPE.STATIC, id, []);
        const modelItem = new model.ModelItem(id, edgeAIModel);
        const crudOperation = new model.CRUDOperation(model.CRUD.UPDATE, model.OBJECTTYPE.MODEL, modelItem, databaseQuery, null);
        return await this.dataAccessService.requestCRUDOperation(crudOperation);
    }

    /**
     * Deletes a model in the local database.
     * @param {String} id: The identifier of the model to be deleted.
     * @return {Promise<Object>} The result of the operation.
     */
    async deleteModel(id) {
        const databaseQuery = new model.DatabaseQuery(model.QUERYTYPE.STATIC, id, []);
        const crudOperation = new model.CRUDOperation(model.CRUD.DELETE, model.OBJECTTYPE.MODEL, null, databaseQuery, null);
        return await this.dataAccessService.requestCRUDOperation(crudOperation);
    }

}

/**
 * Interface of a Perceiver Minion performing perception of data and similar tasks.
 * @interface
 */
class Pmin extends LocalDSOMinion {

    /**
     * Class for Perceiver Minions supporting data storage operations.
     * @param {DataAccessService} dataAccessService: The data access service object.
     * @param {MinionController} minionController: The minion controller.
     * @param {String} id: The id of the minion.
     * @param {Array<Object>} dependencies: The dependant libraries of this minion.
     */
    constructor(dataAccessService, minionController, id, dependencies) {
        super(dataAccessService, minionController, id, dependencies);
        if (new.target === Pmin) {
            throw new Error('Abstract Class cannot be instantiated.');
        }
    }
}

module.exports.Minion = Minion;
module.exports.LocalDSOMinion = LocalDSOMinion;
module.exports.Cmin = Cmin;
module.exports.VisualizationCmin = VisualizationCmin;
module.exports.Pmin = Pmin;
module.exports.Tmin = Tmin;
},{"../model":16}],5:[function(require,module,exports){
const minion = require('./minion');

/**
 * Controller of the minion infrastructure.
 * @class
 */
class MinionController {

    /**
     * Constructor of a minion controller.
     * @param {DataAccessService} dataAccessService: The data access service object.
     * @param {} uiAdapter: The UI adapter giving access to manipulate the UI.
     */
    constructor(dataAccessService, uiAdapter) {
        this.minionMap = new MinionCommunicationMap();
        this.counter = 0;
        this.minionClasses = {};
        this.minionInstances = {};

        this.dataAccessService = dataAccessService;
        this.uiAdapter = uiAdapter;
    }

    /**
     * Registers a set of software items within the local workspace.
     * @param {Array<SoftwareItem>}softwareItems
     */
    register(softwareItems) {
        for (let i = 0; i < softwareItems.length; i++) {
            this._addMinionClass(softwareItems[i].getId(), softwareItems[i].getClass());
        }
    }

    /**
     * Bind minions to a smart service configuration
     * @param {Array<MinionSpecification>} minionSpecifications: List of minion specifications.
     */
    bind(minionSpecifications) {
        for (let minionSpecification of minionSpecifications) {
            if (!minionSpecification.getInstanceId())
                minionSpecification.setInstanceId(0);
            this._initialize(minionSpecification);

        }
        for (let minionSpecification of minionSpecifications) {
            if (minionSpecification.getTargetMinionIds()) {
                const sourceId = minionSpecification.getInstanceId();
                for (let targetId of minionSpecification.getTargetMinionIds()) {
                    this._addTransition(sourceId, targetId);
                }
            }
        }
    }

    /**
     * Activate all minions that are already bound.
     */
    async activate() {
        for (let minionInstanceId of Object.keys(this.minionInstances)) {
            try {
                await this.minionInstances[minionInstanceId].activate();
            } catch (e) {
                console.warn(e);
            }
        }
    }

    /**
     * Terminate running minions.
     */
    terminate() {
        for (let minionInstanceId of Object.keys(this.minionInstances)) {
            this.minionInstances[minionInstanceId].terminate();
        }
    }

    /**
     * Clear the whole runtime environment i.e. transitions and instances.
     */
    clearRuntimeEnvironment() {
        this.terminate();
        this.minionMap = new MinionCommunicationMap();
        this.minionInstances = {};
    }

    /**
     * Submit new data into the minion network.
     * @param {Minion} sourceId: The source of the data.
     * @param {*} dataItem: The data to be forwarded.
     */
    notify(sourceMinion, dataItem) {
        console.log(dataItem);
        const targets = this.minionMap.getTargetMinionIDs(sourceMinion.getInstanceId());
        for (let target of targets) {
            this.minionInstances[target].notify(dataItem);
        }
    }

    /**
     * Get the minion classes loaded from disk.
     * @return {Object} The minion classes that are currently available.
     */
    getMinionClasses() {
        return this.minionClasses;
    }

    /**
     * Get a particular class for a minion id.
     * @param {String} minionId: The minion id.
     * @return {Class} The minion class.
     */
    getMinionClass(minionId) {
        return this.minionClasses[minionId];
    }

    /**
     * initializes a new minion based on its specification object.
     * @param {MinionSpecification} minionSpecification: The minion specification object.
     * @private
     */
    async _initialize(minionSpecification) {
        const uiMinion = (new this.minionClasses[minionSpecification.getSoftwareItemId()]()) instanceof minion.VisualizationCmin;
        let min = null;
        if (uiMinion) {
            min = new this.minionClasses[minionSpecification.getSoftwareItemId()](this.dataAccessService, this, minionSpecification.getSoftwareItemId(), this.uiAdapter);
        } else {
            min = new this.minionClasses[minionSpecification.getSoftwareItemId()](this.dataAccessService, this, minionSpecification.getSoftwareItemId());
        }
        this._addMinionInstance(minionSpecification, min);
        this.minionMap.addMinion(min.getInstanceId());
    }

    /**
     * Add a new minion class to the network.
     * @param {String} id: The id of the minion class i.e. the id of the software item.
     * @param {Class} minionClass: The minion class to be added.
     * @private
     */
    _addMinionClass(id, minionClass) {
        if (!(Object.keys(this.minionClasses).includes(id))) {
            this.minionClasses[id] = minionClass;
        }
    }

    /**
     * Add a new minion instance to the network.
     * @param {MinionSpecification} minionSpecification: The minion specification.
     * @param {Minion} min: The minion to be added.
     * @private
     */
    _addMinionInstance(minionSpecification, min) {
        const minionInstanceId = minionSpecification.getInstanceId();
        if (this.minionInstances[minionInstanceId]) {
            throw Error('Bind Error: Minion instance duplicate.')
        } else {
            min.setInstanceId(minionInstanceId);
            this.minionInstances[minionInstanceId] = min;
        }
    }

    /**
     * Add a new transition between two minion instances within the communication network.
     * @param {String} sourceMinionId: The id of the source minion.
     * @param {String} targetMinionId: The id of the target minion.
     * @private
     */
    _addTransition(sourceMinionId, targetMinionId) {
        if (targetMinionId === "") {
            return;
        }
        if ((this.minionInstances[sourceMinionId]) && (this.minionInstances[targetMinionId]))
            this.minionMap.addTransition(sourceMinionId, targetMinionId);
        else
            throw Error('Transition Error: Source and/or Target not available.');
    }
}

/**
 * Transition map of all minion instances.
 * @class
 */
class MinionCommunicationMap {

    /**
     * Create an empty transition map.
     */
    constructor() {
        this.columnRows = [];
        this.map = [];
    }

    /**
     * Get all targets of a specified minion instance id.
     * @param {String} minionInstanceId: The minion instance id.
     * @return {Array} The target minion instance ids.
     */
    getTargetMinionIDs(minionInstanceId) {
        const resultIDs = [];
        const index = this.columnRows.indexOf(minionInstanceId);
        for (let i = 0; i < this.map[index].length; i++) {
            if (this.map[index][i] === 1) {
                resultIDs.push(this.columnRows[i]);
            }
        }
        return resultIDs;
    }

    /**
     * Get all sources of a specified minion instance id.
     * @param {String} minionInstanceId: The minion instance id.
     * @return {Array} The source minion instance ids.
     */
    getSourceMinionIDs(minionInstanceId) {
        const resultIDs = [];
        const index = this.columnRows.indexOf(minionInstanceId);
        for (let i = 0; i < this.map.length; i++) {
            if (this.map[i][index] === 1) {
                resultIDs.push(this.columnRows[i]);
            }
        }
        return resultIDs;
    }

    /**
     * Add a new minion to the map.
     * @param {String} minionInstanceId: The minion instance id of the new minion.
     */
    addMinion(minionInstanceId) {
        this.columnRows.push(minionInstanceId);
        for (let row of this.map) {
            row.push(0);
        }
        const newRow = [];
        for (let i = 0; i < this.columnRows.length; i++) {
            newRow.push(0);
        }
        this.map.push(newRow)
    }

    /**
     * Add a new transition between two minion instances.
     * @param {String} sourceMinionInstanceId: The id of the source minion instance.
     * @param {String} targetMinionInstanceId: The id of the target minion instance.
     */
    addTransition(sourceMinionInstanceId, targetMinionInstanceId) {
        const sourceIndex = this.columnRows.indexOf(sourceMinionInstanceId);
        const targetIndex = this.columnRows.indexOf(targetMinionInstanceId);
        this.map[sourceIndex][targetIndex] = 1;
    }

    /**
     * Removes an existing transition between two minion instances.
     * @param {String} sourceMinionInstanceId: The id of the source minion instance.
     * @param {String} targetMinionInstanceId: The id of the target minion instance.
     */
    removeTransition(sourceMinionInstanceId, targetMinionInstanceId) {
        const sourceIndex = this.columnRows.indexOf(sourceMinionInstanceId);
        const targetIndex = this.columnRows.indexOf(targetMinionInstanceId);
        this.map[sourceIndex][targetIndex] = 0;
    }

    /**
     * Return the whole transition map.
     * @return {Array<Array<Number>>} The transition map
     */
    getMap() {
        return this.map;
    }

    /**
     * Returns the column names i.e. minion instance ids of the transition map.
     * @return {Array<String>} The column names.
     */
    getColumnRows() {
        return this.columnRows;
    }
}

module.exports.MinionCommunicationMap = MinionCommunicationMap;
module.exports.MinionController = MinionController;

},{"./minion":4}],6:[function(require,module,exports){
const model = require('../model');

/**
 * State Machine for smart service executions using minion states.
 * @class MinionStateController
 */
class MinionStateController {

    /**
     * Creates a new MinionStateController with all required states and transitions.
     * @param {SmartServiceController} smartServiceController: Instance of the running smart service controller.
     */
    constructor(smartServiceController) {
        this.smartServiceController = smartServiceController;
        this.idle = new Idle(this);
        this.smartServiceConfigurationsFound = new SmartServiceConfigurationsFound(this);
        this.smartServiceConfigurationLoaded = new SmartServiceConfigurationLoaded(this);
        this.minionMatchingChecked = new MinionMatchingChecked(this);
        this.executionFailed = new ExecutionFailed(this);
        this.executionProtected = new ExecutionProtected(this);
        this.executionPossible = new ExecutionPossible(this);
        this.minionsBound = new MinionsBound(this);
        this.smartServiceRunning = new SmartServiceRunning(this);

        this.currentState = this.idle;
    }

    /**
     * Initiates a request for all ids of available smart service configuration items.
     * @return {Promise<Object>} The result of the call.
     */
    async getSmartServiceConfigurationItemIds() {
        return await this.currentState.getSmartServiceConfigurationItemIds();
    }

    /**
     * Delivers all ids of available smart service configuration items back to the caller.
     * @return {Object} The result of the call.
     */
    deliverSmartServiceConfigurationItemIds(smartServiceConfigurationItemIds) {
        return this.currentState.deliverSmartServiceConfigurationItemIds(smartServiceConfigurationItemIds);
    }

    /**
     * Loads a specific smart service configuration into the system given its id.
     * @param {String} smartServiceConfigurationItemId: The id of the smart service configuration item to be loaded.
     * @return {Object} The result of the call.
     */
    async loadSmartServiceConfiguration(smartServiceConfigurationItemId) {
        return await this.currentState.loadSmartServiceConfiguration(smartServiceConfigurationItemId);
    }

    /**
     * Checks availability of all minions necessary for service execution fiŕst local, then broadcast.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @return {Object} The result of the call.
     */
    async checkMinionMatching(smartServiceConfigurationItem) {
        return await this.currentState.checkMinionMatching(smartServiceConfigurationItem);
    }

    /**
     * Gets executed if some minion is not available for the service execution.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    someMinionNotAvailable(smartServiceConfigurationItem, response) {
        return this.currentState.someMinionNotAvailable(smartServiceConfigurationItem, response);
    }

    /**
     * Gets executed if some minion is a protected ressource.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    someMinionProtected(smartServiceConfigurationItem, response) {
        return this.currentState.someMinionProtected(smartServiceConfigurationItem, response);
    }

    /**
     * Gets executed if all minions are available for service execution.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    allMinionsAvailable(smartServiceConfigurationItem, response) {
        return this.currentState.allMinionsAvailable(smartServiceConfigurationItem, response);
    }

    /**
     * Initiates mechanism in order to remove the protection of some requested ressource.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Promise<Object>} The result of the call.
     */
    async removeProtection(smartServiceConfigurationItem, response) {
        return await this.currentState.removeProtection(smartServiceConfigurationItem, response);
    }

    /**
     * Gets executed in order to bind all minions w.r.t. the service configuration within the smart sertvice controller.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    bindMinions(smartServiceConfigurationItem, response) {
        return this.currentState.bindMinions(smartServiceConfigurationItem, response);
    }

    /**
     * Runs the smart service according to the smart service configuration once all minions are loaded and bound.
     * @return {Promise<Object>} The result of the call.
     */
    async runSmartService() {
        return await this.currentState.runSmartService();
    }

    /**
     * Terminates the running smart service once started.
     * @return {Promise<Object>} The result of the call.
     */
    terminateSmartService() {
        return this.currentState.terminateSmartService();
    }

    /**
     * Cancels the operation and returns back to Idle State.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    cancel(smartServiceConfigurationItem, response) {
        return this.currentState.cancel(smartServiceConfigurationItem, response);
    }

    /**
     * Sets the current state of the state machine according to a transition.
     * @param {MinionState} newState: The new state of the state machine.
     */
    setCurrentState(newState) {
        this.currentState = newState;
    }

    /**
     * Get the current state of the state machine.
     * @return {MinionState} The current state of the state machine
     */
    getCurrentState() {
        return this.currentState;
    }

    /**
     * Get Idle state.
     * @return {Idle} The Idle state.
     */
    getIdle() {
        return this.idle;
    }

    /**
     * Get SmartServiceConfigurationsFound state.
     * @return {SmartServiceConfigurationsFound} The SmartServiceConfigurationsFound state.
     */
    getSmartServiceConfigurationsFound() {
        return this.smartServiceConfigurationsFound;
    }

    /**
     * Get SmartServiceConfigurationLoaded state.
     * @return {SmartServiceConfigurationLoaded} The SmartServiceConfigurationLoaded state.
     */
    getSmartServiceConfigurationLoaded() {
        return this.smartServiceConfigurationLoaded;
    }

    /**
     * Get MinionMatchingChecked state.
     * @return {MinionMatchingChecked} The MinionMatchingChecked state.
     */
    getMinionMatchingChecked() {
        return this.minionMatchingChecked;
    }

    /**
     * Get ExecutionFailed state.
     * @return {ExecutionFailed} The ExecutionFailed state.
     */
    getExecutionFailed() {
        return this.executionFailed;
    }

    /**
     * Get ExecutionProtected state.
     * @return {ExecutionProtected} The ExecutionProtected state.
     */
    getExecutionProtected() {
        return this.executionProtected;
    }

    /**
     * Get ExecutionPossible state.
     * @return {ExecutionPossible} The ExecutionPossible state.
     */
    getExecutionPossible() {
        return this.executionPossible;
    }

    /**
     * Get MinionsBound state.
     * @return {MinionsBound} The MinionsBound state.
     */
    getMinionsBound() {
        return this.minionsBound;
    }

    /**
     * Get SmartServiceRunning state.
     * @return {SmartServiceRunning} The SmartServiceRunning state.
     */
    getSmartServiceRunning() {
        return this.smartServiceRunning
    }

    /**
     * Get the SmartServiceController of the state machine.
     * @return {SmartServiceController} The SmartServiceController.
     * @private
     */
    _getSmartServiceController() {
        return this.smartServiceController;
    }
}


/**
 * Abstract parent class for all necessary minion states.
 * @class
 */
class MinionState {

    /**
     * Creates a new Minion State given the MinionStateController.
     * @param {MinionStateController} minionStateController: The minion controlling state machine.
     */
    constructor(minionStateController) {
        if (new.target === MinionState) {
            throw new TypeError('Abstract classes cannot be instantiated.')
        }
        Object.defineProperty(this, 'minionStateController', {
            get: function () {
                return minionStateController;
            }
        });
    }

    /**
     * Initiates a request for all ids of available smart service configuration items.
     * @return {Promise<Object>} The result of the call.
     */
    async getSmartServiceConfigurationItemIds() {
        return await {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Delivers all ids of available smart service configuration items back to the caller.
     * @return {Object} The result of the call.
     */
    deliverSmartServiceConfigurationItemIds(smartServiceConfigurationItemIds) {
        return {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Loads a specific smart service configuration into the system given its id.
     * @param {String} smartServiceConfigurationItemId: The id of the smart service configuration item to be loaded.
     * @return {Object} The result of the call.
     */
    async loadSmartServiceConfiguration(smartServiceConfigurationItemId) {
        return await {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Checks availability of all minions necessary for service execution fiŕst local, then broadcast.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @return {Object} The result of the call.
     */
    async checkMinionMatching(smartServiceConfigurationItem) {
        return await {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Gets executed if some minion is not available for the service execution.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    someMinionNotAvailable(smartServiceConfigurationItem, response) {
        return {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Gets executed if some minion is a protected ressource.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    someMinionProtected(smartServiceConfigurationItem, response) {
        return {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Gets executed if all minions are available for service execution.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    allMinionsAvailable(smartServiceConfigurationItem, response) {
        return {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Initiates mechanism in order to remove the protection of some requested ressource.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Promise<Object>} The result of the call.
     */
    async removeProtection(smartServiceConfigurationItem, response) {
        return await {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Gets executed in order to bind all minions w.r.t. the service configuration within the smart sertvice controller.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    bindMinions(smartServiceConfigurationItem, response) {
        return {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Runs the smart service according to the smart service configuration once all minions are loaded and bound.
     * @return {Promise<Object>} The result of the call.
     */
    async runSmartService() {
        return await {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Terminates the running smart service once started.
     * @return {Promise<Object>} The result of the call.
     */
    terminateSmartService() {
        return {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Cancels the operation and returns back to Idle State.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    cancel(smartServiceConfigurationItem, response) {
        return {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

}

/**
 * @class
 */
class Idle extends MinionState {
    /**
     * Creates a new Idle state.
     * @param {MinionStateController} minionStateController: The underlying minion state controller.
     */
    constructor(minionStateController) {
        super(minionStateController);
    }

    /**
     * Initiates a request for all ids of available smart service configuration items.
     * @return {Promise<Object>} The result of the call.
     */
    async getSmartServiceConfigurationItemIds() {
        const smartServiceConfigurationItemIds = await this.minionStateController._getSmartServiceController().getSmartServiceConfigurationItemIds();
        this.minionStateController.setCurrentState(this.minionStateController.getSmartServiceConfigurationsFound());
        return this.minionStateController.deliverSmartServiceConfigurationItemIds(smartServiceConfigurationItemIds);
    }

    /**
     * Loads a specific smart service configuration into the system given its id.
     * @param {String} smartServiceConfigurationItemId: The id of the smart service configuration item to be loaded.
     * @return {Object} The result of the call.
     */
    async loadSmartServiceConfiguration(smartServiceConfigurationItemId) {
        const response = await this.minionStateController._getSmartServiceController().loadSmartServiceConfiguration(smartServiceConfigurationItemId);
        this.minionStateController.setCurrentState(this.minionStateController.getSmartServiceConfigurationLoaded());
        return await this.minionStateController.checkMinionMatching(model.SmartServiceConfigurationItem.fromJSON(response.response.res));
    }
}

/**
 * @class
 */
class SmartServiceConfigurationsFound extends MinionState {

    /**
     * Creates a new SmartServiceConfigurationsFound state.
     * @param {MinionStateController} minionStateController: The underlying minion state controller.
     */
    constructor(minionStateController) {
        super(minionStateController);
    }

    /**
     * Delivers all ids of available smart service configuration items back to the caller.
     * @return {Object} The result of the call.
     */
    deliverSmartServiceConfigurationItemIds(smartServiceConfigurationItemIds) {
        this.minionStateController.setCurrentState(this.minionStateController.getIdle());
        return {
            status: 'success',
            success: true,
            message: 'Operation was successfully executed.',
            smartServiceConfigurationItemIds: smartServiceConfigurationItemIds,
            state: this.minionStateController.getCurrentState()
        };
    }
}

/**
 * @class
 */
class SmartServiceConfigurationLoaded extends MinionState {

    /**
     * Creates a new SmartServiceConfigurationLoaded state.
     * @param {MinionStateController} minionStateController: The underlying minion state controller.
     */
    constructor(minionStateController) {
        super(minionStateController);
    }

    /**
     * Checks availability of all minions necessary for service execution fiŕst local, then broadcast.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @return {Object} The result of the call.
     */
    async checkMinionMatching(smartServiceConfigurationItem) {
        const matchingResponse = await this.minionStateController._getSmartServiceController().match(smartServiceConfigurationItem);
        this.minionStateController.setCurrentState(this.minionStateController.getMinionMatchingChecked());
        for (let softwareItem of matchingResponse) {
            if (softwareItem.status === model.RESPONSE_STATUS.NOT_AVAILABLE) {
                return this.minionStateController.someMinionNotAvailable(smartServiceConfigurationItem, matchingResponse);
            }
            if (softwareItem.status === model.RESPONSE_STATUS.PROTECTED) {
                return this.minionStateController.someMinionProtected(smartServiceConfigurationItem, matchingResponse);
            }
        }
        return this.minionStateController.allMinionsAvailable(smartServiceConfigurationItem, matchingResponse);
    }
}

/**
 * @class
 */
class MinionMatchingChecked extends MinionState {

    /**
     * Creates a new MinionMatchingChecked state.
     * @param {MinionStateController} minionStateController: The underlying minion state controller.
     */
    constructor(minionStateController) {
        super(minionStateController);
    }

    /**
     * Gets executed if some minion is not available for the service execution.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    someMinionNotAvailable(smartServiceConfigurationItem, response) {
        this.minionStateController.setCurrentState(this.minionStateController.getExecutionFailed());
        return this.minionStateController.cancel(smartServiceConfigurationItem, response);
    }

    /**
     * Gets executed if some minion is a protected ressource.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    someMinionProtected(smartServiceConfigurationItem, response) {
        this.minionStateController.setCurrentState(this.minionStateController.getExecutionProtected());
        return {
            status: 'success',
            success: true,
            message: 'Operation was successfully executed.',
            smartServiceConfigurationItem: smartServiceConfigurationItem,
            matchingResponse: response,
            state: this.minionStateController.getCurrentState()
        };
    }

    /**
     * Gets executed if all minions are available for service execution.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    allMinionsAvailable(smartServiceConfigurationItem, response) {
        this.minionStateController.setCurrentState(this.minionStateController.getExecutionPossible());
        return this.minionStateController.bindMinions(smartServiceConfigurationItem, response);
    }
}

/**
 * @class
 */
class ExecutionFailed extends MinionState {

    /**
     * Creates a new ExecutionFailed state.
     * @param {MinionStateController} minionStateController: The underlying minion state controller.
     */
    constructor(minionStateController) {
        super(minionStateController);
    }

    /**
     * Cancels the operation and returns back to Idle State.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    cancel(smartServiceConfigurationItem, response) {
        this.minionStateController.setCurrentState(this.minionStateController.getIdle());
        return {
            status: 'success',
            success: true,
            message: 'Operation was successfully executed.',
            smartServiceConfigurationItem: smartServiceConfigurationItem,
            matchingResponse: response,
            state: this.minionStateController.getCurrentState()
        };
    }
}

/**
 * @class
 */
class ExecutionProtected extends MinionState {

    /**
     * Creates a new ExecutionProtected state.
     * @param {MinionStateController} minionStateController: The underlying minion state controller.
     */
    constructor(minionStateController) {
        super(minionStateController);
    }

    /**
     * Initiates mechanism in order to remove the protection of some requested ressource.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Promise<Object>} The result of the call.
     */
    async removeProtection(smartServiceConfigurationItem, response) {
        //TODO Implement Method with concrete business logic. At the moment it just cancels the execution.
        const matchingResponse = await this.minionStateController._getSmartServiceController().removeProtections(response);

        return this.cancel(smartServiceConfigurationItem, response);

        // Something like this will be the case once there is a concrete business logic behind the execution:
        /*
            const matchingResponse = await this.minionStateController._getSmartServiceController().removeProtections(response);
            this.minionStateController.setCurrentState(this.minionStateController.getExecutionPossible());
            return this.minionStateController.bindMinions(smartServiceConfigurationItem, matchingResponse)
         */

    }

    /**
     * Cancels the operation and returns back to Idle State.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    cancel(smartServiceConfigurationItem, response) {
        this.minionStateController.setCurrentState(this.minionStateController.getIdle());
        return {
            status: 'success',
            success: true,
            message: 'Operation was successfully executed.',
            smartServiceConfigurationItem: smartServiceConfigurationItem,
            matchingResponse: response,
            state: this.minionStateController.getCurrentState()
        };
    }
}

/**
 * @class
 */
class ExecutionPossible extends MinionState {

    /**
     * Creates a new ExecutionPossible state.
     * @param {MinionStateController} minionStateController: The underlying minion state controller.
     */
    constructor(minionStateController) {
        super(minionStateController);
    }

    /**
     * Gets executed in order to bind all minions w.r.t. the service configuration within the smart sertvice controller.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    bindMinions(smartServiceConfigurationItem, response) {
        this.minionStateController._getSmartServiceController().bindMinions(smartServiceConfigurationItem, response);
        this.minionStateController.setCurrentState(this.minionStateController.getMinionsBound());

        return {
            status: 'success',
            success: true,
            message: 'Operation was successfully executed.',
            smartServiceConfigurationItem: smartServiceConfigurationItem,
            matchingResponse: response,
            state: this.minionStateController.getCurrentState()
        };
    }
}

/**
 * @class
 */
class MinionsBound extends MinionState {

    /**
     * Creates a new MinionsBound state.
     * @param {MinionStateController} minionStateController: The underlying minion state controller.
     */
    constructor(minionStateController) {
        super(minionStateController);
    }

    /**
     * Runs the smart service according to the smart service configuration once all minions are loaded and bound.
     * @return {Promise<Object>} The result of the call.
     */
    async runSmartService() {
        await this.minionStateController._getSmartServiceController().activateLoadedService();
        this.minionStateController.setCurrentState(this.minionStateController.getSmartServiceRunning());

        return {
            status: 'success',
            success: true,
            message: 'Operation was successfully executed.',
            state: this.minionStateController.getCurrentState()
        };
    }
}

/**
 * @class
 */
class SmartServiceRunning extends MinionState {

    /**
     * Creates a new SmartServiceRunning state.
     * @param {MinionStateController} minionStateController: The underlying minion state controller.
     */
    constructor(minionStateController) {
        super(minionStateController);
    }

    /**
     * Terminates the running smart service once started.
     * @return {Promise<Object>} The result of the call.
     */
    terminateSmartService() {
        this.minionStateController._getSmartServiceController().terminateRunningService();
        this.minionStateController.setCurrentState(this.minionStateController.getIdle());

        return {
            status: 'success',
            success: true,
            message: 'Operation was successfully executed.',
            state: this.minionStateController.getCurrentState()
        };
    }
}

module.exports.MinionState = MinionState;
module.exports.MinionsBound = MinionsBound;
module.exports.MinionStateController = MinionStateController;
},{"../model":16}],7:[function(require,module,exports){
const MinionController = require('./minioncontroller').MinionController;
const DataAccessService = require('../dataallocation/dataaccessservice').DataAccessService;
const model = require('../model');

/**
 * Provides functionality for a smart service execution including loading, matching, binding and execution phases.
 * @class
 */
class SmartServiceController {

    /**
     * Creates a new SmartServiceController that controlls the smart service execution according to its configuration.
     * @param {DataAccessService} dataAccessService: The data access service of the system in orde rto communicate with the data and software allocation.
     * @param {uiAdapter} uiAdapter: The UI adapter giving access to manipulate the UI.
     */
    constructor(dataAccessService, uiAdapter) {
        this.dataAccessService = dataAccessService;
        this.uiAdapter = uiAdapter;
        this.minionController = new MinionController(this.dataAccessService, uiAdapter);
    }

    /**
     * Get a specific smart service configuration item given its id.
     * @param {String} smartServiceConfigurationItemId: The smart service configuration item id.
     * @return {Promise<SmartServiceConfigurationItem>} The result of the request.
     */
    async loadSmartServiceConfiguration(smartServiceConfigurationItemId) {
        const query = new model.DatabaseQuery(model.QUERYTYPE.STATIC, smartServiceConfigurationItemId, []);
        const crudOperation = new model.CRUDOperation(model.CRUD.READ, model.OBJECTTYPE.SMART_SERVICE, null, query);
        return await this.dataAccessService.requestCRUDOperation(crudOperation);
    }

    /**
     * Provides the (crucial) functionality that is necessary for finding and matching the smart services components i.e. minions. (crucial functionality)
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying configuration item of the smart service.
     * @return {Promise<Array>} The response of the minions found and matched (either available, protected or not available).
     */
    async match(smartServiceConfigurationItem) {
        // This method should match all necessary minions first within the local database and afterwards with a broadcast operation for the minions that weren'd available locally.

        // Check all minions that are locally available.
        const locallyAvailable = [];
        const locallyNotAvailable = [];
        for (let i = 0; i < smartServiceConfigurationItem.getConfiguration().length; i++) {
           try {
               let result = await this._matchLocalMinions(smartServiceConfigurationItem.getConfiguration()[i]);
               if (result.success && result.response.res) {
                   result.response = model.SoftwareItem.fromJSON(result.response.res);
                   locallyAvailable.push(result);
               } else {
                   locallyNotAvailable.push(smartServiceConfigurationItem.getConfiguration()[i]);
               }
           } catch (Error) {
                locallyNotAvailable.push(smartServiceConfigurationItem.getConfiguration()[i]);
            }
        }
        // Broadcast for all minions that are not locally available.
        const result = locallyAvailable;
        for (let i = 0; i < locallyNotAvailable.length; i++) {
            let request = await this._matchBroadcastMinions(locallyNotAvailable[i]);
            if (request.success && request.state === this.dataAccessService.getDataRequestStateController().getIdle()) {
                request.response = request.response.res.sc[0];
                let crudOperation = new model.CRUDOperation(model.CRUD.CREATE, model.OBJECTTYPE.SOFTWARE, request.response, null, null);
                await this.dataAccessService.requestCRUDOperation(crudOperation);
            }
            result.push(request);
        }
        return result;
    }

    async _matchLocalMinions(minionSpecification, numberOfRetries = 0) {
        // Creates a local CRUDOperation first. NOTE: This just queries on the id of the minions, but mot on something like a minimal version of a minion.
        const _this = this;
        let crudOperation = new model.CRUDOperation(model.CRUD.READ, model.OBJECTTYPE.SOFTWARE, null, new model.DatabaseQuery(model.QUERYTYPE.STATIC, minionSpecification.getSoftwareItemId(), null), null);
        let result = await this.dataAccessService.requestCRUDOperation(crudOperation);
        if (result.success) {
            return result;
        } else {
            if (numberOfRetries < 3) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(_this._matchLocalMinions(minionSpecification, numberOfRetries++));
                    }, 500);
                })
            } else {
                return result;
            }
        }
    }

    async _matchBroadcastMinions(minionSpecification, numberOfRetries = 0) {
        // Creates a local CRUDOperation first. NOTE: This just queries on the id of the minions, but mot on something like a minimal version of a minion.
        const _this = this;
        let crudOperation = new model.CRUDOperation(model.CRUD.READ, model.OBJECTTYPE.SOFTWARE, null, new model.DatabaseQuery(model.QUERYTYPE.STATIC, minionSpecification.getSoftwareItemId(), null), new model.BroadcastConfiguration(this.dataAccessService.getLocalID(), [minionSpecification.getSoftwareItemId()], model.BROADCAST_TYPES.BAAS, model.BROADCAST_CONDITION.ANY, null));
        let result = await this.dataAccessService.requestCRUDOperation(crudOperation);
        if (result.success) {
            if (result.state === this.dataAccessService.getDataRequestStateController().getRessourceAccessProtected()) {
                // TODO Cancel for now
                result = await this.dataAccessService.cancelBroadcastOperation(crudOperation);
            }
            return result;
        } else {
            if (numberOfRetries < 3) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(_this._matchLocalMinions(minionSpecification, numberOfRetries++));
                    }, 500);
                })
            } else {
                return result;
            }
        }
    }

    /**
     * Binds all minions within the minion controller with their specified transitions in order to make the service executable. (crucial functionality)
     * @param {SmartServiceConfigurationItem} smartServiceConfiguration: The underlying configuration item of the smart service.
     * @param {Array} matchingResult: The result of the minion matching phase including the loaded software components.
     */
    bindMinions(smartServiceConfiguration, matchingResult) {
        // This method should make use of the minion controller to bind the matched minions in the specified way.
        this.minionController.clearRuntimeEnvironment();
        const minionSpecifications = smartServiceConfiguration.getConfiguration();
        this.minionController.register(matchingResult.map(res => res.response));
        this.minionController.bind(smartServiceConfiguration.getConfiguration());
        try {
            this.uiAdapter.showService(smartServiceConfiguration);
        } catch (e) {
            console.warn('catched: ' + e);
        }
    }

    /**
     * Activates the service once loaded all necessary minions within the minion controller.
     * @return {Promise<void>}
     */
    async activateLoadedService() {
        await this.minionController.activate();
    }

    /**
     * Terminates the running smart service once activated.
     */
    terminateRunningService() {
        this.minionController.terminate();
        this.minionController.clearRuntimeEnvironment();
    }

    /**
     * Get all ids of available smart service configuration items within the local db.
     * @return {Promise<Array<String>>} List of smart service configuration items.
     */
    async getSmartServiceConfigurationItemIds() {
        return await this.dataAccessService.getSmartServiceConfigurationItemIds();
    }



    /**
     * Remove the protection of all protected minions within the matching result according to its protection rule. (crucial functionality)
     * @param {Array} matchingResult: The result of the initial matching.
     * @return {Promise<Array>} The result of the initial matching result together with the minions made available by removing its protection.
     */
    async removeProtections(matchingResult) {
        console.warn('Method needs to be implemented first!');
        // TODO: This method should work with some transactional mechanism to remove protections from software items by third party.
    }

    /**
     * Get the minion controller used in the system.
     * @return {MinionController} The MinionController Object.
     */
    getMinionController() {
        return this.minionController;
    }

    /**
     * Get the data access service used for data allocation.
     * @return {DataAccessService} The DataAccessService Object.
     */
    getDataAccessService() {
        return this.dataAccessService;
    }
}

module.exports.SmartServiceController = SmartServiceController;
},{"../dataallocation/dataaccessservice":10,"../model":16,"./minioncontroller":5}],8:[function(require,module,exports){

/**
 * The UI-Adapter organizes the UI-structure, more specifically the representation of an
 * active smart service and it's C-minions. 
 * Every variant of this adapter should implement a representation for a smart service and 
 * its corresponding C-minions.
 * 
 * It allocates each Cmin their space on screen and manages current output seen by the user.
 * 
 * This adapter allows to use the same interface for service specific Core-UI communication on 
 * different UI platforms, e.g. PC and mobile. Non DOM UI is also compatible, as long as the 
 * output can be controlled with javascript
 * @interface
 */

const $ = require('jquery');

class InvalidIdError extends Error{
     constructor (message){
         super(message);
     }
 }
class uiAdapter {
    /**
     * Create the UI Adapter and setup all necessary UI elements (e.g. DOM)
     * @param {*} needed_methods 
     */
    constructor() {

    };

    showService(config) {



    }

    sendNotification(message, source) {

    }

    addData(data, source) {

    }

    requestInput(type, callback) {

    }

    /**
     * Clear everything UI related 
     */
    clearUI() {

    }

    verifyCompatibility(config) {
        return 2;
    }
}

class domAdapter extends uiAdapter {

    static get GRAPH_LIBRARY() {
        return "https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.js"
    }
    static get PLOT_LIBRARY() {
        return "https://cdn.jsdelivr.net/npm/apexcharts"
    }
    static get VIDEO_LIBRARY() {
        return "https://www.youtube.com/iframe_api"
    }

    static get MATERIAL_DESIGN_LITE() {
        return "https://code.getmdl.io/1.3.0/material.min.js";
    }

    constructor(visualizationSpace) {
        super();
        this.visualizationSpace = visualizationSpace;

        //promises for dynamic library loading
        this.promises = {};

        // init state keeping variables
        this.card_count = 0;
        this.cards = {};
        this.active_cards = [];
        this.callbacks = {};
        this.charts = {};

    }

    // creates mdl based layout ("https://getmdl.io/") for the given smart service config

    showService(config) {
        // the container for the service
        var container = document.createElement("div");
        container.className = "service-container";

        // unique id
        var instance_number = 0;
        while (document.querySelector("#container-" + config.name + instance_number)) {
            instance_number += 1;
        }
        this.id = "container-" + config.name + instance_number;
        container.id = this.id;

        // create the header
        var sidebar = document.createElement("div");
        sidebar.className = "service-sidebar"
        var endbutton = document.createElement("button");
        endbutton.className = "mdl-button mdl-button--icon mdl-js-button";
        endbutton.innerHTML = "<i class='material-icons'>cancel</i>";
        endbutton.onclick = this.clearUI.bind(this);
        sidebar.appendChild(endbutton);

        var header = document.createElement("h3");
        header.className = "service-header";
        header.innerText = config.name;
        sidebar.appendChild(header);
        
        var summary_button = document.createElement("button");
        summary_button.className = "mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent";
        summary_button.innerText = "Summary";
        sidebar.appendChild(summary_button);
        summary_button.onclick = function(){
            this.cardAction("descriptionMinion");
        }.bind(this);

        container.append(sidebar);

        // make the grid
        var card_grid = document.createElement("div");
        card_grid.className = "mdl-grid";
        this.card_grid = card_grid;
        container.appendChild(card_grid);



        // create a card that describes the service
        var descriptionCard = this.createCard(config.descriptionTitle, config.descriptionText, "descriptionMinion");
        this.makeServiceGraph(descriptionCard, config);


        this.cards.descriptionMinion = descriptionCard;
        this.showCard("descriptionMinion");

        // a visual container for each minion is created

        config.configuration.forEach(function (minion) {
            var minion_button = document.createElement("button");
            minion_button.onclick = function () {
                this.cardAction(minion.instanceId);
            }.bind(this);
            //minion_button.className = "mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored";
            minion_button.className = "mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent";
            minion_button.innerText = minion.name;
            sidebar.appendChild(minion_button);

            var description;
            var type = minion.type;
            if (minion.hasOwnProperty("description")) {
                description = minion.description;
            } else {
                switch (type) {
                    case "P":
                        description = "This minion collects data";
                        break;
                    case "T":
                        description = "This minion analyzes data";
                        break;
                    case "C":
                        description = "This minion visualizes results";
                        break;
                }
            }

            var card = this.createCard(minion.name, description, minion.instanceId);
            this.cards[minion.instanceId] = card;
            if (minion.hasOwnProperty("defaultShow")) {
                if (minion.defaultShow) {
                    this.showCard(minion.instanceId);
                }
            }
        }.bind(this));

        const _this = this;
        this.loadDependency(domAdapter.MATERIAL_DESIGN_LITE, function () {
            self.componentHandler.upgradeElements(_this.card_grid);
            _this.visualizationSpace.appendChild(container);
        });


    }

    sendNotification(sourceId, message) {

    }

    addData(sourceId, data) {
        if (this.callbacks.hasOwnProperty(sourceId)) {
            this.callbacks[sourceId](data);
        }
    }

    requestInput(sourceId, type, callback) {

    }

    /**
     * Clear everything UI related 
     */
    clearUI() {
        document.getElementById(this.id).remove();
        delete this.cards
        delete this.charts
        delete this.active_cards
        delete this.callbacks
        delete this.promises
    }

    verifyCompatibility(config) {
        //TODO
        return true
    }

    showYoutubeVideo(id, videoid, autoplay = false, start = 0, callback = null) {
        this.checkId(id)
        if (typeof YT !== "object") {
            this.loadDependency(domAdapter.VIDEO_LIBRARY, () => {
                this.showYoutubeVideo.apply(this, arguments)
            });
            return
        }
        var cardmedia = this.cards[id].querySelector(".card-media");

        window.onYouTubeIframeAPIReady = function(){
            let player = new YT.Player(cardmedia, {
                videoId: videoid,
                start: start,
                events: {
                    onReady: onPlayerReady
                }
            });
        }
        this.callbacks[id] = callback;
        function onPlayerReady(event) {
            if (autoplay) {
                event.target.seekTo(start, true);
                event.target.playVideo()
            }
        };
    }

    showBarChart(id, labels, config) {
        this.checkId(id);
        if (typeof ApexCharts !== "function") {
            this.loadDependency(domAdapter.PLOT_LIBRARY, () => {
                this.showBarChart.apply(this, arguments)
            });
            return
        }


        var media_card = this.cards[id].querySelector(".card-media");
        var data;
        if (!config.hasOwnProperty("init")) {
            data = new Array(labels.length).fill(0);
        } else {
            var init = config.init;
            if (init.length !== labels.length) {
                throw Error("Non equal amount of init values and labels");
            }
            data = init;
        }

        var options = {
            chart: {
                type: 'bar',
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    //columnWidth: '30%',
                }
            },
            xaxis: {
                categories: labels
            },
            series: [{
                data: data
            }, ],
        };

        if (config.hasOwnProperty("colors")) {
            options.colors = config.colors;
        }
        var chart = new ApexCharts(media_card, options);

        var update = function (input) {

            data[input.index] = input.value;
            chart.updateSeries([{
                data: data
            }]);
        }

        chart.render();
        this.charts[id] = chart;
        this.callbacks[id] = update;


    }

    // create a new card for the service
    createCard(title, description, id) {
        var newcard = document.createElement("div");
        newcard.className = "mdl-card mdl-shadow--6dp mdl-cell mdl-cell--top mdl-cell--6-col";


        var minimize = document.createElement("div");
        minimize.className = "mdl-card__menu";


        var expand = document.createElement("button");
        expand.className = "mdl-button mdl-button--icon";
        expand.innerHTML = "<i class='material-icons'>expand_more</i>";
        expand.id = id+"_expand";
        expand.onclick = ()=>{
            this.cardDescription(id);
        }

        minimize.append(expand);

        var button = document.createElement("button");
        button.className = "mdl-button mdl-button--icon";
        button.innerHTML = "<i class='material-icons'>remove</i>";
        button.onclick = function () {
            this.cardAction(id);
        }.bind(this);
        minimize.append(button);


        newcard.append(minimize);
        this.addCardTitle(newcard, title);

        var media = document.createElement("div");
        media.className = "card-media";
        newcard.appendChild(media);

        this.addCardText(newcard, description);

        return newcard
    }


    cardAction(id) {
        if (this.active_cards.includes(id)) {
            this.hideCard(id);
        } else {
            this.showCard(id);
        }
    }

    cardDescription(id){
        var card = this.cards[id];

        var description = card.querySelector(".mdl-card__supporting-text");
        var button = card.querySelector("i");
        if(description.style.display === "" ){
            description.style.display = "block";
            button.innerText = "expand_less";
        } else{
            description.style.display = "";
            button.innerText = "expand_more";
        }
    }

    //show the card
    showCard(id) {

        var card = this.cards[id];
        if (this.card_count == 300) {
            this.card_grid.removeChild(this.card_grid.childNodes[0]);
            this.active_cards.shift();
            this.active_cards.push(id);

            this.card_grid.appendChild(card);

        } else {
            this.active_cards.push(id);
            this.card_count += 1;
            this
            this.card_grid.appendChild(card);
        }

    }

    hideCard(id) {
        var index = this.active_cards.indexOf(id);
        this.card_grid.removeChild(this.card_grid.childNodes[index]);
        this.active_cards.splice(index, 1);
        this.card_count -= 1;
    }

    addCardTitle(div, title) {
        var mdl_title = document.createElement("div");
        mdl_title.class = "mdl-card__title";
        var inside_title = document.createElement("h2");
        inside_title.innerText = title;
        inside_title.className = "mdl-card__title-text";
        mdl_title.appendChild(inside_title);
        div.appendChild(mdl_title);
    }

    addCardImage(div, url) {
        var media = div.querySelector(".card-media")
        var img = document.createElement("img");
        img.src = url;
        media.appendChild(img);
        div.appendChild(media);
    }

    addCardText(div, text) {

        var textdiv = document.createElement("div");
        textdiv.className = "mdl-card__supporting-text";
        textdiv.innerText = text;
        div.appendChild(textdiv);
    }


    makeServiceGraph(div, conf) {
        if (typeof vis !== "object") {
            $("head").append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.css">');
            this.loadDependency(domAdapter.GRAPH_LIBRARY, ()=>{
                this.makeServiceGraph.apply(this, arguments)
            });
            return
        }

        var graph = div.querySelector(".card-media");

        var nodes = [];
        var edges = [];
        conf.configuration.forEach(function (minion) {
            var group = minion.type === "P" ? 0 : minion.type === "T" ? 1 : 2;
            var minion_node = {
                id: minion.instanceId,
                label: minion.name,
                group: group
            };
            minion.targetMinionIds.forEach(function (id) {
                var edge = {
                    from: minion.instanceId,
                    to: id,
                    arrows: "to"
                }
                edges.push(edge);
            })
            nodes.push(minion_node);
        })
        nodes = new vis.DataSet(nodes);

        // create an array with edges
        edges = new vis.DataSet(edges);
        var height = 0.4 * document.documentElement.clientHeight;
        // create a network
        var data = {
            nodes: nodes,
            edges: edges
        };
        var options = {
            nodes: {
                shape: "dot",
                size: 40,
                borderWidth: 3
            },
            height: parseInt(height) + "px",
        };
        var network = new vis.Network(graph, data, options);

    }


    loadDependency(src, callback) {
        if (this.promises.hasOwnProperty("src")) {
            this.promises[src].then(callback)
        } else {
            this.promises[src] = new Promise(function (resolve, reject) {
                var script = document.createElement("script");
                script.type = "text/javascript";
                script.onload = resolve;
                script.onerror = reject;
                script.src = src;
                document.body.append(script);
            });
            this.promises[src].then(callback);
        }
    }

    checkId(id){
        if(!this.cards.hasOwnProperty(id)){
            throw new InvalidIdError("Invalid id:" + id);
        }
    }
}

module.exports.uiAdapter = uiAdapter;
module.exports.domAdapter = domAdapter;
},{"jquery":2}],9:[function(require,module,exports){
const model = require('../model');

// TODO: Revise functionality e.g. broadcastRessourceAccess does provide the minions already if found and does not only check whether the minion is available or not.

/**
 * Class for handling the data access of the TUCANA Core Service in the backend.
 * @class
 */
class DataAccessController {

    /**
     * Creates the data access object given the three adapters.
     * @param {DatabaseHandler} databaseHandler: The database of the service.
     * @param {UPeerCommunicationHandler} uPeerCommunicationHandler: The UPeerCommunicationHandler of the service.
     * @param {BaaSCommunicationHandler} baasCommunicationHandler: The BaaSCommunicationHandler of the service.
     * @param {TENVIdentificationHandler} tenvIdentificationHandler: The TENVIdentificationHandler of the service.
     */
    constructor(databaseHandler, uPeerCommunicationHandler, baasCommunicationHandler, tenvIdentificationHandler) {
        this.database = databaseHandler;
        this.uPeerCommunicationHandler = uPeerCommunicationHandler;
        this.baasCommunicationHandler = baasCommunicationHandler;
        this.tenvIdentificationHandler = tenvIdentificationHandler;
    }

    /**
     * Returns all IDs of the Domain Items in the local database.
     * @return {Promise<Array>} The IDs of the domain items.
     */
    async getDomainItemIds() {
        return await this.database.getDomainItemIDs();
    }

    /**
     * Returns all IDs (names) of the Software Items in the local database.
     * @return {Promise<Array>} The names of the software items.
     */
    async getSoftwareItemIds() {
        return await this.database.getSoftwareItemIDs();
    }

    /**
     * Returns all IDs of the Model Items in the local database.
     * @return {Promise<Array>} The IDs of model items.
     */
    async getModelItemIds() {
        return await this.database.getModelItemIDs();
    }

    /**
     * Returns all IDs of the Smart Service Configuration Items in the local database.
     * @return {Promise<Array>} The IDs of Smart Service Configuration Items.
     */
    async getSmartServiceConfigurationItemIds() {
        return await this.database.getSmartServiceConfigurationItemIDs();
    }

    /**
     * Returns the local ID of the peer.
     * @return {String} The peers local ID.
     */
    getLocalID() {
        return this.tenvIdentificationHandler.getLocalID();
    }

    /**
     * Returns all properties of the peer.
     * @return {Object}: The properties of the peer.
     */
    getProperties() {
        return this.tenvIdentificationHandler.getProperties();
    }

    /**
     * Returns all peers available in the network that fulfill the given properties.
     * @param {Array} properties: The properties to match.
     * @return {Promise<Array>} The list of available peer IDs.
     */
    async getFilteredPeerIds(properties) {
        return await this.uPeerCommunicationHandler.getFilteredPeerIds(properties);
    }

    /**
     * Checks access of a specified peer and returns the result i.e. the requested ressources or the availability status of the minion.
     * @param {CRUDOperation} crudOperation: The specified CRUDOperation.
     * @return {Promise<Response>} The result of the request.
     */
    async broadcastRessourceAccess(crudOperation) {
        if (crudOperation.getBroadcastConfiguration().getType() === model.BROADCAST_TYPES.UPEER) {
            return await this.uPeerCommunicationHandler.broadcastRessourceAccess(crudOperation);
        } else {
            return await this.baasCommunicationHandler.broadcastRessourceAccess(crudOperation);
        }
    }

    /**
     * Requests for access at a set of given target peers and returns the requests result i.e. provides ressources or not.
     * @param {CRUDOperation} crudOperation: The CRUDOperation to be executed.
     * @return {Promise<Response>} The result of the request.
     */
    async requestAccessPermission(crudOperation) {
        // TODO: Mechanism for payed transactions necessary.
        console.warn('Method requestAccessPermission not implemented, redirecting to RessourceNotAvailable State.');
        return await {
            req: {crudOperation: crudOperation},
            res: {success: false, status: 'not_available', message: 'Ressource not available.'}
        };
    }

    /**
     * Executes a CRUDOperation.
     * @param {CRUDOperation} crudOperation: The local or remote CRUDOperation to be executed.
     * @return {Promise<Response>} The result of the request.
     */
    async executeCRUDOperation(crudOperation) {
        if (crudOperation.getBroadcastConfiguration()) {
            return await this.broadcastRessourceAccess(crudOperation);
        } else {
            return await this.executeLocalCRUDOperation(crudOperation);
        }
    }


    /**
     * Executes a CRUDOperation within the local environment of the peer.
     * @param {CRUDOperation} crudOperation: The CRUDOperation to be executed.
     * @return {Promise<Response>} The result of the request.
     */
    async executeLocalCRUDOperation(crudOperation) {
        return await this.database.executeLocalCRUDOperation(crudOperation);
    }

}

module.exports.DataAccessController = DataAccessController;

},{"../model":16}],10:[function(require,module,exports){
const DataRequestStateController = require('./datarequeststatecontroller').DataRequestStateController;
const DataAccessController = require('./dataaccesscontroller').DataAccessController;

// TODO: Add Comments

/**
 * Class for handling the data access of the TUCANA Core Service in the backend.
 * @class
 */
class DataAccessService {

    /**
     * Creates the data access object given the three adapters.
     * @param {DatabaseHandler} databaseHandler: The database of the service.
     * @param {UPeerCommunicationHandler} uPeerCommunicationHandler: The UPeerCommunicationHandler of the service.
     * @param {BaaSCommunicationHandler} baasCommunicationHandler: The BaaSCommunicationHandler of the service.
     * @param {TENVIdentificationHandler} tenvIdentificationHandler: The TENVIdentificationHandler of the service.
     */
    constructor(databaseHandler, uPeerCommunicationHandler, baasCommunicationHandler, tenvIdentificationHandler) {
        this.dataAccessController = new DataAccessController(databaseHandler, uPeerCommunicationHandler, baasCommunicationHandler, tenvIdentificationHandler);
        this.dataRequestStateController = new DataRequestStateController(this.dataAccessController);
    }

    async requestCRUDOperation(crudOperation) {
        return await this.dataRequestStateController.requestCRUDOperation(crudOperation);
    }

    async requestRessourceAccess(crudOperation) {
        return await this.dataRequestStateController.requestRessourceAccess(crudOperation);
    }

    async cancelBroadcastOperation (crudOperation) {
        return await this.dataRequestStateController.cancelBroadcastOperation(crudOperation);
    }

    /**
     * Returns all IDs of the Domain Items in the local database.
     * @return {Promise<Array>} The IDs of the domain items.
     */
    async getDomainItemIds () {
        return await this.dataAccessController.getDomainItemIds();
    }

    /**
     * Returns all IDs (names) of the Software Items in the local database.
     * @return {Promise<Array>} The names of the software items.
     */
    async getSoftwareItemIds () {
        return await this.dataAccessController.getSoftwareItemIds();
    }

    /**
     * Returns all IDs of the Model Items in the local database.
     * @return {Promise<Array>} The IDs of model items.
     */
    async getModelItemIds () {
        return await this.dataAccessController.getModelItemIds();
    }

    /**
     * Returns all IDs of the Smart Service Configuration Items in the local database.
     * @return {Promise<Array>} The IDs of Smart Service Configuration Items.
     */
    async getSmartServiceConfigurationItemIds () {
        return await this.dataAccessController.getSmartServiceConfigurationItemIds();
    }

    /**
     * Returns the local ID of the peer.
     * @return {String} The peers local ID.
     */
    getLocalID() {
        return this.dataAccessController.getLocalID();
    }

    /**
     * Return the properties of the peer.
     * @return {Map} The peers properties.
     */
    getProperties(){
        return this.dataAccessController.getProperties();
    }

    /**
     * Returns all peers available in the network that fulfill the given properties.
     * @param {Array} properties: The properties to match.
     * @return {Promise<Array>} The list of available peer IDs.
     */
    async getFilteredPeerIds(properties) {
        return await this.dataAccessController.getFilteredPeerIds(properties);
    }

    getDataRequestStateController() {
        return this.dataRequestStateController;
    }
}

module.exports.DataAccessService = DataAccessService;

},{"./dataaccesscontroller":9,"./datarequeststatecontroller":11}],11:[function(require,module,exports){
/**
 * @class
 */
class DataRequestStateController {

    /**
     * Creates a new DataRequestStateController (state machine) Object.
     * @param {DataAccessController} dataAccessController: The underlying DataAccessController Object.
     */
    constructor(dataAccessController){
        this.idle = new Idle(this, dataAccessController);
        this.requestReceived = new RequestReceived(this, dataAccessController);
        this.broadcastRequestReceived = new BroadcastRequestReceived(this, dataAccessController);
        this.awaitBroadcastResponse = new AwaitBroadcastResponse(this, dataAccessController);
        this.ressourceAccessProtected = new RessourceAccessProtected(this, dataAccessController);
        this.ressourceAccessProvided = new RessourceAccessProvided(this, dataAccessController);
        this.ressourceAccessNotAvailable = new RessourceAccessNotAvailable(this, dataAccessController);

        this.currentState = this.idle;
    }

    /**
     * This function should define behaviour of a single CRUD operation
     * @param {CRUDOperation} crudOperation: The CRUD operation to be executed of type CRUDOperation
     * @return {Promise<Object>} The result of the request.
     */
    async requestCRUDOperation(crudOperation) {
        return await this.currentState.requestCRUDOperation(crudOperation);
    }

    /**
     * Will be called when the CRUD Operation is of type broadcast.
     * @param {CRUDOperation} crudOperation: The broadcast CRUD operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async requestBroadcastCRUDOperation(crudOperation) {
        return await this.currentState.requestBroadcastCRUDOperation(crudOperation);
    }

    /**
     * Broadcasts a ressource request.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async broadcastRessourceAccess(crudOperation) {
        return await this.currentState.broadcastRessourceAccess(crudOperation);
    }

    /**
     * Executed when data access is protected.
     * @param {CRUDOperation} crudOperation: The inital operation.
     * @param {Object} response: The responses of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async ressourceProtected(crudOperation, response){
        return await this.currentState.ressourceProtected(crudOperation, response);
    }

    /**
     * Executed when data access is provided.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The responses of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async ressourceProvided(crudOperation, response){
        return await this.currentState.ressourceProvided(crudOperation, response);
    }


    /**
     * Executed when data access is not available.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The response of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async ressourceNotAvailable (crudOperation, response){
        return await this.currentState.ressourceNotAvailable(crudOperation, response);
    }

    /**
     * Once the ressource access is protected a request for data access can be initiated.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async requestRessourceAccess(crudOperation) {
        return await this.currentState.requestRessourceAccess(crudOperation);
    }

    /**
     * Executes the broadcast CRUD operation as defined in the parameters of the crudOperation object.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The response of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async broadcastOperationExecuted(crudOperation, response) {
        return await this.currentState.broadcastOperationExecuted(crudOperation, response);
    }

    /**
     * Executes a local CRUD operation.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async executeLocalOperation(crudOperation){
        return await this.currentState.executeLocalOperation(crudOperation);
    }

     /**
     * Cancels the remote CRUD operation.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The response of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async cancelBroadcastOperation(crudOperation, response = null){
        return await this.currentState.cancelBroadcastOperation(crudOperation, response);
    }

    /**
     * Set the current state of the state machine.
     * @param {State} newState: The new state.
     */
    setCurrentState( newState ) {
        this.currentState = newState;
    }

    /**
     * Get the current state of the machine.
     * @return {State} The current state.
     */
    getCurrentState() {
        return this.currentState;
    }

    /**
     * Get the Idle State.
     * @return {Idle} The Idle State.
     */
    getIdle() {
        return this.idle;
    }

    /**
     * Get the RequestReceived State.
     * @return {RequestReceived} The RequestReceived State.
     */
    getRequestReceived() {
        return this.requestReceived;
    }

    /**
     * Get the BroadcastRequestReceived State.
     * @return {BroadcastRequestReceived} The BroadcastRequestReceived State.
     */
    getBroadcastRequestReceived() {
        return this.broadcastRequestReceived;
    }

    /**
     * Get the AwaitBroadcastResponse State.
     * @return {AwaitBroadcastResponse} The AwaitBroadcastResponse State.
     */
    getAwaitBroadcastResponse() {
        return this.awaitBroadcastResponse;
    }

    /**
     * Get the RessourceAccessProtected State.
     * @return {RessourceAccessProtected} The RessourceAccessProtected State.
     */
    getRessourceAccessProtected() {
        return this.ressourceAccessProtected;
    }

    /**
     * Get the RessourceAccessProvided State.
     * @return {RessourceAccessProvided} The RessourceAccessProvided State.
     */
    getRessourceAccessProvided() {
        return this.ressourceAccessProvided;
    }

    /**
     * Get the RessourceAccessNotAvailable State.
     * @return {RessourceAccessNotAvailable} The RessourceAccessNotAvailable State.
     */
    getRessourceAccessNotAvailable() {
        return this.ressourceAccessNotAvailable;
    }
}

class State {
    constructor(dataRequestStateController) {
        if (new.target === State) {
            throw new TypeError('Abstract classes cannot be instantiated.')
        }
        Object.defineProperty(this, 'dataRequestStateController', {get : function () {
                return dataRequestStateController;
            }});
    }

    /**
     * This function should define behaviour of a single CRUD operation
     * @param {CRUDOperation} crudOperation: The CRUD operation to be executed of type CRUDOperation
     * @return {Promise<Object>} The result of the request.
     */
    async requestCRUDOperation(crudOperation) {
        return await { status : 'failed', success : false, message : 'This operation is not executable in the current state.', state : this.dataRequestStateController.getCurrentState() };
    }

    /**
     * Will be called when the CRUD Operation is of type broadcast.
     * @param {CRUDOperation} crudOperation: The broadcast CRUD operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async requestBroadcastCRUDOperation(crudOperation) {
        return await { status : 'failed', success : false, message : 'This operation is not executable in the current state.',state : this.dataRequestStateController.getCurrentState() };
    }

    /**
     * Broadcasts a ressource request.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async broadcastRessourceAccess(crudOperation) {
        return await { status : 'failed', success : false, message : 'This operation is not executable in the current state.', state : this.dataRequestStateController.getCurrentState() };
    }

    /**
     * Executed when data access is protected.
     * @param {CRUDOperation} crudOperation: The inital operation.
     * @param {Object} response: The responses of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async ressourceProtected(crudOperation, response){
        return await { status : 'failed', success : false, message : 'This operation is not executable in the current state.', state : this.dataRequestStateController.getCurrentState() };
    }

    /**
     * Executed when data access is provided.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The responses of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async ressourceProvided(crudOperation, response){
        return await { status : 'failed', success : false, message : 'This operation is not executable in the current state.',state : this.dataRequestStateController.getCurrentState() };
    }

    /**
     * Executed when data access is not available.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The response of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async ressourceNotAvailable(crudOperation, response){
        return await { status : 'failed', success : false, message : 'This operation is not executable in the current state.', state : this.dataRequestStateController.getCurrentState() };
    }

    /**
     * Once the ressource access is protected a request for data access can be initiated.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async requestRessourceAccess(crudOperation) {
        return await { status : 'failed', success : false, message : 'This operation is not executable in the current state.', state : this.dataRequestStateController.getCurrentState() };
    }

    /**
     * Executes the broadcast CRUD operation as defined in the parameters of the crudOperation object.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The response of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async broadcastOperationExecuted(crudOperation, response) {
        return await { status : 'failed', success : false, message : 'This operation is not executable in the current state.', state : this.dataRequestStateController.getCurrentState() };
    }

    /**
     * Executes a local CRUD operation.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async executeLocalOperation(crudOperation){
        return await { status : 'failed', success : false, message : 'This operation is not executable in the current state.', state : this.dataRequestStateController.getCurrentState() };
    }


    /**
     * Cancels the remote CRUD operation.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The response of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async cancelBroadcastOperation(crudOperation, response = null){
        return await { status : 'failed', success : false, message : 'This operation is not executable in the current state.', state : this.dataRequestStateController.getCurrentState() };
    }
}

/**
 * @class
 */
class Idle extends State {

    /**
     * Constructor for the Idle State.
     * @param {DataRequestStateController} dataRequestStateController: The managing data request state controller.
     * @param {DataAccessController} dataAccessController: The operational data access controller.
     */
    constructor(dataRequestStateController, dataAccessController) {
        super(dataRequestStateController);
        this.dataAccessController = dataAccessController;
    }

    /**
     * This function should define behaviour of a single CRUD operation
     * @param {CRUDOperation} crudOperation: The CRUD operation to be executed of type CRUDOperation
     * @return {Promise<Object>} The result of the request.
     */
    async requestCRUDOperation(crudOperation) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getRequestReceived());
        let broadcast = false;
        try {
            broadcast  = crudOperation.getBroadcastConfiguration();
        } catch (e) {
            broadcast = false;
        }
        if (broadcast){
            return await this.dataRequestStateController.requestBroadcastCRUDOperation(crudOperation);
        } else {
            return await this.dataRequestStateController.executeLocalOperation(crudOperation);
        }
    }

    /**
     * Returns the name of the state.
     * @return {String} The constructor's name.
     */
    toString() {
        return this.constructor.name;
    }
}

/**
 * @class
 */
class RequestReceived extends State {

    /**
     * Constructor for the RequestReceived State.
     * @param {DataRequestStateController} dataRequestStateController: The managing data request state controller.
     * @param {DataAccessController} dataAccessController: The operational data access controller.
     */
    constructor(dataRequestStateController, dataAccessController) {
        super(dataRequestStateController);
        this.dataAccessController = dataAccessController;
    }

    /**
     * Executes a local CRUD operation.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async executeLocalOperation(crudOperation) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getIdle());
        const operationStatus = await this.dataAccessController.executeCRUDOperation(crudOperation);
        return { status : 'success', success : true, message : 'Operation was successfully executed.', state : this.dataRequestStateController.getCurrentState(), response : {req : crudOperation, res: operationStatus} };
    }

    /**
     * Will be called when the CRUD Operation is of type broadcast.
     * @param {CRUDOperation} crudOperation: The broadcast CRUD operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async requestBroadcastCRUDOperation(crudOperation) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getBroadcastRequestReceived());
        return await this.dataRequestStateController.broadcastRessourceAccess(crudOperation);
    }

    /**
     * Returns the name of the state.
     * @return {String} The constructor's name.
     */
    toString() {
        return this.constructor.name;
    }
}

/**
 * @class
 */
class BroadcastRequestReceived extends State {

    /**
     * Constructor for the BroadcastRequestReceived State.
     * @param {DataRequestStateController} dataRequestStateController: The managing data request state controller.
     * @param {DataAccessController} dataAccessController: The operational data access controller.
     */
    constructor(dataRequestStateController, dataAccessController) {
        super(dataRequestStateController);
        this.dataAccessController = dataAccessController;
    }

    /**
     * Broadcasts a ressource request.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async broadcastRessourceAccess (crudOperation) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getAwaitBroadcastResponse());
        const _this = this;
        const response = await this.dataAccessController.broadcastRessourceAccess(crudOperation);
        if (response.res.status === 'protected') {
            return await _this.dataRequestStateController.ressourceProtected(crudOperation, response);
        } else if (response.res.status === 'provided') {
            return await _this.dataRequestStateController.ressourceProvided(crudOperation, response);
        } else {
            return await _this.dataRequestStateController.ressourceNotAvailable(crudOperation, response);
        }
    }

    /**
     * Returns the name of the state.
     * @return {String} The constructor's name.
     */
    toString() {
        return this.constructor.name;
    }
}

/**
 * @class
 */
class AwaitBroadcastResponse extends State {

    /**
     * Constructor for the AwaitBroadcastResponse State.
     * @param {DataRequestStateController} dataRequestStateController: The managing data request state controller.
     * @param {DataAccessController} dataAccessController: The operational data access controller.
     */
    constructor(dataRequestStateController, dataAccessController) {
        super(dataRequestStateController);
        this.dataAccessController = dataAccessController;
    }

    /**
     * Executed when data access is protected.
     * @param {CRUDOperation} crudOperation: The inital operation.
     * @param {Object} response: The responses of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async ressourceProtected(crudOperation, response) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getRessourceAccessProtected());
        return await { status : 'success', success : true, message : 'Operation was successfully executed.', state : this.dataRequestStateController.getCurrentState(), response: response};
    }

    /**
     * Executed when data access is provided.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The responses of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async ressourceProvided(crudOperation, response) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getRessourceAccessProvided());
        return await this.dataRequestStateController.broadcastOperationExecuted(crudOperation, response);
    }

    /**
     * Executed when data access is not available.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The response of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async ressourceNotAvailable (crudOperation, response) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getRessourceAccessNotAvailable());
        return await this.dataRequestStateController.cancelBroadcastOperation(crudOperation, response);
    }

    /**
     * Returns the name of the state.
     * @return {String} The constructor's name.
     */
    toString() {
        return this.constructor.name;
    }
}

/**
 * @class
 */
class RessourceAccessProtected extends State {

    /**
     * Constructor for the RessourceAccessProtected State.
     * @param {DataRequestStateController} dataRequestStateController: The managing data request state controller.
     * @param {DataAccessController} dataAccessController: The operational data access controller.
     */
    constructor(dataRequestStateController, dataAccessController) {
        super(dataRequestStateController);
        this.dataAccessController = dataAccessController;
    }

    /**
     * Once the ressource access is protected a request for data access can be initiated.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async requestRessourceAccess(crudOperation) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getAwaitBroadcastResponse());

        const _this = this;
        const response = await this.dataAccessController.requestAccessPermission(crudOperation);
        if (response.res.status === 'protected') {
            return await _this.dataRequestStateController.ressourceProtected(crudOperation, response);
        } else if (response.res.status === 'provided') {
            return await _this.dataRequestStateController.ressourceProvided(crudOperation, response);
        } else {
            return await _this.dataRequestStateController.ressourceNotAvailable(crudOperation, response);
        }
    }

    /**
     * Cancels the remote CRUD operation.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The response of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async cancelBroadcastOperation(crudOperation, response = null) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getIdle());
        return await { status : 'success', success : true, message : 'Operation was successfully executed.', state : this.dataRequestStateController.getCurrentState(), response : response };
    }

    toString() {
        return this.constructor.name;
    }
}

/**
 * @class
 */
class RessourceAccessProvided extends State {

    /**
     * Constructor for the RessourceAccessProvided State.
     * @param {DataRequestStateController} dataRequestStateController: The managing data request state controller.
     * @param {DataAccessController} dataAccessController: The operational data access controller.
     */
    constructor(dataRequestStateController, dataAccessController) {
        super(dataRequestStateController);
        this.dataAccessController = dataAccessController;
    }

    /**
     * Executes the broadcast CRUD operation as defined in the parameters of the crudOperation object.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The response of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async broadcastOperationExecuted (crudOperation, response) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getIdle());
        return { status : 'success', success : true, message : 'Operation was successfully executed.', state : this.dataRequestStateController.getCurrentState(), response : response };
    }

    /**
     * Returns the name of the state.
     * @return {String} The constructor's name.
     */
    toString() {
        return this.constructor.name;
    }
}

/**
 * @class
 */
class RessourceAccessNotAvailable extends State {

    /**
     * Constructor for the RessourceAccessNotAvailable State.
     * @param {DataRequestStateController} dataRequestStateController: The managing data request state controller.
     * @param {DataAccessController} dataAccessController: The operational data access controller.
     */
    constructor(dataRequestStateController, dataAccessController) {
        super(dataRequestStateController);
        this.dataAccessController = dataAccessController;
    }

    /**
     * Cancels the remote CRUD operation.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The response of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async cancelBroadcastOperation(crudOperation, response) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getIdle());
        return await { status : 'success', success : true, message : 'Operation was successfully executed.', state : this.dataRequestStateController.getCurrentState(), response : response };
    }

    /**
     * Returns the name of the state.
     * @return {String} The constructor's name.
     */
    toString() {
        return this.constructor.name;
    }
}

module.exports.DataRequestStateController = DataRequestStateController;
module.exports.State = State;
},{}],12:[function(require,module,exports){
const model = require('../../model');
// TODO: Add Comments

/**
 * @interface
 */
class BaaSCommunicationHandler {

    /**
     * Creates a new instance of the BaaSCommunicationHandler
     */
    constructor() {
        if (new.target === BaaSCommunicationHandler) {
            throw new Error('Interfaces cannot be instantiated.');
        }

        Object.defineProperty(this, 'tucanaPlatform', {get : function () {
                return null;
            }});

        Object.defineProperty(this, 'initialized', {get : function () {
                return false;
            }});

    }

    /**
     * Executes a new CRUDOperation as a BaaS broadcast.
     * @param {CRUDOperation} crudOperation: The CRUDOperation to be executed.
     * @return {Promise<Object>} The result of the operation
     */
    async broadcastRessourceAccess(crudOperation) {
        if (crudOperation.getObjectType() === model.OBJECTTYPE.SOFTWARE) {
            return await this.broadcastSBaaS(crudOperation);
        } else if (crudOperation.getObjectType() === model.OBJECTTYPE.DATA) {
            return await this.broadcastDBaaS(crudOperation);
        } else if (crudOperation.getObjectType() === model.OBJECTTYPE.SMART_SERVICE) {
            return await this.broadcastSSCBaaS(crudOperation);
        } else if (crudOperation.getObjectType() === model.OBJECTTYPE.MODEL) {
            return await this.broadcastMBaaS(crudOperation);
        }
    }

    /**
     * This function can be used to fetch software items.
     * @param {CRUDOperation} crudOperation
     * @return {Array<Promise<SoftwareItem>>}
     */
    async broadcastSBaaS(crudOperation) {
        throw new Error('You have to implement the method broadcastSBaaS!');
    }

    /**
     * This function can be used to fetch domain items.
     * @param {CRUDOperation} crudOperation
     * @return {Array<Promise<DomainItem>>}
     */
    async broadcastDBaaS(crudOperation) {
        throw new Error('You have to implement the method broadcastDBaaS!');
    }

    /**
     * This function can be used to fetch smart service configuration items.
     * @param {CRUDOperation} crudOperation
     * @return {Array<Promise<SmartServiceConfigurationItem>>}
     */
    async broadcastSSCBaaS(crudOperation) {
        throw new Error('You have to implement the method broadcastSSCBaaS!');
    }

    /**
     * This function can be used to fetch model items.
     * @param {CRUDOperation} crudOperation
     * @return {Array<Promise<ModelItem>>}
     */
    async broadcastMBaaS(crudOperation) {
        throw new Error('You have to implement the method broadcastMBaaS!');
    }
}

module.exports.BaaSCommunicationHandler = BaaSCommunicationHandler;
},{"../../model":16}],13:[function(require,module,exports){
const CRUD = require('../../model').CRUD;
const OBJECTTYPE = require('../../model').OBJECTTYPE;

/**
 * @interface
 */
class DatabaseHandler {

    /**
     * Interface for classes that represent a DatabaseHandler Adapter.
     */
	constructor() {
		if(new.target===DatabaseHandler){
            throw new Error('Interfaces cannot be instantiated.');
        }

	}

    /**
	 * Given a well definded CRUDOperation this function executes the right function.
     * @param crudOperation: The operation to be executed.
     * @returns {Promise<void>}
     */
	async executeLocalCRUDOperation(crudOperation)	{
		switch (crudOperation.getOperationType()) {
			case CRUD.CREATE:
				return await this.create(crudOperation.getObject(), crudOperation.getObjectType());
				break;
			case CRUD.READ:
                return await this.read(crudOperation.getQuery(), crudOperation.getObjectType());
				break;
			case CRUD.UPDATE:
                return await this.update(crudOperation.getQuery(), crudOperation.getObject(), crudOperation.getObjectType());
				break;
			case CRUD.DELETE:
                return await this.delete(crudOperation.getQuery(), crudOperation.getObjectType());
        }
	}

    /**
	 * Creates an object in the local database
     * @param object: The object to create.
	 * @param objectType: The type of the object i.e. data, software or model.
     * @returns {Promise<boolean>} Success or not.
     */
	async create(object, objectType) {
		switch (objectType) {
			case OBJECTTYPE.DATA:
				return await this._createData(object);
				break;
			case OBJECTTYPE.SOFTWARE:
				return await this._createSoftwareComponent(object);
				break;
			case OBJECTTYPE.MODEL:
				return await this._createModel(object);
				break;
            case OBJECTTYPE.SMART_SERVICE:
                return await this._createSmartServiceConfiguration(object);
                break;
		}
	}

    /**
     * Reads an object from the local database.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param objectType: The type of the object i.e. data, software or model.
     * @returns {Promise<Array>} Array of objects.
     */
    async read(query, objectType) {
        switch (objectType) {
            case OBJECTTYPE.DATA:
                return await this._readData(query);
                break;
            case OBJECTTYPE.SOFTWARE:
                return await this._readSoftwareComponent(query);
                break;
            case OBJECTTYPE.MODEL:
                return await this._readModel(query);
                break;
            case OBJECTTYPE.SMART_SERVICE:
                return await this._readSmartServiceConfiguration(query);
                break;
        }
    }

    /**
     * Updates an object and replaces it with a new one.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param object: The new object.
     * @param objectType: The type of the object i.e. data, software or model.
     * @returns {Promise<boolean>} Success or not.
     */
    async update(query, object, objectType) {
        switch (objectType) {
            case OBJECTTYPE.DATA:
                return await this._updateData(query, object);
                break;
            case OBJECTTYPE.SOFTWARE:
                return await this._updateSoftwareComponent(query, object);
                break;
            case OBJECTTYPE.MODEL:
                return await this._updateModel(query, object);
                break;
            case OBJECTTYPE.SMART_SERVICE:
                return await this._updateSmartServiceConfiguration(query, object);
                break;
        }
    }

    /**
     * Deletes an object
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param objectType: The type of the object i.e. data, software or model.
     * @returns {Promise<boolean>} Success or not.
     */
    async delete(query, objectType) {
        switch (objectType) {
            case OBJECTTYPE.DATA:
                return await this._deleteData(query);
                break;
            case OBJECTTYPE.SOFTWARE:
                return await this._deleteSoftwareComponent(query);
                break;
            case OBJECTTYPE.MODEL:
                return await this._deleteModel(query);
                break;
            case OBJECTTYPE.SMART_SERVICE:
                return await this._deleteSmartServiceConfiguration(query);
                break;
        }
    }

    /**
     * Returns all cached domain item IDs accessible withing the database.
     * @return {Promise<Array>} The IDs of the stored domain items.
     */
    async getDomainItemIDs() {
        throw new Error('You have to implement the method getDomainItemIDs');
    }

    /**
     * Returns all cached software item names accessible withing the database.
     * @return {Promise<Array>} The names of the cached software items.
     */
    async getSoftwareItemIDs() {
        throw new Error('You have to implement the method getSoftwareItemIDs');
    }

    /**
     * Returns all cached model item IDs accessible withing the database.
     * @return {Promise<Array>} The IDs of the stored model items.
     */
    async getModelItemIDs() {
        throw new Error('You have to implement the method getModelItemIDs');
    }

    /**
     * Returns all cached Smart Service Configuration Item IDs accessible withing the database.
     * @return {Promise<Array>} The IDs of the stored Smart Service Configuration Items.
     */
    async getSmartServiceConfigurationItemIDs() {
        throw new Error('You have to implement the method getSmartServiceConfigurationItemIDs');
    }

    /**
	 * Creates a new data object.
     * @param object: The object to create.
     * @return {Promise<boolean>} Success or not
     */
	async _createData(object) {
        throw new Error('You have to implement the method _createData!');
    }

    /**
     * Creates a new software component object.
     * @param object: The object to create.
     * @return {Promise<boolean>} Success or not
     */
    async _createSoftwareComponent(object) {
        throw new Error('You have to implement the method _createSoftwareComponent!');
    }

    /**
     * Creates a new model object.
     * @param object: The object to create.
     * @return {Promise<boolean>} Success or not
     */
    async _createModel(object) {
        throw new Error('You have to implement the method _createModel!');
    }

    /**
     * Creates a new smart service configuration item.
     * @param object: The object to create.
     * @return {Promise<boolean>} Success or not
     */
    async _createSmartServiceConfiguration(object) {
        throw new Error('You have to implement the method _createSmartServiceConfiguration!');
    }

    /**
     * Reads a new data object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @returns {Promise<Array>} Array of objects.
     */
    async _readData(query) {
        throw new Error('You have to implement the method _readData!');
    }

    /**
     * Reads a new software component object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @returns {Promise<Array>} Array of objects.
     */
    async _readSoftwareComponent(query) {
        throw new Error('You have to implement the method _readSoftwareComponent!');
    }

    /**
     * Reads a new model object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @returns {Promise<Array>} Array of objects.
     */
    async _readModel(query) {
        throw new Error('You have to implement the method _readModel!');
    }

    /**
     * Reads a new smart service configuration item.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @returns {Promise<Array>} Array of objects.
     */
    async _readSmartServiceConfiguration(query) {
        throw new Error('You have to implement the method _readSmartServiceConfiguration!');
    }

    /**
     * Updates a data object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param object: The object to be updated.
     * @return {Promise<boolean>} Success or not
     */
    async _updateData(query, object) {
        throw new Error('You have to implement the method _updateData!');
    }

    /**
     * Updates a software component object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param object: The object to be updated.
     * @return {Promise<boolean>} Success or not
     */
    async _updateSoftwareComponent(query, object) {
        throw new Error('You have to implement the method _updateSoftwareComponent!');
    }

    /**
     * Updates a model object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param object: The object to be updated.
     * @return {Promise<boolean>} Success or not
     */
    async _updateModel(query, object) {
        throw new Error('You have to implement the method _updateModel!');
    }

    /**
     * Updates a new smart service configuration item.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param object: The object to be updated.
     * @return {Promise<boolean>} Success or not
     */
    async _updateSmartServiceConfiguration(query, object) {
        throw new Error('You have to implement the method _updateSmartServiceConfiguration!');
    }

    /**
     * Deletes a data object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @return {Promise<boolean>} Success or not
     */
    async _deleteData(query) {
        throw new Error('You have to implement the method _deleteData!');
    }

    /**
     * Deletes a software component object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @return {Promise<boolean>} Success or not
     */
    async _deleteSoftwareComponent(query) {
        throw new Error('You have to implement the method _deleteSoftwareComponent!');
    }

    /**
     * Deletes a model object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @return {Promise<boolean>} Success or not
     */
    async _deleteModel(query) {
        throw new Error('You have to implement the method _deleteModel!');
    }

    /**
     * Deletes a smart service configuration item.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @return {Promise<boolean>} Success or not
     */
    async _deleteSmartServiceConfiguration(query) {
        throw new Error('You have to implement the method _deleteSmartServiceConfiguration!');
    }
}

module.exports.DatabaseHandler = DatabaseHandler;
},{"../../model":16}],14:[function(require,module,exports){
const model = require('../../model');

/**
 * Interface for classes that represent a UPeerCommunicationHandler Adapter.
 * @interface
 */
class UPeerCommunicationHandler {

	/**
	 * Constructor of the uPeerCommunicationHandler interface.
	 */
	constructor() {
		if (new.target === UPeerCommunicationHandler) {
            throw new Error('Interfaces cannot be instantiated.');
        }
		this.c = 0;
		this.tPlatform = null;
		this.setup = false;
		this.cStack = [];

		Object.defineProperty(this, 'tucanaPlatform', {get : function () {
				return this.tPlatform;
			}, set(v) {
				this.tPlatform = v;
			}});

		Object.defineProperty(this, 'initialized', {get : function () {
				return this.setup;
			}, set(v) {
				this.setup = v;
			}});

		Object.defineProperty(this, 'counter', {
			get : function () {
				return this.c;
			}, set : function (v) {
				this.c = v;
			}});

		Object.defineProperty(this, 'callStack', {get : function () {
				return this.cStack;
			}, set(v) {
				this.cStack = v;
			}});

		// Set the timeout statically for the time being
		Object.defineProperty(this, 'timeout', {get : function () {
				return 5000;
			}});
	}

	/**
	 * Connects the uPeerCommunicationHandler to the core to handle messages properly.
	 * @param {TucanaCoreService} tucanaPlatform: The TUCANA Core interface.
	 */
	connectToCore(tucanaPlatform) {
		this.tucanaPlatform = tucanaPlatform;
		Object.defineProperty(this, 'identificationHandler', {get : function () {
				return this.tucanaPlatform.getIdentificationHandler();
			}});
		console.log('Connected to core');
		console.log(this.tucanaPlatform);
	}

	/**
	 * Initialization funtion of the UPeerCommunicationHandler Interface; Needs to be called after construction.
	 * @param {TucanaCoreService} tucanaPlatform: The underlying Tucana Platform object for trigger handling and local data accessibility
	 */
	init(tucanaPlatform) {
		//Functionality for the initialization of the communication i.e. setup of handlers, event listeners etc.
		this.connectToCore(tucanaPlatform);
		this.setupEventListener();
		this.initialized = true;
	}

	/**
	 * Handles the request by a connected peer.
	 * @param {Object} req: The request containing the CRUD operation, trigger, id and source
	 * @return {Promise<void>}
	 */
	async handleRequest(req) {
		let res = null;
		if (this.initialized) {
			res = await this.handleCRUDOperation(model.CRUDOperation.fromJSON(req.crudOperation));
		} else {
			res = {success : false, status : 'error', message : 'UPeerCommunicationHandler is not initialized'};
		}
		this.answer(req, res);
	}

	/**
	 * Handles the remote CRUD operation.
	 * @param {CRUDOperation} remoteCRUDOperation: The CRUD operation object.
	 * @return {Promise<Object>} The result of the local operation execution.
	 */
	async handleCRUDOperation(remoteCRUDOperation) {
		if (this.initialized) {
			remoteCRUDOperation.setBroadcastConfiguration(null);
			// TODO: Add try and catch here.
			return await this.tucanaPlatform.performCRUDOperation(remoteCRUDOperation)
		} else {
			return new Promise ((resolve, reject) => {
				reject('UPeerCommunicationHandler is not initialized.');
			});
		}
	}

	/**
	 * Handles a trigger received by the remote peer.
	 * @param {Trigger} trigger: The trigger to be executed.
	 */
	handleTrigger(trigger) {
		// TODO handling of a remote trigger
		if (this.initialized) {
			console.warn('Method not implemented yet.');
		}
	}

	/**
	 * Answers a request.
	 * @param {Object} req: The initial request of the remote peer.
	 * @param {Object} res: The result of the local execution.
	 */
	answer (req, res) {
		this.transfer( model.CRUDOperation.fromJSON(req.crudOperation).getBroadcastConfiguration().getSource(),{req: req, res: res});
	}

	/**
	 * Internal function handling the response of the requested peer.
	 * @param req: The initial request.
	 * @param res: The remote peers response.
	 */
	handleResponse(req, res) {
		const id = req.id;
		const method = this.callStack[id];
		method.fun(req, res);
	}

	/**
	 * Executes a broadcast CRUD operation based on the BroadcastConfiguration within the CRUDOperation.
	 * @param {CRUDOperation} crudOperation: The broadcast CRUD operation to be executed.
	 * @return {Promise<Object>}: The result of the CRUD operation.
	 */
	async _executeBroadcastCRUDOperation(crudOperation) {
		// Formulate a request and use transfer to share the request with a peer
		if (this.initialized) {
			const _this = this;
			const promises = [];
			for (let targetRessource of crudOperation.getBroadcastConfiguration().getTargets()) {
				const id = _this.callStack.length;
				const request = {
					id : id,
					type: "req",
					source : crudOperation.getBroadcastConfiguration().getSource(),
					target: targetRessource,
					crudOperation : crudOperation.toJSON(),
				};
				promises.push(
					Promise.race([
						new Promise((resolve, reject) => {
							_this.callStack.push({id: id, fun : function (req, res) {
									if (req && res) {
										resolve({req : req, res : res});
									} else {
										resolve({req : request, res : {success : false, status: 'failed', message: 'Got wrong response format.'}});
									}
								}});
							_this.transfer(request.target, request);
						}),
						// Setup a timeout such that long duration of requests will lead to a timeout.
						new Promise((resolve, reject) => {
							let timeout = setTimeout(() => {
								clearTimeout(timeout);
								// Clear the callback function.
								_this.callStack[id].fun = function(req, res) {
									return;
								};
								resolve({req : request, res : {success : false, status: 'failed', message: 'Timed out in ' + _this.timeout + 'ms.'}});
							}, _this.timeout)
						})
					]));
			}
			return Promise.all(promises.map(p => p.catch(error => {
				console.error(error);
				return {res : {success : false, status: 'failed', message: error}};
			})));
		} else {
			return new Promise((resolve, reject) => {
				reject('UPeerCommunicationHandler is not initialized.');
			});
		}

	}

	/**
	 * Transfer a request to the remote peers to check whether ressource access is provided or not.
	 * @param {CRUDOperation} crudOperation: The CRUDOperation.
	 * @return {Promise<Object>}: The result of the request.
	 */
	async broadcastRessourceAccess(crudOperation) {
		// Check whether the remote peer allows access to the environment
		// TODO Implement this function and use transfer to send a request to a remote peer.
		console.warn('Method not implemented yet.');
		return await this._executeBroadcastCRUDOperation(crudOperation);
	}

	/**
	 * Transfer a request to the remote peer to request access permission.
	 * @param {String} targetPeerID: The id of the target peer.
	 * @return {Promise<Object>}: The result of the request.
	 */
	async requestAccessPermission(targetPeerID) {
		// Request for access to the remote environment.
		// TODO Implement this function and use transfer to send a request to a remote peer.
		console.warn('Method not implemented yet.');
	}

	/**
	 * Setup of the event listeners for environmental communication as well as for peer communication.
	 */
	setupEventListener() {
		throw new Error('You have to implement the method setupEventListener.');

	}

	/**
	 * Transfer function for json objects to a target id.
	 * @param {String} target: The target id.
	 * @param {Object} object: The object to be transferred.
	 */
	transfer(target, object) {
		throw new Error('You have to implement the method transfer.');
	}

	/**
	 * Returns all accessible peers in a network with the given properties.
	 * @param {Array} properties: The properties to fulfill.
	 * @return {Promise<Array>}: The list of the filtered peers.
	 */
	async getFilteredPeerIds(properties) {
		// Return the accessible peer ids in the network e.g. based on intelligent broadcasting
		throw new Error('You have to implement the method getFilteredPeerIds.');
	}
}

module.exports.UPeerCommunicationHandler = UPeerCommunicationHandler;

},{"../../model":16}],15:[function(require,module,exports){
/**
 * Interface for classes that represent a TENVIdentificationHandler Adapter.
 * @interface
 */

class TENVIdentificationHandler {


    /**
     * Contructor of the tenvIdentificationHandler interface.
     */
    constructor() {
        if (new.target === TENVIdentificationHandler) {
            throw new Error('Interfaces cannot be instantiated.');
        }
    }

    /**
     * Returns the local id of the peer.
     * @return {String}: The local id of the peer.
     */
    getLocalID() {
        throw new Error('You have to implement the method getLocalID.')
    }

    /**
     * Returns all properties of the peer.
     *@return {Object}: The properties of the peer.
     */
    getProperties() {
        throw new Error('You have to implement the method getLocalID.')
    }

    /**
     * Returns the name of the peer.
     * @return {String}: The name of the peer.
     */
    getName() {
        throw new Error('You have to implement the method getName.')
    }

    /**
     * Returns the type of the peer.
     * @return {String}: The type of the peer.
     */
    getType() {
        throw new Error('You have to implement the method getType.')
    }

    /**
     * Returns the geographic information of the peer.
     * @return {String}: The geographic information of the peer.
     */
    async getGeography() {
        throw new Error('You have to implement the method getType.')
    }

    /**
     * Returns the software offering of the peer.
     * @return {String}: The software offering of the peer.
     */
    getSoftwareOffering() {
        throw new Error('You have to implement the method getSoftwareOffering.')
    }

    /**
     * Returns the model offering of the peer.
     * @return {String}: The model offering of the peer.
     */
    getModelOffering() {
        throw new Error('You have to implement the method getModelOffering.')
    }

    /**
     * Returns the content offering of the peer.
     * @return {String}: The content offering of the peer.
     */
    getContentOffering() {
        throw new Error('You have to implement the method getContentOffering.')
    }

    /**
     * Returns the keywords of the peer.
     * @return {Array}: The keywords of the peer.
     */
    getKeywords() {
        throw new Error('You have to implement the method getKeywords.')
    }

}

module.exports.TENVIdentificationHandler = TENVIdentificationHandler;
},{}],16:[function(require,module,exports){
// TODO: Add Comments + revise some descriptive models e.g. FeatureRequest and FeatureResponse and MinionSpecification

/**
 * Datatype of CRUD operations.
 * @type {{CREATE: string, READ: string, UPDATE: string, DELETE: string}}
 */
const CRUD = {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete'
};

/**
 * Datatype of objects.
 * @type {{DATA: string, SOFTWARE: string, MODEL: string}}
 */
const OBJECTTYPE = {
    DATA: 'data',
    SOFTWARE: 'software',
    MODEL: 'model',
    SMART_SERVICE: 'smart_service'
};

/**
 * Different types of queries; streaming type means connection is kept alive and the request function gets notified whenever there is new data.
 * @type {{STATIC: string, STREAMING: string}}
 */
const QUERYTYPE = {
    STATIC: 'static',
    STREAMING: 'streaming'
};

/**
 * Types of a remote request targeting a connected peer.
 * @type {{CRUD: string, TRIGGER: string, CRUD_TRIGGER: string, CHECK_ACCESS: string, REQUEST_ACCESS: string}}
 */
const REQUEST_TYPES = {
    CRUD: 'crud',
    TRIGGER: 'trigger',
    CRUD_TRIGGER: 'crud_trigger',
    CHECK_ACCESS: 'check_access',
    REQUEST_ACCESS: 'request_access'
};


const BROADCAST_TYPES = {
    UPEER: 'upeer',
    BAAS: 'baas'
};

const BROADCAST_CONDITION = {
    ALL: 'all',
    ANY: 'any'
};

const RESPONSE_STATUS = {
    NOT_AVAILABLE: 'not_available',
    PROTECTED: 'protected',
    PROVIDED: 'provided'
};

class CRUDOperation {
    /**
     * Creates a new CRUD operation of certain type.
     * @param operationType: The type of operation (create, read, update, delete)
     * @param objectType: The type of the object to operate on (data, software, model)
     * @param object (optional): the object to be saved.
     * @param query (optional): The query for reading, updating and deletion of objects.
     * @param broadcastConfiguration (optional): The configuration of the remote operation.
     */
    constructor(operationType = CRUD.CREATE, objectType = OBJECTTYPE.DATA, object = null, query = null, broadcastConfiguration = null) {
        this.operationType = operationType;
        this.objectType = objectType;
        this.object = object;
        this.query = query;
        this.broadcastConfiguration = broadcastConfiguration;
    }

    toJSON() {
        return {
            operationType: this.operationType,
            objectType: this.objectType,
            object: this.object ? this.object.toJSON() : null,
            query: this.query ? this.query.toJSON() : null,
            broadcastConfiguration: this.broadcastConfiguration ? this.broadcastConfiguration.toJSON() : null
        };
    }

    static fromJSON(json) {
        if (json) {
            let object = null;
            if (json.object) {
                if (json.object.object) {
                    object = DomainItem.fromJSON(json.object);
                } else if (json.object.code) {
                    object = SoftwareItem.fromJSON(json.object);
                } else {
                    object = ModelItem.fromJSON(json.object);
                }
            }
            return new CRUDOperation(json.operationType, json.objectType, object, DatabaseQuery.fromJSON(json.query), BroadcastConfiguration.fromJSON(json.broadcastConfiguration));
        } else return null;
    }

    /**
     * Returns the operation type.
     * @returns {string}
     */
    getOperationType() {
        return this.operationType;
    }

    /**
     * Returns the object type.
     * @returns {string}
     */
    getObjectType() {
        return this.objectType;
    }

    /**
     * Returns the object.
     * @throws TypeError if no object is defined.
     * @returns {*}
     */
    getObject() {
        if (this.object) {
            return this.object;
        } else {
            throw TypeError('Object is not defined.');
        }
    }

    /**
     * Returns the query object of the operation.
     * @throws TypeError if no query is defined.
     * @returns {*}
     */
    getQuery() {
        if (this.query) {
            return this.query;
        } else {
            throw TypeError('DatabaseQuery is not defined.');
        }
    }

    /**
     * Returns the remote configuration of the operation.
     * @throws TypeError if no remote configuration is defined.
     * @returns {Object}
     */
    getBroadcastConfiguration() {
        if (this.broadcastConfiguration) {
            return this.broadcastConfiguration;
        } else {
            return null;
        }
    }

    /**
     * Returns the target of the remote operation.
     * @throws TypeError if no remote configuration is defined.
     * @returns {Array}
     */
    getBroadcastTargets() {
        return this.getBroadcastConfiguration().getTargets();
    }

    /**
     * Returns the minions to be triggered at the remote environment.
     * @throws TypeError if no remote configuration is defined.
     * @returns {Array}
     */
    getRemoteTriggers() {
        return this.getBroadcastConfiguration().getTrigger();
    }

    /**
     * Sets the operation type.
     */
    setOperationType(operationType) {
        this.operationType = operationType;
    }

    /**
     * Sets the object type.
     */
    setObjectType(objectType) {
        this.objectType = objectType;
    }

    /**
     * Sets the object.
     */
    setObject(object) {
        this.object = object;
    }

    /**
     * Sets the query object of the operation.
     */
    setQuery(query) {
        this.query = query;
    }

    /**
     * Sets the remote configuration of the operation.
     */
    setBroadcastConfiguration(remoteConfiguration) {
        this.broadcastConfiguration = remoteConfiguration;
    }
}

class DatabaseQuery {

    /**
     * Creates a query for a read, update and/or delete CRUDOperation based on identifiying ressource string and query parameters.
     * @param {String} queryType: The type of the query i.e. whether it will be streaming or static operations.
     * @param {String} ressource: Identificator of the ressource i.e. domain, peer ID etc.
     * @param {Array<Object>} params: The parameter of the query.
     */
    constructor(queryType = QUERYTYPE.STATIC, ressource, params) {
        this.queryType = queryType;
        this.ressource = ressource;
        this.params = params;
    }

    toJSON() {
        return {
            queryType: this.queryType,
            ressource: this.ressource,
            params: this.params,
        }
    }

    static fromJSON(json) {
        if (json) {
            return new DatabaseQuery(json.queryType, json.ressource, json.params);
        } else {
            return null;
        }
    }

    getQueryType() {
        return this.queryType;
    }

    getRessource() {
        return this.ressource;
    }

    getParams() {
        return this.params;
    }

    toURI() {
        let uri = this.ressource;
        if (this.params.length > 0) {
            uri += '?'
        }
        for (let i = 0; i < this.params.length; i++) {
            uri += this.params[i].name + '=' + this.params[i].value;
            if (i < (this.params.length - 1)) {
                uri += '&';
            }
        }
        return uri;
    }

}

class DomainItem {

    /**
     * Creates a single domain-specific data item.
     * @param id {String}: The id of the domain item.
     * @param object {Object}: The data object with related meta data.
     */
    constructor(id, object) {
        this.id = id;
        this.object = object;
    }

    toJSON() {
        return {
            id: this.id,
            object: this.object,
        }
    }

    static fromJSON(json) {
        if (json) {
            return new DomainItem(json.id, json.object);
        } else {
            return null;
        }
    }

    getId() {
        return this.id;
    }

    getObject() {
        return this.object;
    }


    setId(newId) {
        this.id = newId
    }

    setObject(newObject) {
        this.object = newObject;
    }
}

class SoftwareItem {

    /**
     * Creates a single software component with its executionable code.
     * @param id {String}: The id of the software component i.e. minion name.
     * @param code {String}: The code to be interpreted as a string.
     */
    constructor(id, code) {
        this.id = id;
        this.code = code;
    }

    toJSON() {
        return {
            id: this.id,
            code: this.code.toString()
        }
    }

    static fromJSON(json) {
        if (json) {
            return new SoftwareItem(json.id, json.code);
        } else {
            return null;
        }
    }

    getId() {
        return this.id;
    }

    getCode() {
        return this.code;
    }

    getClass() {
        return eval('(' + this.getCode() + ')');
    }

    setId(newId) {
        this.id = newId
    }

    setCode(newCode) {
        this.code = newCode;
    }
}

class ModelItem {

    /**
     * Creates a single model with its id and model including weights and  architecture
     * @param id {String}: The unique id of the model
     * @param model {Object}: The model including architecture and weigths
     */
    constructor(id, model) {
        this.id = id;
        this.model = model;
    }

    toJSON() {
        return {
            id: this.id,
            model: this.model.toString()
        }
    }

    static fromJSON(json) {
        if (json) {
            return new ModelItem(json.id, json.model);
        } else {
            return null;
        }
    }

    getId() {
        return this.id;
    }

    getModel() {
        return this.model;
    }

    setId(newId) {
        this.id = newId;
    }

    setModel(newModel) {
        this.model = newModel;
    }

}

class SmartServiceConfigurationItem {

    /**
     * Creates an app configuration item that defines a pipeline of minion execution respectively with their inputs, outputs and connectors.
     * @param {String} id: The identifier of the app configuration.
     * @param {String} version: The version of the app configuration.
     * @param {Array<MinionSpecification>} configuration: The configuration itself.
     * @param {Object} context: Metadata about the configuration parameters.
     */
    constructor(id, version, configuration, context, name, descriptionTitle, descriptionText) {
        this.id = id;
        this.version = version;
        this.configuration = configuration;
        this.context = context;
        this.name = name;
        this.descriptionTitle = descriptionTitle;
        this.descriptionText = descriptionText;
    }

    toJSON() {
        const config = [];
        for (let minSpec of this.configuration) {
            config.push(minSpec.toJSON());
        }
        return {
            id: this.id,
            version: this.version,
            configuration: config,
            context: this.context,
            name: this.name,
            descriptionTitle: this.descriptionTitle,
            descriptionText: this.descriptionText,
        }
    }

    static fromJSON(json) {
        if (json) {
            for (let i = 0; i < json.configuration.length; i++) {
                json.configuration[i] = MinionSpecification.fromJSON(json.configuration[i]);
            }
            return new SmartServiceConfigurationItem(json.id, json.version, json.configuration, json.context, json.name, json.descriptionTitle, json.descriptionText);
        } else {
            return null;
        }
    }

    getId() {
        return this.id;
    }

    getVersion() {
        return this.version;
    }

    getConfiguration() {
        return this.configuration;
    }

    getContext() {
        return this.context;
    }
}

class Trigger {

    constructor(triggerMethod = null, minionSpecs = null) {
        this.triggerMethod = triggerMethod;
        this.minionSpecs = minionSpecs;
    }

    toJSON() {
        return {
            triggerMethod: this.triggerMethod ? this.triggerMethod.toString() : null,
            minionSpecs: this.minionSpecs ? this.minionSpecs.toJSON() : null
        }
    }

    static fromJSON(json) {
        if (json) {
            let triggerMethod = json.triggerMethod;
            if (triggerMethod) {
                triggerMethod = eval('(' + triggerMethod + ')');
            }
            return new Trigger(triggerMethod, MinionSpecification.fromJSON(json.minionSpecs));
        } else {
            return null;
        }
    }

    getTriggerMethod() {
        return this.triggerMethod;
    }

    getMinionSpecs() {
        return this.minionSpecs;
    }
}

class BroadcastConfiguration {

    /**
     * Represents the parameters necessary for a broadcast request.
     * @param {String} source: The requesting agent.
     * @param {Array<String>} targets: The targets of the request i.e. ids or uris etc.
     * @param {BROADCAST_CONDITION} broadcastCondition: The condition of accepting the broadcast i.e. all requests need to be satisfied or at least one.
     * @param {Trigger} trigger: (Optional) A trigger to be executed in the remote environment.
     */
    constructor(source, targets, type = BROADCAST_TYPES.BAAS, broadcastCondition = BROADCAST_CONDITION.ANY, trigger = null) {
        this.source = source;
        this.targets = targets;
        this.type = type;
        this.broadcastCondition = broadcastCondition;
        this.trigger = trigger;
    }

    toJSON() {
        return {
            source: this.source,
            targets: this.targets,
            type: this.type,
            broadcastCondition: this.broadcastCondition,
            trigger: this.trigger ? this.trigger.toJSON() : null
        }
    }

    static fromJSON(json) {
        if (json) {
            return new BroadcastConfiguration(json.source, json.targets, json.type, json.broadcastCondition, Trigger.fromJSON(json.trigger));
        } else {
            return null;
        }
    }

    getTargets() {
        return this.targets;
    }

    getSource() {
        return this.source;
    }

    getType() {
        return this.type;
    }

    getBroadcastCondition() {
        return this.broadcastCondition;
    }

    getTrigger() {
        return this.trigger;
    }
}

class MinionSpecification {

    /**
     *
     * @param {Number} instanceId: The instance id.
     * @param {string} softwareItemId: The software item Id.
     * @param {Array<string>} targetMinionIds: The target minions.
     */
    constructor(instanceId, softwareItemId, targetMinionIds, name, defaultShow, type) {
        // TODO define input and output specifications of a minion in order to enable a core matching between them.
        this.instanceId = instanceId;
        this.softwareItemId = softwareItemId;
        this.targetMinionIds = targetMinionIds;
        this.name = name;
        this.defaultShow = defaultShow;
        this.type = type;
    }

    toJSON() {
        return {
            instanceId: this.instanceId,
            softwareItemId: this.softwareItemId,
            targetMinionIds: this.targetMinionIds,
            name: this.name,
            defaultShow: this.defaultShow,
            type : this.type,
        }
    }

    static fromJSON(json) {
        if (json) {
            return new MinionSpecification(json.instanceId, json.softwareItemId, json.targetMinionIds, json.name, json.defaultShow, json.type);
        } else {
            return null;
        }
    }

    /**
     * Get the instance identifier.
     * @return {Number} The instance id.
     */
    getInstanceId() {
        return this.instanceId;
    }

    /**
     * Get the software item of interest.
     * @return {SoftwareItem} The software item.
     */
    getSoftwareItemId() {
        return this.softwareItemId;
    }

    /**
     * Get the list of target minions.
     * @return {Array<string>} The list of target minions.
     */
    getTargetMinionIds() {
        return this.targetMinionIds;
    }

    /**
     * Sets a new instance id.
     * @param {Number} newInstanceId: The new instance id.
     */
    setInstanceId(newInstanceId) {
        this.instanceId = newInstanceId;
    }
}

class FeatureRequest {
    // TODO: Request might be helpful to distinguish between remote crud operations and access control requests for instance.
    // TODO: Needs a concrete specification about what information is necessary e.g. typeOfRequest, crudOperation, triggers etc.

    constructor(type, crudOperation = null, trigger = null) {
        this.type = type;
        if (type === REQUEST_TYPES.CRUD || type === REQUEST_TYPES.CRUD_TRIGGER) {
            if (!crudOperation)
                throw new Error('CRUD Operation is not defined while trying to build a CRUD request.');
            else
                this.crudOperation = crudOperation;
        }
        if (type === REQUEST_TYPES.TRIGGER || type === REQUEST_TYPES.CRUD_TRIGGER) {
            if (!trigger)
                throw new Error('TRIGGER is not defined while trying to build a Trigger request.');
            else
                this.trigger = trigger;
        }
    }

    getType() {
        return this.type;
    }

    getCRUDOperation() {
        return this.crudOperation;
    }

    getTrigger() {
        return this.trigger;
    }

    toJSON() {
        return {
            type: this.type,
            crudOperation: this.crudOperation ? this.crudOperation.toJSON() : null,
            trigger: this.trigger ? this.trigger.toJSON() : null
        };
    }

    static fromJSON(json) {
        if (json) {
            return new FeatureRequest(json.type, CRUDOperation.fromJSON(json.crudOperation), Trigger.fromJSON(json.trigger));
        } else return null;
    }
}

class FeatureResponse {
    // TODO: Responses migh be helpful to structure the responses of the uPeerCommunicationHandler as well as of the database interfaces and its communication to the rest of the system.
    // TODO: Needs a concrete specification about what information is necessary e.g. success, status, message etc.

    /**
     * Contains information about the result of an initial request.
     * @param {FeatureRequest} initialRequest: The initial request.
     * @param {Object} result: The result of the request.
     */
    constructor(initialRequest, result) {
        this.request = initialRequest;
        this.result = result;
    }

    getRequest() {
        return this.request;
    }

    getResult() {
        return this.result;
    }

    toJSON() {
        return {
            request: this.request.toJSON(),
            result: result
        };
    }

    static fromJSON(json) {
        if (json) {
            return new FeatureResponse(FeatureRequest.fromJSON(json.request), json.result);
        } else return null;
    }
}

module.exports.CRUDOperation = CRUDOperation;
module.exports.DatabaseQuery = DatabaseQuery;
module.exports.DomainItem = DomainItem;
module.exports.SoftwareItem = SoftwareItem;
module.exports.ModelItem = ModelItem;
module.exports.SmartServiceConfigurationItem = SmartServiceConfigurationItem;
module.exports.Trigger = Trigger;
module.exports.BroadcastConfiguration = BroadcastConfiguration;
module.exports.MinionSpecification = MinionSpecification;
module.exports.FeatureRequest = FeatureRequest;
module.exports.FeatureResponse = FeatureResponse;
module.exports.CRUD = CRUD;
module.exports.OBJECTTYPE = OBJECTTYPE;
module.exports.QUERYTYPE = QUERYTYPE;
module.exports.REQUEST_TYPES = REQUEST_TYPES;
module.exports.BROADCAST_CONDITION = BROADCAST_CONDITION;
module.exports.BROADCAST_TYPES = BROADCAST_TYPES;
module.exports.RESPONSE_STATUS = RESPONSE_STATUS;
},{}],17:[function(require,module,exports){
module.exports.minion = require('./coreplatform/minion');
module.exports.minionstate = require('./coreplatform/minionstatecontroller');
module.exports.adapter = require('./adapter');
module.exports.model = require('./model');
module.exports.DatabaseHandler = require('./dataallocation/handler/databasehandler').DatabaseHandler;
module.exports.UPeerCommunicationHandler = require('./dataallocation/handler/peercommunicationhandler').UPeerCommunicationHandler;
module.exports.BaaSCommunicationHandler = require('./dataallocation/handler/baascommunicationhandler').BaaSCommunicationHandler;
module.exports.TENVIdentificationHandler = require('./dataallocation/handler/tenvidentificationhandler').TENVIdentificationHandler;

// module.exports.tf = require('@tensorflow/tfjs');
// module.exports.tfvis = require('@tensorflow/tfjs-vis');

const DataAccessService = require('./dataallocation/dataaccessservice').DataAccessService;
const SmartServiceController = require('./coreplatform/smartservicecontroller').SmartServiceController;
const MinionStateController = require('./coreplatform/minionstatecontroller').MinionStateController;
const model = require('./model');

// TODO: Add Comments; Revise overall stream of functionality (Are all Interfaces provided as functions that should be provided for executing the core concepts of the tucana platform?)
/**
 * @class
 */
class TucanaCoreService {

    constructor(databaseHandler, upeerCommunicationHandler, baasCommunicationHandler, tenvIdentificationHandler, uiAdapter) {
        this.databaseHandler = databaseHandler;
        this.tenvIdentificationHandler = tenvIdentificationHandler;
        this.upeerCommunicationHandler = upeerCommunicationHandler;
        this.upeerCommunicationHandler.init(this);
        this.baasCommunicationHandler = baasCommunicationHandler;
        this.uiAdapter = uiAdapter;

        this.dataAccessService = new DataAccessService(databaseHandler, upeerCommunicationHandler, baasCommunicationHandler, tenvIdentificationHandler);
        this.smartServiceController = new SmartServiceController(this.dataAccessService, this.uiAdapter);
        this.minionStateController = new MinionStateController(this.smartServiceController);
    }

    async getSmartServiceConfigurationItemIds() {
        if (this.getLocalID()){
            return await this.minionStateController.getSmartServiceConfigurationItemIds();
        } else {
            return null;
        }
    }

    async loadSmartServiceConfiguration(smartServiceConfigurationId) {
        if (this.getLocalID()) {
            return this.minionStateController.loadSmartServiceConfiguration(smartServiceConfigurationId);
        } else {
            return null;
        }
    }

    cancelExecution() {
        if (this.getLocalID()) {
            return this.minionStateController.cancel();
        } else {
            return null;
        }
    }

    async removeProtection(smartServiceConfigurationItem, response) {
        if (this.getLocalID()) {
            return await this.minionStateController.removeProtection(smartServiceConfigurationItem, response)
        } else {
            return null;
        }
    }

    async runSmartService() {
        return await this.minionStateController.runSmartService();
    }

    terminateSmartService() {
        return this.minionStateController.terminateSmartService();
    }

    async createSmartServiceConfiguration(smartServiceConfiguration) {
        if (this.getLocalID()) {
            const crudOperation = new model.CRUDOperation(model.CRUD.CREATE, model.OBJECTTYPE.SMART_SERVICE, smartServiceConfiguration, null, null);
            const result = await this.dataAccessService.requestCRUDOperation(crudOperation);
            return result;
        } else {
            return null;
        }
    }

    getIdentificationHandler() {
        return this.tenvIdentificationHandler;
    }

    getLocalID() {
        return this.dataAccessService.getLocalID();
    }
    getProperties(){
        return this.dataAccessService.getProperties();
    }

    _initializePlatform () {
        // TODO Load the minions
    }
}

module.exports.TucanaCoreService = TucanaCoreService;

},{"./adapter":3,"./coreplatform/minion":4,"./coreplatform/minionstatecontroller":6,"./coreplatform/smartservicecontroller":7,"./dataallocation/dataaccessservice":10,"./dataallocation/handler/baascommunicationhandler":12,"./dataallocation/handler/databasehandler":13,"./dataallocation/handler/peercommunicationhandler":14,"./dataallocation/handler/tenvidentificationhandler":15,"./model":16}]},{},[17])(17)
});
