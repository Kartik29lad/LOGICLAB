# LogicLab — State Ownership Model & Architecture Contract

**Document Type:** Architectural Contract  
**Status:** Approved Specification Baseline

---

## 1. Core Principle

Every state value in LogicLab has **exactly one clear owner**. State must never drift or be duplicated across competing storage mechanisms.

---

## 2. State Ownership Matrix

| State Category              | Source of Truth                     | Storage Mechanism             | Examples                                                                                                                       |
| --------------------------- | ----------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Server State**            | SQL Server (`LogicLab_Development`) | Server API / Repositories     | User profiles, progress records, challenge attempts, favorites, saved experiments, history logs.                               |
| **URL State**               | Browser URL / Next.js Router        | Query params & route segments | Current algorithm slug (`/algorithms/quick-sort`), active tab (`?tab=complexity`), active search filter (`?category=sorting`). |
| **Feature State**           | React Component Tree                | `useState` / `useReducer`     | Form draft inputs, dialog open/close flags, temporary validation messages, dropdown open states.                               |
| **Visualizer State**        | Visualizer Engine Store             | Custom Playback Hook / Store  | Current execution step index, playback state (`PLAYING`, `PAUSED`), playback speed (1.0x), active highlighted element IDs.     |
| **Persistent Client State** | Browser Local Storage               | Safe LocalStorage Adapter     | Theme preference (`dark` / `light`), audio toggle, dismissed onboarding banner flags.                                          |

---

## 3. Strict Prohibitions

1. **No Hidden Second Database:** `localStorage` or `IndexedDB` must never become an uncoordinated shadow database for user progress, challenge attempts, or bookmarks. All persistent learning state is server-authoritative.
2. **No Business Logic in UI Stores:** Visualizer stores only hold trace step cursors and playback timing. The execution engine produces immutable trace steps before visualization begins.
3. **URL Shareability:** Any view that can be shared between learners (such as a specific algorithm detail view or comparison configuration) must derive its identity from the URL.
