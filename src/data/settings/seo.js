const client = require('../../../utils/sanityClient.js')

const filter = `
  *[_type == "settingsSeo" && !(_id in path('drafts.**'))]{
    metaDesc,
    metaTitle,
    shareDesc,
    'shareGraphic': shareGraphic.asset->url,

    shareTitle,
    siteTitle,
  }[0]
`

module.exports = async() => {
    return await client.fetch(filter).catch((err) => console.error(err))
}