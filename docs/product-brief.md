# Product Brief

> Grounded in the current app structure. Sections marked **[OPEN]** are not answerable from code — confirm with the user instead of guessing.

## What it is

Receipt management app: scan a receipt → OCR + Groq LLM extract vendor/date/total/items/category → store in Supabase → visualize spending as a map trail and an emotion pattern (feeling tagged per receipt).

**Target users:** North American, 25–35, smartphone-native. **[OPEN]** — beyond this, no stated business goal, monetization, or growth metric exists in the repo. Ask before assuming any.

## Core flow (scan)

`app/(scan)/` — `camera` → `upload` → `result`, backed by `useAnalysisFlow` / `useAnalysisMutation` and `store/analysisDraftStore.ts`.

1. Capture or pick a photo.
2. Upload to Supabase Storage (`/api/upload`).
3. OCR via external service → raw text.
4. `/api/parse-receipt` → Groq parses raw text into structured fields + category.
5. User confirms/edits the parsed result (feeling tag included) → saved as a receipt.

## Screens (`app/(routes)/`)

- **home** — dashboard (recent activity, summary widgets; see `useDashboard.ts` and `app/api/dashboard/*`).
- **map** — spending "trail" visualized on Leaflet using geocoded receipt locations.
- **insights** — emotion/spending pattern analysis (category breakdown, emotion-by-hour, month-over-month).
- **receipts** / **receipts/[id]** — list and detail view of saved receipts.
- **settings** — account/profile settings.

## Auth (`app/(auth)/`)

login, signup, onboarding, forgot-password, reset-password — standard Supabase Auth flow via `lib/supabase/`.

## Feeling tagging

Every receipt can carry a feeling tag (see `lib/feelings.ts` — `FEELING_TAGS`). This is the basis for the "emotion pattern" side of insights; it's a first-class concept, not a minor annotation, so don't treat it as optional metadata when touching receipt-related code.

## Explicitly out of scope (per README roadmap, unimplemented)

- Apollo GraphQL API layer
- Tip automation rules
- Line-item edit/recalculation
- Upload history/status list

Don't build toward these unless asked — they're backlog items, not current architecture.

## Open questions **[OPEN]**

- Monetization / business model
- Success metrics (what does "working" mean for this product?)
- Any constraints on Groq/OCR cost that should shape feature decisions
