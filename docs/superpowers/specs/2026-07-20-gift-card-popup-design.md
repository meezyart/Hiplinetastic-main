# Gift Card Popup Design

Date: 2026-07-20

## Goal

Keep the existing orange **GIFT CARDS** card unchanged while making its **Buy Now** action and the desktop/mobile **Gift Cards** top-menu links use HIPLINE's shared Momence checkout dialog. Preserve normal new-tab links as the progressive-enhancement fallback.

## Approaches considered

1. **Sanity-managed card plus URL-matched menu enhancement (selected).** Keep the existing Gift Cards pass record on the `popup` presentation. In the desktop and mobile header templates, add the shared dialog attributes only when a menu item's external URL equals the managed `momence.giftCardUrl`.
2. Match menu items by the visible `Gift Cards` label. This is simpler but brittle because a content editor could rename the label without changing its purpose.
3. Add a new popup-specific navigation schema. This is more configurable but expands the Sanity schema for one known managed destination and is unnecessary for Phase 1.

## Design

The Gift Cards pass remains document `c39a24ce-d220-4b4f-870e-de75a3d9621d` with destination `https://momence.com/gcc/253441`. Only `purchasePresentation` changes from `external-link` to `popup` in Sanity. The existing `classPass.njk` template will render `data-embed-dialog-url` and the current dialog component will create the checkout iframe on activation.

The desktop `header.njk` and mobile `mobile-menu.njk` templates compare each external menu URL with `momence.giftCardUrl`. The matching top-level item receives the same `data-embed-dialog-url` and `data-embed-dialog-title="Buy GIFT CARDS"` attributes as the card. Its existing `href`, label, menu position, and new-tab behavior remain intact as the non-JavaScript fallback.

The card's text, price icon, colors, placement, and Momence URL do not change. No other menu item receives popup behavior.

## Fallback and accessibility

Without JavaScript, the button remains a normal HTTPS link. With JavaScript, the dialog provides an **Open checkout in a new tab** fallback, traps keyboard focus, exposes a labelled dialog, and returns focus to the card action when closed. Momence's gift-card response currently omits frame-blocking `X-Frame-Options` and CSP headers, so modal embedding is supported.

## Verification

- Rebuild using fresh published Sanity content.
- Assert the generated Gift Cards card contains its existing URL and popup trigger attribute.
- Assert both generated top-menu Gift Cards links contain the same popup URL and title while unrelated navigation links do not.
- Run the full test suite and Momence cutover verifier.
- In the local browser, activate the Gift Cards card plus the desktop and mobile menu links and verify the dialog iframe, title, fallback URL, close behavior, and unchanged presentation.
- Repeat the checkout interaction on the Netlify deploy preview before production cutover.

## Out of scope

- Redesigning the Gift Cards card.
- Changing the Gift Cards menu label, position, or destination.
- Adding popup configuration fields to the navigation schema.
- Altering Momence's hosted checkout interface.
