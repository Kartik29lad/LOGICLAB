# LogicLab — Production Implementation Plan
## Full-Project Dark UI, Visualizer Motion, Feature Preservation, and Verification

**Status:** Implementation plan; no implementation or test results are implied.

**Goal:** Redesign the entire LogicLab application to match the approved dark technical laboratory visual direction and polished reference motion while preserving existing functionality, algorithms, navigation, persistence, APIs, metadata, keyboard behavior, and current feature scope.

**Execution rule:** Work in one phase at a time. Do not begin the next phase until the current phase has a reviewed diff, relevant checks, browser evidence, a completed acceptance record, and explicit sign-off. All verification starts as **Pending**.

---

## 0. Executive Summary and Non-Negotiable Scope

### 0.1 Desired outcome

Every page and UI state—not only the visualizer—must use the approved dark laboratory design system:

- Deep navy/near-black canvas and layered dark surfaces.
- Cyan as the primary focus/action color, mint for successful completion, amber for comparisons/decisions, and carefully limited coral for actual errors or destructive actions.
- High-legibility typography, restrained glow, consistent borders and spacing, geometric SVG outline icons, and purposeful, smooth motion.
- Shared application shell, cards, form controls, menus, dialogs, empty states, errors, loading states, and all responsive layouts must feel like one product.
- Visualizer canvas, code pane, step log, timeline, counters, and current trace event must remain synchronized.

### 0.2 In scope

1. Design tokens, typography, global CSS, shared UI primitives, application shell, headers, sidebars/drawers, navigation, search, cards, forms, tabs, badges, dialogs, menus, loading/error/empty states.
2. All existing route families and dynamic route instances discovered in the actual repository.
3. Existing visualizer shells, playback controls, timelines, code/highlight synchronization, step logs, and data-structure renderers.
4. Existing content/detail pages, catalogs, comparisons, playgrounds, learning paths, challenge pages, progress/history/favorites/bookmarks/activity/experiments/settings/authentication pages when present.
5. Motion correctness, reduced-motion behavior, keyboard/focus behavior, responsive layout, actual contrast checks, regression tests, performance measurement, and route-wide visual QA.

### 0.3 Out of scope unless separately approved

- Rewriting algorithm implementations or changing canonical trace/state-generator behavior as a styling task.
- Turning an existing scaffold into a full feature (for example, turning a challenge detail scaffold into a new coding IDE, or adding new graph/tree-playground capabilities).
- Replacing API contracts, database schemas, storage keys, authentication semantics, content models, or analytics calculations.
- Adding fabricated learner counts, fake progress, synthetic success metrics, or ungrounded performance claims.
- Removing unrelated settings, keyboard shortcuts, or navigation options as part of a theme redesign.
- Adding decorative scanlines, excessive particles, constant pulsing, or heavy neon effects that do not explain state.

### 0.4 Source-of-truth rule

The **current repository filesystem, code, `package.json`, tests, and behavior** are authoritative. The paths, route names, script names, counts, and slugs mentioned in older planning notes are candidates until verified against the repository. Do not silently choose between conflicting route-name variants (for example, `/paths` versus `/learning-paths`, or `/playground` versus nested playground routes). The preflight phase must resolve this from the actual route tree.

---

## 1. Product and Engineering Contracts

### 1.1 Preserve existing behavior

The redesign must preserve, where present:

- Routes, route parameters, query-string behavior, navigation targets, redirects, deep links, and 404 behavior.
- Algorithm/data-structure step generators, operation semantics, invariants, canonical traces, counters, pseudocode selection, and current-step indexing.
- Playback controls: play, pause, forward step, backward step, reset, scrub, speed control, algorithm selection, and presentation mode.
- Existing graph/tree editing operations, linear data-structure actions, search/filter behavior, comparison mode, and custom data inputs.
- Existing local-storage keys and serialized formats, server/API payload shapes, feature flags, authentication behavior, and backend validation.
- Existing settings other than an explicitly approved global dark-only theme decision.
- SEO metadata, canonical URLs, OpenGraph values, JSON-LD structured data, and error handling.
- Existing audio/step feedback, when present; it remains silent by default and respects user settings.

If the current code does not support a behavior described in an old plan, mark it **existing scaffold / unsupported** and do not create a new feature under the guise of styling. Do not promise “zero regression” from a plan alone; prove preservation with before/after tests and interaction checks.

### 1.2 Canonical trace rule

The algorithm trace or state engine—not CSS, animation callbacks, or elapsed wall-clock time—is the source of truth. An animation presents the selected trace state. At any moment, these must refer to the same event/state:

1. Visual canvas.
2. Current step and total step count.
3. Active pseudocode line (when available).
4. Step/event log selection.
5. Operation metrics/counters.
6. Accessible textual state/announcements.

### 1.3 No false data

Use actual repository data and actual computed state. When data is unavailable, show a clear empty, loading, unavailable, or scaffold state. Never invent user totals, progress, streaks, timing measurements, algorithm operation counts, “100% deterministic” badges, or performance claims.

### 1.4 Dark appearance and settings

The approved visual target is dark across the application. Keep the settings/API contract valid. If the current product lets users choose Light or System, record the dark-only setting as an intentional product decision before disabling that control; do not accidentally remove options or break payload validation. If the dark-only decision is approved, display the locked dark state clearly and serialize the exact enum/value expected by the existing API. Preserve every unrelated setting.

---

## 2. Phase 0 — Repository Preflight, Baseline, and Definitive Inventory

**Objective:** Remove uncertainty before editing shared foundations. This phase is an audit and planning phase; it must not change application source files except for approved audit documentation.

### 2.1 Protect existing work

Before running edits or code-generation:

1. Run `git status --short` and record all existing modified/untracked files. Do not overwrite or discard user changes.
2. Record current branch and latest commit. Create a dedicated branch/checkpoint according to the user's existing Git workflow; if branch creation is not desired, at minimum capture the baseline commit and working-tree state.
3. Identify package manager and lockfile (`package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`) and use that package manager consistently.
4. Record Node.js and package-manager versions.
5. Run only baseline scripts that actually exist in `package.json`. Save command, timestamp, exit code, and relevant output.

### 2.2 Generate the authoritative route inventory

Inspect every file under `src/app` and determine the actual URL routes from Next.js App Router conventions. Route groups in parentheses do **not** form part of the URL. Include:

- Static pages.
- Dynamic segments (`[slug]`, `[id]`, catch-all/optional catch-all segments if present).
- Root, nested, route-group, loading, error, not-found, and global-error boundaries as applicable.
- Parallel/intercepting routes and route handlers if present; label route handlers separately from pages.
- Authenticated/workspace pages, settings, user/history/progress pages, experiment pages, playgrounds, and less-frequently visited sections.

Create `docs/implementation/route-inventory.md` (or the repository's agreed documentation directory) with columns:

| URL pattern | Source file (literal path) | Route type/group | Dynamic values and valid slugs | Shell/layout | Existing interactions | Data dependencies | Verification status |
|---|---|---|---|---|---|---|---|

Rules:
- Every routable page file must map to one URL pattern or have a documented reason why it is not a user-facing route.
- Every row must use an exact, literal filesystem path. For route groups, use valid paths such as `src/app/(public)/error.tsx`; never escape, split, or corrupt the parentheses.
- Reconcile route names that conflict across earlier notes using the repository, not memory or guesswork.
- Do not claim a fixed route count until this inventory is generated and checked.
- Create a navigation-link audit mapping each internal link/navigation item to a real route or documented external destination.

### 2.3 Inventory shared components and visualizers

Map actual component modules for:

- App shell, header, sidebar/drawer, breadcrumbs, global search, navigation, cards, buttons, fields, tabs, badges, tables, dialogs, popovers, dropdowns, tooltips, code panels, and status primitives.
- Visualizer shell, engine/state adapters, playback controls, timeline, step log, code view, metrics, renderer registry, and each renderer that really exists.
- Loading/error/not-found boundaries in root and route groups.
- Theme tokens and CSS entry points.
- Storage/API contracts and feature flags used by the UI.

The previously listed ten renderer families (array, linked list, stack, queue, binary tree, BST, AVL tree, graph, hash table, heap) are a **candidate inventory**. Verify all modules that exist and include any additional actual renderer. Do not create a renderer just to satisfy the old count.

Create `docs/implementation/component-inventory.md` and `docs/implementation/feature-preservation-matrix.md`.

### 2.4 Verify scripts and baseline

Read `package.json` and produce `docs/implementation/verification-inventory.md` containing:

- Every unique `scripts` key and its exact command string.
- A count computed from unique keys, not a manually summed set of overlapping categories.
- Which existing commands cover type checking, linting, unit tests, integration tests, accessibility, responsive behavior, visualizer logic, security, performance, and production build.
- Existing test coverage gaps and any proposed new tests.
- Current baseline execution result for every command actually run: **Pass / Fail / Blocked / Not Run** with exit code and reason.

Do not assume all script names from earlier documents still exist. Verify each before using it. A command existing in `package.json` is not proof the relevant behavior is tested.

### 2.5 Baseline visual/behavior evidence

Before redesign:

- Capture representative existing screenshots at 1440px, 1024px, 768px, and 320px for the home/catalog, detail, visualizer, comparison, learning/challenge, workspace/settings, and overlay states that exist.
- Exercise high-risk interactions before styling: play/pause/reset/step/scrub, filters/search, data-structure operations, graph/tree edit actions, local persistence, settings save, keyboard shortcuts, and overlay close behavior.
- Record known defects as pre-existing; do not attribute them to the redesign.

### 2.6 Phase 0 exit gate

Do not begin implementation until:

- Route inventory reconciles to the actual `src/app` tree.
- All literal target paths are validated.
- Shared-component and feature-preservation inventories exist.
- The exact script inventory and baseline results are documented.
- Any high-impact product decision (including locking theme to dark if that removes an existing preference) is explicitly recorded.

---

## 3. Design System Specification

### 3.1 Canonical tokens

Use these as the initial design tokens. Validate actual contrast combinations before finalizing all usage. If a token fails for its intended role, adjust the token—not the accessibility requirement—and document the resulting value.

| Token role | Initial value | Intended use |
|---|---|---|
| Canvas/base | `#0A0F1C` | Global app background |
| Surface/card | `#121B27` | Cards, panels, controls, modal bodies |
| Raised surface | `#1A2636` | Popovers, selected/raised panels, menus |
| Subtle surface | `#162232` | Secondary containers, inactive tracks |
| Subtle border | `#1E293B` | Low-emphasis separators |
| Standard border | `#223249` | Cards/panels and input borders |
| Strong border | `#2E3E55` | Active/hovered/strongly separated panels |
| Primary text | `#F8FAFC` | Headings and body text |
| Secondary text | `#CBD5E1` | Descriptions and secondary labels |
| Subtle text | `#8096B0` | Metadata, timestamps, line numbers; use only after checking each background |
| Cyan accent | `#00E5FF` | Primary action, focus, active step, selected control, pointer |
| Blue accent/text | `#60A5FA` | Links and secondary information where contrast passes |
| Mint/success | `#22C55E` | Found, sorted, completed, successful states |
| Amber/warning | `#F59E0B` | Comparisons, pivots, decisions, warnings |
| Coral/danger text | `#F87171` | Real errors, invalid input, destructive actions |
| Violet accent/text | `#C084FC` | Secondary structural labels, rotations, categories |
| Neutral state | Theme-derived muted neutral | Unselected, idle, unavailable, or not-found-without-error states |

Use alpha/color-mix variants only as backgrounds, overlays or glows where appropriate; do not use low-opacity text where it drops contrast below the required threshold.

### 3.2 Semantic color rules

- **Cyan:** current focus, active step, selected/primary control, pointer, primary CTA.
- **Amber:** comparing, pivot, decision, warning, transitional state.
- **Mint:** actual success, completed, visited/resolved/found, sorted element.
- **Blue/violet/neutral:** secondary categories, structural distinctions, traversal/backtracking, complexity information where appropriate.
- **Coral:** genuine errors, invalid syntax/input, failed validation, destructive action confirmation only.
- Never mark a routine swap, normal backtracking, “not found” outcome, unselected control, or merely high complexity as an error with coral.
- Color is never the only state signal: pair color with label, shape, icon, positioning, or textual state.

### 3.3 Typography

The repository audit previously reported that `public/fonts` has no local font binaries. Confirm this during Phase 0. The guaranteed build baseline must not depend on an external font download:

```css
:root {
  --font-sans: Inter, ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", ui-monospace,
    SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace;
}
```

- Do not add `next/font/google` while promising network-independent builds: Next.js downloads Google fonts during the build. If local, licensed font assets become available, use `next/font/local`; verify licensing and build behavior.
- Use sans-serif for navigation/content and monospace for code, indices, step logs, complexity values, technical metrics, and tabular counts.
- Use `font-variant-numeric: tabular-nums` for step counters, indices and metrics.
- Do not claim zero CLS merely because fallback fonts exist. Measure layout shift and clipping in browser tests.

### 3.4 Shared shape, spacing, and elevation

- Establish reusable tokens for spacing, radii, panel padding, header height, sidebar width, focus-ring width, and z-index layers after examining the approved reference and existing layout constraints.
- Prefer consistent 8/12/16/24/32 spacing increments where compatible with the existing layout; avoid isolated arbitrary values.
- Use restrained borders and shadows. Cyan glow is a small emphasis, not a permanent blur around every component.
- All clickable controls need coherent default, hover, active, focus-visible, disabled, pending, success, and error states as applicable.

### 3.5 Accessibility/contrast requirements

Measure contrast with a repeatable script or accessibility tool against **every actual foreground/background pairing**, including nested surfaces, badges, hover/selected states, disabled states, focus rings, chart labels, placeholder text, and overlay scrims.

- Normal text: contrast ratio at least **4.5:1**.
- Large text: at least **3:1**.
- Essential non-text UI graphics and focus indicators: at least **3:1** against adjacent colors where the criterion applies.
- Record the algorithm/tool and actual calculated ratio; don't manually invent or copy an unverified ratio table.
- A color can pass on the canvas and fail on a raised surface. Test each real pairing.
- Disabled controls and decorative graphics should be identified as such; do not use them to communicate essential instructions or states.
- Keyboard focus must be plainly visible, not hidden by overflow or overlay layers.

---

## 4. Motion and Visualizer Architecture

### 4.1 Motion timing tokens

Start with these target ranges and tune after observing the reference mockup and actual device performance:

- Micro-interactions: 100–160 ms.
- Dropdown/popover/control transitions: 160–220 ms.
- Navigation drawer/panel transitions: 220–280 ms.
- Visualizer element transitions: 180–320 ms, depending on travel distance and semantic need.

Centralize motion timing/easing in tokens or shared motion utilities. Avoid untracked per-component durations.

### 4.2 Motion quality rules

- Animation must communicate a state change, show spatial continuity, or give feedback to a real user action.
- Prefer `transform` and `opacity`; avoid repeated layout-triggering changes when transform-based movement is appropriate.
- Elements should move from and to their real logical positions; nodes, edges, pointers, labels and array items must not visually detach from the data state.
- Avoid gratuitous page-wide intro animations, flashing, scanlines, floating particle backgrounds, excessive blur, and long blocking transitions.
- Avoid motion that shifts surrounding text or causes controls to become unreachable.

### 4.3 Playback race/cancellation contract

Test these cases explicitly:

1. Play then pause immediately.
2. Play then reset before a transition completes.
3. Press step forward/backward rapidly several times.
4. Scrub the timeline while playback is running.
5. Change speed during an active transition.
6. Switch algorithm/data structure while running, if supported.
7. Navigate away and back while timers/listeners are active.
8. Enter/exit presentation mode during playback.
9. Trigger an empty/error/terminal state mid-animation.

Latest user action wins. Stale animation callbacks must never overwrite the latest state. Use explicit cancellation/sequence IDs/abort semantics or the project's existing reliable pattern. Clean up timers, animation frames, observers, and listeners on reset, unmount, algorithm switch, and relevant state change.

### 4.4 Reduced-motion behavior

Honor `prefers-reduced-motion` for CSS and JavaScript-driven movement. In reduced-motion mode:

- Preserve all actions and state updates.
- Replace unnecessary travel, pulsing and glowing with immediate state changes or brief opacity changes.
- Do not use rapid flashing.
- Ensure no feature or explanation requires animation to be understood; provide textual/structural state labels.

### 4.5 Visualizer renderer contract

For every existing renderer:

- Use the shared token set and semantic colors.
- Preserve SVG/canvas geometry and interactions unless a layout correction is required for the approved design.
- Keep labels, arrows, node edges, indices and selected states legible at all supported sizes and zoom levels.
- Ensure large inputs do not clip essential nodes or make the canvas impossible to operate.
- Keep chart/node/bucket/bar states synchronized to the canonical trace.
- Distinguish compare, swap, sorted, found, visited, pivot, null, empty, collision, error, and terminal states accurately.
- Confirm screen-reader/text state does not become stale when a visual transition is cancelled.

### 4.6 Motion regression tests required

Add or strengthen tests for:

- Active-step, code-line, log-entry, visual state and counters referring to the same trace event.
- Rapid play/pause/reset/forward/backward/scrub action sequences.
- No stale state after a cancelled transition.
- Reset returns visual state and counters to the canonical initial state.
- End-of-trace and start-of-trace controls do not exceed valid bounds.
- Reduced-motion mode still updates state correctly and suppresses non-essential motion.
- All listeners/timers/animation frames are cleaned up on unmount and route/algorithm changes.
- Data-structure operation semantics remain valid before and after visual styling.

---

## 5. Phase-by-Phase Implementation Roadmap

The precise target files for every phase must be filled from the Phase 0 inventories using exact literal paths. The paths below describe component roles; they are not permission to invent files or rename routes.

### Phase 1 — Design tokens, global styles, typography, and status/boundary surfaces

**Objective:** Establish the dark baseline without changing business logic.

**Work:**
1. Implement canonical tokens in the verified token stylesheet.
2. Update global CSS reset, app background, text defaults, scrollbar treatment (subtle and usable), focus styles, selection colors, and reduced-motion utilities.
3. Restyle verified shared status primitives for badges, empty states, loading states, and errors while preserving public APIs/props.
4. Restyle every verified root and nested loading/error/not-found boundary. Do not assume there are exactly seven; use the audit inventory.
5. Preserve Next.js boundary contracts, including required client directives, `reset()` calls, `notFound()` semantics, route links, digest handling, and status/alert roles.
6. Implement the non-network typography stack; preserve metadata and layout behavior.
7. Add a small token/contrast audit utility or tests that can reproduce actual ratios from the token file and declared pairings.

**Acceptance:**
- No accidental bright/white page flashes in verified routes or boundary states.
- Status components remain API-compatible and semantically correct.
- Every exact boundary path from the inventory is handled.
- Measured foreground/background pairings used in Phase 1 pass their intended requirements or are corrected.
- Reduced motion suppresses the shared spinner/pulse animation where appropriate.
- Baseline typecheck/lint/tests/build are compared against Phase 0 results; existing unrelated failures remain documented.

### Phase 2 — Shared application shell, navigation, global search, and layout layers

**Objective:** Make all routes feel like one cohesive application.

**Work:**
1. Restyle the verified app shell, header, desktop navigation/sidebar, mobile drawer, breadcrumb or title patterns, and page content container.
2. Establish consistent layer/z-index tokens for sticky header, drawer, popover, tooltip, dialog, and presentation mode.
3. Replace emoji/Unicode pictograms in primary navigation and primary operation toolbars with consistent SVG outline icons. Keep symbols that are actual educational content (for example, mathematical syntax) intact.
4. Implement or restyle global search only using its existing interaction contract. Preserve shortcut(s), routes, filtering, history and empty-state behavior.
5. Define narrow breakpoints based on the actual layout and confirm no navigation items become unreachable.
6. Ensure overlay scroll locking, focus management, Escape dismissal, return focus, click-away handling and focus-visible states work without adding duplicate listeners.

**Acceptance:**
- Navigation targets match the definitive route inventory.
- `Ctrl+K`/`Cmd+K` (if currently supported) works and does not steal keystrokes from text fields.
- Drawer/search can be opened and closed with keyboard and pointer/touch; focus returns appropriately.
- Every page uses the shared shell correctly; nested layouts are not double-wrapped.
- 1440px, 1024px, 768px, and 320px smoke screenshots show no overlap or horizontal overflow.

### Phase 3 — Shared content primitives, catalog hubs, search results, and reusable page layout

**Objective:** Apply consistent cards, forms, lists, tabs and content hierarchy across public/discovery pages.

**Work:**
1. Restyle reusable cards, catalog grids, filters, chips, fields, buttons, tabs, tables, badges, skeletons, empty results, and inline error messages.
2. Style actual catalog and discovery pages identified in the route inventory (such as algorithm/data-structure catalogs and search results if present).
3. Preserve filtering, sorting, URL query synchronization, deep links, selected states, pagination/load-more behavior if present, and search result order.
4. Ensure card hover elevation is subtle and never the only indication that an item is interactive.
5. Remove unsupported/fabricated dashboard numbers; use existing content/state or honest empty states.

**Acceptance:**
- Every catalog route in the actual inventory has consistent layout.
- Filters preserve semantics and URL state.
- Zero-result, loading, failure and successful result states are all styled.
- Cards/buttons have hover, keyboard focus, active, disabled and pending states as appropriate.
- Content isn't truncated in ways that hide key labels, values, or actions at supported breakpoints.

### Phase 4 — Visualizer shell, playback controls, timeline, code pane, logs, and shared toolbars

**Objective:** Restyle the visualization workbench while preserving deterministic trace behavior.

**Work:**
1. Restyle the visualizer workspace layout: page title/context, canvas, code panel, event log, controls, speed selector, timeline, operation counters and responsive arrangement based on actual components.
2. Restyle play/pause/forward/back/reset, range slider/timeline, step counter, algorithm picker, and presentation controls with unified SVG icons and clear pressed/disabled states.
3. Define active trace event appearance once and reuse it in canvas, code, and log.
4. Verify timeline scrubbing, current index, and code/log synchronization while playback and cancellation occur.
5. Keep step-generation and algorithm-state logic out of presentation components; do not refactor engine architecture merely for styling.
6. Preserve supported shortcuts, audio preferences and mode flags.

**Acceptance:**
- All high-risk playback race tests in Section 4.6 pass or are explicitly blocked with a reason.
- Rapid user inputs cannot allow an outdated animation to overwrite the current state.
- Current step, code highlight, log, canvas and counters match the same trace event.
- Start/end-of-trace and empty data behave correctly.
- Fullscreen/presentation mode preserves playback step and cleanly exits with Escape when supported.

### Phase 5 — Every existing visualizer renderer / canvas family

**Objective:** Restyle all renderers found during the Phase 0 inventory. The ten known families are a candidate checklist, not a guaranteed repository count.

**Renderer targets where present:**
- Array/sorting bars.
- Linked list (including supported singly/doubly variants).
- Stack.
- Queue.
- Binary tree.
- Binary search tree.
- AVL tree.
- Graph.
- Hash table.
- Heap.
- Any other renderer discovered in the actual registry.

**Work by renderer:**
1. Replace hard-coded colors with shared semantic tokens.
2. Preserve structure geometry, operations, node identity, and event transitions.
3. Implement visual states from actual trace values—not guessed labels or local animation state.
4. Verify labels, indices, arrows, weights, null markers, balance factors, bucket values, collision chains, and edge/node selection.
5. Ensure normal swaps use semantic compare/swap states, not danger coral. Reserve coral for actual failure/destructive error states.
6. Validate overflow, resizing, long values, large datasets, graph density and tree depth.

**Acceptance:**
- Each renderer in the verified registry has a recorded visual test and relevant logic regression test.
- Existing operations and invariants produce equivalent canonical states before and after the redesign.
- Pointer/edge/node motion corresponds to the correct underlying state.
- At least one ordinary case, edge case, terminal state and reduced-motion case is recorded per renderer family.

### Phase 6 — Algorithm and data-structure detail pages, specialized labs, and dynamic templates

**Objective:** Restyle every verified dynamic detail template and specialized lab without fabricating feature depth.

**Work:**
1. Restyle algorithm detail pages: title/overview, complexity information, pseudocode/code display, examples, related links, and embedded/full visualizer links where they already exist.
2. Restyle data-structure detail pages: descriptions, operation/complexity tables, memory/shape examples, and launch actions where present.
3. Restyle specialized labs (including DFS lab if it exists) using the same tokens and motion rules.
4. Test every valid dynamic slug from the actual content registry, not just one representative slug.
5. Test invalid slugs and their proper `notFound()` boundaries. Return actions must target valid route destinations.
6. Preserve dynamic content, SEO metadata, tabs, anchors, and internal links.

**Acceptance:**
- Every listed dynamic slug loads the correct content and expected renderer.
- Invalid slugs return intentional 404 UI; no blank page or silent fake content.
- No hard-coded copy/data leaks from one slug to another.
- Existing embedded and dedicated visualizer links continue to route correctly.

### Phase 7 — Comparison, general playgrounds, learning paths, challenges, and learning surfaces

**Objective:** Apply the design system to each of these features if it exists, while making a strict distinction between current behavior and scaffold status.

**Work:**
1. Comparison: preserve algorithm selection, shared/identical input rules, synchronized playback where supported, counters, and reset behavior.
2. Playground: preserve actual supported inputs, validation, random data generation, save/export actions, graph/tree editing, and operation semantics; do not add new editor capabilities under this phase.
3. Learning paths/learning pages: preserve content order, dependency/progression rules, status persistence and links to existing content.
4. Challenges: restyle existing challenge list/detail behavior. Check whether submission/runner/editor is genuinely implemented; do not describe a scaffold as a working solution executor.
5. Restyle reset confirmations and other overlays using the shared modal system.
6. Preserve progress/points semantics and clearly identify absence of backend/local data.

**Acceptance:**
- Every active control corresponds to an existing working function, or is clearly labelled unavailable/scaffolded.
- Comparison input and playback semantics do not drift due to animation timing.
- Progress is derived only from existing state and uses the existing storage/backend contract.
- Reset confirmation Cancel restores the unchanged state; Confirm applies exactly the existing reset behavior.
- Scaffolds remain scaffolds unless feature work receives separate approval.

### Phase 8 — Workspace, authentication, settings, user-history pages, and remaining routes

**Objective:** Eliminate the risk that less-visited pages remain visually inconsistent.

**Work:**
1. Use the authoritative Phase 0 inventory to enumerate and restyle every remaining page and nested layout, including login/register, progress, history, favorites, bookmarks, activity, experiments, learning, profile/workspace, settings, or any other routes that really exist.
2. Preserve auth states, form validation, server errors, redirect destinations, session behavior, persistence, pagination, filters and empty states.
3. Preserve settings that are unrelated to theme, including playback speed, code-panel visibility, accessibility/motion settings, audio preferences or other existing options.
4. Apply the approved dark-only setting decision consistently. Do not break accepted API enum values or silently drop existing functionality.
5. Restyle every remaining modal, menu, tooltip, status, loading/error state and responsive variant.

**Acceptance:**
- Each actual route from `route-inventory.md` has a pass/fail result and screenshot or documented reason for no screenshot.
- No page is omitted because it is not linked from the main navigation.
- Auth and settings changes preserve all existing server/API behavior.
- All routes render consistent backgrounds, typography, controls and boundary states.

### Phase 9 — Production QA, regression, responsive, accessibility, visual matching, and release gate

**Objective:** Verify the entire application, not just the representative happy path.

**Work:**
1. Run the verified script inventory's baseline and final commands; include build, typecheck, lint, unit/integration tests, security checks and relevant feature tests available in the repository.
2. Execute a route-by-route browser pass for every URL pattern and each dynamic slug in the inventory.
3. Execute all invalid-slug/404 states and overlays: search, mobile drawer, dialogs, menus, presentation mode, graph editor and any other actual overlay.
4. Test widths at 1440px, 1024px, 768px, and 320px; add browser/device-specific widths if the audit reveals a breakpoint there.
5. Test keyboard-only operation, focus visibility, focus trapping/return, Escape behavior, forms, screen-reader roles/labels, reduced motion and measured contrast.
6. Compare before/after screenshots to the approved reference and pre-redesign baseline. Record issues and corrections rather than saying “looks good” without evidence.
7. Measure performance on a defined browser/environment and specified representative dataset. Record method and measured results; do not promise 60fps without measurement.
8. Verify production build and smoke-test the built app in the supported deployment configuration.

**Acceptance:**
- No unresolved P0/P1 regression or broken primary route.
- All commands that are required and exist have recorded result, exit code and log reference.
- All route/dynamic/overlay rows have a recorded status: Pass, Fail, Blocked or Not Applicable with reason.
- All high-risk playback regression tests pass.
- Accessibility findings are fixed or explicitly triaged and accepted; no failing contrast result is hidden.
- Production build succeeds in the intended environment; if offline-build compatibility is required, verify it with network access actually disabled.
- Remaining known issues are explicitly listed and approved before release.

---

## 6. Route, Dynamic Data, and Overlay Acceptance Records

### 6.1 Definitive route record (generated in Phase 0)

Do not hard-code a “27 routes” claim until the repository is audited. The following record format must be applied to **every actual route** in `docs/implementation/route-inventory.md`:

| URL pattern | Source file | Viewports | Visual acceptance | Interactions checked | Data/persistence checked | Baseline result | Final result | Evidence / defects |
|---|---|---|---|---|---|---|---|---|
| Fill from actual inventory | Literal verified path | 1440 / 1024 / 768 / 320 | Dark surfaces, layout, contrast, type, overflow | All visible interactions | Actual API/storage contracts | Pending | Pending | Screenshot/log/issue ID |

Route audit must include public pages, workspace/auth pages, detail pages, hidden-but-routable pages, all route groups, all nested/dynamic segments, and root/nested error/loading/not-found boundaries. A route is not considered tested simply because the shared template passed once.

### 6.2 Candidate route families to reconcile (not a substitute for filesystem audit)

Earlier project notes mention some or all of the following. Keep each only if confirmed by the actual route inventory; record any actual route not listed here as well:

- Home/dashboard.
- Algorithm catalog and `/algorithms/[slug]` detail routes.
- Data-structure catalog and `/data-structures/[slug]` detail routes.
- Visualizer hub and each supported visualizer route, including specialized DFS if present.
- Comparison and playground routes, including any separate graph/tree playgrounds.
- Search.
- Learning/learning-path catalog and dynamic detail routes; reconcile `/paths` versus `/learning-paths` from the actual repository.
- Challenges list and dynamic detail routes.
- Progress, history, favorites, bookmarks, activity and experiments, if present.
- Login/register/auth routes, settings, workspace/account pages, if present.
- All root/nested 404, error, loading, and global error states supported by the installed Next.js version and app structure.

Do not retain a URL from this candidate list unless a source route exists, and do not omit an actual route because it is absent from this list.

### 6.3 Dynamic slug register

For each dynamic route:

1. Identify its source of valid slugs (content registry, database, fixture or route definition).
2. Generate a complete list of valid slugs automatically or directly from that source; do not rely on memory.
3. For each slug, check that title, content, complexity/metadata, actions and selected renderer correspond to that slug.
4. Verify that route parameters are validated and unsafe/unknown slugs do not fall through to another slug's content.
5. Test one intentionally invalid slug per dynamic route family and verify the correct 404 behavior and return destination.
6. Mark the row pending until the real route has been opened and checked.

Candidate slug sets that appeared in previous drafts (such as 12 algorithm entries, 10 data structures, three learning paths or 12 challenges) must be compared with the actual project data and corrected if different.

### 6.4 Overlay acceptance matrix

For each overlay that actually exists, record its source component, open trigger, close methods, focus behavior, scroll behavior, responsive appearance, and result. Candidate overlays include:

| Overlay candidate | Required checks if present |
|---|---|
| Global search dialog/popover | Shortcut opens; text input receives focus; result navigation works; arrows/Enter/Escape work if supported; focus returns to trigger |
| Mobile navigation drawer | Opens from its control; backdrop/Escape close; focus remains usable; page scroll is controlled; route navigation closes it |
| Graph editor/modal | Edit existing supported graph; input validation; save/cancel behavior; close with Escape if supported; no stale graph state |
| Presentation/fullscreen mode | Correct layout; playback state preserved on enter/exit; Escape handling; no hidden keyboard traps |
| Reset confirmation | Cancel is non-destructive; confirm performs the existing reset; focus handled correctly |
| Speed/algorithm dropdown | Current value displayed; valid choices selectable; keyboard behavior and click-away dismissal |
| Any additional dialog, popover, tooltip, menu or disclosure | Same shared checklist; do not omit just because it is not in the candidate set |

### 6.5 Per-route evidence standards

For each route and overlay test, record:

- URL, route variant/slug, browser/device, viewport width and height.
- Test date, commit, phase, and test build/revision.
- Actions performed and expected result.
- Actual result and pass/fail/blocked status.
- Screenshot(s), console/network errors where relevant, and linked issue/defect.
- Correction and re-test result.

---

## 7. Verified Command and Test Strategy

### 7.1 Command inventory before use

Phase 0 must create the authoritative unique `package.json` script table. Names and commands below are examples of likely checks based on earlier project notes; use them only if the current repository confirms them:

- `typecheck` / `tsc --noEmit`.
- `lint` / ESLint.
- Existing unit and feature test runners (Vitest or the repository's actual framework).
- Existing visualizer core/regression tests.
- Existing accessibility and responsive contract tests.
- Existing security/content/architecture checks.
- `build` / Next.js production build.

If a required test does not exist, add a scoped test or record the gap and proposed acceptance method. Do not create a fake script or empty test solely to make the gate green.

### 7.2 Required change discipline per phase

Before phase:
- Capture `git status --short` and confirm the intended branch/checkpoint.
- Run relevant baseline test(s) if practical.
- Read target files and their dependencies; don't replace files wholesale without understanding their behavior.

After phase:
- Inspect `git diff --check`, changed-file list and diff.
- Run verified phase tests.
- Open affected routes in the browser and exercise interactions.
- Record known failures separately as pre-existing, introduced, or environment-blocked.
- Do not remove/disable an existing test just because it fails.
- Obtain sign-off before moving on.

### 7.3 Testing layers

1. **Static:** Typecheck, lint, formatting check if configured, build/file-size/architecture checks if real and applicable.
2. **Unit:** Token/contrast utility, components, state engine invariants, playback cancellation, renderer transformations.
3. **Integration:** Playback controls with canonical trace, code/log synchronization, settings/API persistence, filters/URL state, graph/tree operations, auth flows if applicable.
4. **Browser/E2E:** Routes, dynamic slugs, navigation, forms, overlays, responsive interactions, error/loading states, keyboard operation.
5. **Visual:** Representative and route-family screenshots compared with reference and baseline.
6. **Performance:** Measured startup/interaction/animation budgets with method, environment and dataset recorded.
7. **Release:** Production build/start smoke test and documented unresolved risk acceptance.

---

## 8. Accessibility, Responsive, and Performance Gates

### 8.1 Responsive widths

Minimum widths: 1440px, 1024px, 768px and 320px. Test actual breakpoints from CSS and add a width immediately above/below each breakpoint. At each width verify:

- No unintended horizontal page overflow.
- Text and action labels are not clipped or overlapped.
- Navigation, toolbars, side panels and overlays remain usable.
- Canvas content can be inspected and operated; large graphs/trees do not make primary controls inaccessible.
- Dialogs fit vertically and can scroll without hiding the close/confirm actions.

### 8.2 Keyboard and assistive technology

- All essential interactions work from keyboard.
- Focus indicator is visible and not clipped.
- Menus/dialogs have appropriate focus handling and Escape behavior where expected.
- Buttons have accessible names; icon-only buttons have labels; decorative SVGs are hidden from assistive tech.
- Loading, error, success and step changes use suitable status semantics without excessively announcing every animation frame.
- Color is not the only status cue.
- Reduced motion is verified on both CSS and JS-driven motion.

### 8.3 Performance

- Define the baseline machine/browser and representative input sizes before measuring.
- Measure build and route startup, interaction latency, long tasks/layout shifts, and animation smoothness on the key visualizer interactions.
- Prefer transform/opacity and avoid unnecessary per-frame React rerenders or layout thrash.
- Test a normal dataset and a large supported dataset; record if performance degrades.
- Performance targets must be measured. Do not assert “60 fps” from visual impression or a code review alone.
- Record CLS target (<0.05 as an initial target) only if it is measured in the defined test environment.

---

## 9. Reference-Mockup Matching and Visual Review

For each major phase, compare screenshots to the user-approved reference mockup and baseline screenshots. Do not judge only the colors; check:

1. Overall canvas/background and layered surface hierarchy.
2. Header/sidebar proportions, main content width and workbench geometry.
3. Typography hierarchy, line lengths, dense technical labels and code readability.
4. Card size/density, spacing, alignment, border weight, corner radii and shadow/glow restraint.
5. Visualizer canvas proportions and the relationship among canvas, controls, code and event log.
6. Icon style/size/stroke consistency and lack of unintended emoji/Unicode navigation icons.
7. Active/completed/warning/error semantic states.
8. Loading/error/empty states and overlays.
9. Mobile/tablet arrangement and touch usability.
10. Motion cadence and state synchronization while idle, playing, scrubbing, resetting and at terminal states.

A screenshot mismatch should produce a defect entry, correction and re-capture. Mark visual review as Pass only when the recorded comparison is acceptable; keep it Pending otherwise.

---

## 10. Risk Register and Mitigations

| Risk | Impact | Mitigation | Required evidence |
|---|---|---|---|
| Route path assumptions are wrong | High: missing/broken pages | Generate authoritative route inventory in Phase 0; use literal verified paths | Route/file inventory and route smoke results |
| Shared CSS affects unrelated routes | High: widespread regressions | Change tokens first, review global selectors, test route families after each phase | Diff review and representative/all-route evidence |
| Stale animation callback overwrites state | High: visualizer lies about current state | Cancellation/sequence contract plus rapid-action regression tests | Passing playback race tests |
| UI redesign modifies algorithm behavior | High: correctness regression | Keep generators/engines unchanged and compare canonical trace outputs | Before/after trace and invariant tests |
| Unsupported feature inferred from old plan | High: scope expansion | Label scaffold/current behavior clearly; require separate approval for new feature | Feature-preservation matrix |
| Dark theme disables a functional preference | Medium/high: user-setting regression | Record and approve dark-only decision; preserve API enum and all other settings | Decision record and settings/API test |
| Font loading breaks offline build | Medium: CI/build failure | No required external build-time font fetch; use system fallbacks or local licensed fonts | Offline build evidence when required |
| Contrast is calculated for wrong backgrounds | Medium/high: unreadable states | Audit every actual pair; automatic calculation plus visual/browser review | Pairing matrix with ratios and results |
| Script inventory counts overlap | Medium: misleading readiness | Count unique script keys from package.json | Exact key/command manifest |
| Representative screenshot mistaken for route-wide QA | High: hidden page defects | Route-by-route matrix, dynamic slug coverage, overlay checklist | Completed acceptance record |
| Performance target is not measured | Medium: sluggish motion | Define environment/dataset and use browser performance measurements | Recorded metrics and run steps |

---

## 11. Phase Sign-Off Template

Copy this block for each phase and fill it after work is complete:

```text
Phase:
Commit / branch:
Changed files:
Pre-existing working-tree changes preserved: Yes / No (details)
Baseline checks and exit codes:
Post-phase checks and exit codes:
Routes / slugs / overlays checked:
Viewports and browser/device:
Motion/accessibility checks performed:
Screenshot / log evidence:
Defects found:
Corrections made and retest result:
Known failures / blockers (with owner/reason):
Scope expansion avoided or separately approved:
Decision: PASS / FAIL / BLOCKED / ACCEPTED WITH DOCUMENTED EXCEPTIONS
Reviewer sign-off:
```

Never use **Pass** for a test that was not executed. Use **Blocked** for environmental problems; use **Not Applicable** only with a reason. A passing build does not automatically mean visual QA or behavior QA passed.

---

## 12. Release Readiness Checklist

### Product and route coverage
- [ ] Phase 0 inventory reconciled with every actual route file and valid dynamic data source.
- [ ] All routes/route groups and valid dynamic slugs have recorded acceptance results.
- [ ] Invalid slugs, loading/error/not-found boundaries and overlays are verified.
- [ ] Scaffold status is accurate; no unapproved feature development was smuggled into styling work.
- [ ] Theme-setting decision is documented; unrelated settings preserved.

### Visual system
- [ ] All pages use the approved dark laboratory token system.
- [ ] All real foreground/background pairs have measured contrast results.
- [ ] Primary icons are consistent SVG outline icons, with educational symbols preserved where meaningful.
- [ ] Reference-mockup comparisons, responsive screenshots and corrections are recorded.
- [ ] Empty/loading/error/success/disabled/focus states are visually consistent.

### Correctness and accessibility
- [ ] Algorithm/DS canonical traces are unchanged unless a separately approved bug fix is documented.
- [ ] Playback race/cancellation/scrub/reset/end-state tests pass.
- [ ] Canvas/code/log/counters remain synchronized.
- [ ] Keyboard/focus/Escape/overlay behavior is verified.
- [ ] Reduced-motion behavior is verified.
- [ ] Persistence, API contracts, route links, metadata and feature flags are preserved.

### Build and release
- [ ] Exact package scripts and commands have been verified against `package.json`.
- [ ] Required static/unit/integration/browser tests are run and logged.
- [ ] Production build and smoke test succeed in the target environment.
- [ ] Performance measurements are recorded; no unmeasured claims remain.
- [ ] All P0/P1 defects are fixed; remaining known issues and exceptions have explicit approval.

---

## 13. Final Implementation Order

Use this sequence without skipping gates:

1. **Phase 0:** Repository preflight, route/component/feature/script inventories, baseline screenshots and test results.
2. **Phase 1:** Design tokens, typography, global styles and status/error/loading boundaries.
3. **Phase 2:** Shared shell, navigation, search and layout layers.
4. **Phase 3:** Shared content primitives, catalogs, filters and search results.
5. **Phase 4:** Visualizer shell, playback, timeline, code/log synchronization.
6. **Phase 5:** Every existing renderer family.
7. **Phase 6:** Detail templates, dynamic slugs and specialized labs.
8. **Phase 7:** Comparison, playgrounds, learning paths and challenges within current scope.
9. **Phase 8:** Workspace, auth, settings, progress/history/bookmarks and all remaining routes.
10. **Phase 9:** Complete verification, visual review, accessibility, performance and release gate.

**Starting instruction:** Begin with Phase 0 only. Do not implement Phase 1 until the real route inventory, target paths, script list, baseline results, feature-preservation matrix and any product decisions are documented. This plan is ready to guide implementation once those live-repository facts are filled in; it does not claim those facts or any tests have already been verified.
