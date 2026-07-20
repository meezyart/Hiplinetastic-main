const assert = require('node:assert/strict')
const test = require('node:test')

const {
  EXPECTED_PASS_URLS,
  auditGeneratedPages
} = require('../scripts/verify-momence-cutover')

const officialVideoUrl = 'https://momence.com/video/courses/253441'

test('accepts a generated plugin-first Phase 1 release', () => {
  const pages = {
    'index.html': '<a href="https://momence.com/sign-in">Account</a><div data-embed-dialog hidden></div>',
    'schedule/index.html': '<script src="https://momence.com/plugin/host-schedule/host-schedule.js" host_id="253441"></script>',
    'passes/index.html': EXPECTED_PASS_URLS.map(url => {
      const dialog = url.includes('/m/') ? ` data-embed-dialog-url="${url}"` : ''
      return `<a href="${url}"${dialog}>Buy</a>`
    }).join(''),
    'on-demand/index.html': `<iframe src="${officialVideoUrl}"></iframe><a href="${officialVideoUrl}">Open the Video Library</a>`
  }

  assert.deepEqual(auditGeneratedPages(pages), [])
})

test('reports legacy output and incomplete Momence release surfaces', () => {
  const pages = {
    'index.html': '<healcode-widget></healcode-widget>',
    'schedule/index.html': '<a href="https://clients.mindbodyonline.com/example">Schedule</a>',
    'passes/index.html': '<script src="https://widgets.mindbodyonline.com/javascripts/healcode.js"></script>'
  }

  assert.deepEqual(auditGeneratedPages(pages), [
    'Legacy Mindbody or HealCode output remains in: index.html, passes/index.html, schedule/index.html',
    'Home page is missing the Momence account action',
    'Schedule page is missing the official Momence host-schedule plugin for host 253441',
    `Passes page is missing ${EXPECTED_PASS_URLS.length} approved Momence destinations`,
    'Passes page is missing popup checkout triggers for 11 membership destinations',
    'Generated site is missing the shared checkout dialog shell',
    'On-Demand page was not generated'
  ])
})

test('rejects an external embed whose fallback exists only elsewhere on the page', () => {
  const pages = {
    'index.html': '<a href="https://momence.com/sign-in">Account</a><div data-embed-dialog hidden></div>',
    'schedule/index.html': '<script src="https://momence.com/plugin/host-schedule/host-schedule.js" host_id="253441"></script>',
    'passes/index.html': EXPECTED_PASS_URLS.map(url => {
      const dialog = url.includes('/m/') ? ` data-embed-dialog-url="${url}"` : ''
      return `<a href="${url}"${dialog}>Buy</a>`
    }).join(''),
    'services/index.html': '<a href="https://example.com/unrelated">Unrelated</a><section class="external-service"><iframe class="external-service__frame" sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe></section>',
    'on-demand/index.html': `<iframe src="${officialVideoUrl}"></iframe><a href="${officialVideoUrl}">Open the Video Library</a>`
  }

  assert.deepEqual(auditGeneratedPages(pages), [
    'Universal external embeds are missing sandbox or HTTPS fallback protection in: services/index.html'
  ])
})
