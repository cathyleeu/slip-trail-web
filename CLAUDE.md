# Slip Trail — Development Guide

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

> **Core Tradeoff:** These guidelines heavily bias toward caution and precision over raw speed. For trivial tasks, use your engineering judgment.

---

## 1. Think Before Coding

**Do not assume. Do not hide confusion. Surface tradeoffs early.**

Before writing any code, adhere to the following checklist:

- **Explicit Assumptions:** State your assumptions clearly before implementing. If anything is uncertain, ask for clarification first.
- **Present Alternatives:** If a requirement allows multiple interpretations, present the options instead of picking one silently.
- **Push for Simplicity:** If a simpler approach exists, suggest it. Push back against over-engineering when warranted.
- **Stop on Ambiguity:** If a concept or requirement is unclear, stop immediately. Name the confusion and ask the user.

## 2. Simplicity First

**Write the minimum code required to solve the exact problem. Zero speculative engineering.**

- **Strict Scope:** Do not add features, abstractions, or helpers beyond what was explicitly requested.
- **No Premature Flexibility:** Avoid building single-use code with unnecessary "configurability" or "future-proofing."
- **No Redundant Error Handling:** Do not write defensive code or error handling for impossible or out-of-scope scenarios.
- **Aggressive Refactoring for Brevity:** If a solution takes 200 lines but could realistically be done in 50, stop and rewrite it.

> 💡 **The Senior Test:** "Would a senior engineer look at this and say it is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what is strictly necessary. Clean up only your own mess.**

When modifying existing code:

- **No Scope Creep:** Do not "improve," reformat, or fix comments in adjacent, unrelated code.
- **Respect Existing Style:** Match the codebase's existing style, patterns, and paradigms perfectly—even if you disagree with them.
- **Unrelated Dead Code:** If you notice pre-existing unused code, mention it in text. Do **not** delete it unless explicitly asked.

When your changes create orphans:

- **Clean Your Workspace:** Remove any imports, variables, or functions that _your_ specific changes rendered obsolete or unused.

> 💡 **The Diff Test:** Every single line in the final diff must trace directly and uniquely back to the user's explicit request.

## 4. Goal-Driven Execution

**Define success criteria before you start. Loop and verify independently.**

Transform abstract tasks into verifiable, binary goals:

- _Example (Validation):_ Instead of "Add validation," use "Write/run tests for invalid inputs, then implement the logic to make them pass."
- _Example (Bug Fix):_ Instead of "Fix the bug," use "Reproduce the bug with a failing test case, then implement the fix to make it pass."

For multi-step or complex tasks, always output a brief, sequential plan using this exact format before coding:

```text
1. [Step Description] → verify: [Specific, measurable check]
2. [Step Description] → verify: [Specific, measurable check]
3. [Step Description] → verify: [Specific, measurable check]

```

> **Success Metrics:** These guidelines are working effectively if your diffs contain zero unnecessary changes, no rewrites are required due to over-complication, and clarifying questions are raised _before_ implementation rather than after a mistake.

---

## Project Overview

Receipt management app: camera → OCR → Groq parse → map trail + emotion pattern analysis.

- **Target Users:** North American, 25–35, smartphone-native.

---

## Tech Stack

| Layer         | Tool                                                              |
| ------------- | ----------------------------------------------------------------- |
| **Framework** | Next.js 16 App Router                                             |
| **Styling**   | Tailwind CSS v4 + CSS variables (globals.css)                     |
| **Animation** | Framer Motion (motion/react)                                      |
| **State**     | Zustand (client draft state), TanStack React Query (server state) |
| **Backend**   | Supabase (Postgres + Auth + Storage)                              |
| **AI**        | Groq SDK (llama-3.1-8b-instant)                                   |
| **Maps**      | Leaflet + react-leaflet                                           |
| **Geocoding** | Nominatim / OpenStreetMap                                         |

---

## Folder Structure

```text
app/
  (auth)/           # Auth flows — login, signup, onboarding, forgot/reset password
  (routes)/         # Main app — home, map, insights, receipts, settings
  (scan)/           # Scanner flow — camera, result, upload
  api/              # Next.js API routes (server-side only)
  components/
    ui/             # Atoms & molecules: Button, Card, Avatar, IconButton, icons, BaseDialog
    dashboard/      # Dashboard-specific widgets
    map/            # Map-specific components
    *.tsx           # Shared organisms: ReceiptCard, Header, BottomNav, ProcessingDialog
  hooks/            # React Query hooks + flow hooks
  lib/              # Pure utilities (no React imports)
  providers/        # React context providers
  utils/            # Formatting, class merging, image processing
lib/                # Server-safe utilities: Supabase clients, apiResponse
store/              # Zustand stores
types/              # TypeScript types (barrel: types/index.ts)

```

---

## Architecture Patterns

### 1. Atomic Design for Components

- **Atoms** (app/components/ui/): Single-responsibility, no business logic.
- _Examples:_ Button, IconButton, Avatar, Card, Skeleton, BaseDialog, all icons.

- **Molecules** (app/components/ui/ or root components/): Composed from atoms.
- _Examples:_ InputField, Header, LocationSearch.

- **Organisms** (app/components/): Composed from molecules, may include domain logic.
- _Examples:_ ReceiptCard, TipPromptDialog, ProcessingDialog, BottomNav.

- **Pages** (app/(routes)/): Compose organisms, own data fetching via hooks.

### 2. Feature-Collocated Data Fetching

Each page owns its React Query hooks. Hooks live in app/hooks/ named after the domain:

- useReceipt.ts (receipt list / detail)
- useDashboard.ts (home dashboard)
- useAnalysisFlow.ts (scanner pipeline)

### 3. Single Source of Truth for Domain Constants

Never duplicate these constants in component files. Use centralized files:

- **Feelings:** lib/feelings.ts — FEELING_TAGS, FEELING_STYLES, FEELING_EMOJIS, FEELING_BORDER_COLORS
- **Categories:** lib/categories.ts — DEFAULT_CATEGORIES, getCategoryEmoji()
- **Design Tokens:** app/globals.css — CSS variables mapped via @theme inline

### 4. Server / Client Boundary

- lib/supabase/server.ts — Server components and API routes only.
- lib/supabase/client.ts — Client components only.
- **API Routes:** All endpoints in app/api/ must use the withAuth() wrapper from lib/apiHandler.ts.

---

## Coding Rules

### TypeScript

- All files must use TypeScript (.ts / .tsx).
- Prefer explicit types on function parameters; strictly avoid any.
- Use type for unions/intersections; use interface only for extendable object shapes.
- Export types alongside their components within the same file.

### Styling

- Use cn() from @utils/cn (wraps clsx + tailwind-merge) for all class merging.
- Use CSS variables from globals.css via Tailwind tokens (text-fg, bg-surface, border-border).
- Avoid hardcoding hex values or raw Tailwind colors directly—always use semantic tokens.
- **Mobile-First Constraints:** max-w-[430px] viewport, bottom nav at bottom-0, fixed CTAs at bottom-[58px].

### Animations

- All enter/exit animations must use Framer Motion (motion/react).
- **Dialog Entrances:** scale: 0.9 → 1, y: 20 → 0, opacity: 0 → 1.
- **Page Transitions:** x: ±60 → 0, opacity: 0 → 1.
- **Bottom Sheets:** Use spring dynamics: { type: 'spring', stiffness: 380, damping: 38 }.

### State Management

- **Server State:** TanStack React Query via domain hooks in app/hooks/.
- **Draft / Ephemeral UI State:** Zustand stores located in store/.
- **URL / Navigation State:** Next.js useRouter and usePathname.
- _Rule:_ Do not use React Context for data that React Query or Zustand can naturally handle.

### Imports

Always use path aliases configured in tsconfig.json:

```ts
@components     → app/components
@components/ui  → app/components/ui
@hooks          → app/hooks
@lib            → lib
@store          → store
@types          → types
@utils          → app/utils

```

---

## Design System — Warm Utility

### Palette (from globals.css)

| Token                 | Value     | Use                                |
| --------------------- | --------- | ---------------------------------- |
| bg-brand / text-brand | zinc-900  | Primary actions, headings          |
| bg-accent             | amber-500 | Money amounts, spending highlights |
| text-fg               | zinc-900  | Primary text                       |
| text-fg-muted         | zinc-600  | Body copy                          |
| text-fg-subtle        | zinc-400  | Hints, disabled states             |
| bg-surface            | white     | Cards, modals                      |
| bg-surface-subtle     | zinc-100  | Inputs, subtle backgrounds         |
| border-border         | zinc-200  | Default borders                    |

### Feeling Colors

- Mandatorily use FEELING_STYLES, FEELING_EMOJIS, and FEELING_BORDER_COLORS from lib/feelings.ts.
- Never hardcode per-feeling colors or styles directly inside components.

### Typography Hierarchy

- **Large Amounts:** text-6xl font-black tracking-tighter tabular-nums
- **Page Titles:** text-3xl font-extrabold
- **Section Labels:** text-xs font-semibold tracking-widest uppercase text-fg-subtle
- **Body Text:** text-sm text-fg-muted leading-relaxed

---

## Git Workflow

- **Active Branch:** claude/plan-receipt-app-LHVkW
- **Commits:** Descriptive, present tense, always explain the "why".
- **Constraint:** Never push directly to the main branch.

---
