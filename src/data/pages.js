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
          testimonials[]{
            ...,
            testimonials,
            'authorImage':authorImage{
                'url':asset->url,
                alt
            },
            mainContent
          }
      },
      _type == "classMenuSection" => {

          classMenuSections[]->{
            'classImage':classImage.asset->,
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