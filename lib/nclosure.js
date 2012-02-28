"use strict";
var nclosure = exports,
    PATH = require('path'),
    LOADER = require('./loader'),
    NCUTIL = require('./ncutil'),
    DEFAULT_CLOSURE_CONF_PATH = PATH.resolve(PATH.join(__dirname, '..', 'bin', 'closure.json')),
    CURRENT_CLOSURE_CONF_PATH = PATH.resolve(PATH.join(process.cwd(), '.', 'closure.json')),
    APP_OPTIONS = {},
    confloader = Object.create(LOADER.ConfLoader),
    fileloader = Object.create(LOADER.FileLoader);

nclosure.nclosure = function (opts) {
    APP_OPTIONS = confloader.load(DEFAULT_CLOSURE_CONF_PATH);
    try {
        APP_OPTIONS = NCUTIL.merge(APP_OPTIONS, confloader.load(CURRENT_CLOSURE_CONF_PATH));
    } catch(e) {
        console.error('Cannot load config file: ' + CURRENT_CLOSURE_CONF_PATH );
    }
    APP_OPTIONS = NCUTIL.merge(APP_OPTIONS, opts);

    //TODO: move this code
    // check path
    APP_OPTIONS.closureBasePath = PATH.normalize(APP_OPTIONS.closureBasePath);
    if (!NCUTIL.isPathRoot(APP_OPTIONS.closureBasePath)) {
        APP_OPTIONS.closureBasePath = PATH.join(__dirname, APP_OPTIONS.closureBasePath);
    }
    // load
    fileloader.load(PATH.resolve(PATH.join(APP_OPTIONS.closureBasePath, 'base.js')));

    goog.global = goog.window = global.window = global.top = global;

    global.goog.writeScriptTag_ = function (filePath) {
        fileloader.load(PATH.normalize(PATH.join(APP_OPTIONS.closureBasePath, filePath)));
        return false;
    };
    fileloader.load(PATH.resolve(PATH.join(APP_OPTIONS.closureBasePath, 'deps.js')));

    var i = 0,
        depsLength = APP_OPTIONS.additionalDeps.length;
    for(i = 0; i < depsLength; i += 1) {
        //TODO: move this code
        // check path
        APP_OPTIONS.additionalDeps[i] = PATH.normalize(APP_OPTIONS.additionalDeps[i]);
        if (!NCUTIL.isPathRoot(APP_OPTIONS.additionalDeps[i])) {
            APP_OPTIONS.additionalDeps[i] = PATH.join(__dirname, APP_OPTIONS.additionalDeps[i]);
        }
        // load
        fileloader.load(PATH.resolve(APP_OPTIONS.additionalDeps[i]));
    }

    var nodeRequire = require;
    var googRequire = goog.require;
    var that = this;
    goog.require = function intercept(namespace) {
        // If tests are requiring 'nclosure' then lets load the test
        // additionalDeps if any specified.  Otherwise ignore the call
        // to require('nclosure') as we are already initialised
        if (namespace === 'node.process') {
            return { goog: that };
        }
        // Ignore these 'helper' classes which are not infact proper closure
        // classes as they exists before closure (base.js) has been loaded.
        // This means they must be called manually using node's require().
        // If anyone is the using goog.require() for these types its only
        // to get a bit of compiler support
        else if (namespace.indexOf('nclosure_') === 0) {
            return;
        }
        // Assume no namespace == node.js core libs
        else if (namespace.indexOf('.') < 0) {
            global[namespace] = nodeRequire(PATH.normalize(PATH.join(APP_OPTIONS.closureBasePath,namespace)));
        } else {
            googRequire(namespace);
        }
    };
};

//nclosure.nclosure();