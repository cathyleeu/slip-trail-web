# Graph Report - slip-trail  (2026-10-01)

## Corpus Check
- 142 files · ~38,706 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .ico 1, .css 1)

## Summary
- 811 nodes · 1958 edges · 44 communities (40 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a1c004d5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- money
- react
- ui/index.ts
- useAuth.ts
- imageProcessor.ts
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
- Project Reference
- receipt.ts
- package.json
- mom/route.ts
- Header
- useDashboard.ts
- types/index.ts
- ReceiptCapture.tsx
- insights/page.tsx
- useAnalysisMutation.ts
- nomalizedAddress.ts
- TopPlacesWidget.tsx
- analysis.ts
- BottomNav.tsx
- apiResponse.ts
- home/page.tsx
- types/location.ts
- withAuth
- icons.tsx
- caseConverter.ts
- camera/page.tsx
- Button
- logger
- useReceipt.ts
- postcss.config.mjs
- receipts/page.tsx
- Slip Trail
- Map.tsx
- AGENTS.md

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
  CLAUDE.md → app/utils/cn.ts
- `4. Server / Client Boundary` --references--> `withAuth()`  [INFERRED]
  CLAUDE.md → lib/apiHandler.ts
- `3. Single Source of Truth for Domain Constants` --references--> `getCategoryEmoji()`  [INFERRED]
  CLAUDE.md → lib/categories.ts
- `GET` --calls--> `apiSuccess()`  [EXTRACTED]
  app/api/dashboard/mom/route.ts → lib/apiResponse.ts
- `GET` --calls--> `apiSuccess()`  [EXTRACTED]
  app/api/receipts/route.ts → lib/apiResponse.ts

## Import Cycles
- None detected.

## Communities (44 total, 4 thin omitted)

### Community 0 - "money"
Cohesion: 0.16
Nodes (14): CategoryBarChartProps, CategorySlice, CategoryPieChart, CategoryPieChartProps, CategorySlice, MoMWidget, SpendChartProps, SpendPoint (+6 more)

### Community 1 - "react"
Cohesion: 0.07
Nodes (36): ForgotPasswordPage(), LoginPage(), ResetPasswordPage(), getPasswordChecks(), PasswordStrength(), SignUpPage(), handleSignUp(), Divider() (+28 more)

### Community 2 - "ui/index.ts"
Cohesion: 0.06
Nodes (41): AuthLayout(), OnboardingPage(), Slide, SlideResult(), SLIDES, SlideSnap(), slideVariants, InputAction() (+33 more)

### Community 3 - "useAuth.ts"
Cohesion: 0.07
Nodes (23): AccountPage(), ProfileClient(), AuthContext, AuthProvider(), useAuthContext(), useProfile(), UseProfileState, useReceipt() (+15 more)

### Community 4 - "imageProcessor.ts"
Cohesion: 0.17
Nodes (8): AnalyzeReceiptOptions, MIME_TYPES, blobToFile(), compressImage(), convertImage(), fit(), toWebp(), ImageFormat

### Community 5 - "map/page.tsx"
Cohesion: 0.07
Nodes (37): FitBoundsProps, SpendMarker(), SpendMarkerProps, TrailPolylineProps, Spinner(), cachedCategories, EMPTY_CATEGORIES, getStoredCategories() (+29 more)

### Community 6 - "validation.ts"
Cohesion: 0.10
Nodes (26): GET, POST, DEFAULT_LIMIT, DEFAULT_OFFSET, feelingTagSchema, Pagination, paginationSchema, ParsedReceipt (+18 more)

### Community 7 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 8 - "apiSuccess"
Cohesion: 0.17
Nodes (19): CategorySlice, GET, ReceiptRow, GET, GET, SESSIONS, GET, GET (+11 more)

### Community 9 - "constants.ts"
Cohesion: 0.13
Nodes (18): POST, DEFAULT_PERIOD, IMAGE_EXTENSIONS, MAX_LIMIT, MAX_UPLOAD_SIZE_BYTES, RECEIPT_CATEGORIES, ReceiptCategoryValue, STORAGE_BUCKET (+10 more)

### Community 10 - "LocationSearch.tsx"
Cohesion: 0.17
Nodes (14): LocationResult, LocationSearch(), Props, SearchState, requestGeoCoding(), normalizeAddress(), toGeoLocation(), toPlace() (+6 more)

### Community 11 - "dependencies"
Cohesion: 0.09
Nodes (22): dependencies, @apollo/client, @apollo/server, browser-image-compression, chart.js, clsx, graphql, groq-sdk (+14 more)

### Community 12 - "apiHandler.ts"
Cohesion: 0.22
Nodes (13): PATCH(), POST, GET(), apiHandler(), ApiHandlerOptions, AuthenticatedContext, AuthenticatedHandler, handleApiError() (+5 more)

### Community 13 - "[id]/page.tsx"
Cohesion: 0.13
Nodes (18): LocationPin(), Plus(), Trash(), useReceiptDetail(), useUpdateReceipt(), DraftState, recalcTotal(), ReceiptDetailPage() (+10 more)

### Community 14 - "spend-series/route.ts"
Cohesion: 0.36
Nodes (8): buildBuckets(), GET, addUtcDays(), getRangeWithGrain(), startOfUtcDay(), toYm(), toYmd(), DEFAULT_CURRENCY

### Community 15 - "Project Reference"
Cohesion: 0.07
Nodes (26): 1. Atomic Design for Components, 1. Think Before Coding, 2. Feature-Collocated Data Fetching, 2. Simplicity First, 3. Single Source of Truth for Domain Constants, 3. Surgical Changes, 4. Goal-Driven Execution, 4. Server / Client Boundary (+18 more)

### Community 16 - "receipt.ts"
Cohesion: 0.22
Nodes (9): AddressNormalized, ParsedReceipt, ParseReceiptFailure, ParseReceiptResult, ParseReceiptSuccess, ReceiptCategory, ReceiptCharge, ReceiptItem (+1 more)

### Community 17 - "package.json"
Cohesion: 0.05
Nodes (41): eslintConfig, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/leaflet, @types/node (+33 more)

### Community 18 - "mom/route.ts"
Cohesion: 0.18
Nodes (8): GET, MoMRow, PlaceRow, SeriesPoint, SeriesRow, SpendChartProps, SpendSeriesResponse, SummaryRow

### Community 19 - "Header"
Cohesion: 0.27
Nodes (5): Header(), HeaderProps, IconButton, ChevronLeftIcon(), ScanLayout()

### Community 20 - "useDashboard.ts"
Cohesion: 0.14
Nodes (16): RecentPlacesWidget, CategorySlice, EmotionCell, EmotionSlice, MapReceipt, MoMData, RecentPlace, SpendPoint (+8 more)

### Community 21 - "types/index.ts"
Cohesion: 0.18
Nodes (9): HttpErrorLike, HttpFailure, HttpResult, HttpSuccess, ChargeType, DISCOUNT, FEE, TAX (+1 more)

### Community 22 - "ReceiptCapture.tsx"
Cohesion: 0.29
Nodes (7): captureFrameAsBlob(), clamp01(), MotionMeter, Props, ReceiptCapture(), startCamera(), stopCamera()

### Community 23 - "insights/page.tsx"
Cohesion: 0.13
Nodes (20): ReceiptCard(), ReceiptCardProps, Card(), useEmotionBreakdown(), useEmotionByHour(), EmotionCell, EmotionSlice, InsightsPage() (+12 more)

### Community 24 - "useAnalysisMutation.ts"
Cohesion: 0.22
Nodes (3): analyzeRequest(), requestOcr(), requestParsing()

### Community 25 - "nomalizedAddress.ts"
Cohesion: 0.38
Nodes (10): buildAddressNormalized(), buildNotes(), buildQuery(), buildStreet(), dotStrippedRegionCode(), isLikelyRegionCode(), normalizeComponents(), normalizeSpace() (+2 more)

### Community 26 - "TopPlacesWidget.tsx"
Cohesion: 0.26
Nodes (12): SpendChart, SpendChartWidget, SummaryWidget, SortBy, SortTabs(), TopPlacesWidget, WidgetPeriodToggle(), Skeleton() (+4 more)

### Community 27 - "analysis.ts"
Cohesion: 0.22
Nodes (8): AnalyzeOptions, ReceiptAnalysisFailure, ReceiptAnalysisResult, ReceiptAnalysisSuccess, ExternalOcrApiResponse, OcrFailure, OcrResult, OcrSuccess

### Community 28 - "BottomNav.tsx"
Cohesion: 0.28
Nodes (3): BottomNav(), NAV_ITEMS, RoutesLayout()

### Community 29 - "apiResponse.ts"
Cohesion: 0.28
Nodes (4): ApiErrorOptions, ApiFailure, ApiResponse, ApiSuccess

### Community 30 - "home/page.tsx"
Cohesion: 0.31
Nodes (9): CategoryBarChart, Camera(), Upload(), useDashboardCategoryBreakdown(), useDashboardSummary(), DynamicSpendMarker, HomePage(), MapPreview (+1 more)

### Community 31 - "types/location.ts"
Cohesion: 0.32
Nodes (6): AddressComponents, AddressQuality, GeocodeFailure, GeocodeResult, GeocodeSuccess, NominatimAddress

### Community 32 - "withAuth"
Cohesion: 0.48
Nodes (6): DELETE(), GET(), Params, PATCH(), prepareUpdateData(), withAuth()

### Community 33 - "icons.tsx"
Cohesion: 0.25
Nodes (3): Calendar(), Close(), IconProps

### Community 34 - "caseConverter.ts"
Cohesion: 0.38
Nodes (6): CamelToSnakeCase, keysToCamelCase, keysToSnakeCase, SnakeToCamelCase, toCamelCase(), toSnakeCase()

### Community 35 - "camera/page.tsx"
Cohesion: 0.20
Nodes (9): InputProps, Toast(), useToast(), useAnalysisFlow(), useAnalysisMutation(), SettingsPage(), CameraPage(), UploadPage() (+1 more)

### Community 36 - "Button"
Cohesion: 0.36
Nodes (7): ProcessingDialog(), ProcessingDialogProps, TIP_PERCENTAGES, TipPromptDialog(), TipPromptDialogProps, BaseDialog(), Button

### Community 38 - "useReceipt.ts"
Cohesion: 0.33
Nodes (3): ReceiptPayload, queryKeys, ReceiptDetail

### Community 41 - "Slip Trail"
Cohesion: 0.40
Nodes (4): Getting Started, Project Roadmap, Skills & Libraries Used, Slip Trail

### Community 42 - "Map.tsx"
Cohesion: 0.67
Nodes (3): Map(), MapProps, MapUpdater()

## Knowledge Gaps
- **233 isolated node(s):** `Slide`, `SLIDES`, `slideVariants`, `PERIOD_OPTIONS`, `PERIOD_OPTIONS` (+228 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 304 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `money`, `ui/index.ts`, `useAuth.ts`, `Button`, `map/page.tsx`, `imageProcessor.ts`, `camera/page.tsx`, `receipts/page.tsx`, `LocationSearch.tsx`, `Map.tsx`, `[id]/page.tsx`, `package.json`, `useDashboard.ts`, `ReceiptCapture.tsx`, `insights/page.tsx`, `TopPlacesWidget.tsx`, `home/page.tsx`?**
  _High betweenness centrality (0.162) - this node is a cross-community bridge._
- **Why does `next` connect `react` to `ui/index.ts`, `useAuth.ts`, `Button`, `map/page.tsx`, `camera/page.tsx`, `apiHandler.ts`, `[id]/page.tsx`, `package.json`, `Header`, `insights/page.tsx`, `BottomNav.tsx`, `apiResponse.ts`, `home/page.tsx`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Why does `cn()` connect `ui/index.ts` to `react`, `camera/page.tsx`, `Button`, `[id]/page.tsx`, `Project Reference`, `Header`, `insights/page.tsx`, `TopPlacesWidget.tsx`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `useAuth()` (e.g. with `login()` and `loginWithApple()`) actually correct?**
  _`useAuth()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Slide`, `SLIDES`, `slideVariants` to the rest of the system?**
  _233 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.07226107226107226 - nodes in this community are weakly interconnected._
- **Should `ui/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0632996632996633 - nodes in this community are weakly interconnected._