const assert = require('node:assert/strict')
const path = require('node:path')
const test = require('node:test')
const nunjucks = require('nunjucks')

const env = nunjucks.configure(path.resolve(__dirname, '../src/includes'), {
  autoescape: true
})
env.addFilter('url', value => value)
env.addFilter('absoluteUrl', value => `https://myhipline.com${value}`)

const renderLink = item => env.renderString(
  '{% from "macros/menuLink.njk" import menuLinkAttributes %}<a {{ menuLinkAttributes(item) }}>Link</a>',
  { item }
)

test('popup external links keep their direct fallback and dialog metadata', () => {
  const html = renderLink({
    name: 'Gift Cards',
    externalUrl: 'https://momence.com/gcc/253441',
    openInNewTab: true,
    openAsPopup: true
  })

  assert.match(html, /href="https:\/\/momence\.com\/gcc\/253441"/)
  assert.match(html, /target="_blank"/)
  assert.match(html, /rel="noopener noreferrer"/)
  assert.match(html, /data-embed-dialog-url="https:\/\/momence\.com\/gcc\/253441"/)
  assert.match(html, /data-embed-dialog-title="Buy Gift Cards"/)
})

test('disabled and internal links do not receive popup attributes', () => {
  const external = renderLink({
    name: 'Passes',
    externalUrl: 'https://example.com/passes',
    openAsPopup: false
  })
  const internal = renderLink({ name: 'Passes', slug: 'passes', openAsPopup: true })

  assert.doesNotMatch(external, /data-embed-dialog/)
  assert.match(internal, /href="https:\/\/myhipline\.com\/passes"/)
  assert.doesNotMatch(internal, /data-embed-dialog/)
})
