/**
 * Implementation of a web worker i.e. service worker that acts as a local proxy
 */
// TODO implementation of caching functions for app shell that the application is able to run completely offline

'use strict';

var cacheName = 'AppNameCache';
// Caching the the app shell
var appFiles = [
    // html files
    '/',
    '/index.html',
    '/profile.html',
    '/sync.html',

    // config files
    '/manifest.json',
    '/humans.txt',


    // assets
    '/assets/icons/calendar.png',
    '/assets/icons/dummy.png',
    '/assets/icons/inactive_minion.png',
    '/assets/icons/subMinion.png',
    '/assets/icons/searchicon.png',
    '/assets/icons/profile.png',
    '/assets/icons/role-management.png',
    '/assets/icons/sync.png',
    '/assets/touch/apple-touch-icon.png',
    '/assets/touch/chrome-touch-icon-192x192.png',
    '/assets/touch/icon-128x128.png',
    '/assets/touch/ms-touch-icon-144x144-precomposed.png',
    '/assets/loading.svg',

    // icons
    '/favicon.ico',
    '/icon.png',

    // libs
    '/libs/commlib/lib/logger.js',
    '/libs/commlib/lib/peerComm.js',
    '/libs/datasynclib/synchronization.js',
    '/libs/encapsulationlib/customformat.js',
    '/libs/minionlib/minionloader_v2.js',
    '/libs/minionlib/datachannel.js',
    '/libs/minionlib/databuffer.js',
    '/libs/minionlib/minionloader_v2.js',
    '/libs/localstoragelib/crossdatastorageclient.js',
    '/libs/oauthlib/auth0connection.js',
    '/libs/reqlib/browserReq.js',
    '/libs/thirdparty/lock11_0_1.min.js',
    '/libs/thirdparty/jquery-3.2.1.min.js',

    // app shell
    '/scripts/globals.js',
    '/scripts/home-view.js',
    '/scripts/install-service-worker.js',
    '/scripts/profile-view.js',
    '/scripts/sync-view.js',

    // styles
    '/styles/main.css'
];
var externalLibs = [
    'https://code.getmdl.io/1.2.1/material.min.js',
    'https://code.getmdl.io/1.2.1/material.indigo-pink.min.css',
    'https://fonts.googleapis.com/icon?family=Material+Icons'
];

self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('[ServiceWorker] Caching app shell');
            var libs = externalLibs.concat(appFiles);
            var cacheFiles = function(files, promises) {
                if (files.length > 0) {
                    var currentFile = files.pop();
                    var request = new Request(currentFile, {mode : 'no-cors', header : new Headers({'Access-Control-Allow-Origin' : '*'})});
                    promises.push(fetch(request)
                        .catch(function (err) {
                            console.log(err, currentFile);
                            return fetch(new Request(currentFile, { mode : 'cors', header : new Headers({'Access-Control-Allow-Origin' : '*'})}))
                        })
                        .then(function (response) {
                            cache.put(request, response);
                        }));
                    return cacheFiles(files, promises)
                } else {
                    return promises;
                }
            };
            var promises = cacheFiles(libs, []);
            return Promise.all(promises);
        })
    );
});

self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    console.log('[ServiceWorker] Fetch', e.request.url);
    if (e.request.method === 'PATCH') {
        e.respondWith(fetch(e.request));
    } else {
        e.respondWith(
            caches.open(cacheName).then(function (cache) {
                // console.log(e.request);
                return cache.match(e.request).then(function (response) {
                    return fetch(e.request)
                        .catch(function (error) {
                            return response;
                        })
                        .then(function (res) {
                            if (res) {
                                if (e.request.method === 'GET')
                                    cache.put(e.request, res.clone());
                            }
                            return res;
                        });
                });
            })
        );

    }

});
