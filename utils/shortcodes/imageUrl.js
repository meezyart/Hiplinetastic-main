/* ***** ----------------------------------------------- ***** **
/* ***** Image URL Shortcode
/* ***** ----------------------------------------------- ***** */

const client = require('../sanityClient.js');
const imageUrlBuilder = require('@sanity/image-url');

const builder = imageUrlBuilder(client);

module.exports = (image,  width = null, height = null,hotspot = null) => {

  let builderUrl = null
  if (image !== undefined && image) {
       builderUrl = builder.image(image)


    if (width) {
     builderUrl = builderUrl.width(width)
    }
    if (height) {
      builderUrl = builderUrl.height(height)
    }
    if (width && height) {
      builderUrl = builderUrl.width(width).height(height)
    }
 if (hotspot) {
   builderUrl = builderUrl.width(width).height(height).fit('crop').crop('focalpoint').focalPoint(hotspot.x, hotspot.y)
 }
    let url = builderUrl.url().toString();
    let urlStr = new URL(url);
    // console.log('\n---888888888888888888888--\n',urlStr,'\n-----\n')
    let urlParams = new URLSearchParams(urlStr.search)
      console.log('hotspot:', hotspot, '\n-----\n')
    let rect = urlParams.get('rect')

    // if (rect) {
    //   builderUrl = builderUrl.width(width).height(height).rect(rect)
    // }

    console.log('\n---------------------------\n',rect,'\n-----\n',  builderUrl.url(), '\n-----\n')
return builderUrl.url()
} else {
        console.log('\n------------no image---------------\n')


    // return builderUrl.url()
}





//   return builderUrl.auto('format').url()
}