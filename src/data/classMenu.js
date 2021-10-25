const client = require('../../utils/sanityClient.js');

const filter = `
*[_type == "classMenu" && !(_id in path('drafts.**'))]{

  classDescription,
  classChoreographers[]->{

    fullName,
    nickname,
    'coverImage': coverImages[0].asset->,
	'alt':coverImages[0].alt,
	'coverVideo': coverVideos[0].asset->,

  },
  classLink,
  className,
  updatedAt
  }
`

module.exports = async() => {
    return await client.fetch(filter).catch((err) => console.error(err))
}