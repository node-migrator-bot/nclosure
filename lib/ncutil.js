"use strict";
var ncutil = exports,
    isWindows= process.platform === 'win32',
    PATH_SEPARATOR = exports.PATH_SEPARATOR = isWindows ? '\\' : '/',
    PATH_SEPARATOR_DOUBLE = exports.PATH_SEPARATOR_DOUBLE = isWindows ? '\\\\' : '/';

ncutil.isWindows = isWindows;

ncutil.merge = function (target) {
    var i = 1, length = arguments.length, source;
    for ( ; i < length; i++ ) {
        // Only deal with defined values
        if ( (source = arguments[i]) != undefined ) {
            Object.getOwnPropertyNames(source).forEach(function(k){
                var d = Object.getOwnPropertyDescriptor(source, k) || {value:source[k]};
                if (d.get) {
                    target.__defineGetter__(k, d.get);
                    if (d.set) target.__defineSetter__(k, d.set);
                }
                else if (target !== d.value) {
                    target[k] = d.value;
                }
            });
        }
    }
    return target;
};

ncutil.removeSheBang = function (contents) {
    return contents.replace(/^#![^\n]+/, '\n');
};

/**
 * Check whether given path is starts from root directory
 * @param {string} path
 * @return {boolean}
 */
ncutil.isPathRoot = function (path) {
    if (null == path) {
        throw new Error('"path" param has to be defined and not null');
    }
    return new RegExp('^([a-zA-Z]:)?' + PATH_SEPARATOR_DOUBLE + '.*').test(path);
};

ncutil.isObject = function (val) {
    var s = typeof val;
    if ((s == 'object' && !Array.isArray(val)) ||
            (s == 'function' && typeof value.call == 'undefined')) {
        return true;
    }
    return false;
};
