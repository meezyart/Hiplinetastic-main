const MOMENCE_HOST = 'momence.com'
const SCHEDULE_PLUGIN_URL =
  'https://momence.com/plugin/host-schedule/host-schedule.js'

function normalizeMomenceUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return ''

  try {
    const url = new URL(value.trim())
    const isMomenceHost =
      url.hostname === MOMENCE_HOST || url.hostname.endsWith(`.${MOMENCE_HOST}`)

    if (
      url.protocol !== 'https:' ||
      !isMomenceHost ||
      url.username ||
      url.password
    ) {
      return ''
    }

    return url.href
  } catch (error) {
    return ''
  }
}

function normalizeExternalUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return ''

  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' && !url.username && !url.password
      ? url.href
      : ''
  } catch (error) {
    return ''
  }
}

function normalizeHostname(value) {
  if (typeof value !== 'string') return ''

  const hostname = value.trim().toLowerCase().replace(/^\.+|\.+$/g, '')
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(hostname)
    ? hostname
    : ''
}

function normalizeAllowedHosts(value) {
  if (!Array.isArray(value)) return [MOMENCE_HOST]

  return Array.from(new Set([
    MOMENCE_HOST,
    ...value.map(normalizeHostname).filter(Boolean)
  ]))
}

function normalizeAllowedFrameUrl(value, allowedHosts) {
  const safeUrl = normalizeExternalUrl(value)
  if (!safeUrl) return ''

  const hostname = new URL(safeUrl).hostname.toLowerCase()
  const allowed = normalizeAllowedHosts(allowedHosts)
  return allowed.some(host => hostname === host || hostname.endsWith(`.${host}`))
    ? safeUrl
    : ''
}

function normalizeFrameHeight(value, fallback, minimum, maximum) {
  const height = Number(value)
  return Number.isFinite(height)
    ? Math.min(maximum, Math.max(minimum, Math.round(height)))
    : fallback
}

function normalizePurchasePresentation(value, provider = 'momence') {
  if (provider === 'external') return 'external-link'
  return value === 'external-link' ? 'external-link' : 'popup'
}

function normalizeExternalActions(value) {
  if (!Array.isArray(value)) return []

  return value
    .map(action => {
      const url = normalizeExternalUrl(action && action.url)
      const label = typeof (action && action.label) === 'string'
        ? action.label.trim()
        : ''

      return url && label ? { label, url } : null
    })
    .filter(Boolean)
    .slice(0, 6)
}

function normalizeMomencePluginSnippet(markup) {
  if (typeof markup !== 'string' || !markup.trim()) return null

  const scriptMatch = markup.match(/<script\b([^>]*)>[\s\S]*?<\/script>/i)
  if (!scriptMatch) return null

  const attributes = []
  const attributePattern = /\b([a-z][a-z0-9_-]*)\s*=\s*(["'])(.*?)\2/gi
  let attributeMatch
  let src = ''

  while ((attributeMatch = attributePattern.exec(scriptMatch[1])) !== null) {
    const name = attributeMatch[1].toLowerCase()
    const value = attributeMatch[3].trim()

    if (name === 'src') {
      src = normalizeMomenceUrl(value)
      continue
    }

    if (
      ['async', 'defer', 'type', 'style', 'class', 'id'].includes(name) ||
      name.startsWith('on') ||
      !value ||
      value.length > 1000 ||
      /[\u0000-\u001f<>]/.test(value)
    ) {
      continue
    }

    attributes.push({ name, value })
  }

  if (!src) return null

  const scriptUrl = new URL(src)
  if (!scriptUrl.pathname.startsWith('/plugin/') || !scriptUrl.pathname.endsWith('.js')) {
    return null
  }

  const containerMatch = markup.match(/<div\b[^>]*\bid\s*=\s*(["'])([a-z][a-z0-9_-]{0,80})\1[^>]*>/i)

  return {
    containerId: containerMatch ? containerMatch[2] : '',
    src,
    attributes: attributes.slice(0, 24)
  }
}

function normalizeExternalService(section = {}, settings = {}) {
  const providerLabel = typeof section.providerLabel === 'string' && section.providerLabel.trim()
    ? section.providerLabel.trim()
    : 'External service'
  const fallbackUrl = normalizeExternalUrl(section.fallbackUrl)
  const embedUrl = normalizeAllowedFrameUrl(section.embedUrl, settings.allowedEmbedHosts)
  const actions = normalizeExternalActions(section.actions)
  const momencePlugin = normalizeMomencePluginSnippet(section.momencePluginCode)
  const requestedPresentation = ['inline', 'popup', 'external-link'].includes(section.presentation)
    ? section.presentation
    : 'external-link'
  const presentation = requestedPresentation === 'external-link' || embedUrl
    ? requestedPresentation
    : 'external-link'

  if (!embedUrl && !fallbackUrl && !actions.length && !momencePlugin) return null

  const service = {
    heading: typeof section.heading === 'string' ? section.heading.trim() : '',
    providerLabel,
    presentation,
    embedUrl,
    fallbackUrl,
    actions,
    frameTitle: typeof section.frameTitle === 'string' && section.frameTitle.trim()
      ? section.frameTitle.trim()
      : providerLabel,
    actionLabel: typeof section.actionLabel === 'string' && section.actionLabel.trim()
      ? section.actionLabel.trim()
      : `Open ${providerLabel}`,
    desktopHeight: normalizeFrameHeight(section.desktopHeight, 720, 320, 1200),
    mobileHeight: normalizeFrameHeight(section.mobileHeight, 640, 320, 1000)
  }

  if (momencePlugin) service.momencePlugin = momencePlugin

  return service
}

function normalizePurchaseUrl(value, provider = 'momence') {
  return provider === 'external'
    ? normalizeExternalUrl(value)
    : normalizeMomenceUrl(value)
}

function normalizeId(value) {
  const id = String(value == null ? '' : value).trim()
  return /^\d+$/.test(id) ? id : ''
}

function normalizeIdList(value) {
  let ids = value

  if (typeof value === 'string') {
    try {
      ids = JSON.parse(value)
    } catch (error) {
      ids = value.split(',')
    }
  }

  if (!Array.isArray(ids)) return []

  return ids.map(normalizeId).filter(Boolean)
}

function normalizeFilter(value) {
  return typeof value === 'string' && /^[a-z0-9-]{1,40}$/i.test(value)
    ? value
    : 'show-all'
}

function normalizeLocale(value) {
  return typeof value === 'string' && /^[a-z]{2}(?:-[A-Z]{2})?$/.test(value)
    ? value
    : 'en'
}

function normalizeSchedule(value) {
  if (!value || typeof value !== 'object') return null

  const hostId = normalizeId(value.hostId)
  if (!hostId) return null

  return {
    hostId,
    teacherIds: normalizeIdList(value.teacherIds),
    locationIds: normalizeIdList(value.locationIds),
    tagIds: normalizeIdList(value.tagIds),
    defaultFilter: normalizeFilter(value.defaultFilter),
    locale: normalizeLocale(value.locale)
  }
}

function extractAttribute(markup, name) {
  const pattern = new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i')
  const match = pattern.exec(markup)
  return match ? match[2] : ''
}

function parseLegacyScheduleEmbed(markup) {
  if (typeof markup !== 'string' || !markup.trim()) return null

  const src = normalizeMomenceUrl(extractAttribute(markup, 'src'))
  if (src !== SCHEDULE_PLUGIN_URL) return null

  return normalizeSchedule({
    hostId: extractAttribute(markup, 'host_id'),
    teacherIds: extractAttribute(markup, 'teacher_ids'),
    locationIds: extractAttribute(markup, 'location_ids'),
    tagIds: extractAttribute(markup, 'tag_ids'),
    defaultFilter: extractAttribute(markup, 'default_filter'),
    locale: extractAttribute(markup, 'locale')
  })
}

function normalizeScheduleConfig(section = {}, settings = {}) {
  return (
    normalizeSchedule(section.momence) ||
    normalizeSchedule(settings.schedule) ||
    parseLegacyScheduleEmbed(section.mbo && section.mbo.dataWidgetId)
  )
}

function normalizeMomenceSettings(value = {}) {
  const schedule = normalizeSchedule(value.schedule) || {
    hostId: '',
    teacherIds: [],
    locationIds: [],
    tagIds: [],
    defaultFilter: 'show-all',
    locale: 'en'
  }

  return {
    accountUrl:
      normalizeMomenceUrl(value.accountUrl) || 'https://momence.com/sign-in',
    cartUrl: normalizeMomenceUrl(value.cartUrl),
    videoLibraryUrl: normalizeMomenceUrl(value.videoLibraryUrl),
    videoLibraryPluginUrl: schedule.hostId
      ? `https://momence.com/video/plugin/${schedule.hostId}`
      : '',
    giftCardUrl: normalizeMomenceUrl(value.giftCardUrl),
    scheduleUrl: normalizeMomenceUrl(value.scheduleUrl),
    allowedEmbedHosts: normalizeAllowedHosts(value.allowedEmbedHosts),
    schedule
  }
}

module.exports = {
  normalizeExternalActions,
  normalizeExternalService,
  normalizeExternalUrl,
  normalizeMomenceSettings,
  normalizeMomencePluginSnippet,
  normalizeMomenceUrl,
  normalizePurchasePresentation,
  normalizePurchaseUrl,
  normalizeScheduleConfig
}
