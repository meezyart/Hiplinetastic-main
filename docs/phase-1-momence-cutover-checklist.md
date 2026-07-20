# HIPLINE Phase 1 Momence Cutover Checklist

Status date: 2026-07-20  
Release profile: `plugin`  
Storefront branch: `codex/momence-integration-spec`

## Implemented in code

- The Schedule plugin is rendered from typed, validated attributes. The current legacy embed is parsed only when it matches the approved Momence schedule script.
- The header account action opens `https://momence.com/sign-in` and no longer uses HealCode.
- The global Mindbody runtime and HealCode pass fallback have been removed after the approved pass URLs were published.
- Pass cards use typed managed purchase fields and the shared accessible Momence checkout dialog. Legacy purchase links are not trusted because the previous 10 Class field pointed to Momence's 5 Class product.
- Sanity has a Momence settings singleton, typed Schedule controls, typed pass purchase fields, and a Momence Video Library page section.
- The Video Library section uses the existing Hipline page styles around a Momence-hosted iframe and provides a direct hosted fallback link.

## Site-level Momence values to publish in Sanity

| Field | Value |
|---|---|
| Account URL | `https://momence.com/sign-in` |
| Schedule host ID | `253441` |
| Schedule teacher IDs | `[]` |
| Schedule location IDs | `[]` |
| Schedule tag IDs | `[]` |
| Schedule default filter | `show-all` |
| Schedule locale | `en` |
| Video Library URL | `https://momence.com/video/courses/253441` |
| Gift Card URL | `https://momence.com/gcc/253441` |

## Published pass cutover inventory

The Passes page currently references twelve pass records. Every destination below was verified against HIPLINE's public Momence host feed and the public Momence product metadata for host `253441` on 2026-07-20, then published to Sanity in transaction `NNcodpNt49gA5QX6pFGmPK`.

| Pass | Sanity document ID | Current status |
|---|---|---|
| NEWBIE PASS | `186732f8-6ae0-4105-a627-17e4f216ff2d` | `https://momence.com/m/768424` |
| HIPLINE+ | `9ad5bc4d-8c48-41b7-a578-ea342bf830e7` | `https://momence.com/m/768126` |
| HIPLINE BASIC | `41149699-c4fb-408a-8f87-360d47989ddf` | `https://momence.com/m/768425` |
| VIRTUAL ONLY | `014b7147-56fc-4bf8-8b66-e3035e1e55cb` | `https://momence.com/m/768430` |
| SINGLE CLASS | `cd7ad476-64e7-4604-a195-7fa1253ae3e5` | `https://momence.com/m/766999` |
| 5 CLASS BUNDLE | `5aef577e-ceda-4830-b13f-c56995aaa316` | `https://momence.com/m/766994` |
| 10 CLASS BUNDLE | `a83943ae-6969-4483-88a7-b89760eeac2c` | `https://momence.com/m/766996` |
| 20 CLASS BUNDLE | `480ebb36-78d7-437a-b876-33a7112a2170` | `https://momence.com/m/766998` |
| POP-UP CLASS | `139b517d-c008-4568-9570-e6d6882bf51d` | `https://momence.com/m/767001` |
| ON DEMAND | `a2905cb2-99ba-4086-ac77-9818992fd46e` | `https://momence.com/m/776335` |
| GIFT CARDS | `c39a24ce-d220-4b4f-870e-de75a3d9621d` | `https://momence.com/gcc/253441` |
| CHILDCARE | `6af01e1e-32a9-4fae-b377-aeb983987d10` | `https://momence.com/m/767010` |

The previously noted `https://momence.com/m/766994` mapping for the 10 Class Bundle was incorrect: Momence identifies product `766994` as the 5 Class Pass. The verified 10 Class product is `766996`.

The Sanity Studio includes `scripts/phase1MomenceCutover.js`. It re-verifies every Momence product before showing or applying an atomic content transaction. The approved transaction was published on 2026-07-20, creating the managed `/on-demand/` page and changing only the existing On-Demand navigation item from an external link to that page. Its default mode remains read-only:

```bash
sanity exec scripts/phase1MomenceCutover.js
```

Use the apply command only for a deliberate future content correction:

```bash
sanity exec scripts/phase1MomenceCutover.js --with-user-token -- --apply-production
```

## Remaining legacy Mindbody content

The Sliding Scale page still contains one Mindbody URL in Sanity document `0ea360c9-1268-47b5-a70c-2bf9c71adaf8`, at `pageSections[1].mainContent[3].markDefs[0].href`. HIPLINE's public Momence schedule and product catalog currently expose only the fixed-price `$30` Pop-Up Class; they do not expose the page's `$20`–`$30` sliding-scale choice.

Momence supports a native **Customers pick price / sliding scale pricing** option for classes and subscriptions. The preferred resolution is to configure the relevant Pop-Up class or class template in Momence with a `$20` lower limit and `$30` upper limit, then publish its approved Momence checkout destination as one labelled action through **External Service Section → Client-managed actions**. This preserves HIPLINE's existing Tier 1 / Tier 2 / Tier 3 guidance while letting the customer choose the exact amount inside Momence checkout. See [Momence's class pricing guidance](https://help.momence.com/en/articles/12027801-settings-restrictions-faq-s-classes).

If HIPLINE deliberately prefers three fixed-price products instead, the same Sanity section supports up to six separately labelled HTTPS actions. In either case, replace the legacy Mindbody rich-text link only after the approved Momence destination or destinations exist, then verify the generated page has no Mindbody output.

## Generated-output release gate

After each production-content rebuild, run:

```bash
npm run verify:momence-cutover
```

The command fails unless the generated site has no HealCode or Mindbody output, includes the approved Momence account and Schedule integrations, contains all twelve verified pass destinations, and generates the managed `/on-demand/` page with both the video iframe and hosted fallback. Its current failure is expected only until Sliding Scale is resolved.

After Netlify creates a deploy preview, run the same structural release rules against the five required staging routes:

```bash
npm run verify:momence-preview -- https://DEPLOY-PREVIEW-URL
```

This command refuses `myhipline.com`, requires HTTPS, rejects routes that redirect away from the preview host, and does not replace the desktop, mobile, keyboard, or visual review below.

## Verification evidence

Verification run: 2026-07-20  
Storefront commit: `e3bee48` (`feat: complete Phase 1 Momence storefront cutover`)  
Sanity Studio commit: `476db79` (`feat: finish Phase 1 Momence editor controls`)  
Node: `v22.23.0`

- `npm run build` — passed against current production Sanity content; Eleventy wrote 47 pages.
- `npm test` — 39 tests passed, 0 failed.
- `node --test scripts/phase1MomenceCutover.test.js` in the Sanity Studio — 7 tests passed, 0 failed.
- `npm run build` in the Sanity Studio — passed.
- Source scan — no storefront template contains the HealCode or Mindbody runtime.
- `npm run verify:momence-cutover` — correctly blocked release because `sliding-scale/index.html` still contains the legacy Mindbody purchase link.

Review fixes included before staging:

- Removed two unused legacy partials containing HealCode markup and raw embed compatibility behavior.
- Ensured heading-less External Service sections receive an accessible label instead of a broken `aria-labelledby` reference.
- Scoped the external-embed fallback audit to the same rendered section, preventing unrelated HTTPS links from satisfying the safety gate.
- Removed a duplicate AOS initializer that depended on an untracked deployment asset.

Local browser review on 2026-07-20 covered `/`, `/schedule/`, `/passes/`, `/on-demand/`, and `/sliding-scale/` at desktop and mobile widths. All ten route/viewport combinations returned `200` with no horizontal overflow, broken images, console errors, page errors, or failed first-party requests. The checkout dialog opened from a visible pass action, moved focus to its close control, closed with Escape, and returned focus to the pass action. Momence's current Video Library response rendered successfully but reported that the host has no video courses available; the direct hosted fallback remains visible.

Momence account state inside the checkout iframe is a known non-blocking limitation. Cross-site iframe sessions can be restricted or partitioned by browser third-party storage policy, and the HIPLINE parent page cannot grant Momence access to its authentication cookies. Keep the in-dialog **Open checkout in a new tab** fallback and the header account link so users can establish a normal first-party Momence session without closing the HIPLINE tab. Do not attempt a parent-page storage workaround unless Momence documents support for an embedded Storage Access API flow.

## Launch gates

- [x] Publish the `settingsMomence` singleton with the values above.
- [x] Resolve and verify all twelve active pass destinations against HIPLINE's public Momence catalog.
- [x] Publish the Momence settings and pass transaction with an authenticated Sanity account.
- [ ] Configure client-managed Sliding Scale actions in Sanity and replace the page's remaining Mindbody rich-text link.
- [x] Prepare the managed `/on-demand/` page and exact navigation replacement in the guarded cutover transaction.
- [x] Publish the `/on-demand/` page and navigation replacement with an authenticated Sanity account.
- [x] Confirm the Video Library response omits `X-Frame-Options` and frame-blocking CSP headers; retain the hosted fallback link for runtime failures.
- [ ] Browser-test the published Video Library iframe on staging and production.
- [ ] Run `npm run verify:momence-preview -- https://DEPLOY-PREVIEW-URL` successfully against the Netlify preview.
- [ ] Rebuild and confirm no generated output contains `healcode-widget`, `widgets.mindbodyonline.com`, or `clients.mindbodyonline.com`.
- [ ] Run `npm run verify:momence-cutover` successfully against the production-content build.
- [x] Remove the temporary HealCode pass fallback and global runtime after all published pass cards use approved URLs.
- [ ] Test Schedule, purchases, account access, Video Library, mobile layout, keyboard navigation, and deployment rollback on staging.
