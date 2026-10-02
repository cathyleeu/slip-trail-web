# Graph Report - slip-trail  (2026-10-01)

## Corpus Check
- 147 files · ~40,094 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .ico 1, .css 1)

## Summary
- 833 nodes · 1975 edges · 44 communities (39 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a1c004d5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react
- signup/page.tsx
- ui/index.ts
- types/index.ts
- camera/page.tsx
- map/page.tsx
- validation.ts
- compilerOptions
- apiSuccess
- constants.ts
- LocationSearch.tsx
- dependencies
- apiHandler.ts
- [id]/page.tsx
- spend-series/route.ts
- devDependencies
- receipt.ts
- package.json
- mom/route.ts
- parse-receipt/route.ts
- bug_report.md
- pull_request_template.md
- ReceiptCapture.tsx
- useReceipt.ts
- useAnalysisMutation.ts
- nomalizedAddress.ts
- scripts
- analysis.ts
- BottomNav.tsx
- apiResponse.ts
- eslint.config.mjs
- types/location.ts
- withAuth
- feature_request.md
- caseConverter.ts
- issue/SKILL.md
- pr/SKILL.md
- logger
- analysisDraftStore.ts
- postcss.config.mjs
- review/SKILL.md
- Slip Trail
- Map.tsx
- Project Reference

## God Nodes (most connected - your core abstractions)
1. `react` - 45 edges
2. `cn()` - 39 edges
3. `apiSuccess()` - 36 edges
4. `useAuth()` - 26 edges
5. `next` - 26 edges
6. `withAuth()` - 24 edges
7. `ReceiptDetailPage()` - 23 edges
8. `money()` - 23 edges
9. `Button` - 20 edges
10. `ResultPage()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Styling` --references--> `cn()`  [INFERRED]
  AGENTS.md → app/utils/cn.ts
- `4. Server / Client Boundary` --references--> `withAuth()`  [INFERRED]
  AGENTS.md → lib/apiHandler.ts
- `3. Single Source of Truth for Domain Constants` --references--> `getCategoryEmoji()`  [INFERRED]
  AGENTS.md → lib/categories.ts
- `GET` --calls--> `apiSuccess()`  [EXTRACTED]
  app/api/dashboard/mom/route.ts → lib/apiResponse.ts
- `GET` --calls--> `apiSuccess()`  [EXTRACTED]
  app/api/receipts/route.ts → lib/apiResponse.ts

## Import Cycles
- None detected.

## Communities (44 total, 5 thin omitted)

### Community 0 - "react"
Cohesion: 0.06
Nodes (61): CategoryBarChart, CategoryBarChartProps, CategorySlice, CategoryPieChart, CategoryPieChartProps, CategorySlice, MoMWidget, RecentPlacesWidget (+53 more)

### Community 1 - "signup/page.tsx"
Cohesion: 0.07
Nodes (34): ForgotPasswordPage(), LoginPage(), ResetPasswordPage(), getPasswordChecks(), PasswordStrength(), SignUpPage(), handleSignUp(), Divider() (+26 more)

### Community 2 - "ui/index.ts"
Cohesion: 0.08
Nodes (34): AuthLayout(), InputAction(), InputActionProps, InputElement(), InputFieldProps, InputFieldRoot(), InputWrapper(), InputWrapperProps (+26 more)

### Community 3 - "types/index.ts"
Cohesion: 0.07
Nodes (31): AccountPage(), ProfileClient(), AuthContext, AuthProvider(), useAuthContext(), UseProfileState, geistMono, geistSans (+23 more)

### Community 4 - "camera/page.tsx"
Cohesion: 0.11
Nodes (19): ProcessingDialog(), Close(), Toast(), useToast(), AnalyzeReceiptOptions, useAnalysisFlow(), useAnalysisMutation(), capturePhoto() (+11 more)

### Community 5 - "map/page.tsx"
Cohesion: 0.10
Nodes (22): FitBoundsProps, SpendMarker(), SpendMarkerProps, TrailPolylineProps, LocationPin(), Spinner(), useMapReceipts(), DynamicFitBounds (+14 more)

### Community 6 - "validation.ts"
Cohesion: 0.10
Nodes (25): GET, POST, DEFAULT_LIMIT, DEFAULT_OFFSET, feelingTagSchema, Pagination, paginationSchema, ParsedReceipt (+17 more)

### Community 7 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 8 - "apiSuccess"
Cohesion: 0.17
Nodes (19): CategorySlice, GET, ReceiptRow, GET, GET, SESSIONS, GET, GET (+11 more)

### Community 9 - "constants.ts"
Cohesion: 0.17
Nodes (13): POST, DEFAULT_PERIOD, IMAGE_EXTENSIONS, MAX_LIMIT, MAX_UPLOAD_SIZE_BYTES, RECEIPT_CATEGORIES, ReceiptCategoryValue, STORAGE_BUCKET (+5 more)

### Community 10 - "LocationSearch.tsx"
Cohesion: 0.24
Nodes (10): LocationResult, LocationSearch(), Props, SearchState, requestGeoCoding(), normalizeAddress(), toGeoLocation(), toPlace() (+2 more)

### Community 11 - "dependencies"
Cohesion: 0.09
Nodes (22): dependencies, @apollo/client, @apollo/server, browser-image-compression, chart.js, clsx, graphql, groq-sdk (+14 more)

### Community 12 - "apiHandler.ts"
Cohesion: 0.18
Nodes (14): PATCH(), GET(), apiHandler(), ApiHandlerOptions, AuthenticatedContext, AuthenticatedHandler, handleApiError(), UnauthenticatedHandler (+6 more)

### Community 13 - "[id]/page.tsx"
Cohesion: 0.06
Nodes (48): Header(), HeaderProps, TIP_PERCENTAGES, TipPromptDialog(), TipPromptDialogProps, BaseDialog(), Button, Card() (+40 more)

### Community 14 - "spend-series/route.ts"
Cohesion: 0.36
Nodes (8): buildBuckets(), GET, addUtcDays(), getRangeWithGrain(), startOfUtcDay(), toYm(), toYmd(), DEFAULT_CURRENCY

### Community 15 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/leaflet, @types/node, @types/react (+2 more)

### Community 16 - "receipt.ts"
Cohesion: 0.14
Nodes (13): ChargeType, DISCOUNT, FEE, TAX, TIP, ParseReceiptFailure, ParseReceiptResult, ParseReceiptSuccess (+5 more)

### Community 17 - "package.json"
Cohesion: 0.12
Nodes (16): name, private, version, @apollo/client, @apollo/server, browser-image-compression, graphql, radix-ui (+8 more)

### Community 18 - "mom/route.ts"
Cohesion: 0.18
Nodes (8): GET, MoMRow, PlaceRow, SeriesPoint, SeriesRow, SpendChartProps, SpendSeriesResponse, SummaryRow

### Community 19 - "parse-receipt/route.ts"
Cohesion: 0.36
Nodes (6): POST, coerceCategory(), parseReceipt(), log, LogContext, LogLevel

### Community 20 - "bug_report.md"
Cohesion: 0.40
Nodes (4): Acceptance criteria, Expected behavior, Observed behavior, Steps to reproduce

### Community 21 - "pull_request_template.md"
Cohesion: 0.40
Nodes (4): Changes, Related issues, Validation, Why

### Community 22 - "ReceiptCapture.tsx"
Cohesion: 0.29
Nodes (7): captureFrameAsBlob(), clamp01(), MotionMeter, Props, ReceiptCapture(), startCamera(), stopCamera()

### Community 23 - "useReceipt.ts"
Cohesion: 0.08
Nodes (22): OnboardingPage(), Slide, SlideResult(), SLIDES, SlideSnap(), slideVariants, ReceiptCard(), ReceiptCardProps (+14 more)

### Community 24 - "useAnalysisMutation.ts"
Cohesion: 0.22
Nodes (3): analyzeRequest(), requestOcr(), requestParsing()

### Community 25 - "nomalizedAddress.ts"
Cohesion: 0.38
Nodes (10): buildAddressNormalized(), buildNotes(), buildQuery(), buildStreet(), dotStrippedRegionCode(), isLikelyRegionCode(), normalizeComponents(), normalizeSpace() (+2 more)

### Community 26 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 27 - "analysis.ts"
Cohesion: 0.20
Nodes (9): AnalyzeOptions, LocationStatus, ReceiptAnalysisFailure, ReceiptAnalysisResult, ReceiptAnalysisSuccess, ExternalOcrApiResponse, OcrFailure, OcrResult (+1 more)

### Community 28 - "BottomNav.tsx"
Cohesion: 0.28
Nodes (3): BottomNav(), NAV_ITEMS, RoutesLayout()

### Community 29 - "apiResponse.ts"
Cohesion: 0.28
Nodes (4): ApiErrorOptions, ApiFailure, ApiResponse, ApiSuccess

### Community 30 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 31 - "types/location.ts"
Cohesion: 0.31
Nodes (7): AddressComponents, AddressNormalized, AddressQuality, GeocodeFailure, GeocodeResult, GeocodeSuccess, NominatimAddress

### Community 32 - "withAuth"
Cohesion: 0.48
Nodes (6): DELETE(), GET(), Params, PATCH(), prepareUpdateData(), withAuth()

### Community 33 - "feature_request.md"
Cohesion: 0.50
Nodes (3): Acceptance criteria, Problem, Requested scope

### Community 34 - "caseConverter.ts"
Cohesion: 0.38
Nodes (6): CamelToSnakeCase, keysToCamelCase, keysToSnakeCase, SnakeToCamelCase, toCamelCase(), toSnakeCase()

### Community 38 - "analysisDraftStore.ts"
Cohesion: 0.29
Nodes (4): zustand, AnalysisDraftState, safeRevokeObjectUrl(), ParsedReceipt

### Community 41 - "Slip Trail"
Cohesion: 0.40
Nodes (4): Getting Started, Project Roadmap, Skills & Libraries Used, Slip Trail

### Community 42 - "Map.tsx"
Cohesion: 0.50
Nodes (4): Map(), MapProps, MapUpdater(), GeoLocation

### Community 43 - "Project Reference"
Cohesion: 0.06
Nodes (30): 1. Atomic Design for Components, 1. Think Before Coding, 2. Feature-Collocated Data Fetching, 2. Simplicity First, 3. Single Source of Truth for Domain Constants, 3. Surgical Changes, 4. Goal-Driven Execution, 4. Server / Client Boundary (+22 more)

## Knowledge Gaps
- **250 isolated node(s):** `Slide`, `SLIDES`, `slideVariants`, `PERIOD_OPTIONS`, `PERIOD_OPTIONS` (+245 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 323 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `signup/page.tsx`, `ui/index.ts`, `types/index.ts`, `camera/page.tsx`, `map/page.tsx`, `LocationSearch.tsx`, `Map.tsx`, `[id]/page.tsx`, `package.json`, `ReceiptCapture.tsx`, `useReceipt.ts`?**
  _High betweenness centrality (0.154) - this node is a cross-community bridge._
- **Why does `next` connect `signup/page.tsx` to `react`, `ui/index.ts`, `types/index.ts`, `camera/page.tsx`, `map/page.tsx`, `apiHandler.ts`, `[id]/page.tsx`, `package.json`, `useReceipt.ts`, `BottomNav.tsx`, `apiResponse.ts`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `cn()` connect `ui/index.ts` to `react`, `signup/page.tsx`, `camera/page.tsx`, `Project Reference`, `[id]/page.tsx`, `useReceipt.ts`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `useAuth()` (e.g. with `login()` and `loginWithApple()`) actually correct?**
  _`useAuth()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Slide`, `SLIDES`, `slideVariants` to the rest of the system?**
  _250 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.06323396567299007 - nodes in this community are weakly interconnected._
- **Should `signup/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06583850931677018 - nodes in this community are weakly interconnected._