const assert = require('node:assert/strict')
const path = require('node:path')
const test = require('node:test')
const nunjucks = require('nunjucks')
const {
  normalizePurchasePresentation,
  normalizePurchaseUrl
} = require('../utils/momence.js')

const env = nunjucks.configure(path.resolve(__dirname, '..', 'src', 'includes'), {
  autoescape: true
})
env.addFilter('blocksToHtml', () => '')
env.addFilter('purchasePresentation', normalizePurchasePresentation)
env.addFilter('purchaseUrl', normalizePurchaseUrl)

test('Momence pass cards use progressively enhanced checkout dialogs', () => {
  const html = env.render('class/classPass.njk', {
    pageSection: {
      dataType: 'classPassSection',
      passHeadline: 'Passes',
      passColor: { title: 'hotpink' },
      passes: [
        {
          passName: 'NEWBIE PASS',
          passPrice: 24,
          purchaseProvider: 'momence',
          purchaseUrl: 'https://momence.com/m/768424',
          purchaseButtonLabel: 'Buy Now',
          purchasePresentation: 'popup'
        }
      ]
    }
  })

  assert.match(html, /href="https:\/\/momence\.com\/m\/768424"/)
  assert.match(html, /data-embed-dialog-url="https:\/\/momence\.com\/m\/768424"/)
  assert.match(html, /data-embed-dialog-title="Buy NEWBIE PASS"/)
})
