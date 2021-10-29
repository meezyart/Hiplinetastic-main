/* ***** ----------------------------------------------- ***** **
/* ***** Blocks To HTML Filter
/* ***** ----------------------------------------------- ***** */

const blocksToHtml = require('@sanity/block-content-to-html')
const getYouTubeID = require('get-youtube-id')
const getVideoId = require('get-video-id')
const imageUrl = require('../shortcodes/imageUrl.js')
const imageSrcset = require('../shortcodes/imageSrcset.js')
const getInternalUrl = require('../getInternalUrl.js')

const h = blocksToHtml.h

const serializers = {
  // list: (props, b, c) => {
  //     return h(
  //         'ul', {
  //             className: 'maxcoach-list'
  //         },
  //         props.children
  //     )

  // },
  // listItem: (props, b, c) => {
  //     return h(
  //         'li', {
  //             className: 'icon'
  //         },
  //         props.children
  //     )
  // },

  types: {
    mainImage: (props) =>
      h('figure', { className: '' }, [
        h('img', {
        //   dataset: {
        //       srcset: imageSrcset(props.node.asset),
        //       sizes: 'auto'
        //   },
          src: imageUrl(props.node.asset),
          alt: props.node.alt
        })
        // h('figcaption', { class: '' }, props.node.caption)
      ]),
    youtubeBlock: (props) => h('iframe', { src: `https://www.youtube.com/embed/${getYouTubeID(props.node.youtubeUrl)}` }),
    vimeoBlock: (props) => h('iframe', { src: `https://player.vimeo.com/video/${getVideoId(props.node.vimeoUrl).id}` })
  },
  marks: {
    internalLink: (props) => {
    //   console.log('Check => ~ file: blocksToHtml.js ~ line 51 ~ props', props)
      return h(
        'a',
        {
          href: getInternalUrl(props.mark.slug, props.mark.dataType),
          class: props.mark.isButton ? 'btn btn-primary btn-hover-secondary' : ''
        },
        props.children
      )
    },
    link: (props) =>
      h(
        'a',
        {
          href: props.mark.href,
          target: '_blank',
          rel: 'noopener',
          class: props.mark.isButton ? 'btn btn-primary btn-hover-secondary' : ''
        },
        props.children
      )
  }
}

module.exports = (value) => {
  const html = blocksToHtml({
    blocks: value,
    serializers: serializers
  })

  // If html starts with an empty div, remove brcause it interferes with s2r
  if (html.startsWith('<div>')) {
    return html.slice(5).slice(0, -6)
  } else {
    return html
  }
}
