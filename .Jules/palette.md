## 2026-10-01 - Accessible Notification Bell & Dropdown Pattern
**Learning:** Dropdowns and trigger icons in this design system were built with plain `div` elements and `onClick` handlers, missing keyboard focusability, screen reader role descriptions, and `Escape` key close behavior.
**Action:** When working with dropdowns or icon triggers in this app, convert `div` triggers and list items to `<button type="button">`, add `aria-expanded` and `aria-haspopup` attributes, reset button defaults in `GlobalStyles.ts`, and attach `Escape` key listeners.
