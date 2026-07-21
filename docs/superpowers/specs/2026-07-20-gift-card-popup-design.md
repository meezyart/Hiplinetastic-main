# Gift Card Popup Design

Date: 2026-07-20

## Goal

Keep the existing orange **GIFT CARDS** card unchanged while making its **Buy Now** action use HIPLINE's shared Momence checkout dialog. Preserve a normal new-tab link as the progressive-enhancement fallback.

## Approaches considered

1. **Sanity-managed card popup (selected).** Set the existing Gift Cards pass record to the `popup` presentation. The current pass template then emits the shared dialog attributes without adding one-off markup.
2. Add Gift Cards-specific template logic. This would work but would bypass the existing Sanity page-builder presentation field and create special-case code.
3. Change both the card and top navigation. This expands scope and changes navigation behavior the user has not approved as part of this card fix.

## Design

The Gift Cards pass remains document `c39a24ce-d220-4b4f-870e-de75a3d9621d` with destination `https://momence.com/gcc/253441`. Only `purchasePresentation` changes from `external-link` to `popup` in Sanity. The existing `classPass.njk` template will render `data-embed-dialog-url` and the current dialog component will create the checkout iframe on activation.

The card's text, price icon, colors, placement, and Momence URL do not change. The main and mobile top-menu links remain unchanged in this scope.

## Fallback and accessibility

Without JavaScript, the button remains a normal HTTPS link. With JavaScript, the dialog provides an **Open checkout in a new tab** fallback, traps keyboard focus, exposes a labelled dialog, and returns focus to the card action when closed. Momence's gift-card response currently omits frame-blocking `X-Frame-Options` and CSP headers, so modal embedding is supported.

## Verification

- Rebuild using fresh published Sanity content.
- Assert the generated Gift Cards card contains its existing URL and popup trigger attribute.
- Run the full test suite and Momence cutover verifier.
- In the local browser, activate the Gift Cards card and verify the dialog iframe, title, fallback URL, close behavior, and unchanged card presentation.
- Repeat the checkout interaction on the Netlify deploy preview before production cutover.

## Out of scope

- Changing the top-menu Gift Cards link.
- Redesigning the Gift Cards card.
- Altering Momence's hosted checkout interface.
