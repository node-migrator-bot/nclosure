isWindows = process.platform === 'win32',
    PATH_SEPARATOR = exports.PATH_SEPARATOR = isWindows ? '\\' : '/';

/**
 * Check whether given path is starts from root directory
 * @param {string} path
 * @return {boolean}
 */
exports.isRoot = function (path) {
    if (typeof  path === 'undefined' || null === path) {
        return false;
        // throw new Error('"dir" param has to be defined and not null');
    }
    return !!path.match(new RegExp('(^[a-zA-Z]:)?' + PATH_SEPARATOR + '*'));
};