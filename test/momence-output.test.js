const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..', 'dist')

function readOutput(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

test('Mindbody runtime is limited to the passes migration page', () => {
  const mindbodyRuntime = 'https://widgets.mindbodyonline.com/javascripts/healcode.js'

  assert.doesNotMatch(readOutput('index.html'), new RegExp(mindbodyRuntime))
  assert.doesNotMatch(
    readOutput(path.join('schedule', 'index.html')),
    new RegExp(mindbodyRuntime)
  )
  assert.match(
    readOutput(path.join('passes', 'index.html')),
    new RegExp(mindbodyRuntime)
  )
})

test('generated schedule uses the normalized Momence plugin', () => {
  const schedule = readOutput(path.join('schedule', 'index.html'))

  assert.match(schedule, /host_id="253441"/)
  assert.match(
    schedule,
    /src="https:\/\/momence\.com\/plugin\/host-schedule\/host-schedule\.js"/
  )
  assert.doesNotMatch(schedule, /<healcode-widget/i)
})

test('global account action uses Momence instead of HealCode', () => {
  const home = readOutput('index.html')

  assert.match(home, /href="https:\/\/momence\.com\/sign-in"/)
  assert.match(home, /aria-label="Sign in to your Hipline account"/)
  assert.doesNotMatch(home, /data-type="account-link"/)
})

test('10 Class card never uses the legacy 5 Class Momence destination', () => {
  const passes = readOutput(path.join('passes', 'index.html'))
  const tenClassCard = passes.match(
    /<h4>10 CLASS BUNDLE<\/h4>[\s\S]*?(?=<h4>20 CLASS BUNDLE<\/h4>)/
  )

  assert.ok(tenClassCard, 'expected the generated 10 Class pass card')
  assert.doesNotMatch(tenClassCard[0], /https:\/\/momence\.com\/m\/766994/)
})

test('passes page includes the shared checkout dialog shell before content migration', () => {
  const passes = readOutput(path.join('passes', 'index.html'))

  assert.match(passes, /data-embed-dialog="" hidden/)
  assert.match(passes, /Open checkout in a new tab/)
})
