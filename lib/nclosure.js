"use strict";
var nclosure = exports,
    ncoptions = Object.create(require('./ncoptions').ncoptions),
    PATH = require('path'),
    RM = Object.create(require('./resourcemanager').loader),
    DEFAULT_CLOSURE_CONF_PATH = PATH.resolve(PATH.join(__dirname, '..', 'bin', 'closure.json')),
    CURRENT_CLOSURE_CONF_PATH = PATH.resolve(PATH.join(process.cwd(), '.', 'closure.json')),
    loaded = [];

nclosure.nclosure = function (opts) {
    loadOptions(opts);
    loadGoog();
    loadDeps();
    interceptRequire();
};

nclosure.loadOptions = function (filePath) {
    if (loaded.indexOf(filePath) > -1) {
        return true;
    }
    loaded.push(filePath);
    ncoptions.mergeOptions(RM.load({
        path: filePath,
        type: RM.TYPES.CONF
    }));
};

nclosure.getOption = function (key) {
    return ncoptions.get(key);
};

function loadOptions(opts) {
    nclosure.loadOptions(DEFAULT_CLOSURE_CONF_PATH);
    try {
        nclosure.loadOptions(CURRENT_CLOSURE_CONF_PATH);
    } catch (e) {
        console.error('Cannot load config file: ' + CURRENT_CLOSURE_CONF_PATH);
    }
    if (null != opts) {
        ncoptions.mergeOptions(opts);
    }
}

function loadGoog() {
    RM.load({
        path:PATH.resolve(PATH.join(ncoptions.get('closureBasePath'), 'base.js')),
        type:RM.TYPES.FILE
    });
    goog.global = goog.window = global.window = global.top = global;

    global.goog.writeScriptTag_ = function (filePath) {
        var paths = [];
        ncoptions.get('additionalDeps').every(function (item) {
            return paths.push(PATH.dirname(item));
        });
        paths.push(ncoptions.get('closureBasePath'));
        paths.push(PATH.resolve(process.cwd()));

        // searching for base path
        var path,
            pathsLength = paths.length,
            i = 0;
        for (i = 0; i < pathsLength; i += 1) {
            path = PATH.resolve(PATH.join(paths[i], filePath));
            try {
                RM.load({
                    path:path,
                    type:RM.TYPES.FILE
                });
            } catch (e) {
                continue;
            }
            break;
        }
        return false;
    };
    RM.load({
        path:PATH.resolve(PATH.join(ncoptions.get('closureBasePath'), 'deps.js')),
        type:RM.TYPES.FILE
    });
}

function loadDeps() {
    try {
        RM.load({
            path:PATH.resolve(PATH.join(process.cwd(), '.', 'deps.js')),
            type:RM.TYPES.FILE
        });
        RM.load({
            path:ncoptions.get('additionalDeps'),
            type:RM.TYPES.FILE
        });
    } catch (e) {
    }
}

function interceptRequire() {
    var nodeRequire = require;
    var googRequire = goog.require;
    var that = this;
    goog.require = function intercept(namespace) {
        // If tests are requiring 'nclosure' then lets load the test
        // additionalDeps if any specified.  Otherwise ignore the call
        // to require('nclosure') as we are already initialised
        if (namespace === 'node.process') {
            return { goog:that };
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
            global[namespace] = nodeRequire(namespace);
        } else {
            googRequire(namespace);
        }
    };
}
