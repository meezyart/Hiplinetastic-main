const client = require('../../utils/sanityClient.js')

const filter = `
    *[_type == "page" && !(_id in path('drafts.**'))] {
    pageMetaData{
      pageDescription,
      pageShareImage,
      pageTitle
    },
    pageSections[]{
      ...,
      disabled,
      'dataType':_type,
      heading,
      _type == "picContentSection" => {
        'backgroundColor': bkgrdOpts.backgroundColor,
        picImages[]{
          'key':_key,
          'url':asset->url,
          alt
        },
        picIcons[]{
          'url':asset->url,
          alt
        },
        'picLocation': picType.picLocation
      },
      _type == "faqSection" => {
          faqItems[]{
            heading,
            mainContent
          }
      },
      _type == "testimonialSection" => {
          version,
          testimonials[]->{
            author,
            title,
            'authorImage':authorImage{
                'url':asset->url,
                alt
            },
            mainContent
          }
      },
      _type == "article" => {
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
      },
      _type == "classMenuSection" => {

          classMenuSections[]->{
            'classImage':classImage.asset->,
                classDescription,
                classChoreographers[]->{
                  fullName,
                  nickname,
                  'coverImage': coverImages.asset->,
                'alt':coverImages.alt,
                'coverVideo': coverVideoMain,

                },
                    'classLink': classLink{
                    link,
                      route,
                      title,
                      _type,
                      'internal': landingPageRoute->slug.current
                },
                className,
                updatedAt
            }
      },
      _type == "classPassSection" => {
            passes[]->{
              ...,
              'mainContent':passDescription,
            }
      },
      _type == "loveClubSection" => {
            loveClubForm[]->{
              ...,
              formLink,
              headline,
              'mainContent':loveClubIntro,
            },
      },
      _type == "dancerSection" => {
        ...,
        headline,
        'mainContent':dancerIntro,

      },
      _type == "infoBoxSection" => {
        ...,
        headline

      },
      contactSection,
      classSchedule,
      mainContent[]{
        ...,
        markDefs[]{
          ...,
          _type == "internalLink" => {
            "slug": @.reference->slug.current,
            "dataType": @.reference->_type
          }
        }
      }
    },
    'slug': slug.current,
    title,
    'updatedAt': _updatedAt
  }
`

module.exports = async() => {
    return await client.fetch(filter).catch((err) => console.error(err))
}