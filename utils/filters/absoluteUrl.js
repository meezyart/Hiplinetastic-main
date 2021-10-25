/* ***** ----------------------------------------------- ***** **
/* ***** Absolute URL Filter
/* ***** ----------------------------------------------- ***** */

const { envUrls } = require('../../config');
const homeUrl = envUrls[process.env.ELEVENTY_ENV]

module.exports = value => {
    return homeUrl ? homeUrl + value : value;
}