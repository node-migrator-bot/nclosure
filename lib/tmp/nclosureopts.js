if (typeof(goog) !== 'undefined') {
    goog.provide('nclosure.opts');
} else {
    global['nclosure'] = global['nclosure'] || {};
}

/**
 * @constructor
 */
nclosure.opts = function() {};

/**
 * @type {string}
 */
nclosure.opts.closureBasePath;

/**
 * @type {Array.<string>}
 */
nclosure.opts.additionalDeps;

/**
 * @type {string}
 */
nclosure.opts.jsdocToolkitDir;

/**
 * @type {string}
 */
nclosure.opts.nodeDir;

/**
 * @type {string}
 */
nclosure.opts.compiler_jar;

/**
 * @type {Array.<string>}
 */
nclosure.opts.additionalCompileRoots;

/**
 * @type {Array.<string>}
 */
nclosure.opts.additionalCompileOptions;

/**
 * @type {Array.<string>}
 */
nclosure.opts.additionalJSDocToolkitOptions;

/**
 * @type {string}
 */
nclosure.opts.jsdocToolkitTemplate;

/**
 * @type {Array.<string>}
 */
nclosure.opts.additionalLinterOptions;


exports.nclosure.opts = nclosure.opts;

