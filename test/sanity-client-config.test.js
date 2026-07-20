const assert = require('node:assert/strict')
const test = require('node:test')

const { sanity } = require('../config')

test('static builds bypass the Sanity CDN so published cutover content is fresh', () => {
  assert.equal(sanity.useCdn, false)
})
