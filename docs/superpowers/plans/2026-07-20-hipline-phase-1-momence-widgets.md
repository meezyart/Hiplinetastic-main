# HIPLINE Phase 1 Momence Widgets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace HIPLINE's public and editor-facing Mindbody integration with structured Momence and provider-neutral page widgets, accessible Momence checkout modals, and a verified static production cutover.

**Architecture:** Keep Eleventy responsible for HIPLINE page composition and Sanity responsible for structured editor controls. Normalize every public integration value before Nunjucks renders a known Momence plugin, a sandboxed allowlisted iframe, a modal trigger, or an external fallback; never render editor-supplied HTML or JavaScript. Migrate published content with a guarded Sanity transaction, verify a staging build, and only then remove the HealCode runtime.

**Tech Stack:** Eleventy 0.12, Nunjucks, Sanity Studio v2, GROQ, Alpine/Webpack, focus-trap, Sass, Node's built-in test runner, Sanity CLI, Netlify staging deployment.

---

## Repository and File Map

Storefront repository: `/Users/meezyart/CODEBASE/HIPLINE/Hiplinetastic-main`

- `utils/momence.js`: all public integration normalization and allowlist enforcement.
- `src/data/momence.js`: fetches the public site-level Momence and embed settings from Sanity.
- `src/includes/class/classSchedule.njk`: specialized Momence Schedule renderer.
- `src/includes/class/externalService.njk`: new provider-neutral inline, popup, or link renderer.
- `src/includes/class/classPass.njk`: existing HIPLINE pass cards plus managed purchase triggers.
- `src/includes/partials/embedDialog.njk`: one shared accessible iframe dialog shell.
- `src/includes/page/pageSections.njk`: page-builder section dispatcher.
- `src/layouts/base.njk`: mounts the shared dialog once per page.
- `src/assets/scripts/components/embedDialog.js`: dialog lifecycle, focus, iframe loading, and cleanup.
- `src/assets/scripts/components/global.js`: initializes the dialog controller.
- `src/assets/styles/_momence-integrations.scss`: integration wrappers and responsive dialog styling.
- `src/assets/styles/style.scss`: imports the integration stylesheet.
- `src/includes/theme-scripts.njk`: removes the final HealCode script after content migration.
- `scripts/verify-momence-cutover.js`: generated-output release gate.
- `test/momence.test.js`: normalization unit tests.
- `test/external-service-template.test.js`: Nunjucks output contract.
- `test/pass-template.test.js`: pass-card purchase trigger contract independent of published Sanity content.
- `test/embed-dialog-markup.test.js`: dialog and trigger accessibility contract.
- `test/momence-output.test.js`: built-page integration checks.
- `test/momence-cutover-verifier.test.js`: release-gate unit tests.
- `package.json`: reproducible production build and release-check commands.

Sanity repository: `/Users/meezyart/CODEBASE/HIPLINE/Hipline-sanity-studio`

- `schemas/objects/hipline/externalService.js`: new typed universal page-builder section.
- `schemas/objects/hipline/classSchedule.js`: editor-facing Momence Schedule fields and labels.
- `schemas/documents/hipline/pass.js`: current purchase provider, URL, presentation, and product fields.
- `schemas/documents/settings/momence.js`: site defaults and approved iframe hostnames.
- `schemas/documents/page.js`: exposes the new section in the page builder.
- `schemas/schema.js`: registers the new section type.
- `scripts/phase1MomenceCutover.js`: guarded content migration.
- `scripts/phase1MomenceCutover.test.js`: migration manifest and patch tests.

## Task 1: Normalize Provider-Neutral Embed Configuration

**Files:**

- Modify: `test/momence.test.js`
- Modify: `utils/momence.js`
- Modify: `src/data/momence.js`

- [ ] **Step 1: Write failing normalizer tests**

Replace the existing Momence destructuring import and add these tests to `test/momence.test.js`:

```js
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
      frameTitle: 'Booking',
      actionLabel: 'Open External service',
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
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```bash
node --test test/momence.test.js
```

Expected: FAIL because `normalizeExternalService` and `normalizePurchasePresentation` are not exported.

- [ ] **Step 3: Implement hostname, presentation, and dimension normalization**

Add these complete functions to `utils/momence.js` and export `normalizeExternalService`, `normalizeExternalUrl`, and `normalizePurchasePresentation`:

```js
function normalizeHostname(value) {
  if (typeof value !== 'string') return ''
  const hostname = value.trim().toLowerCase().replace(/^\.+|\.+$/g, '')
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(hostname)
    ? hostname
    : ''
}

function normalizeAllowedHosts(value) {
  if (!Array.isArray(value)) return ['momence.com']
  return Array.from(new Set(['momence.com', ...value.map(normalizeHostname).filter(Boolean)]))
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

function normalizeExternalService(section = {}, settings = {}) {
  const providerLabel = typeof section.providerLabel === 'string' && section.providerLabel.trim()
    ? section.providerLabel.trim()
    : 'External service'
  const fallbackUrl = normalizeExternalUrl(section.fallbackUrl)
  const embedUrl = normalizeAllowedFrameUrl(section.embedUrl, settings.allowedEmbedHosts)
  const requestedPresentation = ['inline', 'popup', 'external-link'].includes(section.presentation)
    ? section.presentation
    : 'external-link'
  const presentation = requestedPresentation === 'external-link' || embedUrl
    ? requestedPresentation
    : 'external-link'

  if (!embedUrl && !fallbackUrl) return null

  return {
    heading: typeof section.heading === 'string' ? section.heading.trim() : '',
    providerLabel,
    presentation,
    embedUrl,
    fallbackUrl,
    frameTitle: typeof section.frameTitle === 'string' && section.frameTitle.trim()
      ? section.frameTitle.trim()
      : providerLabel,
    actionLabel: typeof section.actionLabel === 'string' && section.actionLabel.trim()
      ? section.actionLabel.trim()
      : `Open ${providerLabel}`,
    desktopHeight: normalizeFrameHeight(section.desktopHeight, 720, 320, 1200),
    mobileHeight: normalizeFrameHeight(section.mobileHeight, 640, 320, 1000)
  }
}
```

Extend `normalizeMomenceSettings` so its returned object includes:

```js
scheduleUrl: normalizeMomenceUrl(value.scheduleUrl),
allowedEmbedHosts: normalizeAllowedHosts(value.allowedEmbedHosts)
```

Update the existing settings test input and expected result with:

```js
scheduleUrl: 'https://momence.com/u/hipline-zNlk68',
allowedEmbedHosts: ['momence.com']
```

- [ ] **Step 4: Fetch the approved hostname list from Sanity**

Add the verified public Hipline schedule URL and hostname list to the GROQ projection in `src/data/momence.js`:

```groq
scheduleUrl,
allowedEmbedHosts,
```

- [ ] **Step 5: Run the focused tests**

Run:

```bash
node --test test/momence.test.js
```

Expected: all Momence normalizer tests PASS.

- [ ] **Step 6: Commit the normalizer**

```bash
git add utils/momence.js src/data/momence.js test/momence.test.js
git commit -m "feat: normalize typed external service embeds"
```

## Task 2: Add the Typed Sanity Page-Builder Fields

**Files:**

- Create: `../Hipline-sanity-studio/schemas/objects/hipline/externalService.js`
- Modify: `../Hipline-sanity-studio/schemas/objects/hipline/classSchedule.js`
- Modify: `../Hipline-sanity-studio/schemas/documents/hipline/pass.js`
- Modify: `../Hipline-sanity-studio/schemas/documents/settings/momence.js`
- Modify: `../Hipline-sanity-studio/schemas/documents/page.js`
- Modify: `../Hipline-sanity-studio/schemas/schema.js`

- [ ] **Step 1: Create the provider-neutral section schema**

Create `schemas/objects/hipline/externalService.js` with the following fields and validation:

```js
export default {
  name: 'externalServiceSection',
  title: 'External Service Section',
  type: 'object',
  fields: [
    { name: 'disabled', title: 'Disable section?', type: 'boolean' },
    { name: 'heading', title: 'Heading', type: 'string' },
    { name: 'introduction', title: 'Introduction', type: 'excerptPortableText' },
    {
      name: 'providerLabel',
      title: 'Provider name',
      description: 'Shown to visitors in fallback actions.',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'presentation',
      title: 'Display as',
      type: 'string',
      initialValue: 'inline',
      options: {
        layout: 'radio',
        list: [
          { title: 'On the page', value: 'inline' },
          { title: 'Popup', value: 'popup' },
          { title: 'External link', value: 'external-link' }
        ]
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'embedUrl',
      title: 'Secure iframe URL',
      description: 'Required for on-page and popup displays. The hostname must also be approved in Momence settings.',
      type: 'url',
      validation: Rule => Rule.uri({ scheme: ['https'], allowRelative: false })
    },
    {
      name: 'fallbackUrl',
      title: 'External fallback URL',
      type: 'url',
      validation: Rule => Rule.required().uri({ scheme: ['https'], allowRelative: false })
    },
    {
      name: 'frameTitle',
      title: 'Accessible frame title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    { name: 'actionLabel', title: 'Button label', type: 'string' },
    {
      name: 'desktopHeight',
      title: 'Desktop height in pixels',
      type: 'number',
      initialValue: 720,
      validation: Rule => Rule.integer().min(320).max(1200)
    },
    {
      name: 'mobileHeight',
      title: 'Mobile height in pixels',
      type: 'number',
      initialValue: 640,
      validation: Rule => Rule.integer().min(320).max(1000)
    }
  ],
  preview: {
    select: { title: 'heading', provider: 'providerLabel', disabled: 'disabled' },
    prepare({ title, provider, disabled }) {
      return {
        title: `${disabled ? 'DISABLED: ' : ''}${title || provider || 'External Service'}`,
        subtitle: provider || 'External service'
      }
    }
  }
}
```

- [ ] **Step 2: Register the section in the schema and page builder**

Import `externalServiceSection` in `schemas/schema.js`, add it once to `schemaTypes.concat`, and add this entry immediately after `momenceVideoSection` in `schemas/documents/page.js`:

```js
{
  type: 'externalServiceSection'
}
```

- [ ] **Step 3: Rename the schedule editor and add fallback fields**

Keep `name: 'classScheduleSection'`, change its title and preview prefix to `Momence Schedule Section`, and add these fields before the hidden legacy `mbo` field:

```js
{
  name: 'introduction',
  title: 'Introduction',
  type: 'excerptPortableText'
},
{
  name: 'fallbackUrl',
  title: 'Schedule fallback URL',
  type: 'url',
  validation: Rule => Rule.uri({ scheme: ['https'], allowRelative: false })
},
{
  name: 'fallbackLabel',
  title: 'Fallback link label',
  type: 'string',
  initialValue: 'Open the schedule'
}
```

- [ ] **Step 4: Replace the pass presentation toggle with typed purchase fields**

Add these fields to the Purchase fieldset in `schemas/documents/hipline/pass.js`:

```js
{
  name: 'purchasePresentation',
  title: 'Purchase display',
  type: 'string',
  fieldset: 'purchase',
  initialValue: 'popup',
  options: {
    layout: 'radio',
    list: [
      { title: 'Popup checkout', value: 'popup' },
      { title: 'External link', value: 'external-link' }
    ]
  }
},
{
  name: 'momenceProductId',
  title: 'Momence product ID',
  type: 'string',
  fieldset: 'purchase',
  validation: Rule => Rule.regex(/^\d+$/, { name: 'numeric product ID' })
}
```

Keep `purchaseOpenInNewTab` temporarily readable but set `hidden: true` and update its description to `Legacy presentation field retained for migration.`

- [ ] **Step 5: Add the editor-managed iframe hostname allowlist**

Add these fields to `schemas/documents/settings/momence.js`:

```js
{
  name: 'scheduleUrl',
  title: 'Public schedule fallback URL',
  description: 'The public Hipline host page copied from Momence.',
  type: 'url',
  initialValue: 'https://momence.com/u/hipline-zNlk68',
  validation: momenceUrl
},
{
  name: 'allowedEmbedHosts',
  title: 'Approved iframe hostnames',
  description: 'Hostnames only, without https:// or a path. Momence is always approved.',
  type: 'array',
  of: [
    {
      type: 'string',
      validation: Rule => Rule.regex(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i)
    }
  ],
  validation: Rule => Rule.unique()
}
```

- [ ] **Step 6: Validate the Studio schema**

Run from `/Users/meezyart/CODEBASE/HIPLINE/Hipline-sanity-studio`:

```bash
npm test
```

Expected: Sanity schema check exits 0 with no unknown type or validation configuration errors.

- [ ] **Step 7: Commit the Sanity schema**

```bash
git add schemas/objects/hipline/externalService.js schemas/objects/hipline/classSchedule.js schemas/documents/hipline/pass.js schemas/documents/settings/momence.js schemas/documents/page.js schemas/schema.js
git commit -m "feat: add typed Momence and external service widgets"
```

## Task 3: Render the Universal Page Widget

**Files:**

- Create: `src/includes/class/externalService.njk`
- Create: `test/external-service-template.test.js`
- Modify: `src/includes/page/pageSections.njk`
- Modify: `utils/filters.js`

- [ ] **Step 1: Write the failing Nunjucks output test**

Create `test/external-service-template.test.js`:

```js
const assert = require('node:assert/strict')
const path = require('node:path')
const test = require('node:test')
const nunjucks = require('nunjucks')
const { normalizeExternalService } = require('../utils/momence.js')

const env = nunjucks.configure(path.resolve(__dirname, '..', 'src', 'includes'), {
  autoescape: true
})
env.addFilter('externalService', normalizeExternalService)
env.addFilter('blocksToHtml', () => '')

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
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
node --test test/external-service-template.test.js
```

Expected: FAIL because `class/externalService.njk` does not exist and the filter is not registered.

- [ ] **Step 3: Register the external-service filter**

Import `normalizeExternalService` in `utils/filters.js` and expose it as:

```js
externalService: normalizeExternalService,
```

- [ ] **Step 4: Create the renderer**

Create `src/includes/class/externalService.njk` with a single normalized configuration, HIPLINE section wrapper, sandboxed inline iframe, popup trigger, and external fallback. Use this exact branching contract:

```njk
{% set service = pageSection | externalService(momence) %}
{% if service %}
<section class="section section-padding-top section-padding-bottom external-service" aria-labelledby="external-service-heading-{{ pageSection._key | escape }}">
  <div class="container">
    {% if service.heading %}
      <div class="section-title text-center mb-50">
        <h2 id="external-service-heading-{{ pageSection._key | escape }}">{{ service.heading }}</h2>
      </div>
    {% endif %}
    {% if pageSection.introduction %}
      <div class="external-service__introduction">{{ pageSection.introduction | blocksToHtml | safe }}</div>
    {% endif %}
    {% if service.presentation == 'inline' and service.embedUrl %}
      <iframe class="external-service__frame" src="{{ service.embedUrl }}" title="{{ service.frameTitle }}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts" style="--external-service-height: {{ service.desktopHeight }}px; --external-service-mobile-height: {{ service.mobileHeight }}px"></iframe>
    {% elseif service.presentation == 'popup' and service.embedUrl %}
      <p class="text-center"><a class="btn btn-primary btn-hover-secondary" href="{{ service.fallbackUrl or service.embedUrl }}" data-embed-dialog-url="{{ service.embedUrl }}" data-embed-dialog-title="{{ service.frameTitle }}">{{ service.actionLabel }}</a></p>
    {% endif %}
    {% if service.fallbackUrl and service.presentation != 'popup' %}
      <p class="text-center mt-30"><a class="btn btn-primary btn-hover-secondary" href="{{ service.fallbackUrl }}" target="_blank" rel="noopener noreferrer">{{ service.actionLabel }}</a></p>
    {% endif %}
  </div>
</section>
{% endif %}
```

- [ ] **Step 5: Add the page-dispatch branch**

Add this branch to `src/includes/page/pageSections.njk` immediately after `momenceVideoSection`:

```njk
{% elseif pageSection._type == 'externalServiceSection' %}
  {% include 'class/externalService.njk' %}
```

- [ ] **Step 6: Run the template and normalizer tests**

Run:

```bash
node --test test/momence.test.js test/external-service-template.test.js
```

Expected: all tests PASS.

- [ ] **Step 7: Commit the renderer**

```bash
git add utils/filters.js src/includes/class/externalService.njk src/includes/page/pageSections.njk test/external-service-template.test.js
git commit -m "feat: render universal external service sections"
```

## Task 4: Add the Shared Accessible Embed Dialog

**Files:**

- Create: `src/includes/partials/embedDialog.njk`
- Create: `src/assets/scripts/components/embedDialog.js`
- Create: `src/assets/styles/_momence-integrations.scss`
- Create: `test/embed-dialog-markup.test.js`
- Modify: `src/layouts/base.njk`
- Modify: `src/assets/scripts/components/global.js`
- Modify: `src/assets/styles/style.scss`

- [ ] **Step 1: Write the failing markup contract test**

Create `test/embed-dialog-markup.test.js`:

```js
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const root = path.resolve(__dirname, '..')

test('shared embed dialog exposes the required accessibility hooks', () => {
  const markup = fs.readFileSync(
    path.join(root, 'src/includes/partials/embedDialog.njk'),
    'utf8'
  )

  assert.match(markup, /role="dialog"/)
  assert.match(markup, /aria-modal="true"/)
  assert.match(markup, /aria-labelledby="embed-dialog-title"/)
  assert.match(markup, /data-embed-dialog-close/)
  assert.match(markup, /data-embed-dialog-body/)
  assert.match(markup, /Open checkout in a new tab/)
})
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
node --test test/embed-dialog-markup.test.js
```

Expected: FAIL because the dialog partial does not exist.

- [ ] **Step 3: Add the dialog shell once to the base layout**

Create `src/includes/partials/embedDialog.njk`:

```njk
<div class="embed-dialog" data-embed-dialog hidden>
  <div class="embed-dialog__backdrop" data-embed-dialog-close></div>
  <div class="embed-dialog__panel" role="dialog" aria-modal="true" aria-labelledby="embed-dialog-title" tabindex="-1">
    <div class="embed-dialog__header">
      <h2 id="embed-dialog-title" data-embed-dialog-title>Secure checkout</h2>
      <button class="embed-dialog__close" type="button" data-embed-dialog-close aria-label="Close checkout">&times;</button>
    </div>
    <div class="embed-dialog__body" data-embed-dialog-body></div>
    <p class="embed-dialog__fallback"><a data-embed-dialog-fallback target="_blank" rel="noopener noreferrer">Open checkout in a new tab</a></p>
  </div>
</div>
```

Include it in `src/layouts/base.njk` immediately before `theme-scripts.njk`:

```njk
{% include "partials/embedDialog.njk" %}
```

- [ ] **Step 4: Implement the dialog controller**

Create `src/assets/scripts/components/embedDialog.js` with one controller that delegates trigger clicks, preserves progressive enhancement, and uses the existing `focus-trap` dependency:

```js
import { createFocusTrap } from 'focus-trap'

export const initEmbedDialog = () => {
  const root = document.querySelector('[data-embed-dialog]')
  if (!root) return

  const panel = root.querySelector('[role="dialog"]')
  const body = root.querySelector('[data-embed-dialog-body]')
  const title = root.querySelector('[data-embed-dialog-title]')
  const fallback = root.querySelector('[data-embed-dialog-fallback]')
  let trigger = null

  const finishClose = () => {
    root.hidden = true
    document.body.classList.remove('embed-dialog-open')
    body.replaceChildren()
    if (trigger) trigger.focus()
    trigger = null
  }

  const trap = createFocusTrap(panel, {
    escapeDeactivates: true,
    clickOutsideDeactivates: false,
    fallbackFocus: panel,
    onDeactivate: finishClose
  })

  const close = () => {
    if (root.hidden) return
    trap.deactivate()
  }

  const open = link => {
    const url = link.dataset.embedDialogUrl
    if (!url) return
    trigger = link
    title.textContent = link.dataset.embedDialogTitle || 'Secure checkout'
    fallback.href = link.href
    const frame = document.createElement('iframe')
    frame.src = url
    frame.title = title.textContent
    frame.loading = 'eager'
    frame.referrerPolicy = 'strict-origin-when-cross-origin'
    frame.allow = 'payment; fullscreen'
    frame.setAttribute('data-embed-dialog-frame', '')
    body.replaceChildren(frame)
    root.hidden = false
    document.body.classList.add('embed-dialog-open')
    trap.activate()
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('[data-embed-dialog-url]')
    if (link) {
      event.preventDefault()
      open(link)
      return
    }
    if (event.target.closest('[data-embed-dialog-close]')) close()
  })
}
```

- [ ] **Step 5: Initialize the controller**

Import `initEmbedDialog` in `src/assets/scripts/components/global.js` and call it inside `init` immediately before `Alpine.start()`:

```js
initEmbedDialog()
```

- [ ] **Step 6: Add scoped responsive styling**

Create `src/assets/styles/_momence-integrations.scss` with scoped styles for `.external-service`, `.embed-dialog`, `.embed-dialog__panel`, `.embed-dialog__header`, `.embed-dialog__body`, `.embed-dialog__fallback`, `[data-embed-dialog-frame]`, and `body.embed-dialog-open`. Use a fixed full-screen overlay, `z-index: 10000`, a desktop panel width of `min(768px, calc(100vw - 40px))`, a maximum height of `calc(100vh - 40px)`, and a full-screen panel below `767px`. Define `.external-service__frame` with:

```scss
.external-service__frame {
  display: block;
  width: 100%;
  height: var(--external-service-height, 720px);
  border: 0;

  @media (max-width: 767px) {
    height: var(--external-service-mobile-height, 640px);
  }
}
```

Import it after `popup` in `src/assets/styles/style.scss`:

```scss
@import "momence-integrations";
```

- [ ] **Step 7: Run the markup and bundle checks**

Run:

```bash
node --test test/embed-dialog-markup.test.js
env NODE_OPTIONS=--openssl-legacy-provider npm run build
```

Expected: the markup test passes and Eleventy/Webpack writes 46 or more pages without a compilation error.

- [ ] **Step 8: Commit the dialog**

```bash
git add src/includes/partials/embedDialog.njk src/layouts/base.njk src/assets/scripts/components/embedDialog.js src/assets/scripts/components/global.js src/assets/styles/_momence-integrations.scss src/assets/styles/style.scss test/embed-dialog-markup.test.js
git commit -m "feat: add accessible provider checkout dialog"
```

## Task 5: Connect Pass Cards to Momence Modal Checkout

**Files:**

- Modify: `src/includes/class/classPass.njk`
- Modify: `test/external-service-template.test.js`
- Modify: `test/momence-output.test.js`

- [ ] **Step 1: Add a failing pass-trigger assertion**

Extend `test/momence-output.test.js` with:

```js
test('Momence pass cards use progressively enhanced checkout dialogs', () => {
  const passes = readOutput(path.join('passes', 'index.html'))

  assert.match(passes, /href="https:\/\/momence\.com\/m\/768424"/)
  assert.match(passes, /data-embed-dialog-url="https:\/\/momence\.com\/m\/768424"/)
  assert.match(passes, /data-embed-dialog-title="Buy NEWBIE PASS"/)
})
```

- [ ] **Step 2: Build and verify the new assertion fails**

Run:

```bash
env NODE_OPTIONS=--openssl-legacy-provider npm run build
node --test test/momence-output.test.js
```

Expected: FAIL because pass anchors do not yet have dialog data attributes.

- [ ] **Step 3: Replace the new-tab boolean with normalized presentation**

Update the `passBlock` macro to accept `purchasePresentation='popup'`. Normalize it using the provider, keep the external URL as the real `href`, and add dialog attributes only for a Momence popup:

```njk
{% set managedPurchaseUrl = purchaseUrl | purchaseUrl(purchaseProvider) %}
{% set managedPresentation = purchasePresentation | purchasePresentation(purchaseProvider) %}
{% if managedPurchaseUrl %}
  <a
    href="{{ managedPurchaseUrl | escape }}"
    class="btn {{ buttonClass }} btn-lg mt-30"
    {% if managedPresentation == 'popup' %}
      data-embed-dialog-url="{{ managedPurchaseUrl | escape }}"
      data-embed-dialog-title="Buy {{ passName | escape }}"
    {% else %}
      target="_blank" rel="noopener noreferrer"
    {% endif %}
  >{{ purchaseLabel or buttonTitle }}</a>
{% elseif mbo %}
  {{ healcodeWidget(dataVersion='0.2', linkClass=healcodeClass ~ ' ' ~ buttonClass, type=healcodeType, innerHtml=buttonTitle, serviceId=dataId) }}
{% endif %}
```

Pass `purchasePresentation=pass.purchasePresentation` from every existing color branch. Remove the duplicate `healcodeClass` keyword while touching each call.

- [ ] **Step 4: Expose the presentation filter**

Import and register `normalizePurchasePresentation` in `utils/filters.js`:

```js
purchasePresentation: normalizePurchasePresentation,
```

- [ ] **Step 5: Build and run targeted tests**

Run:

```bash
env NODE_OPTIONS=--openssl-legacy-provider npm run build
node --test test/momence.test.js test/momence-output.test.js test/embed-dialog-markup.test.js
```

Expected: all targeted tests PASS while the temporary HealCode fallback remains limited to unmigrated pass records.

- [ ] **Step 6: Commit the pass modal integration**

```bash
git add src/includes/class/classPass.njk utils/filters.js test/momence-output.test.js
git commit -m "feat: open Momence passes in checkout dialog"
```

## Task 6: Complete the Momence Schedule and On-Demand Wrappers

**Files:**

- Modify: `src/includes/class/classSchedule.njk`
- Modify: `src/includes/class/momenceVideo.njk`
- Modify: `src/assets/styles/_momence-integrations.scss`
- Modify: `test/momence-output.test.js`

- [ ] **Step 1: Add failing fallback and accessibility assertions**

Extend the generated-output tests to require:

```js
test('schedule and On-Demand expose accessible hosted fallbacks', () => {
  const schedule = readOutput(path.join('schedule', 'index.html'))
  const onDemand = readOutput(path.join('on-demand', 'index.html'))

  assert.match(schedule, /href="https:\/\/momence\.com\//)
  assert.match(schedule, />Open the schedule</)
  assert.match(onDemand, /title="Hipline on-demand video library"/)
  assert.match(onDemand, />Open the Video Library</)
})
```

- [ ] **Step 2: Build and verify the schedule assertion fails**

Run:

```bash
env NODE_OPTIONS=--openssl-legacy-provider npm run build
node --test test/momence-output.test.js
```

Expected: FAIL until the published On-Demand page exists and the schedule fallback is rendered.

- [ ] **Step 3: Render schedule introduction and fallback**

In `classSchedule.njk`, render `pageSection.introduction` above the plugin and render a direct external link using `pageSection.fallbackUrl` when valid. If the section URL is missing, use a site-level `momence.scheduleUrl`; otherwise show the existing unavailable message. The fallback anchor must use `target="_blank" rel="noopener noreferrer"` and the label `pageSection.fallbackLabel or 'Open the schedule'`.

- [ ] **Step 4: Keep the Video Library in its HIPLINE wrapper**

Retain the existing validated Momence URL, descriptive iframe title, lazy loading, and hosted fallback. Move its frame sizing from `_common.scss` into `_momence-integrations.scss` so all provider presentation rules live together.

- [ ] **Step 5: Run focused template tests with a local Nunjucks fixture**

Add a Nunjucks fixture case to `test/external-service-template.test.js` for a schedule section with `hostId: '253441'`, `fallbackUrl: 'https://momence.com/u/hipline-zNlk68'`, and `fallbackLabel: 'Open the schedule'`. Render `class/classSchedule.njk` after registering `momenceSchedule`, `dump`, and `blocksToHtml` filters. Assert the plugin `src`, `host_id`, fallback `href`, and label.

Run:

```bash
node --test test/external-service-template.test.js
```

Expected: all fixture tests PASS without requiring published Sanity changes.

- [ ] **Step 6: Commit the schedule and video wrappers**

```bash
git add src/includes/class/classSchedule.njk src/includes/class/momenceVideo.njk src/assets/styles/_momence-integrations.scss src/assets/styles/_common.scss test/external-service-template.test.js test/momence-output.test.js
git commit -m "feat: finish Momence schedule and video wrappers"
```

## Task 7: Update and Dry-Run the Guarded Sanity Migration

**Files:**

- Modify: `../Hipline-sanity-studio/scripts/phase1MomenceCutover.js`
- Modify: `../Hipline-sanity-studio/scripts/phase1MomenceCutover.test.js`

- [ ] **Step 1: Update the failing patch contract**

Change the expected pass patch in `phase1MomenceCutover.test.js` to:

```js
assert.deepEqual(buildPassPatch(PASS_UPDATES[0]), {
  purchaseProvider: 'momence',
  purchaseUrl: PASS_UPDATES[0].purchaseUrl,
  purchaseButtonLabel: 'Buy Now',
  purchasePresentation: 'popup',
  momenceProductId: String(PASS_UPDATES[0].membershipId)
})
```

For Gift Cards, assert `purchasePresentation === 'external-link'` and `momenceProductId === undefined`.

- [ ] **Step 2: Run the migration tests and verify failure**

Run from the Sanity repository:

```bash
node --test scripts/phase1MomenceCutover.test.js
```

Expected: FAIL because `buildPassPatch` still emits `purchaseOpenInNewTab`.

- [ ] **Step 3: Update the guarded pass patch**

Replace `buildPassPatch` with:

```js
const buildPassPatch = update => ({
  purchaseProvider: 'momence',
  purchaseUrl: update.purchaseUrl,
  purchaseButtonLabel: 'Buy Now',
  purchasePresentation: update.membershipId ? 'popup' : 'external-link',
  ...(update.membershipId ? { momenceProductId: String(update.membershipId) } : {})
})
```

Add `allowedEmbedHosts: ['momence.com']` to `SETTINGS_DOCUMENT`. Extend the current-pass GROQ projection to include `purchasePresentation` and `momenceProductId`.

- [ ] **Step 4: Keep Sliding Scale outside the transaction**

Add a dry-run warning field:

```js
releaseWarnings: [
  'Sliding Scale has no approved tiered Momence destination and must remain disabled or receive an approved URL before production cutover.'
]
```

Do not add a guessed Sliding Scale product to `PASS_UPDATES`.

- [ ] **Step 5: Run unit tests and the authenticated dry-run**

Run:

```bash
node --test scripts/phase1MomenceCutover.test.js
sanity exec scripts/phase1MomenceCutover.js --with-user-token
```

Expected: tests PASS; the script prints `mode: dry-run`, 12 verified pass mappings, settings, On-Demand page, navigation update, and `No content was changed`.

- [ ] **Step 6: Commit the guarded migration**

```bash
git add scripts/phase1MomenceCutover.js scripts/phase1MomenceCutover.test.js
git commit -m "feat: prepare typed Momence content cutover"
```

## Task 8: Publish Schema and Content, Then Verify the Static Build

**Files:**

- Modify only through authenticated Sanity transactions: dataset `production`
- Verify: `dist/`

- [ ] **Step 1: Deploy the reviewed Studio schema**

Run from the Sanity repository:

```bash
npm test
npm run build
npm run deploy
```

Expected: schema check and build exit 0; Sanity deploy reports the Studio URL without schema errors.

- [ ] **Step 2: Apply the guarded production content transaction**

Run only after the dry-run output matches the reviewed manifest:

```bash
sanity exec scripts/phase1MomenceCutover.js --with-user-token -- --apply-production
```

Expected: one transaction ID confirming Momence settings, 12 pass mappings, the On-Demand page, and the navigation update.

- [ ] **Step 3: Query the authoritative published records**

Use Sanity Vision or an authenticated CLI query for:

```groq
{
  "settings": *[_id == "settingsMomence"][0],
  "passes": *[_type == "passBlock" && defined(purchaseUrl)] | order(passName asc){passName, purchaseProvider, purchaseUrl, purchasePresentation, momenceProductId},
  "onDemand": *[_type == "page" && slug.current == "on-demand"][0]{title, slug, pageSections}
}
```

Expected: Momence host `253441`, 12 mapped pass documents, and one published On-Demand page with a `momenceVideoSection`.

- [ ] **Step 4: Make the production build command reproducible under current Node**

Change `package.json` so `eleventy:prod` is:

```json
"eleventy:prod": "cross-env NODE_OPTIONS=--openssl-legacy-provider ELEVENTY_ENV=production eleventy"
```

Run:

```bash
npm run build
```

Expected: the build reaches public Sanity, compiles Webpack, and writes the static pages without `ERR_OSSL_EVP_UNSUPPORTED`.

- [ ] **Step 5: Run the pre-cutover output audit**

Run:

```bash
npm test
npm run verify:momence-cutover
```

Expected before Task 9: tests confirm the Momence surfaces; the cutover verifier may report only deliberately retained HealCode output and an unresolved Sliding Scale gate.

- [ ] **Step 6: Commit the build-runtime compatibility change**

```bash
git add package.json package-lock.json
git commit -m "build: support current Node production builds"
```

## Task 9: Remove HealCode and Strengthen the Release Gate

**Files:**

- Modify: `src/includes/class/classPass.njk`
- Delete: `src/includes/partials/mboWidget.njk`
- Modify: `src/includes/theme-scripts.njk`
- Modify: `test/momence-output.test.js`
- Modify: `scripts/verify-momence-cutover.js`
- Modify: `test/momence-cutover-verifier.test.js`

- [ ] **Step 1: Change the built-output test to require zero legacy runtime**

Replace the temporary runtime test with:

```js
test('generated production pages contain no Mindbody or HealCode runtime', () => {
  const pages = ['index.html', 'schedule/index.html', 'passes/index.html', 'sliding-scale/index.html']
  const legacy = /healcode-widget|widgets\.mindbodyonline\.com|clients\.mindbodyonline\.com/i

  pages.forEach(relativePath => assert.doesNotMatch(readOutput(relativePath), legacy))
})
```

- [ ] **Step 2: Build and verify the test fails before cleanup**

Run:

```bash
npm run build
node --test test/momence-output.test.js
```

Expected: FAIL while HealCode fallback markup or scripts remain.

- [ ] **Step 3: Remove the legacy runtime paths**

In `classPass.njk`, remove the `mboWidget` import, all HealCode macro parameters, and the `elseif mbo` branch. In `theme-scripts.njk`, remove the conditional `widgets.mindbodyonline.com/javascripts/healcode.js` script. Delete `src/includes/partials/mboWidget.njk` only after `rg` shows no remaining imports.

Run:

```bash
rg -n "healcode|mindbodyonline|clients\.mindbody|<healcode-widget" src utils
```

Expected: no matches in generated runtime sources; hidden Sanity migration field names may still exist in the adjacent Studio repository.

- [ ] **Step 4: Require modal and universal-widget evidence in the verifier**

Extend `auditGeneratedPages` so the Passes page must contain `data-embed-dialog-url` for each Momence membership URL, the base output must contain `data-embed-dialog`, and any rendered `external-service__frame` must contain both `sandbox=` and a fallback `href=`. Add unit fixtures covering the passing and failing variants.

- [ ] **Step 5: Run the full release test suite**

Run:

```bash
npm run build
npm test
npm run verify:momence-cutover
```

Expected: all Node tests PASS and the cutover verifier prints `Momence Phase 1 cutover verification passed.` If Sliding Scale is intentionally disabled, update the verifier manifest to assert that decision rather than omitting the page silently.

- [ ] **Step 6: Commit the runtime cutover**

```bash
git add src/includes/class/classPass.njk src/includes/theme-scripts.njk test/momence-output.test.js scripts/verify-momence-cutover.js test/momence-cutover-verifier.test.js
git add -A src/includes/partials/mboWidget.njk
git commit -m "feat: complete Mindbody to Momence runtime cutover"
```

## Task 10: Stage, Review, and Release

**Files:**

- Modify: `docs/phase-1-momence-cutover-checklist.md`
- Verify: Netlify deploy preview and `https://myhipline.com`

- [ ] **Step 1: Record the authoritative build and test evidence**

Add the exact date, commit, Node version, commands, pass totals, and verifier output to `docs/phase-1-momence-cutover-checklist.md`. Record the Sliding Scale decision explicitly as either an approved Momence URL or disabled for launch.

- [ ] **Step 2: Create a Netlify deploy preview without promoting production**

Push the feature branch and create the repository's normal deploy preview. Record the preview URL in the checklist. Do not merge or trigger the production alias.

- [ ] **Step 3: Verify all launch surfaces on desktop and mobile**

Check these routes at approximately 1440x1000 and 390x844:

```text
/
/schedule/
/passes/
/on-demand/
/sliding-scale/
```

For each route, verify banner geometry against `https://myhipline.com`, no broken images, no horizontal overflow, no console errors caused by HIPLINE code, and correct fallback links.

- [ ] **Step 4: Verify keyboard and modal behavior**

For at least one pass modal and one universal-widget popup, verify Tab/Shift+Tab containment, visible close control, Escape closing, focus restoration, body scroll lock, mobile full-height layout, checkout loading, external fallback, and iframe cleanup after close.

- [ ] **Step 5: Verify Sanity authoring behavior**

In the deployed Studio, open a page and confirm that an editor can add, reorder, disable, and configure both **Momence Schedule Section** and **External Service Section**. Confirm the pass editor shows Purchase provider, URL, display mode, label, and Momence product ID without showing normal Mindbody controls.

- [ ] **Step 6: Obtain staging approval**

Present the deploy-preview URL and checklist. Record explicit client or project-owner approval before production publishing.

- [ ] **Step 7: Perform production cutover and smoke test**

Merge or promote only the approved commit. After deployment, run the same five-route smoke test and confirm `npm run verify:momence-cutover` against the exact build artifact used for production.

- [ ] **Step 8: Commit the completed release record**

```bash
git add docs/phase-1-momence-cutover-checklist.md
git commit -m "docs: record Phase 1 Momence release verification"
```

## Completion Evidence

Phase 1 is complete only when all of the following evidence exists:

- Sanity schema validation and Studio build pass.
- The guarded migration transaction ID and post-migration GROQ results are recorded.
- Every active pass has a verified Momence destination or an explicit disabled decision.
- Sliding Scale has an approved destination or explicit launch-disable decision.
- The storefront build, Node tests, and Momence cutover verifier pass.
- Generated production output contains no Mindbody or HealCode runtime.
- Schedule, On-Demand, account, gift card, pass modal, and universal-widget fallback flows are verified.
- Desktop, mobile, keyboard, and visual staging checks are recorded.
- Staging approval precedes production promotion.
- The production smoke test passes on `https://myhipline.com`.
