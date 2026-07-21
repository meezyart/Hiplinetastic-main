# HIPLINE Phase 1 Momence Widget Design

Date: July 20, 2026

Status: Approved design, awaiting written-spec review

Systems: Hiplinetastic Eleventy storefront, HIPLINE Sanity Studio, Momence

## Purpose

Phase 1 replaces the public and editor-facing Mindbody integration with Momence while preserving HIPLINE's existing visual design and Sanity page-builder workflow. Editors continue building pages from reorderable sections. Technical provider configuration remains structured and validated so that content changes cannot inject arbitrary scripts into the public site.

The solution is plugin-first and static-first. Eleventy renders the HIPLINE page shell and approved integration markup at build time. Momence remains responsible for schedules, checkout, accounts, entitlements, and protected video playback.

## Decisions

1. The existing Class Schedule page-builder section becomes the editor-facing **Momence Schedule Section**. Its persisted `_type` may remain `classScheduleSection` to avoid rewriting every page document.
2. Existing Mindbody fields remain hidden and readable only during migration. They are not shown as the current editing interface and are not emitted after cutover.
3. A new **External Service Section** provides a provider-neutral emergency embed option. It supports approved iframe URLs and external links, but never unrestricted HTML or JavaScript.
4. Pass and membership cards retain the current HIPLINE design. Their Buy Now actions use typed purchase fields and can open an accessible Momence checkout modal or an external Momence page.
5. The official Momence Schedule plugin controls individual class booking behavior. The official Momence Video Library is displayed inside the existing On-Demand page wrapper.
6. Momence is the correct public and editor-facing product name. Internal legacy identifiers such as `mbo` may remain temporarily only when required to read existing documents safely.

## Page-Builder Architecture

### Momence Schedule Section

The specialized schedule section remains the primary way to add a class schedule. Its Sanity interface contains:

- Disable section
- Heading and optional introductory text
- Momence Host ID, with the site-level Host ID as the default
- Teacher, location, and tag filters
- Default filter and locale
- Fallback label and Momence schedule URL

The editor never pastes a script tag. The storefront validates the public values and generates the known Momence plugin markup. The plugin script is loaded once even if a page contains more than one supported Momence surface.

### External Service Section

The page builder gains a typed `externalServiceSection` with:

- Disable section
- Heading and optional introductory text
- Provider label
- Presentation mode: `inline`, `popup`, or `external-link`
- Embed source: an HTTPS iframe URL for inline or popup modes
- Destination URL for the external-link mode and as a fallback
- Descriptive iframe title
- Button or fallback label
- Desktop height with bounded minimum and maximum values
- Optional mobile height
- Optional provider preset selected from an allowlisted list

The generic section does not accept raw HTML, `<script>` elements, inline event handlers, or credentials. A future script-based service receives a small provider adapter in code; existing page documents and the editor workflow do not need to be redesigned.

### Pass Documents and Pass Sections

The existing Class Pass Section continues selecting and ordering pass documents. Each pass document gains current purchase fields:

- Purchase provider: `momence` or `external`
- Secure purchase URL
- Purchase label
- Presentation mode: `popup` or `external-link`
- Optional public Momence product identifier

Legacy Mindbody purchase data remains hidden while the migration is reversible. Once every active pass has a verified Momence destination and the rollback window has closed, the legacy fields can be removed in a later cleanup.

## Storefront Components

The storefront adds four bounded components:

1. **Configuration normalizer** validates provider IDs, URLs, presentation modes, dimensions, and fallback actions. Invalid content becomes a safe fallback rather than executable markup.
2. **Provider renderer** maps an approved provider preset to known plugin or iframe markup. Momence Schedule is the first script-based adapter.
3. **External service renderer** displays the existing HIPLINE section wrapper and either an iframe, popup trigger, or external link.
4. **Accessible checkout/embed dialog** provides the shared popup shell for pass purchases and eligible external services.

The page-section dispatcher adds the new typed section without changing the rendering of unrelated sections.

## Modal Behavior

Pass and membership Buy Now buttons default to the HIPLINE-styled Momence modal when the URL is eligible for framing. The dialog includes:

- A dimmed backdrop and centered desktop panel matching the existing checkout pattern
- A full-height mobile presentation that avoids nested page scrolling where possible
- A visible close button
- Focus movement into the dialog, focus trapping, Escape closing, and focus restoration
- Body scroll locking while open
- A descriptive iframe title and loading state
- An **Open checkout in a new tab** fallback
- Iframe cleanup when closed so checkout state does not leak between products

If framing is blocked, the dialog cannot initialize, or JavaScript is unavailable, the original anchor still opens the approved external Momence purchase URL. The Schedule plugin keeps its own class-booking interaction instead of being wrapped in the HIPLINE checkout dialog.

## Data Flow

1. An editor adds or edits a page section or pass document in Sanity.
2. Sanity validates the structured fields and publishes content.
3. Eleventy retrieves published content during a static build.
4. Normalizers discard unsupported values and produce a small public configuration object.
5. Nunjucks renders the existing HIPLINE layout plus known Momence or iframe markup.
6. Momence loads live schedule, checkout, account, or video content in the visitor's browser.
7. A missing or failed provider experience exposes the configured external fallback.

No API token, OAuth secret, payment data, account credential, or arbitrary script passes through Sanity or generated browser code.

## Migration and Compatibility

The migration is additive before it becomes destructive:

1. Add and deploy the new Sanity fields and page-section type.
2. Populate site-level Momence settings and pass purchase fields with a guarded migration.
3. Add the On-Demand Momence section to the intended page.
4. Render Momence first while legacy data remains hidden and readable.
5. Verify every integration on a staging deployment.
6. Remove HealCode and Mindbody scripts, tags, links, and generated output only after staging approval.
7. Retain hidden legacy document data through the agreed rollback window, then remove it in a later cleanup.

The Sliding Scale destination must correspond to a real Momence product or approved hosted page. The migration must not invent a product, price, or URL.

## Error Handling and Security

- Require HTTPS for all provider and fallback URLs.
- Allow only configured hostnames for inline and popup frames.
- Reject lookalike domains, URLs with embedded credentials, executable protocols, raw HTML, and raw JavaScript.
- Bound iframe dimensions to prevent unusable layouts.
- Give every iframe a descriptive title.
- Keep a usable external fallback for each Momence surface.
- Let one failed provider section fail independently without preventing the rest of the page from rendering.
- Introduce Content Security Policy changes in report-only mode before enforcement.
- Keep legacy data out of normal editor forms and generated production output.

## Testing and Release Gates

### Automated checks

- Unit tests for URL, hostname, provider, presentation-mode, and dimension normalization
- Template tests for Momence Schedule, generic iframe, popup, external link, and fallback output
- Dialog controller tests for open, close, Escape, focus restoration, and repeated use
- Generated-output checks proving that production pages contain no Mindbody or HealCode scripts, tags, links, or retired identifiers
- Pass mapping checks covering every enabled pass
- Build verification using the project's supported Node/OpenSSL configuration

### Browser checks

- Schedule, Passes, On-Demand, account, gift card, and one generic external-service section
- Keyboard-only and screen-reader-oriented dialog checks
- Representative desktop and mobile widths
- Popup fallback behavior when an iframe is blocked
- Visual comparison against the current live HIPLINE design
- Sanity authoring check: add, reorder, disable, configure, and publish each new or changed section

### Production cutover gates

Production cutover requires all of the following:

- Every active pass has an approved Momence destination.
- Sliding Scale has an approved real destination or is intentionally disabled.
- The On-Demand section exists in published Sanity content.
- The Momence Schedule and account actions work from generated output.
- No production output contains Mindbody or HealCode runtime dependencies.
- Staging passes desktop, mobile, keyboard, fallback, and visual review.
- The client or project owner approves staging before production publishing.

## Non-Goals

- Rebuilding Momence checkout, account, payments, schedule management, entitlements, or protected playback
- Allowing unrestricted HTML or JavaScript in Sanity
- Migrating HIPLINE away from Eleventy or its existing page-builder design
- Adding unrelated Momence products or Phase 2 API-driven experiences
- Removing legacy Sanity data before verified cutover and rollback coverage

## Acceptance Criteria

The design is complete when the client can build pages from the existing Sanity page-section workflow, place a specialized Momence Schedule or safe universal external-service widget, manage pass destinations without Mindbody fields, and choose supported inline, popup, or external presentation. The public storefront must preserve its current design, keep transactions in Momence, provide accessible modal and fallback behavior, and pass staging review before any production cutover.
