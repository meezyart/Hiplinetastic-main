const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const nunjucks = require('nunjucks')
const {
  normalizeExternalService,
  normalizeMomencePluginSnippet,
  normalizeMomenceUrl,
  normalizePurchasePresentation,
  normalizePurchaseUrl,
  normalizeScheduleConfig
} = require('../utils/momence.js')

const env = nunjucks.configure(path.resolve(__dirname, '..', 'src', 'includes'), {
  autoescape: true
})
env.addFilter('externalService', normalizeExternalService)
env.addFilter('momencePlugin', normalizeMomencePluginSnippet)
env.addFilter('blocksToHtml', () => '')
env.addFilter('momenceSchedule', normalizeScheduleConfig)
env.addFilter('momenceUrl', normalizeMomenceUrl)
env.addFilter('purchasePresentation', normalizePurchasePresentation)
env.addFilter('purchaseUrl', normalizePurchaseUrl)
env.addFilter('dump', JSON.stringify)

const settings = { allowedEmbedHosts: ['widgets.example.com'] }

test('renders a sanitized Momence appointments plugin from Sanity', () => {
  const html = env.render('class/externalService.njk', {
    pageSection: {
      _key: 'appointments',
      heading: 'Book an appointment',
      providerLabel: 'Momence',
      momencePluginCode: '<div id="ribbon-appointments"></div><script async type="module" host_id="253441" board_id="987" onclick="alert(1)" src="https://momence.com/plugin/appointments/appointments.js"></script>'
    },
    momence: settings
  })

  assert.match(html, /id="ribbon-appointments"/)
  assert.match(html, /src="https:\/\/momence\.com\/plugin\/appointments\/appointments\.js"/)
  assert.match(html, /host_id="253441"/)
  assert.match(html, /board_id="987"/)
  assert.doesNotMatch(html, /onclick=/)
  assert.doesNotMatch(html, /alert\(1\)/)
})

test('renders an allowlisted inline iframe and external fallback', () => {
  const html = env.render('class/externalService.njk', {
    pageSection: {
      _key: 'memberPortal',
      providerLabel: 'Example Provider',
      presentation: 'inline',
      embedUrl: 'https://widgets.example.com/portal',
      fallbackUrl: 'https://example.com/portal',
      frameTitle: 'Example member portal'
    },
    momence: settings
  })

  assert.match(html, /src="https:\/\/widgets\.example\.com\/portal"/)
  assert.match(html, /sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"/)
  assert.match(html, /href="https:\/\/example\.com\/portal"/)
  assert.doesNotMatch(html, /<script/i)
})

test('renders popup configuration as a progressively enhanced link', () => {
  const html = env.render('class/externalService.njk', {
    pageSection: {
      _key: 'booking',
      providerLabel: 'Example Provider',
      presentation: 'popup',
      embedUrl: 'https://widgets.example.com/book',
      fallbackUrl: 'https://example.com/book',
      frameTitle: 'Book with Example Provider',
      actionLabel: 'Book now'
    },
    momence: settings
  })

  assert.match(html, /href="https:\/\/example\.com\/book"/)
  assert.match(html, /data-embed-dialog-url="https:\/\/widgets\.example\.com\/book"/)
  assert.match(html, /data-embed-dialog-title="Book with Example Provider"/)
})

test('renders client-managed tier actions without an arbitrary embed', () => {
  const html = env.render('class/externalService.njk', {
    pageSection: {
      _key: 'slidingScale',
      providerLabel: 'Momence',
      actions: [
        { label: 'Tier 1 — $20', url: 'https://momence.com/m/20' },
        { label: 'Tier 2 — $25', url: 'https://momence.com/m/25' },
        { label: 'Tier 3 — $30', url: 'https://momence.com/m/30' }
      ]
    },
    momence: settings
  })

  assert.match(html, /external-service__actions/)
  assert.match(html, /href="https:\/\/momence\.com\/m\/20"/)
  assert.match(html, /Tier 2 — \$25/)
  assert.doesNotMatch(html, /<iframe/i)
})

test('labels a heading-less external service without a broken aria reference', () => {
  const html = env.render('class/externalService.njk', {
    pageSection: {
      _key: 'memberPortal',
      providerLabel: 'Member portal',
      presentation: 'external-link',
      fallbackUrl: 'https://example.com/portal'
    },
    momence: settings
  })

  assert.match(html, /<section[^>]+aria-label="Member portal"/)
  assert.doesNotMatch(html, /aria-labelledby="external-service-heading-memberPortal"/)
})

test('renders the Momence schedule plugin with a hosted fallback', () => {
  const html = env.render('class/classSchedule.njk', {
    pageSection: {
      _key: 'schedule',
      heading: 'Our Class Schedule',
      momence: {
        hostId: '253441',
        teacherIds: [],
        locationIds: [],
        tagIds: [],
        defaultFilter: 'show-all',
        locale: 'en'
      },
      fallbackUrl: 'https://momence.com/u/hipline-zNlk68',
      fallbackLabel: 'Open the schedule'
    },
    momence: {}
  })

  assert.match(html, /src="https:\/\/momence\.com\/plugin\/host-schedule\/host-schedule\.js"/)
  assert.match(html, /host_id="253441"/)
  assert.match(html, /class="container momence-schedule__container"/)
  assert.match(html, /href="https:\/\/momence\.com\/u\/hipline-zNlk68"/)
  assert.match(html, />\s*Open the schedule\s*</)
})

test('gives the Momence schedule a wider desktop container without widening mobile layouts', () => {
  const styles = fs.readFileSync(
    path.resolve(__dirname, '..', 'src', 'assets', 'styles', '_momence-integrations.scss'),
    'utf8'
  )

  assert.match(
    styles,
    /\.momence-schedule__container\s*\{\s*max-width:\s*1320px;/
  )
})

test('On-Demand offers managed purchase and sign-in actions when the public library is empty', () => {
  const html = env.render('class/momenceVideo.njk', {
    pageSection: {
      _key: 'videoLibrary',
      heading: 'On-Demand Video Library',
      featuredPass: {
        passName: 'ON DEMAND',
        purchaseProvider: 'momence',
        purchaseUrl: 'https://momence.com/m/776335',
        purchaseButtonLabel: 'Buy On-Demand',
        purchasePresentation: 'popup'
      }
    },
    momence: {
      accountUrl: 'https://momence.com/sign-in',
      videoLibraryPluginUrl: 'https://momence.com/video/plugin/253441',
      videoLibraryUrl: 'https://momence.com/video/courses/253441'
    }
  })

  assert.match(html, /Already subscribed\? Sign in to view your videos\./)
  assert.match(html, /href="https:\/\/momence\.com\/m\/776335"/)
  assert.match(html, /data-embed-dialog-url="https:\/\/momence\.com\/m\/776335"/)
  assert.match(html, />\s*Buy On-Demand\s*</)
  assert.match(html, /href="https:\/\/momence\.com\/sign-in"/)
  assert.match(html, /<iframe[^>]+src="https:\/\/momence\.com\/video\/plugin\/253441"/i)
})
