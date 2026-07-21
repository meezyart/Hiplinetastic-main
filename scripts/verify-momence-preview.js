const { auditGeneratedPages } = require('./verify-momence-cutover')

const PREVIEW_ROUTES = [
  '/',
  '/schedule/',
  '/passes/',
  '/on-demand/',
  '/sliding-scale/'
]

const OUTPUT_FILES = {
  '/': 'index.html',
  '/schedule/': 'schedule/index.html',
  '/passes/': 'passes/index.html',
  '/on-demand/': 'on-demand/index.html',
  '/sliding-scale/': 'sliding-scale/index.html'
}

const PRODUCTION_HOSTS = new Set(['myhipline.com', 'www.myhipline.com'])

const parsePreviewUrl = value => {
  let url

  try {
    url = new URL(value)
  } catch {
    throw new Error('Provide a valid URL for the Netlify deploy preview')
  }

  if (url.protocol !== 'https:') {
    throw new Error('The deploy preview must use HTTPS')
  }

  if (PRODUCTION_HOSTS.has(url.hostname.toLowerCase())) {
    throw new Error('Refusing to run a staging check against the production HIPLINE site')
  }

  return url.origin
}

const auditPreviewResponses = responses => {
  const issues = []
  const pages = {}
  const rootResponse = responses['/']
  const expectedHost = rootResponse ? new URL(rootResponse.url).hostname : null

  PREVIEW_ROUTES.forEach(route => {
    const response = responses[route]

    if (!response) {
      issues.push(`Preview route ${route} was not checked`)
      return
    }

    if (response.status !== 200) {
      issues.push(`Preview route ${route} returned HTTP ${response.status}`)
    }

    const responseHost = new URL(response.url).hostname
    if (expectedHost && responseHost !== expectedHost) {
      issues.push(`Preview route ${route} redirected to a different host: ${responseHost}`)
    }

    pages[OUTPUT_FILES[route]] = response.html
  })

  return [...issues, ...auditGeneratedPages(pages)]
}

const fetchPreview = async baseUrl => {
  const entries = await Promise.all(PREVIEW_ROUTES.map(async route => {
    const response = await fetch(new URL(route, `${baseUrl}/`), {
      headers: { 'user-agent': 'HIPLINE Phase 1 preview verifier' },
      redirect: 'manual',
      signal: AbortSignal.timeout(20000)
    })
    const location = response.headers.get('location')

    return [route, {
      status: response.status,
      url: location ? new URL(location, response.url).href : response.url,
      html: await response.text()
    }]
  }))

  return Object.fromEntries(entries)
}

const run = async () => {
  let baseUrl

  try {
    baseUrl = parsePreviewUrl(process.argv[2])
  } catch (error) {
    console.error(error.message)
    console.error('Usage: npm run verify:momence-preview -- https://deploy-preview.example.netlify.app')
    process.exitCode = 1
    return
  }

  let responses
  try {
    responses = await fetchPreview(baseUrl)
  } catch (error) {
    console.error(`Unable to check the Momence deploy preview: ${error.message}`)
    process.exitCode = 1
    return
  }

  const issues = auditPreviewResponses(responses)
  if (issues.length) {
    console.error(`Momence Phase 1 deploy preview is not ready: ${baseUrl}`)
    issues.forEach(issue => console.error(`- ${issue}`))
    process.exitCode = 1
    return
  }

  console.log(`Momence Phase 1 deploy preview verification passed: ${baseUrl}`)
}

if (require.main === module) run()

module.exports = {
  PREVIEW_ROUTES,
  auditPreviewResponses,
  fetchPreview,
  parsePreviewUrl
}
