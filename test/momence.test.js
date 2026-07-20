const test = require('node:test')
const assert = require('node:assert/strict')

const {
  normalizeExternalService,
  normalizeMomenceSettings,
  normalizeMomenceUrl,
  normalizePurchasePresentation,
  normalizePurchaseUrl,
  normalizeScheduleConfig
} = require('../utils/momence.js')

test('normalizes an allowlisted inline external service', () => {
  assert.deepEqual(
    normalizeExternalService(
      {
        heading: 'Member portal',
        providerLabel: 'Example Provider',
        presentation: 'inline',
        embedUrl: 'https://widgets.example.com/portal',
        fallbackUrl: 'https://example.com/portal',
        frameTitle: 'Example member portal',
        desktopHeight: 760,
        mobileHeight: 640
      },
      { allowedEmbedHosts: ['widgets.example.com'] }
    ),
    {
      heading: 'Member portal',
      providerLabel: 'Example Provider',
      presentation: 'inline',
      embedUrl: 'https://widgets.example.com/portal',
      fallbackUrl: 'https://example.com/portal',
      actions: [],
      frameTitle: 'Example member portal',
      actionLabel: 'Open Example Provider',
      desktopHeight: 760,
      mobileHeight: 640
    }
  )
})

test('rejects unapproved frames and keeps a safe external fallback', () => {
  assert.deepEqual(
    normalizeExternalService(
      {
        presentation: 'popup',
        embedUrl: 'https://lookalike.example.net/steal',
        fallbackUrl: 'https://example.com/booking',
        frameTitle: 'Booking'
      },
      { allowedEmbedHosts: ['widgets.example.com'] }
    ),
    {
      heading: '',
      providerLabel: 'External service',
      presentation: 'external-link',
      embedUrl: '',
      fallbackUrl: 'https://example.com/booking',
      actions: [],
      frameTitle: 'Booking',
      actionLabel: 'Open External service',
      desktopHeight: 720,
      mobileHeight: 640
    }
  )
})

test('normalizes only labelled secure external service actions', () => {
  assert.deepEqual(
    normalizeExternalService({
      providerLabel: 'Momence',
      actions: [
        { label: 'Tier 1 — $20', url: 'https://momence.com/m/20' },
        { label: '', url: 'https://momence.com/m/25' },
        { label: 'Tier 2 — $25', url: 'javascript:alert(1)' }
      ]
    }),
    {
      heading: '',
      providerLabel: 'Momence',
      presentation: 'external-link',
      embedUrl: '',
      fallbackUrl: '',
      actions: [{ label: 'Tier 1 — $20', url: 'https://momence.com/m/20' }],
      frameTitle: 'Momence',
      actionLabel: 'Open Momence',
      desktopHeight: 720,
      mobileHeight: 640
    }
  )
})

test('normalizes pass presentation without accepting arbitrary values', () => {
  assert.equal(normalizePurchasePresentation('popup', 'momence'), 'popup')
  assert.equal(normalizePurchasePresentation('external-link', 'momence'), 'external-link')
  assert.equal(normalizePurchasePresentation('overlay', 'momence'), 'popup')
  assert.equal(normalizePurchasePresentation('popup', 'external'), 'external-link')
})

test('normalizeMomenceUrl accepts secure Momence URLs', () => {
  assert.equal(
    normalizeMomenceUrl('https://momence.com/sign-in'),
    'https://momence.com/sign-in'
  )
  assert.equal(
    normalizeMomenceUrl('https://www.momence.com/video/courses/253441'),
    'https://www.momence.com/video/courses/253441'
  )
})

test('normalizeMomenceUrl rejects executable, insecure, and lookalike URLs', () => {
  assert.equal(normalizeMomenceUrl('javascript:alert(1)'), '')
  assert.equal(normalizeMomenceUrl('http://momence.com/sign-in'), '')
  assert.equal(normalizeMomenceUrl('https://momence.com.evil.test/sign-in'), '')
  assert.equal(normalizeMomenceUrl('https://user:pass@momence.com/sign-in'), '')
})

test('normalizePurchaseUrl enforces the selected provider', () => {
  assert.equal(
    normalizePurchaseUrl('https://momence.com/m/123', 'momence'),
    'https://momence.com/m/123'
  )
  assert.equal(
    normalizePurchaseUrl('https://example.org/checkout', 'external'),
    'https://example.org/checkout'
  )
  assert.equal(
    normalizePurchaseUrl('https://example.org/checkout', 'momence'),
    ''
  )
  assert.equal(normalizePurchaseUrl('javascript:alert(1)', 'external'), '')
})

test('normalizeMomenceSettings returns public plugin settings only', () => {
  assert.deepEqual(
    normalizeMomenceSettings({
      accountUrl: 'https://momence.com/sign-in',
      videoLibraryUrl: 'https://momence.com/video/courses/253441',
      giftCardUrl: 'https://momence.com/gcc/253441',
      scheduleUrl: 'https://momence.com/u/hipline-zNlk68',
      allowedEmbedHosts: ['momence.com'],
      apiToken: 'must-not-survive',
      schedule: {
        hostId: '253441',
        teacherIds: ['12', 'bad'],
        locationIds: [34],
        tagIds: []
      }
    }),
    {
      accountUrl: 'https://momence.com/sign-in',
      videoLibraryPluginUrl: 'https://momence.com/video/plugin/253441',
      videoLibraryUrl: 'https://momence.com/video/courses/253441',
      giftCardUrl: 'https://momence.com/gcc/253441',
      scheduleUrl: 'https://momence.com/u/hipline-zNlk68',
      allowedEmbedHosts: ['momence.com'],
      schedule: {
        hostId: '253441',
        teacherIds: ['12'],
        locationIds: ['34'],
        tagIds: [],
        defaultFilter: 'show-all',
        locale: 'en'
      }
    }
  )
})

test('normalizeScheduleConfig prefers typed section settings', () => {
  assert.deepEqual(
    normalizeScheduleConfig({
      momence: {
        hostId: '253441',
        teacherIds: ['12'],
        locationIds: ['34'],
        tagIds: ['56'],
        defaultFilter: 'show-all',
        locale: 'en'
      }
    }),
    {
      hostId: '253441',
      teacherIds: ['12'],
      locationIds: ['34'],
      tagIds: ['56'],
      defaultFilter: 'show-all',
      locale: 'en'
    }
  )
})

test('normalizeScheduleConfig safely migrates the known legacy Momence schedule embed', () => {
  const embed = '<script async type="module" host_id="253441" teacher_ids="[]" location_ids="[34]" tag_ids="[]" default_filter="show-all" locale="en" src="https://momence.com/plugin/host-schedule/host-schedule.js"></script>'

  assert.deepEqual(
    normalizeScheduleConfig({ mbo: { dataWidgetId: embed } }),
    {
      hostId: '253441',
      teacherIds: [],
      locationIds: ['34'],
      tagIds: [],
      defaultFilter: 'show-all',
      locale: 'en'
    }
  )
})

test('normalizeScheduleConfig rejects arbitrary legacy scripts', () => {
  const embed = '<script host_id="253441" src="https://evil.test/steal.js"></script>'

  assert.equal(normalizeScheduleConfig({ mbo: { dataWidgetId: embed } }), null)
})
