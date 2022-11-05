/* ***** ----------------------------------------------- ***** **
/* ***** Blocks To HTML Filter
/* ***** ----------------------------------------------- ***** */

// const blocksToHtml = require('@sanity/block-content-to-html')

const htm = require('htm')
const vhtml = require('vhtml')
const { toHTML, uriLooksSafe} = require('@portabletext/to-html')
const getYouTubeID = require('get-youtube-id')
const getVideoId = require('get-video-id')
const imageUrl = require('../shortcodes/imageUrl.js')
const imageSrcset = require('../shortcodes/imageSrcset.js')
const getInternalUrl = require('../getInternalUrl.js')

const html = htm.bind(vhtml)

// const serializers = {
//   // list: (props, b, c) => {
//   //     return h(
//   //         'ul', {
//   //             className: 'maxcoach-list'
//   //         },
//   //         props.children
//   //     )

//   // },
//   // listItem: (props, b, c) => {
//   //     return h(
//   //         'li', {
//   //             className: 'icon'
//   //         },
//   //         props.children
//   //     )
//   // },

//   types: {
//     mainImage: (props) =>
//       h('figure', { className: '' }, [
//         h('img', {
//           //   dataset: {
//           //       srcset: imageSrcset(props.node.asset),
//           //       sizes: 'auto'
//           //   },
//           src: imageUrl(props.node.asset),
//           alt: props.node.alt
//         })
//         // h('figcaption', { class: '' }, props.node.caption)
//       ]),
//     youtubeBlock: (props) => h('iframe', { src: `https://www.youtube.com/embed/${getYouTubeID(props.node.youtubeUrl)}` }),
//     vimeoBlock: (props) => h('iframe', { src: `https://player.vimeo.com/video/${getVideoId(props.node.vimeoUrl).id}` })
//   },
//   marks: {
//     internalLink: (props) => {
//       return h(
//         'a',
//         {
//           href: getInternalUrl(props.mark.slug, props.mark.dataType),
//           rel: 'noopener',
//           class: props.mark.isButton ? 'btn btn-primary btn-hover-secondary text-light' : ''
//         },
//         props.children
//       )
//     },
//     link: (props) =>
//       h(
//         'a',
//         {
//           href: props.mark.href,
//           target: '_blank',
//           rel: 'noopener',
//           class: props.mark.isButton ? 'btn btn-primary btn-hover-secondary text-light' : ''
//         },
//         props.children
//       )
//   }
// }

const myPortableTextComponent = {
  types: {
    mainImage: ({ value }) => html`<figure><img src="${imageUrl(value.asset)}"  width="500" alt="${value.alt}"/></figure>`,
    // mainImage: ({ value, ...rest }) => {
    //   console.log('Check => ~ file: blocksToHtml.js ~ line 84 ~ props,{ value }', value, rest)

    //   // html`<img src="${value.imageUrl}" />`
    // },
    youtubeBlock: ({ value }) => {
      return html`<iframe
        src="https://www.youtube.com/embed/${getYouTubeID(value.youtubeUrl)}"
        title="YouTube video player"
        width="560"
        height="315"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>`
    },
    vimeoBlock: ({ value }) => {
      return html`<iframe
        src="https://player.vimeo.com/video/${getVideoId(value.vimeoUrl).id}"
        title="Vimeo video player"
        frameborder="0"
        width="560"
        height="315"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>`
    }

    // callToAction: ({ value, isInline }) => (isInline ? html`<a href="${value.url}">${value.text}</a>` : html`<div class="callToAction">${value.text}</div>`)
  },

  marks: {
    link: ({ children, value }) => {
      // ⚠️ `value.href` IS NOT "SAFE" BY DEFAULT ⚠️
      // ⚠️ Make sure you sanitize/validate the href! ⚠️
      const daClass = value.isButton ? 'btn btn-primary btn-hover-secondary text-light' : null
      const href = value.href || ''

      if (uriLooksSafe(href)) {
        const rel = href.startsWith('/') ? undefined : 'noreferrer noopener'
        return html`<a href="${href}" class="${daClass}" rel="${rel}" target="_blank">${children}</a>`
      }

      // If the URI appears unsafe, render the children (eg, text) without the link
      return children
    },
    internalLink: ({ value, children, ...props }) => {
      // ⚠️ `value.href` IS NOT "SAFE" BY DEFAULT ⚠️
      // ⚠️ Make sure you sanitize/validate the href! ⚠️
      const daClass = value.isButton ? 'btn btn-primary btn-hover-secondary text-light' : ''
      const href = getInternalUrl(value.slug, value.dataType) || ''

      if (uriLooksSafe(href)) {
        const rel = href.startsWith('/') ? undefined : 'noopener'
        return html`<a href="${href}" class="${daClass}" rel="${rel}">${children}</a>`
      }
      // If the URI appears unsafe, render the children (eg, text) without the link
      return children
    }
  }
}

module.exports = (value) => {
  const html = toHTML(value, { components: myPortableTextComponent })
  // If html starts with an empty div, remove brcause it interferes with s2r
  if (html.startsWith('<div>')) {
    return html.slice(5).slice(0, -6)
  } else {
    return html
  }
}
