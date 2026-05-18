# Slip Trail — Development Guide

## Project Overview

Receipt management app: camera → OCR → Groq parse → map trail + emotion pattern analysis.
**Target users**: North American, 25–35, smartphone-native.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 App Router |
| Styling | Tailwind CSS v4 + CSS variables (globals.css) |
| Animation | Framer Motion (`motion/react`) |
| State | Zustand (client draft state), TanStack React Query (server state) |
| Backend | Supabase (Postgres + Auth + Storage) |
| AI | Groq SDK (llama-3.1-8b-instant) |
| Maps | Leaflet + react-leaflet |
| Geocoding | Nominatim / OpenStreetMap |

---

## Folder Structure

```
app/
  (auth)/          # Auth flows — login, signup, onboarding, forgot/reset password
  (routes)/        # Main app — home, map, insights, receipts, settings
  (scan)/          # Scanner flow — camera, result, upload
  api/             # Next.js API routes (server-side only)
  components/
    ui/            # Atoms & molecules: Button, Card, Avatar, IconButton, icons, BaseDialog
    dashboard/     # Dashboard-specific widgets
    map/           # Map-specific components
    *.tsx          # Shared organisms: ReceiptCard, Header, BottomNav, ProcessingDialog
  hooks/           # React Query hooks + flow hooks
  lib/             # Pure utilities (no React imports)
  providers/       # React context providers
  utils/           # Formatting, class merging, image processing
lib/               # Server-safe utilities: Supabase clients, apiResponse
store/             # Zustand stores
types/             # TypeScript types (barrel: types/index.ts)
```

---

## Architecture Patterns

### 1. Atomic Design for Components

**Atoms** (`app/components/ui/`): single-responsibility, no business logic.
- `Button`, `IconButton`, `Avatar`, `Card`, `Skeleton`, `BaseDialog`, all icons

**Molecules** (`app/components/ui/` or root `components/`): composed from atoms.
- `InputField`, `Header`, `LocationSearch`

**Organisms** (`app/components/`): composed from molecules, may include domain logic.
- `ReceiptCard`, `TipPromptDialog`, `ProcessingDialog`, `BottomNav`

**Pages** (`app/(routes)/`): compose organisms, own data fetching via hooks.

### 2. Feature-Collocated Data Fetching

Each page owns its React Query hooks. Hooks live in `app/hooks/` named after the domain:
```
useReceipt.ts        # receipt list / detail
useDashboard.ts      # home dashboard
useAnalysisFlow.ts   # scanner pipeline
```

### 3. Single Source of Truth for Domain Constants

- **Feelings**: `lib/feelings.ts` — `FEELING_TAGS`, `FEELING_STYLES`, `FEELING_EMOJIS`, `FEELING_BORDER_COLORS`
- **Categories**: `lib/categories.ts` — `DEFAULT_CATEGORIES`, `getCategoryEmoji()`
- **Design tokens**: `app/globals.css` — CSS variables mapped via `@theme inline`

Never duplicate these in component files.

### 4. Server / Client Boundary

- `lib/supabase/server.ts` — server components and API routes only
- `lib/supabase/client.ts` — client components only
- API routes in `app/api/` must use `withAuth()` wrapper from `lib/apiHandler.ts`

---

## Coding Rules

### TypeScript
- All files are TypeScript (`.ts` / `.tsx`).
- Prefer explicit types on function parameters; avoid `any`.
- Use `type` for unions/intersections; `interface` only for extendable object shapes.
- Export types alongside their components in the same file.

### Styling
- Use `cn()` from `@utils/cn` (wraps `clsx` + `tailwind-merge`) for all class merging.
- Use CSS variables from `globals.css` via Tailwind tokens (`text-fg`, `bg-surface`, `border-border`).
- Avoid hardcoding hex values or raw Tailwind colors directly — use semantic tokens.
- Mobile-first: max-w-[430px] viewport, bottom nav at `bottom-0`, fixed CTAs at `bottom-[58px]`.

### Animations
- All enter/exit animations use Framer Motion (`motion/react`).
- Dialog entrances: `scale: 0.9 → 1`, `y: 20 → 0`, `opacity: 0 → 1`.
- Page transitions: `x: ±60 → 0`, `opacity: 0 → 1`.
- Spring for bottom sheets: `type: 'spring', stiffness: 380, damping: 38`.

### State
- **Server state** (lists, details): TanStack React Query via hooks in `app/hooks/`.
- **Draft/ephemeral UI state**: Zustand store in `store/`.
- **URL/navigation state**: Next.js `useRouter` and `usePathname`.
- Do not use React Context for data that React Query or Zustand can handle.

### Imports
Always use path aliases (configured in `tsconfig.json`):
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

| Token | Value | Use |
|---|---|---|
| `bg-brand` / `text-brand` | zinc-900 | Primary actions, headings |
| `bg-accent` | amber-500 | Money amounts, spending highlights |
| `text-fg` | zinc-900 | Primary text |
| `text-fg-muted` | zinc-600 | Body copy |
| `text-fg-subtle` | zinc-400 | Hints, disabled |
| `bg-surface` | white | Cards, modals |
| `bg-surface-subtle` | zinc-100 | Inputs, subtle backgrounds |
| `border-border` | zinc-200 | Default borders |

### Feeling Colors (from lib/feelings.ts)
Use `FEELING_STYLES`, `FEELING_EMOJIS`, `FEELING_BORDER_COLORS` — never hardcode per-feeling colors in components.

### Typography Hierarchy
- Large amounts: `text-6xl font-black tracking-tighter tabular-nums`
- Page titles: `text-3xl font-extrabold`
- Section labels: `text-xs font-semibold tracking-widest uppercase text-fg-subtle`
- Body: `text-sm text-fg-muted leading-relaxed`

---

## Git Workflow

- Branch: `claude/plan-receipt-app-LHVkW`
- Commits: descriptive, present tense, explain the "why"
- Never push to `main` directly
