# Architecture Notes

> Coding conventions (atomic design levels, server/client boundary, styling rules) live in `CLAUDE.md`. This file covers **why** the data flow is shaped this way, and an index of what already exists so new code isn't built on top of it by accident.

## Data Flow

```
Camera capture (app/(scan)/camera)
  → authenticated POST /api/ocr (called from useAnalysisMutation.requestOcr)
  → external OCR service (server-only OCR_API_URL and OCR_API_KEY)
  → POST /api/parse-receipt  (rawText → lib/groq.ts → Groq llama-3.1-8b-instant)
  → Supabase (receipts / items / places tables)
  → read side: app/(routes)/home, /map, /insights, /receipts
```

Why it's split this way:

- **OCR processing runs in a separate service behind the authenticated web proxy.** `/api/ocr` forwards multipart `image` using server-only `OCR_API_URL` and `OCR_API_KEY` (`X-API-Key`), wraps `{ text }`, and bounds upstream work to 30 seconds. Both client and proxy enforce a 4MB OCR image limit to leave multipart overhead below Vercel's 4.5MB request limit; compression also targets 4MB. Before rollout, the external service must validate the key and a real image request must be recorded. Keep OCR model execution in the external service.
- **`/api/parse-receipt` bounds the input before calling the LLM** (`rawText` must be 30–20,000 chars, see `MAX_RAW_TEXT_LENGTH` in `app/api/parse-receipt/route.ts`). This is a cost/abuse guard on the Groq call, not incidental validation — don't remove it when touching that route.
- **Every `app/api/*` route is wrapped in `withAuth()`** (`lib/apiHandler.ts`). This is the only place user/session/supabase client should come from in a route handler.

## Reuse Index

Check this list before adding a new component, hook, or utility. If something close already exists, extend it instead of writing a parallel version.

**UI atoms** (`app/components/ui/`): `Button`, `IconButton`, `Avatar`, `Card`, `BaseDialog`, `SegmentToggle`, `Toast`, `icons.tsx` (all icons — don't inline new SVGs if one exists here).

**Shared organisms** (`app/components/`): `Header`, `BottomNav`, `ReceiptCard`, `ReceiptCapture`, `ProcessingDialog`, `TipPromptDialog`, `LocationSearch`, `Skeleton`, `Divider`, `Input`, `InputField`.

**Domain hooks** (`app/hooks/`): `useAuth`, `useProfile`, `useCamera`, `useCategories`, `useReceipt`, `useDashboard`, `useAnalysisFlow` / `useAnalysisMutation` (scan pipeline), `useTab`, `useInput`.

**Server-safe utilities** (`lib/`): `apiHandler.ts` (`withAuth`), `apiResponse.ts` (`apiSuccess`/`apiError`), `groq.ts` (LLM parsing + `coerceCategory`), `feelings.ts`, `categories.ts`, `location.ts`, `nomalizedAddress.ts`, `caseConverter.ts`, `chartColors.ts`, `queryKeys.ts`, `validation.ts`, `logger.ts`, `httpFetcher.ts` (client `request()` + `ApiError`).

**State** (`store/`): `analysisDraftStore.ts` — Zustand store for the in-progress scan draft. This is the only client draft state; don't add a second store for the same flow.

**API routes** (`app/api/`): `upload`, `ocr`, `parse-receipt`, `receipts`, `receipts/[id]`, `map-receipts`, `geocode`, `profile`, `dashboard/*` (category-breakdown, emotion-by-hour, emotion-breakdown, recent-places, mom, summary, spend-series, timeseries, top-places).

> `README.md`'s roadmap section mentions Apollo GraphQL and PaddleOCR (`python/ocr.py`) — neither exists in the current codebase (OCR is the external service above, data access is plain Supabase queries, no GraphQL layer). Treat the README roadmap as historical/aspirational, not current architecture, until someone updates it.
