/* ***** ----------------------------------------------- ***** **
/* ***** Absolute URL Filter
/* ***** ----------------------------------------------- ***** */

const { envUrls } = require('../../config');
const homeUrl = envUrls[process.env.ELEVENTY_ENV]

module.exports = value => {
    if (value.startsWith('/assets/')) {
        return value;
    }

    return homeUrl ? homeUrl + value : value;
}
