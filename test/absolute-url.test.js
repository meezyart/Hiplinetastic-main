const assert = require('node:assert/strict')
const test = require('node:test')

const loadAbsoluteUrl = environment => {
  const previousEnvironment = process.env.ELEVENTY_ENV
  process.env.ELEVENTY_ENV = environment

  const modulePath = require.resolve('../utils/filters/absoluteUrl.js')
  delete require.cache[modulePath]
  const absoluteUrl = require(modulePath)

  if (previousEnvironment === undefined) {
    delete process.env.ELEVENTY_ENV
  } else {
    process.env.ELEVENTY_ENV = previousEnvironment
  }

  return absoluteUrl
}

test('development asset and internal URLs stay on the active local origin', () => {
  const absoluteUrl = loadAbsoluteUrl('development')

  assert.equal(absoluteUrl('/assets/css/main.css'), '/assets/css/main.css')
  assert.equal(absoluteUrl('/class-menu/'), '/class-menu/')
})

test('production URLs remain absolute on myhipline.com', () => {
  const absoluteUrl = loadAbsoluteUrl('production')

  assert.equal(
    absoluteUrl('/class-menu/'),
    'https://myhipline.com/class-menu/'
  )
})
