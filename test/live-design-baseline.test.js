const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const readProjectFile = file => fs.readFileSync(
  path.join(__dirname, '..', file),
  'utf8'
)

test('page banner keeps the live background-image structure', () => {
  const template = readProjectFile('src/includes/hero/hero-plain.njk')

  assert.match(template, /style="background-image:url\(/)
  assert.match(template, /data-bg-image=/)
  assert.doesNotMatch(template, /<img[^>]+page-banner-bg/)
})

test('the live normalize and reboot style foundations remain enabled', () => {
  const stylesheet = readProjectFile('src/assets/styles/style.scss')

  assert.match(stylesheet, /^@import ['"]normalize['"];$/m)
  assert.match(stylesheet, /^@import ['"]reboot['"];$/m)
})

test('banner breadcrumb links retain the live text color', () => {
  const stylesheet = readProjectFile(
    'src/assets/styles/elements/_breadcrumb.scss'
  )

  assert.match(stylesheet, /& a \{[\s\S]*?color: \$body-color;/)
})

test('the base layout does not depend on an untracked duplicate AOS initializer', () => {
  const layout = readProjectFile('src/layouts/base.njk')
  const globalScript = readProjectFile('src/assets/scripts/components/global.js')

  assert.doesNotMatch(layout, /init-aos\.js/)
  assert.match(globalScript, /AOS\.init\(/)
})
