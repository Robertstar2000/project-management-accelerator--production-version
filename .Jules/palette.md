## 2026-09-30 - Modal Dialog Accessibility Pattern
**Learning:** React modal components without `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, or an `Escape` key handler lack basic screen reader structure and keyboard dismissibility.
**Action:** Ensure all modal components implement proper dialog ARIA roles, an explicit close button with `aria-label="Close"`, and an `Escape` keyboard event listener.
