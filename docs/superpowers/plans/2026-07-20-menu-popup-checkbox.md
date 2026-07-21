# Sanity Menu Popup Checkbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an editor-controlled **Open As Popup?** setting to Sanity external navigation links and use it for the Gift Cards link in HIPLINE's desktop and mobile menus.

**Architecture:** The active Sanity `navLink` object owns the new boolean, and a guarded content migration enables it on exactly the published Gift Cards link. The storefront GROQ query passes the flag through, while one tested Nunjucks macro renders normal link behavior plus the shared dialog attributes consistently in desktop, mobile, top-level, and dropdown navigation. The generated-site verifier proves that both menu variants contain the progressive-enhancement fallback and popup trigger.

**Tech Stack:** Sanity Studio v2 schemas and content client, Eleventy, Nunjucks, Node.js built-in test runner, existing shared `embedDialog` component.

---

## File map

- Modify `/Users/meezyart/CODEBASE/HIPLINE/Hipline-sanity-studio/schemas/objects/blocks/navLink.js` — expose the editor checkbox and require HTTPS when it is enabled.
- Create `/Users/meezyart/CODEBASE/HIPLINE/Hipline-sanity-studio/scripts/enableGiftCardMenuPopup.js` — idempotently enable the flag on the one expected published Header Menu link.
- Create `/Users/meezyart/CODEBASE/HIPLINE/Hipline-sanity-studio/scripts/enableGiftCardMenuPopup.test.js` — test the schema contract and guarded menu transformation.
- Modify `/Users/meezyart/CODEBASE/HIPLINE/Hipline-sanity-studio/scripts/phase1MomenceCutover.js` — keep the Gift Cards pass popup-safe if the Phase 1 migration is rerun and remove the obsolete Sliding Scale warning.
- Modify `/Users/meezyart/CODEBASE/HIPLINE/Hipline-sanity-studio/scripts/phase1MomenceCutover.test.js` — lock the corrected Gift Cards presentation.
- Create `src/includes/macros/menuLink.njk` — centralize navigation link attributes and popup enhancement.
- Modify `src/includes/header.njk` — use the macro for desktop top-level and dropdown links.
- Modify `src/includes/mobile-menu.njk` — use the macro for mobile top-level and dropdown links.
- Modify `src/data/sections/header.js` — project `openAsPopup` for both menu levels.
- Create `test/header-menu-popup.test.js` — unit-test popup, fallback, internal-link, and disabled-link markup.
- Modify `scripts/verify-momence-cutover.js` — require two generated Gift Cards menu popup triggers.
- Modify `test/momence-cutover-verifier.test.js` — test the new release gate.
- Modify `docs/phase-1-momence-cutover-checklist.md` — record the editor control and updated local verification state.

### Task 1: Lock the Sanity content transformation and schema contract

**Files:**
- Create: `/Users/meezyart/CODEBASE/HIPLINE/Hipline-sanity-studio/scripts/enableGiftCardMenuPopup.test.js`
- Test: `/Users/meezyart/CODEBASE/HIPLINE/Hipline-sanity-studio/scripts/enableGiftCardMenuPopup.test.js`

- [ ] **Step 1: Write the failing tests**

```js
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const {
  GIFT_CARD_URL,
  buildGiftCardPopupMenuItems
} = require('./enableGiftCardMenuPopup')

test('external links expose the Open As Popup editor setting', () => {
  const schema = fs.readFileSync(
    path.resolve(__dirname, '../schemas/objects/blocks/navLink.js'),
    'utf8'
  )

  assert.match(schema, /name:\s*'openAsPopup'/)
  assert.match(schema, /title:\s*'Open As Popup\?'/)
  assert.match(schema, /Popup links require an HTTPS URL/)
})

test('enables popup behavior only on the expected Gift Cards link', () => {
  const menuItems = [
    { _key: 'passes', _type: 'navPage', title: 'Passes' },
    {
      _key: 'gift',
      _type: 'navLink',
      title: 'Gift Cards',
      url: GIFT_CARD_URL,
      openInNewTab: true
    }
  ]

  assert.deepEqual(buildGiftCardPopupMenuItems(menuItems), [
    menuItems[0],
    { ...menuItems[1], openAsPopup: true }
  ])
})

test('is idempotent and refuses an ambiguous or changed Gift Cards link', () => {
  const managed = {
    _key: 'gift',
    _type: 'navLink',
    title: 'Gift Cards',
    url: GIFT_CARD_URL,
    openAsPopup: true
  }

  assert.deepEqual(buildGiftCardPopupMenuItems([managed]), [managed])
  assert.throws(() => buildGiftCardPopupMenuItems([]), /exactly one/i)
  assert.throws(
    () => buildGiftCardPopupMenuItems([
      managed,
      { ...managed, _key: 'gift-copy' }
    ]),
    /exactly one/i
  )
})
```

- [ ] **Step 2: Run the tests and confirm the red state**

Run:

```bash
cd /Users/meezyart/CODEBASE/HIPLINE/Hipline-sanity-studio
node --test scripts/enableGiftCardMenuPopup.test.js
```

Expected: FAIL because `enableGiftCardMenuPopup.js` and `openAsPopup` do not exist.

### Task 2: Add the Sanity checkbox and guarded migration

**Files:**
- Modify: `/Users/meezyart/CODEBASE/HIPLINE/Hipline-sanity-studio/schemas/objects/blocks/navLink.js`
- Create: `/Users/meezyart/CODEBASE/HIPLINE/Hipline-sanity-studio/scripts/enableGiftCardMenuPopup.js`
- Modify: `/Users/meezyart/CODEBASE/HIPLINE/Hipline-sanity-studio/scripts/phase1MomenceCutover.js`
- Modify: `/Users/meezyart/CODEBASE/HIPLINE/Hipline-sanity-studio/scripts/phase1MomenceCutover.test.js`

- [ ] **Step 1: Add the editor field after `openInNewTab`**

```js
{
  name: 'openAsPopup',
  title: 'Open As Popup?',
  description: 'Open this HTTPS link in the shared site popup. The normal link remains the fallback.',
  type: 'boolean',
  validation: Rule => Rule.custom((value, context) => {
    if (!value) return true
    const url = context.parent && context.parent.url
    return /^https:\/\//i.test(url || '') || 'Popup links require an HTTPS URL.'
  })
}
```

- [ ] **Step 2: Implement the guarded, revision-safe migration**

Create `scripts/enableGiftCardMenuPopup.js`:

```js
const HEADER_MENU_ID = '955cf4b3-685b-41cb-bd20-cb91bba391a3'
const GIFT_CARD_URL = 'https://momence.com/gcc/253441'

const isGiftCardLink = item =>
  item &&
  item._type === 'navLink' &&
  item.title === 'Gift Cards' &&
  item.url === GIFT_CARD_URL

const buildGiftCardPopupMenuItems = menuItems => {
  const matches = menuItems.filter(isGiftCardLink)
  if (matches.length !== 1) {
    throw new Error('Expected exactly one published Gift Cards navigation link')
  }

  return menuItems.map(item => isGiftCardLink(item)
    ? { ...item, openAsPopup: true }
    : item
  )
}

const run = async () => {
  const applyProduction = process.argv.includes('--apply-production')
  const client = require('part:@sanity/base/client')
    .withConfig({ apiVersion: '2021-10-21', useCdn: false })
  const menu = await client.fetch(
    '*[_id == $menuId][0]{_id, _rev, menuItems}',
    { menuId: HEADER_MENU_ID }
  )

  if (!menu || !Array.isArray(menu.menuItems)) {
    throw new Error(`Header menu ${HEADER_MENU_ID} was not found`)
  }

  const menuItems = buildGiftCardPopupMenuItems(menu.menuItems)
  if (!applyProduction) {
    console.log(JSON.stringify({ mode: 'dry-run', menuId: HEADER_MENU_ID, menuItems }, null, 2))
    console.log('\nNo content was changed. Re-run with -- --apply-production after approval.')
    return
  }

  const result = await client
    .patch(HEADER_MENU_ID)
    .ifRevisionId(menu._rev)
    .set({ menuItems })
    .commit()
  console.log(`Enabled the Gift Cards menu popup in revision ${result._rev}.`)
}

if (require.main === module) {
  run().catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}

module.exports = {
  GIFT_CARD_URL,
  HEADER_MENU_ID,
  buildGiftCardPopupMenuItems
}
```

- [ ] **Step 3: Make the Phase 1 manifest preserve the current popup state**

Change `buildPassPatch` so every managed pass, including Gift Cards, uses the popup:

```js
const buildPassPatch = update => ({
  purchaseProvider: 'momence',
  purchaseUrl: update.purchaseUrl,
  purchaseButtonLabel: 'Buy Now',
  purchasePresentation: 'popup',
  ...(update.membershipId ? { momenceProductId: String(update.membershipId) } : {})
})
```

Set `RELEASE_WARNINGS` to an empty array because both approved Sliding Scale passes now exist:

```js
const RELEASE_WARNINGS = []
```

Update the Gift Cards assertion in `phase1MomenceCutover.test.js` to expect `purchasePresentation: 'popup'`.

- [ ] **Step 4: Run focused tests and Sanity validation**

Run:

```bash
cd /Users/meezyart/CODEBASE/HIPLINE/Hipline-sanity-studio
node --test scripts/enableGiftCardMenuPopup.test.js scripts/phase1MomenceCutover.test.js
npm test
```

Expected: all Node tests pass and `sanity check` exits successfully.

- [ ] **Step 5: Commit the Studio changes**

```bash
git add schemas/objects/blocks/navLink.js scripts/enableGiftCardMenuPopup.js scripts/enableGiftCardMenuPopup.test.js scripts/phase1MomenceCutover.js scripts/phase1MomenceCutover.test.js
git commit -m "feat: manage navigation popups in sanity"
```

### Task 3: Test the storefront menu-link contract

**Files:**
- Create: `test/header-menu-popup.test.js`
- Modify: `test/momence-cutover-verifier.test.js`

- [ ] **Step 1: Write the failing macro contract test**

```js
const assert = require('node:assert/strict')
const path = require('node:path')
const test = require('node:test')
const nunjucks = require('nunjucks')

const env = nunjucks.configure(path.resolve(__dirname, '../src/includes'), {
  autoescape: true
})
env.addFilter('url', value => value)
env.addFilter('absoluteUrl', value => `https://myhipline.com${value}`)

const renderLink = item => env.renderString(
  '{% from "macros/menuLink.njk" import menuLinkAttributes %}<a {{ menuLinkAttributes(item) }}>Link</a>',
  { item }
)

test('popup external links keep their direct fallback and dialog metadata', () => {
  const html = renderLink({
    name: 'Gift Cards',
    externalUrl: 'https://momence.com/gcc/253441',
    openInNewTab: true,
    openAsPopup: true
  })

  assert.match(html, /href="https:\/\/momence\.com\/gcc\/253441"/)
  assert.match(html, /target="_blank"/)
  assert.match(html, /rel="noopener noreferrer"/)
  assert.match(html, /data-embed-dialog-url="https:\/\/momence\.com\/gcc\/253441"/)
  assert.match(html, /data-embed-dialog-title="Buy Gift Cards"/)
})

test('disabled and internal links do not receive popup attributes', () => {
  const external = renderLink({
    name: 'Passes',
    externalUrl: 'https://example.com/passes',
    openAsPopup: false
  })
  const internal = renderLink({ name: 'Passes', slug: 'passes', openAsPopup: true })

  assert.doesNotMatch(external, /data-embed-dialog/)
  assert.match(internal, /href="https:\/\/myhipline\.com\/passes"/)
  assert.doesNotMatch(internal, /data-embed-dialog/)
})
```

- [ ] **Step 2: Add a failing generated-output release test**

Define a reusable valid home fixture at the top of `test/momence-cutover-verifier.test.js`:

```js
const giftCardMenuLinks = [
  '<a href="https://momence.com/gcc/253441" data-embed-dialog-url="https://momence.com/gcc/253441" data-embed-dialog-title="Buy Gift Cards">Gift Cards</a>',
  '<a href="https://momence.com/gcc/253441" data-embed-dialog-url="https://momence.com/gcc/253441" data-embed-dialog-title="Buy Gift Cards">Gift Cards</a>'
].join('')

const validHome = `<a href="https://momence.com/sign-in">Account</a><div data-embed-dialog hidden></div>${giftCardMenuLinks}`
```

Use `validHome` in every otherwise-valid test fixture. Keep the intentionally incomplete fixture unchanged and add `Home page is missing desktop or mobile Gift Cards popup navigation` after its existing missing-account issue. Then add this focused regression:

```js
test('requires popup navigation in both desktop and mobile headers', () => {
  const pages = createValidPages()
  pages['index.html'] = validHome.replace(giftCardMenuLinks, giftCardMenuLinks.split('</a>')[0] + '</a>')

  assert.deepEqual(auditGeneratedPages(pages), [
    'Home page is missing desktop or mobile Gift Cards popup navigation'
  ])
})
```

Extract the passing fixture into the exact helper used above:

```js
const createValidPages = () => ({
  'index.html': validHome,
  'schedule/index.html': '<script src="https://momence.com/plugin/host-schedule/host-schedule.js" host_id="253441"></script>',
  'passes/index.html': EXPECTED_PASS_URLS.map(url => `<a href="${url}" data-embed-dialog-url="${url}">Buy</a>`).join(''),
  'sliding-scale/index.html': SLIDING_SCALE_PASS_URLS.map(url => `<a href="${url}" data-embed-dialog-url="${url}">Buy</a>`).join(''),
  'on-demand/index.html': `<iframe src="${officialVideoPluginUrl}"></iframe><a href="${hostedVideoUrl}">Open the Video Library</a>`
})
```

The focused regression must expect exactly:

```js
assert.deepEqual(auditGeneratedPages(pages), [
  'Home page is missing desktop or mobile Gift Cards popup navigation'
])
```

- [ ] **Step 3: Run the focused tests and confirm the red state**

Run:

```bash
node --test --test-name-pattern='menu|Gift Cards popup navigation' test/header-menu-popup.test.js test/momence-cutover-verifier.test.js
```

Expected: FAIL because the macro and verifier rule do not exist.

### Task 4: Implement shared desktop/mobile popup attributes

**Files:**
- Create: `src/includes/macros/menuLink.njk`
- Modify: `src/includes/header.njk`
- Modify: `src/includes/mobile-menu.njk`
- Modify: `src/data/sections/header.js`
- Modify: `scripts/verify-momence-cutover.js`

- [ ] **Step 1: Create the shared Nunjucks macro**

```njk
{% macro menuLinkAttributes(item) -%}
href="{% if item.externalUrl %}{{ item.externalUrl | url }}{% else %}{{ ('/' + item.slug) | absoluteUrl }}{% endif %}"{% if item.openInNewTab %} target="_blank" rel="noopener noreferrer"{% endif %}{% if item.openAsPopup and item.externalUrl %} data-embed-dialog-url="{{ item.externalUrl | escape }}" data-embed-dialog-title="Buy {{ item.name | escape }}"{% endif %}
{%- endmacro %}
```

- [ ] **Step 2: Use the macro for all four navigation link locations**

Add this import at the top of both `header.njk` and `mobile-menu.njk`:

```njk
{% from "macros/menuLink.njk" import menuLinkAttributes %}
```

Replace both top-level and dropdown anchor attribute blocks in each template with:

```njk
<a {{ menuLinkAttributes(menuItem) }}>
```

and:

```njk
<a {{ menuLinkAttributes(dropMenuItem) }}>
```

- [ ] **Step 3: Project the flag at both navigation levels**

Add `openAsPopup,` beside `openInNewTab,` in both the top-level and `dropdownItems[]` portions of `src/data/sections/header.js`.

- [ ] **Step 4: Require two Gift Cards menu triggers in generated output**

Add to `scripts/verify-momence-cutover.js`:

```js
const GIFT_CARD_URL = `https://momence.com/gcc/${HOST_ID}`
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const giftCardMenuPattern = new RegExp(
  `<a\\b(?=[^>]*href="${escapeRegExp(GIFT_CARD_URL)}")(?=[^>]*data-embed-dialog-url="${escapeRegExp(GIFT_CARD_URL)}")(?=[^>]*data-embed-dialog-title="Buy Gift Cards")[^>]*>`,
  'gi'
)
const giftCardMenuLinks = home.match(giftCardMenuPattern) || []
if (giftCardMenuLinks.length < 2) {
  issues.push('Home page is missing desktop or mobile Gift Cards popup navigation')
}
```

- [ ] **Step 5: Run focused tests**

Run:

```bash
node --test --test-name-pattern='menu|Gift Cards popup navigation' test/header-menu-popup.test.js test/momence-cutover-verifier.test.js
```

Expected: all matching tests pass.

### Task 5: Publish the menu flag and verify the static build

**Files:**
- Modify: published Sanity Header Menu document `955cf4b3-685b-41cb-bd20-cb91bba391a3`
- Modify: `docs/phase-1-momence-cutover-checklist.md`

- [ ] **Step 1: Run the content migration in dry-run mode**

Run:

```bash
cd /Users/meezyart/CODEBASE/HIPLINE/Hipline-sanity-studio
npx sanity exec scripts/enableGiftCardMenuPopup.js --with-user-token
```

Expected: JSON reports `mode: "dry-run"`, exactly one Gift Cards item has `openAsPopup: true`, and the command states that no content changed.

- [ ] **Step 2: Apply the approved published-content change**

Run:

```bash
npx sanity exec scripts/enableGiftCardMenuPopup.js --with-user-token -- --apply-production
```

Expected: `Enabled the Gift Cards menu popup in revision ...`.

- [ ] **Step 3: Build and run the complete local release checks**

Run:

```bash
cd /Users/meezyart/CODEBASE/HIPLINE/Hiplinetastic-main
npm run build
npm test
npm run verify:momence-cutover
```

Expected: the Eleventy build succeeds, all tests pass, and the verifier prints `Momence Phase 1 cutover verification passed.`

- [ ] **Step 4: Inspect the generated desktop and mobile links directly**

Run:

```bash
rg -n 'data-embed-dialog-title="Buy Gift Cards"' dist/index.html
```

Expected: at least two matches, both with `href` and `data-embed-dialog-url` equal to `https://momence.com/gcc/253441`.

- [ ] **Step 5: Update the checklist and commit the storefront implementation**

Change the checklist statement saying top-menu Gift Cards remains unchanged to state that its Sanity-managed external link now uses the shared popup on desktop and mobile with the direct URL/new-tab fallback.

```bash
git add src/includes/macros/menuLink.njk src/includes/header.njk src/includes/mobile-menu.njk src/data/sections/header.js test/header-menu-popup.test.js scripts/verify-momence-cutover.js test/momence-cutover-verifier.test.js docs/phase-1-momence-cutover-checklist.md
git commit -m "feat: open managed menu links in checkout popup"
```

### Task 6: Complete local browser QA and preserve the staging gate

**Files:**
- Verify only: generated local site and future Netlify deploy preview

- [ ] **Step 1: Run the local production output**

Run:

```bash
python3 -m http.server 8080 --directory dist
```

Expected: `http://localhost:8080/passes/` loads the generated production build.

- [ ] **Step 2: Verify desktop interaction**

At desktop width, activate the top-menu **Gift Cards** link and confirm:

```text
Dialog title: Buy Gift Cards
Frame URL: https://momence.com/gcc/253441
Fallback URL: https://momence.com/gcc/253441
Close button: closes and returns focus to the Gift Cards menu link
```

- [ ] **Step 3: Verify mobile interaction**

At a 390-by-900 viewport, open the mobile menu, activate **Gift Cards**, and confirm the same dialog title, frame URL, fallback URL, close behavior, and focus return. Confirm the header and menu styling remain unchanged at both viewports.

- [ ] **Step 4: Record the staging requirement without cutting over production**

Do not push, deploy, or change the production site in this task. After Netlify provides the exact deploy-preview URL, pass that URL as the final argument to `npm run verify:momence-preview --`. Then repeat desktop/mobile Gift Cards, schedule, pass purchase, account, Video Library, keyboard, and rollback checks on that preview before production cutover.
