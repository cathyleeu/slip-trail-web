This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

Groq API

PostgreSQL [Documentation](https://www.postgresql.org/docs/)
Supabase [Documentation](https://supabase.com/docs)
Tanstack Query [Documentation](https://tanstack.com/query/v4/docs/overview)
Apollo GraphQL [Documentation](https://www.apollographql.com/docs/)

Styles
Framer-motion [Documentation](https://www.framer.com/motion/)
Tailwind CSS [Documentation](https://tailwindcss.com/docs/installation)
Radix UI [Documentation](https://www.radix-ui.com/primitives/docs/overview/introduction)

Map
Nominatim https://nominatim.org/release-docs/latest/
Leaflet https://leafletjs.com/reference.html

---

## Project Roadmap

🔷 Week 1 — Core Logic
[x] init project
[x] set up basic folder structure
[x] configure Tailwind CSS
[] build Supabase DB schema
[] apollo server setup
[x] client setup
[] image upload UI
[x] OCR pipeline basic operation
[] AI parsing version 1 (item list extraction)

🔷 Week 2 — Map Integration
[x] Set up Mapbox (or Google Maps)
[] Add receipt location coordinates
[] Pin-based visualization
[] Simple heatmap version
[] List/card view

🔷 Week 3 — Detail Page + Monthly Report + Tip Processing
[] Detail receipt page
[] Tip automation rules (basic 3 only)
[] Monthly summary page
[] AI insight one or two lines

🔷 Week 4 — Final Polish + README + Demo Video
[] Color/layout polishing
[] Logo/brand minimal form
[] Error handling (OCR failure, empty state, etc.)
[] README
[] 30 sec demo video
[] Deployment (Vercel)
