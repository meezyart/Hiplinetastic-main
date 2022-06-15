const client = require('../../utils/sanityClient.js');

const filter = `
 *[_type == "choreographers" && !(_id in path('drafts.**'))]{
_id,
_type,
  'bio':bio.bioBody[0],
  bioLink,
  'coverImage': coverImages.asset->,
  'alt':coverImages[0].alt,
  'coverVideo': coverVideoMain,
  'dancerClassBody':dancerClass.classBody[0],
  "dancerClass": *[_type=='classMenu' && references(^._id)].className,
  fullName,
  nickname,
  pronoun,
  'bands':music.bands,
  'spotifyUrl': music.spotify,
   quote,
  'social':social.socialSites,
  'updatedAt': _updatedAt

  }
`

module.exports = async() => {

    let results = await client.fetch(filter).catch((err) => console.error(err))
    return results;

}