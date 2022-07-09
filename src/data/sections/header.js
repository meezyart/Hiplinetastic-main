const client = require('../../../utils/sanityClient.js')

const filter = `
 *[_type == "sectionsHeader" && !(_id in path('drafts.**'))]{
 
  'showCart': loginInfo.showCart,
  'showLogin': loginInfo.showLogin,
  topCtaLink,
  ...headerMenu->{
    'menu':menuItems[]{
      'linkType': _type,
      'name': title,
      'externalUrl': url,
      openInNewTab,
      'slug':page->slug.current,
      'slugName': page->title,
      dropdownItems[]{
        'linkType': _type,
        'name': title,
        'externalUrl': url,
        openInNewTab,
        'slug': page->slug.current,
        'slugName': page->title,
      }},
    },
  }[0]
`

module.exports = async() => {
    return await client.fetch(filter).catch((err) => console.error(err))
}