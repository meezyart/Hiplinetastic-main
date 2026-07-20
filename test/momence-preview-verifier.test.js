const assert = require('node:assert/strict')
const test = require('node:test')

const {
  PREVIEW_ROUTES,
  auditPreviewResponses,
  parsePreviewUrl
} = require('../scripts/verify-momence-preview')

const { EXPECTED_PASS_URLS } = require('../scripts/verify-momence-cutover')

const videoPluginUrl = 'https://momence.com/video/plugin/253441'
const hostedVideoUrl = 'https://momence.com/video/courses/253441'

const validResponses = () => ({
  '/': {
    status: 200,
    url: 'https://deploy-preview-42--hipline.netlify.app/',
    html: '<a href="https://momence.com/sign-in">Account</a><div data-embed-dialog hidden></div>'
  },
  '/schedule/': {
    status: 200,
    url: 'https://deploy-preview-42--hipline.netlify.app/schedule/',
    html: '<script src="https://momence.com/plugin/host-schedule/host-schedule.js" host_id="253441"></script>'
  },
  '/passes/': {
    status: 200,
    url: 'https://deploy-preview-42--hipline.netlify.app/passes/',
    html: EXPECTED_PASS_URLS.map(url => {
      const dialog = url.includes('/m/') ? ` data-embed-dialog-url="${url}"` : ''
      return `<a href="${url}"${dialog}>Buy</a>`
    }).join('')
  },
  '/on-demand/': {
    status: 200,
    url: 'https://deploy-preview-42--hipline.netlify.app/on-demand/',
    html: `<iframe src="${videoPluginUrl}"></iframe><a href="${hostedVideoUrl}">Open the Video Library</a>`
  },
  '/sliding-scale/': {
    status: 200,
    url: 'https://deploy-preview-42--hipline.netlify.app/sliding-scale/',
    html: '<a href="https://momence.com/m/123">Sliding Scale</a>'
  }
})

test('accepts an HTTPS deploy-preview URL and normalizes its path', () => {
  assert.equal(
    parsePreviewUrl('https://deploy-preview-42--hipline.netlify.app/some/path'),
    'https://deploy-preview-42--hipline.netlify.app'
  )
})

test('refuses production and non-HTTPS preview targets', () => {
  assert.throws(() => parsePreviewUrl('https://myhipline.com'), /production/i)
  assert.throws(() => parsePreviewUrl('https://www.myhipline.com'), /production/i)
  assert.throws(() => parsePreviewUrl('http://hipline.netlify.app'), /HTTPS/i)
  assert.throws(() => parsePreviewUrl('not-a-url'), /valid URL/i)
})

test('audits all required Phase 1 preview routes', () => {
  assert.deepEqual(PREVIEW_ROUTES, [
    '/',
    '/schedule/',
    '/passes/',
    '/on-demand/',
    '/sliding-scale/'
  ])
  assert.deepEqual(auditPreviewResponses(validResponses()), [])
})

test('reports missing routes, HTTP failures, redirects off preview, and cutover failures', () => {
  const responses = validResponses()
  delete responses['/on-demand/']
  responses['/schedule/'].status = 503
  responses['/passes/'].url = 'https://myhipline.com/passes/'
  responses['/sliding-scale/'].html = '<a href="https://clients.mindbodyonline.com/example">Buy</a>'

  const issues = auditPreviewResponses(responses)

  assert.ok(issues.includes('Preview route /schedule/ returned HTTP 503'))
  assert.ok(issues.includes('Preview route /passes/ redirected to a different host: myhipline.com'))
  assert.ok(issues.includes('Preview route /on-demand/ was not checked'))
  assert.ok(issues.some(issue => issue.includes('Legacy Mindbody or HealCode output remains')))
})
