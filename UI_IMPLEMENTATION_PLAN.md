# UI Implementation Plan

This document outlines the systematic, phased implementation of the Project Forum Design System. Every decision here optimizes for maintainability, avoiding unnecessary abstractions, and strictly adhering to the "Server Components first" architecture.

---

## 1. Existing Screens Audit & Improvement Strategy

### `app/page.tsx` (Home)
- **Purpose:** Gateway for unauthenticated users; subject directory and minimal profile view for authenticated users.
- **Problems:** Disconnected from advanced workflows. No links to Teacher/Admin dashboards. Awkwardly houses the only Logout button.
- **UX Improvements:** Transform into a true User Dashboard showing personalized recent activity rather than just a static list.
- **UI Improvements:** Adopt grid-based Subject Cards rather than full-width list items. Standardize the typographic scale.
- **Accessibility:** Add semantic `<main>` and `<header>` tags.
- **Mobile:** Reduce `py-32 px-16` padding to `py-8 px-4` to reclaim viewport space.
- **Dark Mode:** Soften the absolute black background to `zinc-950`.

### `app/login/page.tsx` (Login)
- **Purpose:** OAuth entry point.
- **Problems:** Extremely basic. Error states are dumped as raw text blocks.
- **UX Improvements:** Auto-dismiss error states after reading.
- **UI Improvements:** Center within the screen perfectly using modern Flexbox. Give the container subtle `shadow-sm`.
- **Accessibility:** Ensure the Google login button has proper ARIA descriptors.
- **Mobile:** Ensure container spans 100% width on small screens.
- **Dark Mode:** Update `bg-black` to `bg-zinc-950`.

### `app/subjects/[slug]/page.tsx` (Subject Feed)
- **Purpose:** Displays all questions under a specific academic subject.
- **Problems:** Dates are absolute (`10/12/2026`). No tags or avatars. Empty states are sterile.
- **UX Improvements:** Format relative dates ("2 hours ago"). Add clear "Solved" vs "Unsolved" visual distinction.
- **UI Improvements:** Wrap the feed items in the new `Card` component specification.
- **Accessibility:** Add `aria-label` to the "Ask Question" button.
- **Mobile:** Stack metadata cleanly. Ensure the "Ask Question" button spans full width on mobile.
- **Dark Mode:** Shift borders to `border-zinc-800`.

### `app/subjects/[slug]/ask/page.tsx` (Ask Form)
- **Purpose:** Question submission form.
- **Problems:** Uses native `<form>` tags heavily duplicated with inline Tailwind. No loading state during submission.
- **UX Improvements:** Disable the submit button and show a spinner during server transit.
- **UI Improvements:** Migrate to standardized `Input` and `Textarea` blocks.
- **Accessibility:** Add proper `<label>` mapping and `aria-invalid` bindings on error.
- **Mobile:** Re-balance padding (`p-4`).
- **Dark Mode:** Soften backgrounds and focus rings.

### `app/questions/[id]/page.tsx` (Thread Detail)
- **Purpose:** Core reading experience displaying a Question and its Answers.
- **Problems:** Cluttered action bar. Deletion happens instantly without confirmation.
- **UX Improvements:** Implement a confirmation dialog before deletion. Format upvote actions logically.
- **UI Improvements:** Constrain line length to `max-w-prose`. Increase line-height to `leading-relaxed`.
- **Accessibility:** Focus management on answer submission.
- **Mobile:** Ensure long code blocks wrap or scroll horizontally without breaking the viewport.
- **Dark Mode:** Ensure reading contrast strictly meets WCAG AA (using `zinc-100` for primary text).

### `app/questions/[id]/edit/page.tsx` & `app/answers/[id]/edit/page.tsx` (Edit Forms)
- **Purpose:** Content mutation.
- **Problems:** Repetitive UI disconnected from the main Ask Form.
- **UX/UI Improvements:** Standardize inputs. Apply loading states on save.

### `app/teacher/page.tsx` (Teacher Dashboard)
- **Purpose:** Faculty oversight of unsolved/unanswered questions.
- **Problems:** Undiscoverable without typing the URL. UI is identical to standard feeds.
- **UX Improvements:** Make accessible via the Global Top Navigation.
- **UI Improvements:** Implement multi-column grid layouts for question categories on desktop.
- **Accessibility:** Heading structures (`H1` -> `H2` -> `H3`) need strict adherence.

### `app/admin/page.tsx` (Admin Dashboard)
- **Purpose:** User role management.
- **Problems:** Standard `<table>` causes horizontal overflow on mobile screens. Select dropdowns are unstyled.
- **UX Improvements:** Add search debouncing. Add confirmation before removing roles.
- **UI Improvements:** Redesign into a Card-list format for mobile, preserving the table only on desktop (`md:table`).
- **Accessibility:** Add `<label className="sr-only">` to role dropdowns.

### `app/attachments/view/[id]/page.tsx` & `app/attachments/image/[id]/page.tsx` (Viewers)
- **Purpose:** Full-screen asset preview.
- **Problems:** Perfect as recently implemented.
- **UX/UI Improvements:** Will simply inherit the global `zinc-950` dark mode background shift.

---

## 2. Reusable UI Patterns
To avoid "framework-heavy" abstractions, we will only build components that genuinely reduce repetition and enforce consistency.
- **Layout & Structure:** `TopNav`
- **Primitives:** `Button` (with variants), `Input`, `Textarea`, `Badge`.
- **Containers:** `Card` (simple wrapper passing children).
- **Feedback:** `Spinner`, `Toast`, `ConfirmDialog`.
- **States:** `EmptyState` (Icon + Title + CTA), `Skeleton` (animated placeholder).

*(Note: We will NOT build complex abstractions like a `<Form>` wrapper or a `<Table>` component library. Native HTML wrapped in our standardized CSS classes is more maintainable.)*

---

## 3. Dependency Graph
To ensure a non-breaking, incremental rollout, work must proceed in this order:

1. **Global Constants:** Update `globals.css` and `tailwind.config` to define the base `zinc` and `emerald` palette.
2. **UI Primitives:** Implement `Button`, `Input`, `Textarea`, `Badge`, `Card`. *(No dependencies)*
3. **Global Layout:** Implement `TopNav`. *(Depends on UI Primitives & Auth Session)*
4. **Interactive Overlays:** Implement `ConfirmDialog`, `Toast`. *(Depends on UI Primitives)*
5. **Page Refactors:** Migrate existing screens to consume the new primitives and layouts. *(Depends on all above)*
6. **State Polish:** Implement `loading.tsx`, `not-found.tsx`. *(Depends on UI Primitives)*

---

## 4. Implementation Tickets

### TICKET UI-01: Global Visual Foundation
- **Goal:** Establish the global visual foundation (design tokens, color system, typography, dark mode theme).
- **Scope:** Update `globals.css` with the new theme configuration. No React components, no page redesigns.
- **Files affected:** `app/globals.css`.
- **Acceptance Criteria:** The application remains completely functional and visually very similar, but inherits the updated base variables (like `zinc-950` for dark mode).
- **Test Plan:** Verify light and dark modes toggle correctly and base backgrounds inherit the new tokens.
- **Rollback Strategy:** Revert `globals.css`.

### TICKET UI-02: Primitive UI Components
- **Goal:** Create only the primitive reusable UI components.
- **Scope:** Build `Button`, `Input`, `Textarea`, `Card`, and `Badge`. Do not build Form or Table wrappers.
- **Files affected:** `components/ui/*`.
- **Acceptance Criteria:** Components exist and support defined variants.
- **Test Plan:** Render each component on a test route temporarily to verify styling.
- **Rollback Strategy:** Delete the `components/ui/` directory.

### TICKET UI-03: Global Navigation & Layout Shell
- **Goal:** Provide a unified header and navigation structure across the app.
- **Scope:** Create `TopNav`. Inject it into `app/layout.tsx`. Remove the Logout button from the Home page. Add dynamic links for Teacher/Admin based on role.
- **Files affected:** `app/layout.tsx`, `components/nav/*`, `app/page.tsx`.
- **Acceptance Criteria:** Every page features a glassmorphic top bar. Auth state is visible. Admin/Teacher links appear automatically for authorized users.
- **Test Plan:** Log in as an Admin. Verify the dropdown shows "Admin Dashboard". Click it. Resize to mobile and verify layout integrity.
- **Rollback Strategy:** Revert `app/layout.tsx` and `app/page.tsx` from Git history.

### TICKET UI-04: Forms & Authentication Polish
- **Goal:** Standardize data entry and error handling.
- **Scope:** Refactor `Ask Form`, `Edit Forms`, and `Login` to use the new UI primitives. Implement loading states on form submit buttons.
- **Files affected:** `app/login/page.tsx`, `app/subjects/[slug]/ask/page.tsx`, `app/questions/[id]/edit/page.tsx`.
- **Acceptance Criteria:** Forms utilize semantic layouts, focus rings match brand colors, and submitting disables the button while showing a spinner.
- **Test Plan:** Submit a question. Verify the button grays out and spins while awaiting server response.
- **Rollback Strategy:** Revert affected page files.

### TICKET UI-05: Thread & Feed Overhaul
- **Goal:** Optimize the core reading experience and standardize lists.
- **Scope:** Refactor `Home`, `Subject Feed`, and `Question Detail` to use `Card` and `Badge` components. Integrate `date-fns` for relative dates. Apply typography rules (`max-w-prose`).
- **Files affected:** `app/page.tsx`, `app/subjects/[slug]/page.tsx`, `app/questions/[id]/page.tsx`.
- **Acceptance Criteria:** Thread lists look like elevated cards. Dates read as "2 hours ago". Question bodies are highly legible.
- **Test Plan:** Read a question on a mobile device and a 4K monitor. Verify line lengths are comfortable and text contrast passes WCAG AA.
- **Rollback Strategy:** Revert affected page files.

### TICKET UI-06: Dashboards & Mobile Tables
- **Goal:** Modernize Teacher and Admin hubs.
- **Scope:** Refactor `/teacher` and `/admin`. Convert the Admin table to a responsive layout (cards on mobile, table on desktop). Use new `Select` / `Input` for role management and search.
- **Files affected:** `app/teacher/page.tsx`, `app/admin/page.tsx`.
- **Acceptance Criteria:** Admin dashboard doesn't horizontally scroll on an iPhone. Search inputs match global styling.
- **Test Plan:** Load Admin page on a simulated mobile viewport. Verify rows stack vertically.
- **Rollback Strategy:** Revert affected page files.

### TICKET UI-07: Feedback, States & Polish
- **Goal:** Eliminate silent failures and abrupt loads.
- **Scope:** Create `loading.tsx` skeletons for major routes. Implement an `<AlertDialog>` wrapper for the `DeleteButton`. Implement custom `not-found.tsx`.
- **Files affected:** `app/**/loading.tsx`, `components/delete-button.tsx`, `app/not-found.tsx`.
- **Acceptance Criteria:** Clicking delete triggers a confirmation modal. Hard-refreshing a page shows a skeleton loader instantly.
- **Test Plan:** Click "Delete Question". Deny the modal prompt; verify nothing deletes. Accept the prompt; verify deletion.
- **Rollback Strategy:** Revert `delete-button.tsx` and delete loading files.

---

## 5. Roadmap Adjustments Justification
- **Removed the "Toast" system from Phase 1:** Implementing robust, accessible toast notifications from scratch is notoriously complex. We will rely on inline error boundaries and clear form feedback first. 
- **Zero Abstract "Wrappers":** I explicitly chose *not* to abstract `<Table>` or `<Form>` into dedicated React components. Wrapping native HTML structures in React components purely for styling creates prop-drilling nightmares and reduces maintainability. We will use composition via standard Tailwind classes or minimal pure components.
- **Phased Navigation Rollout:** By establishing the `TopNav` early in Ticket UI-02, we immediately solve the biggest UX problem (Navigation Dead Ends & Undiscoverable Roles) before tackling minor aesthetic tweaks, delivering immense user value upfront.
