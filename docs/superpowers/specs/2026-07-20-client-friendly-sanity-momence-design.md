# Client-Friendly Momence Editing in Sanity

## Purpose

Make routine HIPLINE updates safe for a non-technical client. Sanity remains the page builder and Momence remains the source of schedules, checkout, accounts, and video. The client edits plain text and public Momence links; technical IDs, embed settings, and security controls are not part of the normal workflow.

## Editing model

### Everyday edits: visible first

Each relevant Sanity field uses its built-in title and description to answer three questions in one sentence:

1. What visitors will see or what the button will do.
2. What the client should paste or change.
3. When to leave it alone and contact HIPLINE support.

Routine controls include headings, introductory text, public Momence purchase links, button labels, and client-managed Sliding Scale actions.

### Advanced Momence settings: collapsed by default

Per-page Schedule overrides are an expandable group labelled **Advanced Momence settings — only open if HIPLINE support asks**. It stays collapsed and explains that the page normally inherits the approved site-wide Schedule settings.

When an ID is genuinely required, its description tells the client exactly what to supply: a numeric value given by Momence or HIPLINE support, without a URL, embed code, password, or dashboard link. The validation message accepts only numbers.

### Support handoff

Every technical field includes an explicit handoff: **If you only have a Momence ID, a dashboard page, or embed code, send it to HIPLINE support instead of guessing.** This avoids invalid checkout links and unexpected website changes.

## Schema changes

### Momence site settings

- Group daily links under **Everyday Momence links**.
- Label each link by purpose: account sign-in, Video Library, Gift Cards, and schedule fallback.
- Add simple descriptions: paste the public Momence page URL; do not paste a login/dashboard URL.
- Keep schedule host/filter/locale fields in a collapsed **Advanced schedule setup** group.
- Keep approved iframe hostnames in a separate collapsed **Technical security settings** group with a support-only warning.

### Schedule section

- Label the page-level schedule link as an optional override and make the default behavior explicit: leave it blank to use HIPLINE's approved default schedule.
- Rename the advanced group to make it support-assisted and collapse it by default.
- Add purpose-and-source descriptions to Host ID, teacher IDs, location IDs, tag IDs, default filter, and locale.
- Describe the fallback button as the customer backup if the embedded schedule does not load.

### Passes

- Rename the purchase fieldset to **Customer checkout button**.
- Describe the Momence purchase link as the public checkout link copied from Momence.
- Explain that popup checkout is the standard and external-link mode is only for a support-directed exception.
- Keep the optional product ID advanced/support-assisted; a product ID is not a replacement for the public purchase link.

### External Service / Sliding Scale

- Describe client-managed actions as the normal tool for multiple Momence choices.
- Add action-row help: use one clear label and one public Momence purchase link per option.
- Explain that the client should send unknown IDs or URLs to support instead of using iframe/embed fields.
- Move iframe, accessibility title, and sizing controls to a collapsed support-assisted group; routine tier buttons remain visible.

## Acceptance checks

- A client can update a pass purchase link, button text, schedule heading, and Sliding Scale tier button without knowing a technical ID.
- A client can tell from the editor whether a field is routine or support-assisted.
- Invalid values receive useful built-in validation feedback.
- The existing public storefront behavior, typed schema validation, and Momence security allowlists remain unchanged.
- The Studio build succeeds before deployment; the deployed Studio shows the new field descriptions and collapsed groups.

## Out of scope

- A custom Sanity plugin or bespoke wizard.
- Accepting raw HTML, embed code, passwords, private dashboard URLs, or API credentials in Sanity.
- Phase 2 custom Momence Video API work.
