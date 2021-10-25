/* ***** ----------------------------------------------- ***** **
/* ***** Image URL Shortcode
/* ***** ----------------------------------------------- ***** */

const client = require('../sanityClient.js');
const imageUrlBuilder = require('@sanity/image-url');

const builder = imageUrlBuilder(client);

module.exports = (image, width, height = null) => {
    if (height) {
        return builder.image(image).width(width).height(height).url()
    } else {
        return builder.image(image).width(width).url()
    }

}