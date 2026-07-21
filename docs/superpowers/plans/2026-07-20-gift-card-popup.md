# Gift Card Popup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing Gift Cards card open HIPLINE's shared Momence checkout dialog without changing its design or destination.

**Architecture:** Keep presentation controlled by the existing Sanity pass record. Strengthen the generated-output release gate so the gift-card URL, like membership URLs, must render with a popup trigger on `/passes/`.

**Tech Stack:** Sanity v2 content, Eleventy/Nunjucks, browser JavaScript, Node test runner.

---

### Task 1: Require the Gift Cards popup in release output

**Files:**
- Modify: `scripts/verify-momence-cutover.js`
- Modify: `test/momence-cutover-verifier.test.js`

- [ ] **Step 1: Write the failing verifier expectation**

Define `GIFT_CARD_URL` and `EXPECTED_POPUP_URLS`, and make valid test fixtures emit `data-embed-dialog-url` for every URL in `EXPECTED_POPUP_URLS`:

```js
const GIFT_CARD_URL = `https://momence.com/gcc/${HOST_ID}`
const EXPECTED_POPUP_URLS = [
  ...EXPECTED_PASS_URLS.filter(url => url.includes('/m/')),
  GIFT_CARD_URL
]
```

- [ ] **Step 2: Run the verifier test and confirm it fails**

Run: `node --test test/momence-cutover-verifier.test.js`

Expected: failure because the verifier currently requires popup attributes only for `/m/` membership URLs.

- [ ] **Step 3: Implement the generated-output requirement**

Replace `MEMBERSHIP_PASS_URLS` with `EXPECTED_POPUP_URLS`, audit all expected popup URLs, update the error message to `approved checkout destinations`, and export `EXPECTED_POPUP_URLS` for fixtures.

- [ ] **Step 4: Run the verifier test**

Run: `node --test test/momence-cutover-verifier.test.js`

Expected: all tests pass.

### Task 2: Publish the Sanity-managed presentation change

**Files:**
- Modify external Sanity document: `c39a24ce-d220-4b4f-870e-de75a3d9621d`

- [ ] **Step 1: Read the current published record and revision**

Require the record to retain:

```js
{
  purchaseProvider: 'momence',
  purchaseUrl: 'https://momence.com/gcc/253441'
}
```

- [ ] **Step 2: Publish the guarded field change**

Apply an `ifRevisionId` Sanity patch containing only:

```js
{ purchasePresentation: 'popup' }
```

Refuse the patch if an unpublished draft exists or the provider/URL no longer match.

- [ ] **Step 3: Query the published record**

Expected: `purchasePresentation` equals `popup`, with provider and URL unchanged.

### Task 3: Rebuild and verify the checkout card

**Files:**
- Modify: `docs/phase-1-momence-cutover-checklist.md`
- Generated only: `dist/passes/index.html`

- [ ] **Step 1: Rebuild from fresh Sanity content**

Run: `npm run build`

Expected: Eleventy writes 47 pages successfully.

- [ ] **Step 2: Verify generated markup**

Run: `npm run verify:momence-cutover`

Expected: `Momence Phase 1 cutover verification passed.` The Gift Cards card must contain both:

```html
href="https://momence.com/gcc/253441"
data-embed-dialog-url="https://momence.com/gcc/253441"
```

- [ ] **Step 3: Run the full test suite**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 4: Browser-test the unchanged card and popup**

On `http://localhost:8080/passes/`, confirm the existing orange card remains visually unchanged. Activate its unique `a[data-embed-dialog-url="https://momence.com/gcc/253441"]` action and verify:

```js
{
  hidden: false,
  frameSrc: 'https://momence.com/gcc/253441',
  fallback: 'https://momence.com/gcc/253441',
  title: 'Buy GIFT CARDS'
}
```

Close the dialog and confirm focus returns to the Gift Cards action.

- [ ] **Step 5: Record the gate and commit**

Update the Phase 1 checklist to state that Gift Cards uses popup presentation with a new-tab fallback, then commit only the verifier, tests, plan/checklist, and related implementation files:

```bash
git commit -m "feat: open gift cards in checkout popup"
```

Do not push or deploy. Netlify preview verification remains a separate production-cutover gate.
