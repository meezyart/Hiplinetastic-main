const client = require('../../utils/sanityClient.js');

const filter = `
 *[_type == "choreographers" && !(_id in path('drafts.**'))]{

  'bio':bio.bioBody[0],
  'bioLink': bio.bioLink.link,
	'coverImage': coverImages[0].asset->,
	'alt':coverImages[0].alt,
	'coverVideo': coverVideos[0].asset->,
	'dancerClass':dancerClass.classBody[0],
  fullName,
  'bands':music.bands,
	'spotifyUrl': music.spotify,
	quote,
	'social':social.socialSites,
  'updatedAt': _updatedAt

  }
`

module.exports = async() => {
    return await client.fetch(filter).catch((err) => console.error(err))
}