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
              ...,
              'choreographers':classChoreographers[]->{
                  fullName,nickname
                },
              'mainContent':classDescription,
              classLink
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