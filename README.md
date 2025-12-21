# Slip Trail

A receipt management app that uses local OCR and Groq LLM to parse receipts, storing data in Supabase and visualizing spending on a map.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

---

## Skills & Libraries Used

**OCR & AI**

- [PaddleOCR](https://www.paddlepaddle.org.cn/paddle/ocr): Local OCR in `python/ocr.py` for text extraction.
- [Groq SDK](https://groq.com): LLM parsing of raw OCR text into structured fields.

**Data & Auth**

- [Supabase](https://supabase.com/docs): Postgres database, file storage, and authentication.
- [PostgreSQL](https://www.postgresql.org/docs/): Primary relational datastore managed via Supabase.

**API & Data Fetching**

- [Apollo GraphQL](https://www.apollographql.com/docs/): Official API layer at `/api/graphql` for receipts/items/places.
- [TanStack Query](https://tanstack.com/query/v4/docs/overview): Client-side fetching/caching for serverless endpoints like `/api/ocr`.

**Web Framework**

- [Next.js](https://nextjs.org/docs): App Router, serverless routes, and UI rendering.

**UI & Styles**

- [Tailwind CSS](https://tailwindcss.com/docs/installation): Utility-first styling.
- [Radix UI](https://www.radix-ui.com/primitives/docs/overview/introduction): Accessible UI primitives.
- [Framer Motion](https://www.framer.com/motion/): Animations and micro-interactions.

**Maps & Geocoding**

- [Leaflet](https://leafletjs.com/reference.html): Map rendering and interaction.
- [Nominatim](https://nominatim.org/release-docs/latest/): OpenStreetMap geocoding and reverse-geocoding.

**Dev & Tooling**

- TypeScript: Static typing across the app.
- ESLint + Prettier: Code quality and formatting.
- pnpm: Fast, disk-efficient package management.

---

## Project Roadmap

**Core Platform**

- [x] init project
- [x] set up basic folder structure
- [x] configure Tailwind CSS
- [x] client setup
- [ ] global error boundary + empty states
- [x] env var validation (GROQ, Supabase) on startup

**Data Layer**

- [x] Supabase schema
- [x] Storage: create bucket `sliptrail-bills` + public policy
- [ ] Apollo GraphQL server at `/api/graphql`
- [ ] Client queries/mutations for receipts/items/places
- [ ] Image upload UI with progress + retry

**OCR & AI Pipeline**

- [x] OCR pipeline basic operation (Python PaddleOCR)
- [x] `/api/ocr` execFile integration + robust stderr logging
- [x] Client flow: capture → upload → OCR → parse
- [x] AI parsing v1 with Groq: vendor/date/total/items
- [ ] Confidence/heuristics: guardrails for totals/taxes

**Release & Ops**

- [x] Vercel project + env vars
- [ ] Deploy serverless routes (`upload`, `parse`, `graphql`)
- [ ] OCR service strategy (railway)

**Mapping & Location**

- [x] Set up Mapbox (or Google Maps)
- [ ] Add receipt location coordinates
- [ ] Pin-based visualization
- [ ] Simple heatmap version
- [ ] List/card view
- [ ] `/api/geocode` using Nominatim
- [ ] Persist lat/lon to `places` and link receipts

**Receipts UX & Insights**

- [ ] Detail receipt page
- [ ] Tip automation rules (basic 3 only)
- [ ] Monthly summary page
- [ ] AI insight one or two lines
- [ ] Edit line items (qty/price) and re-calc totals
- [ ] Upload history list with status (parsed/failed)

**Polish & Docs**

- [ ] Color/layout polishing
- [ ] Logo/brand minimal form
- [ ] Error handling (OCR failure, empty state, etc.)
- [ ] README
- [ ] 30 sec demo video
- [ ] Deployment (Vercel)
- [ ] Docs: architecture diagram OCR→LLM→DB→Map
- [ ] Sample data + curl examples for API
