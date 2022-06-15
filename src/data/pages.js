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
       _type == "timelineSection" => {
      ...,
      timelineSections[]{
        ...,
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

           pressIntro[]{
        ...,
        markDefs[]{
          ...,
          _type == "internalLink" => {
            "slug": @.reference->slug.current,
            "dataType": @.reference->_type
          }
        }
      }	,

      },
        _type == "richTextSection" => {
      ...,
           mainContent[]{
        ...,
        markDefs[]{
          ...,
          _type == "internalLink" => {
            "slug": @.reference->slug.current,
            "dataType": @.reference->_type
          }
        }
      }	,

      },
       _type == "pressSection" => {
      ...,
           pressIntro[]{
        ...,
        markDefs[]{
          ...,
          _type == "internalLink" => {
            "slug": @.reference->slug.current,
            "dataType": @.reference->_type
          }
        }
      }	,

      },
      _type == "heroSliderSection" => {
      ...,
            heroSliders[]->{
              ...,

              headline,
              heroColor,
              mainContent[]{
        ...,
        markDefs[]{
          ...,
          _type == "internalLink" => {
            "slug": @.reference->slug.current,
            "dataType": @.reference->_type
          }
        }
      }	,
              subTitle,
           heroImage{
          'key':_key,
          'url':asset->url,
          alt
        },
            }
      },
      _type == "picContentSection" => {
        ...,
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
        'picLocation': picType.picLocation,
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
      _type == "faqSection" => {
          faqItems[]{
            heading,
            mainContent[]{
        ...,
        markDefs[]{
          ...,
          _type == "internalLink" => {
            "slug": @.reference->slug.current,
            "dataType": @.reference->_type
          }
        }}
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
            mainContent[]{
        ...,
        markDefs[]{
          ...,
          _type == "internalLink" => {
            "slug": @.reference->slug.current,
            "dataType": @.reference->_type
          }
        }}
          }
      },
      _type == "article" => {
          cta,
          excerpt,
          mainContent[]{
        ...,
        markDefs[]{
          ...,
          _type == "internalLink" => {
            "slug": @.reference->slug.current,
            "dataType": @.reference->_type
          }
        }},
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
              'classImageCrop':classImage.crop,
   'classImageHotSpot':classImage.hotspot,
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
              'mainContent':passDescription[]{
        ...,
        markDefs[]{
          ...,
          _type == "internalLink" => {
            "slug": @.reference->slug.current,
            "dataType": @.reference->_type
          }
        }},
            }
      },
      _type == "loveClubSection" => {
            loveClubForm[]->{
              ...,
              formLink,
              headline,
              'mainContent':loveClubIntro[]{
        ...,
        markDefs[]{
          ...,
          _type == "internalLink" => {
            "slug": @.reference->slug.current,
            "dataType": @.reference->_type
          }
        }},
            },
      },
      _type == "dancerSection" => {
        ...,
        headline,
        'mainContent':dancerIntro[]{
        ...,
        markDefs[]{
          ...,
          _type == "internalLink" => {
            "slug": @.reference->slug.current,
            "dataType": @.reference->_type
          }
        }},

      },
      _type == "infoBoxSection" => {
        ...,
       infoBoxes[]{
         ...,
          headline,
          text[]{
        ...,
        markDefs[]{
          ...,
          _type == "internalLink" => {
            "slug": @.reference->slug.current,
            "dataType": @.reference->_type
          }
        }},
          'cta': cta{
                    link,
                      route,
                      title,
                      _type,
                      'internal': landingPageRoute->slug.current
                },
       }

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

module.exports = async () => {
  return await client.fetch(filter).catch((err) => console.error(err))
}
