const client = require('../../utils/sanityClient.js')

const filter = `
  *[_type == "article" && !(_id in path('drafts.**'))]  | order(publishedAt desc) {
    cta,
    excerpt,
    mainContent,
    publishedAt,
    'featuredImage': featuredImage{
          'url':asset->url,
          alt
        },
    'slug': slug.current,
    title,
    'updatedAt': _updatedAt
  }
`

module.exports = async() => {
    return await client.fetch(filter).catch((err) => console.error(err))
}