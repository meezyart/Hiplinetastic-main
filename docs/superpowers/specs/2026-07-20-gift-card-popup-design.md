# Gift Card Popup Design

Date: 2026-07-20

## Goal

Keep the existing orange **GIFT CARDS** card unchanged while allowing Sanity editors to make external navigation links use HIPLINE's shared checkout dialog. Configure the desktop/mobile **Gift Cards** top-menu link with this behavior and preserve its normal URL as the progressive-enhancement fallback.

## Approaches considered

1. **Add an `Open As Popup?` boolean to external navigation links (selected).** This makes the behavior explicit and editor-controlled without tying it to a label or URL. The same setting works for top-level and dropdown links.
2. Match menu items by the managed Gift Cards URL. This avoids a schema change but is implicit and prevents editors from choosing popup behavior for another eligible checkout link.
3. Add a multi-option link-presentation selector. This is more extensible than a checkbox, but it introduces choices that Phase 1 does not currently need.

## Design

The Gift Cards pass remains document `c39a24ce-d220-4b4f-870e-de75a3d9621d` with destination `https://momence.com/gcc/253441`. Only `purchasePresentation` changes from `external-link` to `popup` in Sanity. The existing `classPass.njk` template will render `data-embed-dialog-url` and the current dialog component will create the checkout iframe on activation.

The active Sanity `navLink` schema gains an optional `openAsPopup` boolean titled **Open As Popup?**. Because `navLink` is used for both top-level and dropdown external links, the setting is available in both locations. The existing **Open In New Tab?** setting remains independent and continues to control the fallback link target.

The storefront header query projects `openAsPopup` for top-level and dropdown menu items. The desktop `header.njk` and mobile `mobile-menu.njk` templates add `data-embed-dialog-url` and a `Buy {link title}` dialog title only when an external link has `openAsPopup` enabled. Its existing `href`, label, menu position, and new-tab behavior remain intact as the non-JavaScript fallback.

The published Header Menu's **Gift Cards** external link will have `openAsPopup` enabled. The card's text, price icon, colors, placement, and Momence URL do not change. Other menu items remain unchanged unless an editor explicitly enables the checkbox.

## Fallback and accessibility

Without JavaScript, the item remains a normal link. With JavaScript, the dialog provides an **Open checkout in a new tab** fallback, traps keyboard focus, exposes a labelled dialog, and returns focus to the menu trigger when closed. The checkbox is intended for HTTPS destinations that permit iframe embedding; the existing direct link remains available if the embedded provider cannot load.

## Verification

- Rebuild using fresh published Sanity content.
- Assert the generated Gift Cards card contains its existing URL and popup trigger attribute.
- Assert the Sanity schema exposes **Open As Popup?** on external links.
- Assert the header query projects `openAsPopup` for top-level and dropdown items.
- Assert enabled links in the generated desktop and mobile menus contain their popup URL and title while disabled links do not.
- Run the full test suite and Momence cutover verifier.
- In the local browser, activate the Gift Cards card plus the desktop and mobile menu links and verify the dialog iframe, title, fallback URL, close behavior, and unchanged presentation.
- Repeat the checkout interaction on the Netlify deploy preview before production cutover.

## Out of scope

- Redesigning the Gift Cards card.
- Changing the Gift Cards menu label, position, or destination.
- Replacing the checkbox with a generalized presentation system.
- Altering Momence's hosted checkout interface.
