'use strict'
var unityPath = require('../dist/index.js').unityPath
unityPath().then(function(path) { console.log('Unity is located at:', path); })
