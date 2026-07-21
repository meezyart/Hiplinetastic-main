const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const assert = require('node:assert/strict')

const projectRoot = path.resolve(__dirname, '..')

test('Netlify build uses a current Node runtime without the legacy OpenSSL flag', () => {
  const nodeVersion = fs.readFileSync(path.join(projectRoot, '.nvmrc'), 'utf8').trim()
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')
  )
  const buildScript = packageJson.scripts['eleventy:prod']

  assert.doesNotMatch(buildScript, /NODE_OPTIONS|openssl-legacy-provider/)
  assert.ok(
    Number.parseInt(nodeVersion, 10) >= 18,
    `Node ${nodeVersion} is no longer supported by the Netlify build`
  )
})

test('Webpack uses an OpenSSL 3 compatible content hash', async () => {
  const ScriptsTemplate = require('../src/assets/scripts/__scripts.11ty.js')
  const { webpackConfig } = await new ScriptsTemplate().data()

  assert.equal(webpackConfig.output.hashFunction, 'sha256')
})
