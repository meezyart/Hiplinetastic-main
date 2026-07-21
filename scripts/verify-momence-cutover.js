const fs = require('node:fs')
const path = require('node:path')

const HOST_ID = '253441'
const ACCOUNT_URL = 'https://momence.com/sign-in'
const SCHEDULE_PLUGIN_URL = 'https://momence.com/plugin/host-schedule/host-schedule.js'
const VIDEO_LIBRARY_PLUGIN_URL = `https://momence.com/video/plugin/${HOST_ID}`
const VIDEO_LIBRARY_URL = `https://momence.com/video/courses/${HOST_ID}`
const SLIDING_SCALE_PASS_URLS = [
  'https://momence.com/m/848243',
  'https://momence.com/m/848244'
]

const EXPECTED_PASS_URLS = [
  'https://momence.com/m/768424',
  'https://momence.com/m/768126',
  'https://momence.com/m/768425',
  'https://momence.com/m/768430',
  'https://momence.com/m/766999',
  'https://momence.com/m/766994',
  'https://momence.com/m/766996',
  'https://momence.com/m/766998',
  'https://momence.com/m/767001',
  'https://momence.com/m/776335',
  `https://momence.com/gcc/${HOST_ID}`,
  'https://momence.com/m/767010',
  ...SLIDING_SCALE_PASS_URLS
]

const LEGACY_PATTERN = /healcode-widget|widgets\.mindbodyonline\.com|clients\.mindbodyonline\.com/i
const EXPECTED_POPUP_URLS = [...EXPECTED_PASS_URLS]
const EMBED_SANDBOX = 'sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"'
const EXTERNAL_SERVICE_SECTION_PATTERN = /<section\b(?=[^>]*\bclass="[^"]*\bexternal-service\b[^"]*")[^>]*>[\s\S]*?<\/section>/gi

const auditGeneratedPages = pages => {
  const issues = []
  const legacyPages = Object.entries(pages)
    .filter(([, html]) => LEGACY_PATTERN.test(html))
    .map(([file]) => file)
    .sort()

  if (legacyPages.length) {
    issues.push(`Legacy Mindbody or HealCode output remains in: ${legacyPages.join(', ')}`)
  }

  const home = pages['index.html'] || ''
  if (!home.includes(`href="${ACCOUNT_URL}"`)) {
    issues.push('Home page is missing the Momence account action')
  }

  const schedule = pages['schedule/index.html'] || ''
  if (
    !schedule.includes(`src="${SCHEDULE_PLUGIN_URL}"`) ||
    !schedule.includes(`host_id="${HOST_ID}"`)
  ) {
    issues.push(`Schedule page is missing the official Momence host-schedule plugin for host ${HOST_ID}`)
  }

  const passes = pages['passes/index.html'] || ''
  const missingPassUrls = EXPECTED_PASS_URLS.filter(url =>
    !passes.includes(`href="${url}"`)
  )
  if (missingPassUrls.length) {
    issues.push(`Passes page is missing ${missingPassUrls.length} approved Momence destinations`)
  }

  const missingDialogUrls = EXPECTED_POPUP_URLS.filter(url =>
    !passes.includes(`data-embed-dialog-url="${url}"`)
  )
  if (missingDialogUrls.length) {
    issues.push(`Passes page is missing popup checkout triggers for ${missingDialogUrls.length} approved checkout destinations`)
  }

  const slidingScale = pages['sliding-scale/index.html'] || ''
  const missingSlidingScaleUrls = SLIDING_SCALE_PASS_URLS.filter(url =>
    !slidingScale.includes(`href="${url}"`) ||
    !slidingScale.includes(`data-embed-dialog-url="${url}"`)
  )
  if (missingSlidingScaleUrls.length) {
    issues.push(`Sliding Scale page is missing ${missingSlidingScaleUrls.length} approved popup checkout options`)
  }

  const hasDialogShell = Object.values(pages).some(html => html.includes('data-embed-dialog'))
  if (!hasDialogShell) {
    issues.push('Generated site is missing the shared checkout dialog shell')
  }

  const unsafeExternalFrames = Object.entries(pages)
    .filter(([, html]) => html.includes('class="external-service__frame"'))
    .filter(([, html]) => {
      const sections = html.match(EXTERNAL_SERVICE_SECTION_PATTERN) || []
      const framedSections = sections.filter(section =>
        section.includes('class="external-service__frame"')
      )

      return !framedSections.length || framedSections.some(section =>
        !section.includes(EMBED_SANDBOX) || !/<a[^>]+href="https:\/\//i.test(section)
      )
    })
    .map(([file]) => file)
  if (unsafeExternalFrames.length) {
    issues.push(`Universal external embeds are missing sandbox or HTTPS fallback protection in: ${unsafeExternalFrames.join(', ')}`)
  }

  const onDemand = pages['on-demand/index.html']
  if (!onDemand) {
    issues.push('On-Demand page was not generated')
  } else {
    const hasVideoLibraryFrame = new RegExp(
      `<iframe\\b[^>]*\\bsrc="${VIDEO_LIBRARY_PLUGIN_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`,
      'i'
    ).test(onDemand)
    if (!hasVideoLibraryFrame) {
      issues.push('On-Demand page is missing the official Momence Video Library plugin iframe')
    }
    if (!onDemand.includes(`href="${VIDEO_LIBRARY_URL}"`)) {
      issues.push('On-Demand page is missing the hosted Video Library fallback')
    }
  }

  return issues
}

const readGeneratedPages = root => {
  const pages = {}

  const visit = directory => {
    fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
      const absolutePath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        visit(absolutePath)
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        const relativePath = path.relative(root, absolutePath).split(path.sep).join('/')
        pages[relativePath] = fs.readFileSync(absolutePath, 'utf8')
      }
    })
  }

  visit(root)
  return pages
}

const run = () => {
  const root = path.resolve(process.argv[2] || 'dist')

  if (!fs.existsSync(root)) {
    console.error(`Generated site not found: ${root}`)
    process.exitCode = 1
    return
  }

  const issues = auditGeneratedPages(readGeneratedPages(root))
  if (issues.length) {
    console.error('Momence Phase 1 cutover is not ready:')
    issues.forEach(issue => console.error(`- ${issue}`))
    process.exitCode = 1
    return
  }

  console.log('Momence Phase 1 cutover verification passed.')
}

if (require.main === module) run()

module.exports = {
  EXPECTED_PASS_URLS,
  EXPECTED_POPUP_URLS,
  SLIDING_SCALE_PASS_URLS,
  auditGeneratedPages,
  readGeneratedPages
}
