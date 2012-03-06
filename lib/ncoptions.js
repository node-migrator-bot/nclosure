"use strict";
var ncoptions = exports.ncoptions = {};
Object.defineProperty(ncoptions, "options", {
    value: [],
    writable: true,
    enumerable: false
});
Object.defineProperty(ncoptions, "addOption", {
    value: function (key, value, type) {
        ncoptions.options.push({
            key: key,
            value: value,
            type: type
        });
    }
});
Object.defineProperty(ncoptions, "setOption", {
    value: function (key, value, type) {
        var isReplaced = false;
        this.options.forEach(function (optionObj, optionKey) {
            if (optionObj.key == key) {
                if (Array.isArray(optionObj.value) || Array.isArray(value)) {
                    var opts = [];
                    optionObj.value = Array.prototype.concat.call(optionObj.value, value);
                    var i=0;
                    for (i=0;i<optionObj.value.length; i+=1) {
                        if (new String(optionObj.value[i]).length > 0) {
                            opts.push(optionObj.value[i]);
                        }
                    }
                    optionObj.value = opts;
                } else {
                    optionObj.value = value;
                }
                isReplaced = true;
            }
        });
        if (!isReplaced) {
            this.options.push({
                key: key,
                value: value,
                type: type
            });
        }
    }
});
Object.defineProperty(ncoptions, "getOptionType", {
    value: function (key) {
        var type = null;
        ncoptions.options.forEach(function (option, index) {
            if (option.key == key) {
                type = option.type;
            }
        });
        return type;
    }
});
Object.defineProperty(ncoptions, "mergeOptions", {
    value: function (opts) {
        if (opts == null || null == opts['options']) {
            throw new Error('Opts parameter should not be NULL');
        }
        opts.options.forEach(function (option, optionKey) {
            ncoptions.setOption(optionKey, option);
        });
    }
});
Object.defineProperty(ncoptions, "get", {
    value: function (key) {
        if (key == null) {
            throw new Error('Key parameter should not be NULL');
        }
        var i;
        for (i = 0; i < ncoptions.options.length; i += 1) {
            if (ncoptions.options[i].key == key) {
                return ncoptions.options[i].value;
            }
        }
    }
});

ncoptions.addOption('nodeDir', '', 'path');
ncoptions.addOption('additionalDeps', '', 'path');
ncoptions.addOption('closureBasePath', '', 'path');
ncoptions.addOption('jsdocToolkitDir', '', 'path');
ncoptions.addOption('compiler_jar', '', 'path');
ncoptions.addOption('additionalCompileOptions', '', 'string');
ncoptions.addOption('additionalJSDocToolkitOptions', '', 'string');
ncoptions.addOption('jsdocToolkitTemplate', '', 'string');
ncoptions.addOption('additionalLinterOptions', '', 'array');

