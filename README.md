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

PostgreSQL [Documentation](https://www.postgresql.org/docs/)
Supabase [Documentation](https://supabase.com/docs)
Tanstack Query [Documentation](https://tanstack.com/query/v4/docs/overview)
Apollo GraphQL [Documentation](https://www.apollographql.com/docs/)

Styles
Framer-motion [Documentation](https://www.framer.com/motion/)
Tailwind CSS [Documentation](https://tailwindcss.com/docs/installation)

---

    •	Supabase
    	→ “그냥 Postgres + 파일 스토리지 + 인증 제공해주는 서비스”
    	→ DB 설계/저장소/인증 담당
    •	Apollo GraphQL (서버 + 클라이언트)
    	→ “DB 데이터 읽고/쓰기 위한 공식 API 계층”
    	→ 서버: /api/graphql
    	→ 클라이언트: useQuery, useMutation으로 영수증, 아이템, 장소 조회/저장
    •	TanStack Query
    	→ “서버리스 함수(REST 스타일)로 부르는 OCR/AI/기타 작업용”
    	→ 예: /api/ocr 호출해서 이미지 → 텍스트/JSON 변환
    •	Next.js
    	→ 화면 + 서버리스 + 라우팅 모두 관리하는 껍데기 프레임워크

---

Project Roadmap

🔷 Week 1 — Core Logic
[] init project
[] set up basic folder structure
[] configure Tailwind CSS
[] build Supabase DB schema
[] apollo server setup
[] client setup
[] image upload UI
[] OCR pipeline basic operation
[] AI parsing version 1 (item list extraction)

🔷 Week 2 — Map Integration
[] Set up Mapbox (or Google Maps)
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
