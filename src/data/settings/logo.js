const client = require('../../../utils/sanityClient.js')

const filter = `
  *[_type == "settingsLogo" && !(_id in path('drafts.**'))]{
'darkLogo': darkLogo.asset->,
'lightLogo': lightLogo.asset->,
  }[0]
`

module.exports = async() => {
    return await client.fetch(filter).catch((err) => console.error(err))
}