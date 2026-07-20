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
