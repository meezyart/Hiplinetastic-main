const client = require('../../../utils/sanityClient.js')

const filter = `
  *[_type == "settingsSocial" && !(_id in path('drafts.**'))]{
    socialSites[] {
      facebookUrl,
      twitterUrl,
      instagramUrl,
      youtubeUrl
    },
    twitterHandle
  }[0]
`

module.exports = async() => {
    return await client.fetch(filter).catch((err) => console.error(err))
}