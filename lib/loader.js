"use strict";
var UTIL   = require('util'),
    NCUTIL = require('./ncutil'),
    FS     = require('fs'),
    PATH   = require('path'),
    loader = exports,
    VM     = require('vm');

var baseloader = {
    load: function () {
        throw new Error("not implemented");
    }
};

loader.ConfLoader = Object.create(baseloader);
Object.defineProperty(loader.ConfLoader, "load", {
    value: function (filePath) {
        // TODO: existsSync migrates to fs module in node > 0.7
        if (!PATH.existsSync(filePath)) {
            throw new Error('Such file does not exists: ' + filePath);
        }
        return JSON.parse(FS.readFileSync(filePath, 'utf-8'));
    }
});

loader.FileLoader = Object.create(baseloader);
Object.defineProperty(loader.FileLoader, "scripts", {
    value: [],
    writable: true,
    enumerable: true,
    configurable: false
});
Object.defineProperty(loader.FileLoader, "load", {
    value: function (filePath) {
        // TODO: existsSync migrates to fs module in node > 0.7
        if (!PATH.existsSync(filePath)) {
            throw new Error('Such file does not exists: ' + filePath);
        }
        if (this.scripts.indexOf(filePath) >= 0) {
            return;
        }
        this.scripts.push(filePath);

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
});