const client = require('../../utils/sanityClient.js')
const { normalizeMomenceSettings } = require('../../utils/momence.js')

const filter = `
  *[_type == "settingsMomence" && !(_id in path('drafts.**'))][0]{
    accountUrl,
    cartUrl,
    videoLibraryUrl,
    giftCardUrl,
    scheduleUrl,
    allowedEmbedHosts,
    schedule{
      hostId,
      teacherIds,
      locationIds,
      tagIds,
      defaultFilter,
      locale
    }
  }
`

module.exports = async () => {
  const settings = await client.fetch(filter).catch(error => {
    console.error('Unable to load public Momence settings', error)
    return {}
  })

  return normalizeMomenceSettings(settings || {})
}
