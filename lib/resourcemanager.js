"use strict";
var RM = exports,
    NCUTIL = require('./ncutil'),
    PATH = require('path'),
    FS = require('fs'),
    VM = require('vm');

function checkSinglePathArgument (argument) {
    if (typeof argument == 'string') {
        loadFile(argument);
    }
}

function loadConf(filePath) {
    var ncoptions = Object.create(require('./ncoptions').ncoptions),
        key,
        item,
        opts;
    // TODO: existsSync migrates to fs module in node > 0.7
    if (!PATH.existsSync(filePath)) {
        throw new Error('Such file does not exists: ' + filePath);
    }
    opts = JSON.parse(FS.readFileSync(filePath, 'utf-8'));
    for (key in opts) {
        item = opts[key];
        if (ncoptions.getOptionType(key) == 'path') {
            if (Array.isArray(opts[key])) {
                opts[key].forEach(function (subitem, index) {
                    opts[key][index] = PATH.resolve(PATH.join(PATH.dirname(filePath), subitem))
                });
            } else {
                opts[key] = PATH.resolve(PATH.join(PATH.dirname(filePath), item))

            }
        }
        ncoptions.setOption(key, opts[key]);
    }
    return ncoptions;
}

function loadFile(filePath) {
    // TODO: existsSync migrates to fs module in node > 0.7
    if (!PATH.existsSync(filePath)) {
        throw new Error('Such file does not exists: ' + filePath);
    }
    if (RM.loader.scripts.indexOf(filePath) >= 0) {
        return;
    }
    RM.loader.scripts.push(filePath);

    var fileContents = FS.readFileSync(filePath, 'utf-8');
    fileContents = NCUTIL.removeSheBang(fileContents);
    try {
        VM.runInThisContext(fileContents, filePath);

    } catch (e) {
        throw new Error('Could not load file "' + filePath + '"\n' + e.stack);
    }
    // Every time a script is loaded we check here if any additional initialisation
    // is required to make the loaded mode function correctly.  Namely the timers
    // framework need a bit of extra work to function correctly.
    //
    // If the Timer module has been loaded, provide the Node-
    // specific implementation of the *Timeout and *Interval
    // methods.
    if (goog.Timer && !goog.Timer.defaultTimerObject) {
        goog.Timer.defaultTimerObject = {
            'setTimeout':setTimeout,
            'clearTimeout':clearTimeout,
            'setInterval':setInterval,
            'clearInterval':clearInterval
        };
    }
}

/**
 * Usage:
 *      loader.load(filePath);
 *      loader.load([filePath1, filePath2, filePath3]);
 *      loader.load(filePath1, filePath2, filePath3);
 *
 *      loader.load({
 *          type: 'conf',  // types: conf, file
 *          path: '/path/to/file'
 *      });
 *
 *
 *
 */
RM.loader = {
    typeLoaders: {
        value: [],
        writable: true,
        enumerable: false
    },
    scripts: [],
    TYPES: {
        CONF: loadConf,
        FILE: loadFile
    },
    load: function (argv) {
        var resource,
            result;
        if (arguments.length === 1) {
            resource = argv;
        } else {
            resource = Array.prototype.slice.call(arguments);
        }

        result = checkSinglePathArgument(resource);

        if (Array.isArray(resource)) {
            result = [];
            resource.forEach(function (resourceItem, itemInd) {
                result[itemInd] = checkSinglePathArgument(resourceItem);
            });
        }

        if (NCUTIL.isObject(resource)) {
            if (null == resource['path'] || null == resource['type']) {
                throw new Error('Invalid object passed to function. ' + resource);
            }
            if (Array.isArray(resource['path'])) {
                result = [];
                resource['path'].forEach(function (filePath) {
                    result.push(resource['type'](filePath));
                });
            } else {
                result = resource['type'](resource['path']);
            }
        }

        // if there is result after loading resource it should be returned
        if (null != result) {
            return result;
        }
    }
};
Object.freeze(RM.loader.TYPES);




