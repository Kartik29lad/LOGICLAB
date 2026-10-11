# Phase 21 — Accessibility and Responsive Browser QA

## Target Browsers

The application is tested and verified against the modern evergreen desktop and mobile browsers:

- **Chrome** (Version 120+)
- **Edge** (Version 120+)
- **Firefox** (Version 122+)
- **Safari** (Version 17+)

## Viewport QA Breakpoints

- **Mobile portrait**: `<=600px` (Single column stacked layout, touch targets >= 44x44px)
- **Tablet / Small laptop**: 601px - 1024px (Adaptive split view, collapsible navigation drawer)
- **Desktop**: 1025px+ (Full laboratory split view, persistent sidebar)

## Accessibility Standards

- WCAG 2.1 AA Contrast compliance across all dark UI tokens.
- Full keyboard operability and visible focus indicators.
- Prefers-reduced-motion OS support and in-app toggles.
