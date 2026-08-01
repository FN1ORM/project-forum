# Project Forum: Design System

This document serves as the permanent, foundational design specification for Project Forum. It dictates the visual language, interaction patterns, and user experience paradigms that must be strictly followed for all current and future implementations.

---

## 1. Design Philosophy
Project Forum is an academic discussion platform, not a marketing website. Its design must prioritize reading comprehension, focus, and utility. 

- **Content-First:** The UI should recede into the background. Typography and spacing must optimize long-form reading, ensuring that complex academic questions and answers remain the focal point.
- **Calm & Professional:** The aesthetic must evoke trust and stability. We avoid flashy, hyper-vibrant elements that induce cognitive load or distract from the academic discourse.
- **Accessible & Inclusive:** The platform serves a diverse student and faculty body. High contrast, clear focus states, and generous touch targets are non-negotiable.
- **Timeless & Minimal:** By avoiding transient web design trends in favor of strong typographic hierarchies and solid grid systems, the software will remain modern and maintainable for years to come.

---

## 2. Color System
We utilize semantic tokens to ensure consistency. Absolute black (`#000000`) and absolute white (`#ffffff`) are strictly forbidden to reduce eye strain. We use **Emerald** as our primary brand color to symbolize growth, resolution (solved states), and academic progress.

### Light Mode
- **Background:** `zinc-50` (`#fafafa`) - Provides a soft canvas that is easier on the eyes than pure white.
- **Surface:** `white` (`#ffffff`) - Used strictly for elevated elements (cards, dialogs) to create subtle depth.
- **Surface Elevated:** `zinc-100` (`#f4f4f5`) - Used for hover states on surfaces.
- **Border:** `zinc-200` (`#e4e4e7`) - Subtle separation.
- **Primary Text:** `zinc-900` (`#18181b`) - Core reading text. Not pure black.
- **Secondary Text:** `zinc-500` (`#71717a`) - Metadata, timestamps, placeholders.
- **Muted Text:** `zinc-400` (`#a1a1aa`) - Disabled states.
- **Brand Primary:** `emerald-600` (`#059669`) - Primary buttons, active states, "Solved" indicators.
- **Brand Hover:** `emerald-700` (`#047857`)
- **Accent/Info:** `blue-600` (`#2563eb`) - Links, informational alerts.
- **Success:** `emerald-600` (`#059669`)
- **Warning:** `amber-500` (`#f59e0b`)
- **Danger:** `red-600` (`#dc2626`) - Destructive actions.

### Dark Mode (Non-Inverted)
Dark mode uses a distinct, cooler gray palette designed specifically for low-light legibility. 
- **Background:** `zinc-950` (`#09090b`) - Deep, but not pure black.
- **Surface:** `zinc-900` (`#18181b`) - Card backgrounds.
- **Surface Elevated:** `zinc-800` (`#27272a`) - Hover states, dropdowns.
- **Border:** `zinc-800` (`#27272a`)
- **Primary Text:** `zinc-100` (`#f4f4f5`)
- **Secondary Text:** `zinc-400` (`#a1a1aa`)
- **Muted Text:** `zinc-500` (`#71717a`)
- **Brand Primary:** `emerald-500` (`#10b981`)
- **Brand Hover:** `emerald-400` (`#34d399`)
- **Danger:** `red-500` (`#ef4444`)

---

## 3. Typography
- **Font Family:** `Geist` (Sans) for UI and Body. `Geist Mono` for code blocks.
- **Heading Hierarchy:**
  - `H1`: `text-3xl` (30px), `font-bold`, `tracking-tight`, `leading-tight`.
  - `H2`: `text-xl` (20px), `font-semibold`, `tracking-tight`, `leading-snug`.
  - `H3`: `text-lg` (18px), `font-medium`, `leading-snug`.
- **Body Text:** `text-base` (16px), `leading-relaxed` (1.625) to optimize long-form reading.
- **Small Text:** `text-sm` (14px), `leading-normal` for metadata, navigation, inputs.
- **Captions/Labels:** `text-xs` (12px), `font-medium`, `uppercase`, `tracking-wider` for tags and system labels.
- **Code Blocks:** `text-sm`, `font-mono`, `bg-zinc-100 dark:bg-zinc-900`, `p-4`, `rounded-md`.
- **Maximum Reading Width:** `max-w-prose` (approx 65-70 characters) on text-heavy content surfaces to prevent eye fatigue.
- **Paragraph Spacing:** `mb-6` between paragraphs in questions and answers.

---

## 4. Spacing System
Based on a strict 4px (0.25rem) grid to maintain rhythmic harmony.
- **Micro:** `2px`, `4px` (`gap-1`) - Checkbox to label, icon to text.
- **Small:** `8px` (`gap-2`) - Input elements, list items.
- **Medium:** `16px` (`gap-4`, `p-4`) - Card internal padding, form row spacing.
- **Large:** `24px` (`gap-6`, `p-6`) - Section gaps, main card padding.
- **Extra Large:** `32px` (`gap-8`), `48px` (`gap-12`) - Page header to content, major architectural sections.
- **Container Widths:** 
  - Forms/Auth: `max-w-md`
  - Reading/Threads: `max-w-3xl`
  - Dashboards/Tables: `max-w-5xl`
- **Mobile Spacing:** Screen padding defaults to `p-4`.
- **Desktop Spacing:** Screen padding scales to `p-8` or relies on centered containers with auto margins.

---

## 5. Border Radius
Used to soften the digital environment.
- **Small (`rounded-sm`, 2px):** Checkboxes, small structural tags.
- **Medium (`rounded-md`, 6px):** Buttons, Inputs, Dropdowns, Badges.
- **Large (`rounded-lg`, 8px):** Cards, Dialogs, Modals, Images.
- **Extra Large (`rounded-full`, 9999px):** Avatars, primary FABs, Status indicators.

---

## 6. Shadows & Elevation
Elevation is communicated via subtle shadows in Light Mode, and via background lightness in Dark Mode (not shadows, as shadows vanish on dark backgrounds).
- **Cards (Rest):** No shadow. Relies on a 1px border.
- **Cards (Hover):** `shadow-sm` (Light mode only) + border color shift.
- **Dropdowns/Menus:** `shadow-md` to pop over content.
- **Dialogs/Modals:** `shadow-xl` + full viewport glassmorphic backdrop.
- **Glass Panels:** Used on fixed/sticky elements (like Topnav). Requires `backdrop-blur-md` and a semi-transparent background (`bg-white/80` or `bg-zinc-950/80`).

---

## 7. Motion System
Motion must be practically invisible, used strictly to confirm interaction, never to dazzle.
- **Duration:** `duration-150` or `duration-200`.
- **Easing:** `ease-in-out` or `ease-out`.
- **Hover Animations:** Subtle background shifts (`hover:bg-zinc-100`), text color shifts, or slight border darkening.
- **Button Animations:** Slight scale-down on active/click (`active:scale-[0.98]`).
- **Modal Animations:** Quick fade-in (`animate-in fade-in zoom-in-95 duration-200`).
- **Image/PDF Viewers:** The thumbnail scales slightly on hover (`hover:scale-[1.02]`); the full viewer fades in upon navigation.
- **Loading:** Smooth, indeterminate pulsing (`animate-pulse`) for skeletons, spinning for minimal inline loaders.

---

## 8. Iconography
- **Library:** `Lucide React`.
- **Rules:** Icons should only be used when they distinctly aid comprehension (e.g., Download, Back, Search, Delete, User).
- **Sizes:** 
  - Inline buttons: `16px` (`w-4 h-4`)
  - Standalone actions: `20px` (`w-5 h-5`)
  - Empty state illustrations: `48px` (`w-12 h-12`)
- **Stroke Width:** `2px` consistently.

---

## 9. Component Library
- **Buttons:** 
  - *Primary:* `bg-emerald-600 text-white hover:bg-emerald-700`
  - *Secondary:* `bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50` (Dark: `bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800`)
  - *Destructive:* `bg-red-600 text-white hover:bg-red-700`
  - *Ghost:* `bg-transparent hover:bg-zinc-100 text-zinc-600`
- **Inputs & Textareas:** `bg-white dark:bg-zinc-950`, `border-zinc-200 dark:border-zinc-800`, `rounded-md`. Focus state uses `ring-2 ring-emerald-500/50 border-emerald-500`.
- **Cards (Subject, Question, Answer):** `bg-white dark:bg-zinc-900`, `border border-zinc-200 dark:border-zinc-800`, `rounded-lg`, `p-6`.
- **Badges/Tags:** `px-2.5 py-0.5`, `rounded-full`, `text-xs font-medium`. Solved: `bg-emerald-100 text-emerald-800`.
- **Dialogs/Modals:** Centered `<dialog>` or fixed `div`, max-width `md`, `p-6`, glassmorphic backdrop.
- **Dropdowns:** Triggered by avatar or "..." buttons. Absolutely positioned, `shadow-md`, `rounded-md`, `border`.
- **Tables (Admin):** Clean horizontal borders (`border-b`) only. Generous padding (`p-4`). 
- **Skeleton:** `bg-zinc-200 dark:bg-zinc-800`, `animate-pulse`, `rounded-md`.
- **Toast:** Bottom-right fixed, `shadow-lg`, dark background in light mode (`bg-zinc-900 text-white`), light in dark mode (`bg-zinc-100 text-zinc-900`).

---

## 10. Forms
- **Layout:** Vertical stacks. `gap-2` between label and input. `gap-6` between form groups.
- **Labels:** `text-sm font-medium text-zinc-900 dark:text-zinc-100`.
- **Validation:** Client-side validation triggers prior to Server Action execution.
- **Errors:** Displayed directly beneath the input in `text-sm text-red-600`. The input border turns `border-red-500`.
- **Disabled/Pending States:** Inputs get `opacity-50 cursor-not-allowed`. Submit buttons display a loading spinner and change text to "Submitting...".

---

## 11. Navigation
- **Top Navigation (Global):** A fixed, glassmorphic (`backdrop-blur-md bg-white/80 dark:bg-zinc-950/80`) top bar spanning the full width. Contains:
  - Left: Logo / Brand Name (clickable to Home).
  - Center: Breadcrumbs (e.g., Home / Mathematics / Limits).
  - Right: Search icon, Global User Menu Avatar.
- **User Menu (Dropdown):** Contains Profile info, Theme toggle, role-based contextual links (Teacher Dashboard, Admin Dashboard), and Logout.
- **Sidebar:** Not utilized. The platform remains full-width/centered column to prioritize reading.
- **Mobile Navigation:** Topnav condenses. User Menu transforms into a bottom-sheet or full-screen overlay if complex.

---

## 12. Feedback System
- **Toasts:** Brief, transient success messages ("Question posted", "Answer deleted"). Auto-dismiss after 4 seconds.
- **Loading Indicators:** 
  - Entire page loads: Managed via `loading.tsx` feeding Skeleton screens mapping the expected UI.
  - Form submissions: Inline button spinners.
- **Empty States:** Must include a subtle, 1-color Lucide icon (48px), a title ("No questions found"), a descriptive subtitle, and a primary CTA button ("Ask the first question").
- **Permission Denied / 404:** Custom `not-found.tsx` centered vertically, featuring a clean error message and a "Return Home" button.

---

## 13. Attachments
- **Preview Cards (Inline):** Displayed as `max-w-sm` bounded boxes below text. Images render as clickable thumbnails (hover scale + brightness). PDFs render as file cards with the document name and a "View PDF" link.
- **Viewers:** Dedicated routes using full-viewport, distraction-free UIs. The viewers feature a top bar with a "Back" button (powered by query parameters) and a "Download Original" button.

---

## 14. Accessibility
- **Color Contrast:** All text must meet WCAG AA standards (4.5:1 ratio). `zinc-500` against `zinc-50` is specifically chosen to pass.
- **Keyboard Navigation:** All interactive elements must be reachable via `Tab`. 
- **Focus Rings:** Native focus rings are disabled and replaced with a uniform `focus:outline-none focus:ring-2 focus:ring-emerald-500/50` across all inputs and buttons.
- **Touch Targets:** Minimum `44x44px` physical touch area for mobile buttons, regardless of visual icon size.
- **ARIA:** Critical icons must have `<span className="sr-only">Description</span>` or `aria-label`.

---

## 15. Responsive Rules
- **Mobile (`<640px`):** Stack all multi-column layouts. Screen padding is `p-4`. Inputs span `w-full`. Tables must be converted to card-lists to prevent horizontal scrolling.
- **Tablet (`sm`, `>=640px`):** Screen padding expands to `p-8`. Two-column internal grids allowed.
- **Laptop/Desktop (`md/lg`, `>=768px`):** Containers max out at their respective logical widths (`max-w-3xl`, `max-w-5xl`). Margins switch to `mx-auto` to center content on ultra-wide displays.

---

## 16. Dark Mode
Dark mode involves a deliberate color re-mapping, not a mathematical inversion.
- **Canvas:** Uses `bg-zinc-950`.
- **Surfaces (Cards):** Uses `bg-zinc-900`. The 1-step lightness difference provides depth.
- **Borders:** Uses `border-zinc-800`.
- **Primary Text:** `text-zinc-100` (Avoid `#ffffff` to prevent halation/blooming on OLED screens).
- **Buttons:** Secondary buttons transition to `bg-zinc-900 border border-zinc-800 hover:bg-zinc-800`. Primary Emerald buttons shift to `emerald-500` to maintain contrast against dark backgrounds.
- **Inputs:** `bg-zinc-950 border-zinc-800 focus:border-emerald-500`.
- **Tables (Admin):** Header rows use `bg-zinc-900`, alternating or hover rows use `bg-zinc-800/50`.
- **Viewers:** The image/PDF viewers naturally inherit `bg-zinc-950` as their vast canvas, creating a cinematic viewing experience.

---

## 17. Glassmorphism
Glassmorphism is inherently distracting and computationally heavy. It is used **sparingly** and only for Z-axis overlays that sit *above* scrolling content to provide context of the content beneath:
- **Approved Uses:**
  - The Global Top Navigation bar (`bg-white/80 backdrop-blur-md`).
  - Modal/Dialog backdrops (`bg-black/40 backdrop-blur-sm`).
- **Forbidden Uses:**
  - Standard Cards (Questions, Answers, Subjects).
  - Forms.
  - Buttons.
  - Reading surfaces.

---

## 18. Future Expansion
The system is designed to gracefully absorb future scope:
- **Notifications:** Will map seamlessly into a "Bell" icon in the Top Navigation, dropping down a `shadow-md` floating list panel.
- **Bookmarks/Saved:** Will manifest as a simple secondary icon action next to the Upvote button on Question Cards.
- **Profiles & Reputation:** The Avatar component is already scoped. Reputation scores will append next to usernames in a muted `text-xs` badge.
- **Messaging:** Will utilize a sidebar layout (the only valid use case for a sidebar in this system) bounded by `max-w-5xl`.

---

## Implementation Roadmap

To systematically execute this redesign without destabilizing the application, work will be grouped into independently testable tickets.

### Ticket UI-01: Global Top Navigation & Layout
**Goal:** Implement the persistent Top Nav, User Dropdown, and standardize semantic HTML layouts.
- Install `lucide-react`.
- Create `components/topnav.tsx` and integrate it into `app/layout.tsx`.
- Move the Logout logic into a dropdown menu in the Topnav.
- Remove redundant Home page login/logout buttons; redesign Home page into a true dashboard.

### Ticket UI-02: Core Design System Components
**Goal:** Build the primitive UI blocks to eradicate repetitive Tailwind strings.
- Create `components/ui/button.tsx` (supporting variants).
- Create `components/ui/input.tsx` and `components/ui/textarea.tsx`.
- Create `components/ui/card.tsx`.
- Create `components/ui/badge.tsx`.

### Ticket UI-03: Refactoring Dashboards & Forms
**Goal:** Apply the new components to the Admin, Teacher, and Auth routes.
- Rewrite `app/admin/page.tsx` using `<Card>` and a responsive list view for mobile.
- Rewrite `app/teacher/page.tsx` utilizing consistent Card lists.
- Upgrade Login and Ask Question forms with the new Input/Textarea components.

### Ticket UI-04: Thread UI & Reading Experience
**Goal:** Overhaul the core reading experience on Subject and Question pages.
- Refactor `app/questions/[id]/page.tsx` typography for optimal reading (`max-w-prose`, `leading-relaxed`).
- Standardize the Upvote buttons, metadata rows, and attachment cards.
- Add `date-fns` for relative timestamp formatting (e.g., "2 hours ago").

### Ticket UI-05: State Management & Feedback (Loading/Errors)
**Goal:** Introduce professional feedback loops.
- Add `loading.tsx` with Skeleton loaders across all major routes.
- Integrate a Toast notification provider (e.g., `sonner`) for Server Action success/error feedback.
- Build a custom `not-found.tsx` and implement `<AlertDialog>` for the Delete actions.
