const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const includesRoot = path.resolve(__dirname, '..', 'src', 'includes')
const legacyRuntime = /healcode-widget|widgets\.mindbodyonline\.com|clients\.mindbodyonline\.com/i

const readTemplates = directory => fs.readdirSync(directory, { withFileTypes: true })
  .flatMap(entry => {
    const entryPath = path.join(directory, entry.name)
    return entry.isDirectory() ? readTemplates(entryPath) : [entryPath]
  })
  .filter(file => file.endsWith('.njk'))

test('storefront templates contain no legacy Mindbody or HealCode runtime', () => {
  const offenders = readTemplates(includesRoot)
    .filter(file => legacyRuntime.test(fs.readFileSync(file, 'utf8')))
    .map(file => path.relative(includesRoot, file))

  assert.deepEqual(offenders, [])
})

test('On-Demand resolves its editor-selected purchase pass from Sanity', () => {
  const pagesQuery = fs.readFileSync(
    path.resolve(__dirname, '..', 'src', 'data', 'pages.js'),
    'utf8'
  )

  assert.match(
    pagesQuery,
    /_type == "momenceVideoSection"[\s\S]*featuredPass->/
  )
})

test('header cart keeps the cart icon and uses its own managed Momence URL', () => {
  const header = fs.readFileSync(
    path.resolve(includesRoot, 'header.njk'),
    'utf8'
  )

  assert.match(header, /sections\.header\.showCart and momence\.cartUrl/)
  assert.match(header, /fa-shopping-cart/)
  assert.doesNotMatch(header, /header-cart[\s\S]{0,500}momence\.giftCardUrl/)
})
