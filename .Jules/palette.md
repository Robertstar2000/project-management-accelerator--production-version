## 2026-10-01 - Accessible Notification Bell & Dropdown Pattern
**Learning:** Dropdowns and trigger icons in this design system were built with plain `div` elements and `onClick` handlers, missing keyboard focusability, screen reader role descriptions, and `Escape` key close behavior.
**Action:** When working with dropdowns or icon triggers in this app, convert `div` triggers and list items to `<button type="button">`, add `aria-expanded` and `aria-haspopup` attributes, reset button defaults in `GlobalStyles.ts`, and attach `Escape` key listeners.

## 2026-10-05 - Accessible Modal Dialogs & Destructive Action Feedback
**Learning:** Legacy modal implementations in this application were missing `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, auto-focus (`modalRef`), `Escape` key close listeners, header close buttons, and disabled states on dangerous forms until required confirmation input is typed.
**Action:** Always wrap modal dialog contents with `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`, attach an `Escape` key listener, focus container on open, add a `button-close` icon with `aria-label`, and visually disable destructive buttons until confirmation text matches.
