const assert = require('node:assert/strict')
const path = require('node:path')
const test = require('node:test')
const nunjucks = require('nunjucks')
const { normalizeExternalService } = require('../utils/momence.js')

const env = nunjucks.configure(path.resolve(__dirname, '..', 'src', 'includes'), {
  autoescape: true
})
env.addFilter('externalService', normalizeExternalService)
env.addFilter('blocksToHtml', () => '')

const settings = { allowedEmbedHosts: ['widgets.example.com'] }

test('renders an allowlisted inline iframe and external fallback', () => {
  const html = env.render('class/externalService.njk', {
    pageSection: {
      _key: 'memberPortal',
      providerLabel: 'Example Provider',
      presentation: 'inline',
      embedUrl: 'https://widgets.example.com/portal',
      fallbackUrl: 'https://example.com/portal',
      frameTitle: 'Example member portal'
    },
    momence: settings
  })

  assert.match(html, /src="https:\/\/widgets\.example\.com\/portal"/)
  assert.match(html, /sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"/)
  assert.match(html, /href="https:\/\/example\.com\/portal"/)
  assert.doesNotMatch(html, /<script/i)
})

test('renders popup configuration as a progressively enhanced link', () => {
  const html = env.render('class/externalService.njk', {
    pageSection: {
      _key: 'booking',
      providerLabel: 'Example Provider',
      presentation: 'popup',
      embedUrl: 'https://widgets.example.com/book',
      fallbackUrl: 'https://example.com/book',
      frameTitle: 'Book with Example Provider',
      actionLabel: 'Book now'
    },
    momence: settings
  })

  assert.match(html, /href="https:\/\/example\.com\/book"/)
  assert.match(html, /data-embed-dialog-url="https:\/\/widgets\.example\.com\/book"/)
  assert.match(html, /data-embed-dialog-title="Book with Example Provider"/)
})
