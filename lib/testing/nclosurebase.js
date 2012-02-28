/**
 * @constructor
 */
nclosure.testing.base = function () {
};


nclosure.testing.base.prototype.init = function () {
    this.runCurrentFileInGoogTest_();
    this.killCurrentThread_();
};

/**
 * If the current file being executed is a test we actually stop processing and
 * start a new child process that runs this file using nctest
 * @private
 */
nclosure.testing.base.prototype.runCurrentFileInGoogTest_ = function () {
    var command = 'nctest';
    var args = process.argv.splice(1);
    var test = require('child_process').spawn(command, args);
    var printMsg = function (data) {
        data = data.toString();
        if (data.charAt(data.length - 1) === '\n') {
            data = data.substring(0, data.length - 1);
        }
        console.error(data);
    };
    test.stdout.on('data', printMsg);
    test.stderr.on('data', printMsg);
    test.on('uncaughtException', function (err) {
        console.error(err.stack);
    });
};

/**
 * Kills the current thread (stops the Node session)
 * @private
 */
nclosure.base.prototype.killCurrentThread_ = function () {
    process.once('uncaughtException', function (ex) {});
    throw new Error();
};



