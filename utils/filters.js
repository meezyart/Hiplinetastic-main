const { DateTime } = require('luxon')

module.exports = {
    dateToFormat: function(date, format) {
        return DateTime.fromJSDate(date, { zone: 'utc' }).toFormat(format)
    },

    dateToISO: function(date) {
        return DateTime.fromJSDate(date, { zone: 'utc' }).toISO({
            includeOffset: false,
            suppressMilliseconds: true
        })
    },
    isoDateForm: function(date) {
        return DateTime.fromISO(date).toFormat('mm-dd-yyyy')
    },

    obfuscate: function(str) {
        const chars = []
        for (var i = str.length - 1; i >= 0; i--) {
            chars.unshift(['&#', str[i].charCodeAt(), ';'].join(''))
        }
        return chars.join('')
    }
}