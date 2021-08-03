const client = require('../../../utils/sanityClient.js')

const filter = `
 *[_type == "sectionsFooter" && !(_id in path('drafts.**'))]{
   addressSection,
  footerSection1{
   'title':footerMenuTitle1,
   'showFooter': showFooterMenu1,
   'menu':footerMenu1->{
   menuItems[]{
     'slug':page->slug.current,
     title,
     _type,
     url,
     openInNewTab,
   }
}
 },
  footerSection2{

   'title':footerMenuTitle2,
   'showFooter': showFooterMenu2,
   'menu':footerMenu2->{
   menuItems[]{
     'slug':page->slug.current,
     title,
     _type,
     url,
     openInNewTab,
   }
}
 },


  }[0]

`

module.exports = async() => {
    return await client.fetch(filter).catch((err) => console.error(err))
}