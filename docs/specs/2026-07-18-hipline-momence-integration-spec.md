# Hipline Momence Integration Specification

Status: Draft for review  
Date: July 18, 2026  
Systems: Static Hiplinetastic Eleventy storefront, Hipline Sanity Studio, Momence  

## Problem Statement

Hipline's public website is managed through Sanity and rendered as a static Eleventy storefront. Scheduling, passes, account access, and several purchase actions still depend on Mindbody and HealCode. Some Momence links and a schedule embed have been placed into fields originally designed for Mindbody, creating a mixed integration that is difficult to manage and unsafe to extend.

Hipline needs to remove Mindbody without redesigning the site. Momence functionality must feel like part of the existing Hipline experience, remain manageable in Sanity, work on mobile and with assistive technology, and avoid exposing private API credentials in browser code or CMS content.

Momence also provides video, community, appointments, gift cards, lead forms, reviews, and webchat. These capabilities need deliberate placement rather than being embedded indiscriminately across the site.

## Approved Client Phase 1 Release

The approved Phase 1 release profile is `plugin`. It includes the official Momence Schedule and Video Library experiences inside Hipline-managed wrappers, Momence pass purchase links, the Momence account action, essential Mindbody and HealCode removal, typed Sanity controls, mobile and accessibility testing, deployment, and launch fixes.

Custom API-rendered video cards, serverless adapters, Community, Appointments, Reviews, Lead Forms, Webchat, advanced Content Security Policy work, and additional custom pages are optional Phase 2 work. The implementation stages later in this document describe the delivery order inside the approved client phase; they are not separately quoted client phases.

## Goals

1. Remove all production Mindbody and HealCode dependencies.
2. Preserve Hipline's current typography, colors, spacing, pricing cards, buttons, animation language, and responsive behavior.
3. Give editors structured Momence controls in Sanity without requiring HTML, scripts, or iframe snippets.
4. Use the Momence schedule plugin for the live schedule.
5. Present the official Momence Video Library inside a Hipline-styled page wrapper without rebuilding Momence account, purchase, entitlement, or playback behavior.
6. Keep purchases, authentication, booking, and protected playback inside approved Momence flows.
7. Provide accessible, mobile-friendly presentation for inline embeds and popup workflows.
8. Make each integration independently disableable and recoverable.

## Non-Goals

- Rebuilding Momence checkout, payment processing, authentication, entitlement checks, or protected video playback.
- Redesigning Hipline's public website.
- Migrating historical customer, booking, or payment data.
- Exposing the Momence legacy API token in Sanity, generated HTML, JavaScript bundles, or browser network requests.
- Replacing all curated Hipline testimonials with Momence reviews.
- Building a fully custom schedule during the first migration phase.
- Enabling every active Momence application merely because it is available.

## Solution Overview

The approved Phase 1 integration will use two presentation strategies:

1. **Managed Momence embeds:** Schedule and Video Library experiences are generated from validated Sanity fields and displayed inside existing Hipline page wrappers.
2. **Managed external actions:** Pass purchases, account access, gift cards, and fallback actions use approved Momence URLs displayed with existing Hipline buttons and cards.

Native Hipline rendering of Momence video metadata is reserved for optional Phase 2 and requires a separately approved API contract and credential strategy.

Sanity controls content and placement. Momence remains the transactional source of truth. The storefront never accepts arbitrary executable markup from editors.

## Static Site Constraint

Hiplinetastic remains a static Eleventy site. Pages and Sanity-managed editorial content are generated into the deployment output during a build. This project does not introduce server-side page rendering, a persistent application server, or a client-side single-page application.

Momence components have different freshness behavior within that constraint:

- Official Momence plugins load their live content from Momence after the static page loads.
- A custom Video Library can retrieve Momence data securely during the Eleventy build and render a static snapshot. It becomes current again after a new deployment.
- If updates must appear between deployments, the static Video Library may load public, normalized JSON from a small optional serverless adapter. The HTML page remains static; only the video data request is dynamic.
- The browser must never call a token-protected Momence API directly. If no serverless adapter is approved, use build-time video data or the official Momence Video Library plugin.

The current deployment publishes the generated `dist` directory and does not yet configure a functions directory. Adding a function is therefore an explicit infrastructure decision, not an assumed part of the static storefront.

## Video Library Presentation Options

### Option A: Official Momence plugin

- Best fit for the existing static deployment.
- Loads current video inventory directly from Momence without a Hipline API token or website rebuild.
- Keeps Momence search, collections, purchase, account, and access behavior intact.
- Hipline can style the page hero, introduction, outer container, spacing, background, loading area, and fallback action.
- Hipline cannot directly restyle the plugin's internal cards, filters, typography, or buttons because the Video Library is rendered in a cross-origin Momence iframe.

### Option B: Custom static video grid

- Uses the bundled `courses-grid-1` pattern and provides full Hipline visual control.
- Retrieves Momence video metadata securely during the Eleventy build.
- Requires a new deployment before Momence inventory changes appear on the public page.

### Option C: Custom grid with runtime data

- Uses the same Hipline grid with between-deployment freshness.
- Keeps the Eleventy page static but introduces a small serverless data adapter and its operational responsibilities.

The recommended first release is Option A inside a Sanity-managed Hipline section. The schema should keep presentation details separate from the provider so that Option B or C can replace the iframe later without rebuilding the page model.

The selected Video Library release profile must be explicit:

- `plugin`: live Momence iframe, no Hipline API credential, and limited internal styling.
- `static-grid`: build-time Momence API fetch, fully Hipline-styled cards, and deployment-based freshness.
- `runtime-grid`: Hipline-styled cards backed by an optional serverless adapter and cache-window freshness.

Requirements and acceptance tests that are specific to a profile apply only after that profile is selected.

## User Stories

1. As a visitor, I want to see the current class schedule inside the Hipline website so that I can find a class without navigating an unfamiliar interface.
2. As a visitor, I want schedule filters to work on mobile so that I can find classes by date, instructor, location, or tag.
3. As a visitor, I want pass buttons to open the correct Momence purchase flow so that I can buy the pass shown on the Hipline card.
4. As a returning member, I want the account button to take me to the correct Momence sign-in flow.
5. As a visitor, I want to browse on-demand videos in a design consistent with Hipline.
6. As a visitor, I want newly published Momence videos to appear according to the selected release profile: live through the plugin, after deployment for the static grid, or within the configured cache window for the runtime grid.
7. As a visitor, I want to search and filter available videos by supported Momence metadata.
8. As a visitor, I want a clear empty state when no videos match my filters.
9. As a visitor, I want a clear recovery action when video data cannot be loaded.
10. As a customer, I want video purchase and playback actions to honor my Momence account and entitlements.
11. As a visitor, I want appointment and inquiry workflows to open without losing my place on the Hipline page.
12. As a keyboard user, I want popup workflows to trap focus, close with Escape, and return focus to the trigger.
13. As a mobile visitor, I want popup workflows to use the available screen without nested scrolling traps.
14. As a screen-reader user, I want embeds, dialogs, filters, and loading states to have meaningful labels and announcements.
15. As an editor, I want to add or reorder a Momence section using the existing Sanity page builder.
16. As an editor, I want to select a supported Momence component type without copying code from the Momence dashboard.
17. As an editor, I want to choose whether a Momence action appears inline, full-page, in a popup, or as an external link.
18. As an editor, I want to disable an integration without deleting its settings.
19. As an editor, I want validation to reject unsupported hosts, malformed URLs, and incomplete appointment settings.
20. As an editor, I want pass purchase URLs to be independent from retired Mindbody data.
21. As an editor, I want to feature selected videos and control headings and introductory content in Sanity.
22. As an operator, I want API failures to degrade to an approved Momence link or plugin.
23. As an operator, I want private credentials stored only in deployment environment variables.
24. As an operator, I want cached API responses so that Momence outages or rate limits do not immediately break the page.
25. As an operator, I want integration failures to be observable without exposing customer information.
26. As a developer, I want one validated Momence configuration model so that every page does not invent its own embed logic.
27. As a developer, I want a single server-side video adapter so that legacy and newer Momence authentication can be changed without rewriting the UI.
28. As a developer, I want the old HealCode script removed only after all dependent widgets have been migrated.
29. As a developer, I want targeted tests around URL validation, response normalization, fallbacks, and dialog behavior.
30. As the site owner, I want the migration to be reversible by integration so that Hipline can recover quickly from a Momence problem.

## Page Placement Decisions

### Required migration pages

- **Schedule:** Replace the legacy schedule field with a structured Momence schedule section. Render it as a full-width page section inside the existing Hipline container.
- **Passes:** Keep the current Hipline pricing cards. Replace Mindbody widget configuration with validated Momence purchase URLs. The supplied Single Class URL maps to the existing Single Class card.
- **Global header:** Replace HealCode login/account and cart behavior with approved Momence actions. Preserve the existing header icon and CTA treatment.

### Recommended Momence surfaces

- **Home:** Optional reviews preview and calls to Schedule and On-Demand.
- **Events:** Use as the future event discovery page. It may use Momence data rendered with the existing theme event-card pattern if a suitable API contract is available.
- **Contact Us:** Optional lead form and global webchat entry point.
- **Livestream FAQ:** Link to On-Demand rather than embedding the full library inside the FAQ.
- **Love Club:** Optional community-post preview or community action.
- **Party Pop and Rent Hipline:** Optional appointment or lead-form popup when the corresponding Momence service or board exists.
- **Child Care, Restorative Classes, and Pop In:** Use only targeted schedule, booking, or purchase actions that correspond to actual Momence inventory.
- **Class Menu:** Keep editorial content and route class actions to the Momence schedule.

### Pages requiring no direct integration

Choreographers, Sliding Scale, Why We Are, Meet the Owner, Join the Team, FAQ, The 411, Covid Policy, and Press remain editorial unless a later business requirement adds a specific Momence action.

## Sanity Content Model

### Site-level Momence settings

Create a singleton configuration document with:

- Public host ID.
- Account/sign-in URL.
- Schedule defaults.
- On-Demand fallback URL.
- Gift-card URL.
- Webchat enabled state and public configuration.
- Allowed Momence hostname list.
- Default locale.
- Default theme colors mapped to Hipline design tokens.

No API token, OAuth client secret, raw script, or raw iframe field is permitted.

### Typed Momence page sections

Add narrow, typed objects to the existing page-section array rather than one universal object with many invalid combinations:

- `momenceScheduleSection` owns schedule-specific filters, layout options, heading, introduction, enabled state, and fallback action.
- `momenceVideoSection` owns the selected release profile, heading, introduction, presentation settings, filters supported by the verified data contract, enabled state, and fallback action.
- `momenceEmbedSection` is limited to iframe integrations with genuinely shared behavior, such as appointments, lead forms, reviews, or community content. It owns the approved component type, public URL or identifier, inline/dialog presentation, heading, enabled state, and fallback action.

Account, gift-card, and webchat defaults remain in the site-level Momence settings document. Pass destinations remain on pass documents.

Visual variants are named choices such as `default`, `light`, or `accent`. Actual colors and design tokens remain in storefront code rather than becoming arbitrary editor-entered values.

### Pass migration

Replace the Mindbody-specific pass fields with:

- Purchase provider, initially restricted to Momence or external.
- Validated purchase URL.
- Button label.
- Open-in-new-tab setting, defaulting to true for external checkout.
- Optional Momence membership or product identifier for future server-side validation.

Existing pass name, price, description, bullets, color, order, and disabled state remain unchanged.

Legacy Mindbody fields remain temporarily readable during migration but are hidden from normal editing after data conversion.

### Video library configuration

Sanity controls presentation rather than transactional data:

- Page heading and introduction.
- Featured video identifiers.
- Allowed collection filters.
- Default sort and filter.
- Card density and section variant.
- Empty-state copy.
- Error-state copy and fallback CTA.

Video title, availability, thumbnail, teacher, collection, price, and entitlement-related state come from Momence and are not duplicated as editable Sanity content.

## Deep Modules

### 1. Momence configuration module

Provides one validated, normalized configuration object to templates. It owns URL allow-listing, defaults, component-specific validation, and safe serialization.

### 2. Momence embed renderer

Accepts the normalized public configuration and produces only known Momence plugin markup. It does not accept arbitrary HTML. Each component type has an explicit renderer and fallback.

### 3. Momence video adapter

Runs in a server-side or serverless environment. It owns authentication, Momence request construction, timeout behavior, response validation, normalization, caching, and removal of private or unnecessary fields.

Its public response is provider-neutral so that Momence authentication or endpoint changes do not require changes to the card UI.

### 4. Hipline video library

Renders provider-neutral video records using existing Hipline and MaxCoach-derived card, button, spacing, and animation patterns. It owns loading, search, supported filters, pagination or incremental loading, empty states, error recovery, and action links.

### 5. Accessible Momence dialog

Provides a reusable dialog for appointments, gift cards, and lead forms. It owns lazy loading, focus trapping, Escape and backdrop closing, focus restoration, scroll locking, responsive sizing, dynamic iframe height messages, and iframe cleanup after closing.

## Video Data Contract

The browser-facing video endpoint returns only fields required for display:

- Stable public identifier.
- Title.
- Short description when available.
- Thumbnail URL.
- Teacher or presenter display names.
- Collection labels.
- Duration when available.
- Display price or access label when safely available.
- Public purchase, detail, or playback action URL.
- Publication or ordering date when available.
- Availability state.

The adapter must tolerate missing optional fields. Unknown provider fields are discarded. Error responses use a stable application error shape and never include credentials, upstream authorization headers, or raw upstream payloads.

This contract is provisional until an API contract spike verifies representative free, paid, subscription-only, and unavailable videos. The spike must confirm pagination, stable identifiers, thumbnails, duration, teachers, collections, availability, and action URLs. Logged-out and logged-in flows must both reach the correct Momence purchase or playback behavior. The custom grid must not display filters, prices, or access claims for fields the API does not reliably supply.

## Freshness and Caching

- **Static-build mode:** Video data is requested securely during the Eleventy build, rendered into static HTML, and refreshed on the next deployment. If Momence data cannot be validated, the deployment fails and Netlify keeps the last successful deployment live.
- **Optional runtime mode:** The static page requests normalized public data from a serverless adapter after loading. Successful responses are cached for a short configurable period, initially 5–15 minutes.
- In runtime mode, stale data may be served briefly during transient Momence failures when the hosting platform supports stale-while-revalidate behavior.
- The UI provides a Momence fallback action if neither built, fresh, nor cached data is available.
- Schedule freshness remains the responsibility of the official Momence plugin.

## Styling Decisions

- Reuse the current Hipline pricing-card component for passes.
- Adapt the bundled MaxCoach event-card pattern for future native event rendering.
- Use the bundled MaxCoach `courses-grid-1` template as the primary visual reference for the Video Library. Reuse its two-column desktop, one-column mobile grid; thumbnail-first card structure; result count; sort area; access badge; metadata row; and incremental "Load More" pattern.
- Map Momence video data into that pattern: thumbnail to the card image, access state to the badge, price or subscription access to the price area, video title to the card heading, and teacher, collection, or duration to the metadata row.
- Keep the established Hipline colors, typography, buttons, and animation timing in place of the template's generic course-demo treatment.
- Implement search, filtering, sorting, and incremental loading as accessible application controls. Do not depend on the template's demo-only Selectric behavior or placeholder links.
- Use the bundled popup visual shell as a starting point, but replace its incomplete behavior with an accessible dialog controller.
- Do not import a second theme stylesheet or use the bundled Gilkan theme.
- Style the containers, headings, controls, and fallback states. Treat the inside of cross-origin Momence iframes as vendor-controlled except for options officially supported by Momence.

## Design Concept: Hipline Clubhouse

Use MaxCoach as structural scaffolding rather than a second visual identity. Hipline continues to own the typography, purple, hot-pink, and seafoam palette, gradient buttons and cards, photography, playful language, and restrained motion.

A reusable action rail connects the four primary customer intentions:

- **Move:** Schedule and upcoming workshops.
- **Watch:** On-Demand Video Library.
- **Book:** Appointments and private services.
- **Belong:** Community, reviews, and Love Club.

The rail may appear on Home and the Online hub, then reduce to relevant contextual actions on interior pages. On mobile it becomes horizontally scrollable pills or stacked action cards with clear text labels.

Approved MaxCoach-derived patterns:

- `courses-grid-1` supplies the Video Library grid, card anatomy, result count, metadata row, access badge, and incremental loading structure.
- `event` supplies workshop and pop-up highlight cards above or beside the live Schedule plugin. It does not replace the live schedule.
- `event-details` supplies the visual composition for appointment service summaries before opening Momence booking.
- `course-details-free` supplies an understated tab rail for Watch, Community, and Reviews on a possible Online hub.
- `blog-grid` supplies Community preview cards only when Momence exposes trustworthy public post data and destinations.
- `contact-us` supplies the section composition around a Momence Lead Form; its demo submission code is not used.
- `shopping-cart-empty` supplies the centered icon, message, and recovery-action grammar for empty or failed API-rendered content.
- Hipline's existing testimonial slider remains the primary Reviews presentation.
- Hipline's existing colorful pass cards remain the primary Passes and Gift Cards presentation.

Required adaptations:

- Add Hipline-specific modifiers rather than copying theme components unchanged, because some inherited MaxCoach colors are generic pink, brown, or gray.
- Make booking and purchase actions permanently visible on touch devices rather than hover-only.
- Use fixed media aspect ratios, explicit image dimensions, lazy loading, and accessible names.
- Keep large Schedule, Video, and Community experiences on full pages rather than inside desktop-style dialogs.
- Keep webchat and the existing scroll-to-top control in separate fixed positions so they do not collide.

Do not reuse MaxCoach login, account, dashboard, cart, checkout, curriculum, or progress interfaces. Those patterns would incorrectly imply that Hipline owns Momence authentication, commerce, or entitlements.

## Interaction Decisions

- Schedule and Video Library are full-page experiences, not popup content.
- Community Posts are full-page or inline depending on the amount of live content.
- Appointments, Gift Cards, and Lead Forms may use the accessible dialog when their content behaves well at mobile widths.
- Reviews are inline sections.
- Webchat is a global floating integration with a site-level enable switch.
- External Momence purchase and account flows clearly indicate that a new tab or Momence-hosted step will open when applicable.
- Iframes are lazy-loaded unless they are the primary content visible near the top of the destination page.

## Security and Privacy Requirements

- Rotate the legacy token disclosed during project discussion before using the API.
- Store API tokens, OAuth client secrets, and refresh tokens only in protected deployment environment variables.
- Never expose private credentials through Eleventy data files, Sanity documents, generated HTML, client JavaScript, logs, or error messages.
- Restrict outbound adapter requests to approved Momence endpoints.
- Restrict editor-entered URLs to HTTPS and approved Momence hosts unless the field explicitly permits a general external destination.
- Validate and normalize all upstream responses before returning them to browsers.
- Use timeouts and bounded retries for upstream requests.
- Apply an appropriate Content Security Policy for required Momence scripts, frames, images, and connections.
- Introduce Content Security Policy in report-only mode first. Verify Schedule, Video Library, Appointments, checkout, account, images, and API connections before enforcement.
- Do not collect or proxy Momence customer payment, authentication, or health/intake-form data through the Hipline adapter.

## Accessibility Requirements

- Maintain logical heading order around every Momence section.
- Give every iframe a descriptive title.
- Ensure all triggers are real buttons or links with visible focus states.
- Meet WCAG AA contrast for Hipline-owned text and controls.
- Support keyboard operation for search, filters, tabs, and dialogs.
- Announce video loading, empty, and error states appropriately.
- Prevent focus from entering hidden dialogs.
- Return focus to the original trigger after a dialog closes.
- Avoid nested page and iframe scrolling on mobile whenever possible.
- Respect reduced-motion preferences for Hipline-owned animation.

## Failure and Fallback Behavior

- A failed schedule plugin displays configured explanatory text and a direct Momence schedule link.
- A failed video request displays the configured error state and On-Demand fallback link.
- A malformed Sanity configuration fails closed and does not output arbitrary markup.
- A missing appointment board disables the trigger in preview and produces a clear editor validation error.
- A dialog that cannot initialize uses its external Momence URL instead.
- Failure of one Momence component does not prevent unrelated page sections from rendering.

## Migration Plan

### Implementation stage 0: Inventory and launch inputs

- Rotate the exposed legacy token before any later API-backed profile is approved.
- Export a mapping of every active pass and its Momence destination.
- Confirm the Schedule plugin configuration, Video Library URL or embed configuration, account URL, and fallback URLs.

### Implementation stage 1: Structured Sanity foundation

- Add site-level Momence settings.
- Add the reusable Momence section.
- Add pass purchase fields and validation.
- Add editor previews and migration-safe legacy field handling.

### Implementation stage 2: Core Mindbody replacement

- Replace the Schedule page integration.
- Replace pass actions.
- Replace the global account action.
- Confirm no remaining page requires HealCode, then remove the global HealCode script and legacy widget templates.

### Implementation stage 3: Video Library plugin

- Launch the official Video Library plugin inside the Sanity-managed Hipline wrapper.
- Add the Sanity-managed On-Demand page and navigation entry.
- Verify plugin loading, account and purchase flows, responsive behavior, and the hosted fallback action.

### Optional Phase 2: Additional Momence components

- Add the accessible dialog.
- Enable approved Appointments, Gift Cards, and Lead Forms.
- Add inline Reviews and optional Community content.
- Enable webchat only after privacy, mobile, and visual review.

### Post-launch cleanup and observability

- Remove hidden legacy Mindbody fields after a safe migration period.
- Add monitoring for adapter failures and fallback usage.
- Document editor workflows and operational recovery steps.

## Testing Decisions

Tests verify externally observable behavior rather than template implementation details.

### Configuration tests

- Supported component and presentation combinations normalize correctly.
- Unsupported URLs, raw markup, and missing required identifiers are rejected.
- Optional defaults are applied consistently.

### Embed tests

- Each component produces the approved public markup and attributes.
- Disabled or invalid integrations render no executable embed.
- Fallback links remain available when scripts fail.

### Optional Phase 2: Video adapter tests

- Valid Momence responses normalize to the public contract.
- Missing optional fields do not break the response.
- Authentication failures, timeouts, invalid JSON, and rate limits map to stable errors.
- Secrets and raw upstream data never appear in responses or logs.
- Static-build mode verifies deterministic generated output and approved snapshot fallback behavior.
- Runtime mode verifies cache hit, expiration, and stale fallback behavior.

### Optional Phase 2: Custom Video UI tests

- Loading, results, search/filter, empty, error, and fallback states render correctly.
- Cards work with incomplete optional metadata.
- Keyboard navigation and visible focus behavior are verified.
- Mobile card layout is checked at representative widths.

### Optional Phase 2: Dialog tests

- Trigger activation, focus trap, Escape close, close button, backdrop behavior, and focus restoration work.
- Body scrolling is restored after closing.
- Dynamic appointment height messages are accepted only from approved origins and expected message shapes.
- Mobile presentation avoids inaccessible nested scrolling.

### Migration checks

- Every active pass maps to an approved Momence destination.
- The Schedule page updates from the Momence dashboard.
- No generated page contains Mindbody, HealCode, retired site IDs, or legacy widget tags after cutover.
- Existing page content, layout order, responsive behavior, and core metadata remain intact.
- Storefront and Sanity production builds complete in their supported Node environments.
- API-backed releases are blocked until credential rotation and the Video API contract spike are complete.

## Acceptance Criteria

1. All production Mindbody and HealCode scripts, tags, links, and configuration are removed.
2. Schedule changes made in Momence appear through the Schedule page plugin.
3. Every enabled pass card opens its approved Momence purchase flow.
4. The global account action opens the approved Momence account flow.
5. Editors can configure supported Momence components without writing code.
6. Sanity cannot publish arbitrary script or iframe markup through the Momence fields.
7. The official Video Library experience renders inside the Hipline `/on-demand/` wrapper, loads current Momence-managed content, and provides a usable hosted fallback action.
8. Phase 1 introduces no API credentials in Sanity, generated HTML, browser assets, public responses, or logs.
9. The Video Library iframe and hosted fallback are usable with keyboard navigation and representative desktop and mobile layouts.
10. Existing non-Momence pages retain their current design and content structure.
11. Each Phase 1 Momence integration has a documented disable or fallback path.
12. Storefront and Sanity production builds pass in the supported release environment.
13. Any enforced Content Security Policy is preceded by a report-only verification covering every enabled Momence flow.

Optional Phase 2 API or dialog work retains its own security, credential-rotation, data-contract, focus-management, loading, empty, error, and caching gates. Those gates do not expand the approved plugin-first Phase 1 release.

## Rollback Strategy

- Each new Momence section has an enabled switch and fallback URL.
- Core integrations are released independently so Schedule, Passes, Video, and dialogs can be rolled back separately.
- Before legacy cleanup, rollback consists of a deployment rollback plus retained legacy Sanity fields.
- After legacy cleanup, rollback uses approved Momence-hosted links or plugins; Mindbody is no longer the recovery path.
- Legacy Sanity data remains readable until the corresponding Momence flow has been verified in production and the rollback window closes.
- The old global HealCode dependency is removed only after the final generated-site scan confirms it is unused.
- The Video Library can temporarily fall back to the official Momence plugin or hosted On-Demand page without changing editorial page content.
- Remove the raw executable embed compatibility path after migration; it must not remain as an emergency publishing mechanism.

## Resolved Phase 1 Release Decisions

1. The managed Video Library route is `/on-demand/`, matching the existing navigation language.
2. The complete active pass mapping is verified against Hipline's public Momence catalog for host `253441` and recorded in the Phase 1 cutover checklist.
3. The official hosted Video Library URL is `https://momence.com/video/courses/253441`; the Hipline wrapper retains that hosted URL as its fallback action.
4. Gift Cards open directly at `https://momence.com/gcc/253441` during Phase 1.

## Further Notes

The word "Momence" is used consistently in this specification. Existing fields named for Mindbody may temporarily carry Momence markup, but that compatibility behavior is considered migration debt and must not become the permanent content model.

The local theme folder is reference material. Reuse should be limited to selected structural patterns and the styles already included in the active Hipline bundle; the project should not import an entire alternate theme.
