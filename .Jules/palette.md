## 2026-10-01 - Accessible Notification Bell & Dropdown Pattern
**Learning:** Dropdowns and trigger icons in this design system were built with plain `div` elements and `onClick` handlers, missing keyboard focusability, screen reader role descriptions, and `Escape` key close behavior.
**Action:** When working with dropdowns or icon triggers in this app, convert `div` triggers and list items to `<button type="button">`, add `aria-expanded` and `aria-haspopup` attributes, reset button defaults in `GlobalStyles.ts`, and attach `Escape` key listeners.

## 2026-10-06 - Modal Accessibility Standard in Custom React Components
**Learning:** Custom modals in this app lack a modal framework, so each modal must explicitly include `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, an `Escape` key event listener, initial focus management with `ref`, and an `aria-label` close button.
**Action:** Always check custom modals for these 5 core modal accessibility requirements when adding or updating modal components.

## 2026-10-16 - Form Semantics in Confirmation Modals
**Learning:** Modals with text input confirmation (like project deletion or key matching) often render plain `div` containers, blocking users from submitting via the `Enter` key after typing the required confirmation text.
**Action:** Wrap modal inputs and action buttons in a `<form>` with an `onSubmit` handler that validates conditions (`isConfirmed`) before calling the confirmation callback.

## 2026-10-23 - Keyboard Focusability and Explanatory Tooltips for Disabled Cards
**Learning:** Setting `tabIndex={-1}` on disabled interactive cards or buttons completely hides them from keyboard tab order, preventing keyboard users from discovering the element or learning why it is disabled.
**Action:** Keep interactive card containers in tab order (`tabIndex={0}`) with `aria-disabled="true"` and a descriptive `title` / `aria-label` attribute explaining the prerequisite required to enable the action.
