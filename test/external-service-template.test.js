const assert = require('node:assert/strict')
const path = require('node:path')
const test = require('node:test')
const nunjucks = require('nunjucks')
const {
  normalizeExternalService,
  normalizeMomenceUrl,
  normalizeScheduleConfig
} = require('../utils/momence.js')

const env = nunjucks.configure(path.resolve(__dirname, '..', 'src', 'includes'), {
  autoescape: true
})
env.addFilter('externalService', normalizeExternalService)
env.addFilter('blocksToHtml', () => '')
env.addFilter('momenceSchedule', normalizeScheduleConfig)
env.addFilter('momenceUrl', normalizeMomenceUrl)
env.addFilter('dump', JSON.stringify)

const settings = { allowedEmbedHosts: ['widgets.example.com'] }

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
  assert.match(html, /href="https:\/\/momence\.com\/u\/hipline-zNlk68"/)
  assert.match(html, />\s*Open the schedule\s*</)
})
