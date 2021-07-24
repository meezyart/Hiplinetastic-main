/* ***** ----------------------------------------------- ***** **
/* ***** Image URL Shortcode
/* ***** ----------------------------------------------- ***** */

const client = require('../sanityClient.js');
const imageUrlBuilder = require('@sanity/image-url');

const builder = imageUrlBuilder(client);

module.exports = (image, width) => {
    return builder.image(image).width(width).url();
}