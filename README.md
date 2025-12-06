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

**Week 1 — Core Logic**

- [x] init project
- [x] set up basic folder structure
- [x] configure Tailwind CSS
- [ ] build Supabase DB schema
- [ ] apollo server setup
- [x] client setup
- [ ] image upload UI
- [x] OCR pipeline basic operation
- [ ] AI parsing version 1 (item list extraction)

**Week 2 — Map Integration**

- [x] Set up Mapbox (or Google Maps)
- [ ] Add receipt location coordinates
- [ ] Pin-based visualization
- [ ] Simple heatmap version
- [ ] List/card view

**Week 3 — Detail Page + Monthly Report + Tip Processing**

- [ ] Detail receipt page
- [ ] Tip automation rules (basic 3 only)
- [ ] Monthly summary page
- [ ] AI insight one or two lines

**Week 4 — Final Polish + README + Demo Video**

- [ ] Color/layout polishing
- [ ] Logo/brand minimal form
- [ ] Error handling (OCR failure, empty state, etc.)
- [ ] README
- [ ] 30 sec demo video
- [ ] Deployment (Vercel)
