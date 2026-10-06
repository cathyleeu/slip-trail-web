# Beta environment and dependency baseline

Issue: [#34](https://github.com/cathyleeu/slip-trail-web/issues/34). Audit date: **2026-10-06 (America/Vancouver)**.
Source baseline: `aaa97423363ec86f42156117212a5f9d2e3c7ffc` (`main`).

This is a read-only operational baseline, not proof that the deployed product works end to end. No database migrations, account creation, receipt uploads, infrastructure changes or OCR repository edits were performed. Architecture and product narrative remain in [PR #29](https://github.com/cathyleeu/slip-trail-web/pull/29); this document covers setup, evidence and outstanding checks only.

## Reproduce the local web environment

Use Node.js **22** and pnpm **9.13.0** to match `.github/workflows/ci.yml`. This audit ran on macOS with Node.js **20.17.0**, pnpm **9.13.0**, Next.js **16.1.1** and the already-installed local dependencies. A fresh install and Node.js 22 execution were not performed in this audit.

From the repository root:

```sh
node --version
pnpm --version
pnpm install --frozen-lockfile
if [ ! -e .env.local ] && [ ! -L .env.local ]; then
  cp .env.example .env.local
fi
# Replace placeholders in .env.local before starting the application.
pnpm lint
pnpm exec next typegen
pnpm exec tsc --noEmit
pnpm build
pnpm dev
```

Do not overwrite an existing `.env.local`. `pnpm dev` uses `next dev --experimental-https`; open `https://localhost:3000` and trust the local development certificate as appropriate. Allow camera access or choose an image from the gallery. For the production build locally, stop the development server and run `pnpm start`; the default origin is `http://localhost:3000`, so adjust the site URL and Auth redirect configuration for that test. Production hosting should use HTTPS.

`next/font` downloads Geist and Geist Mono during a build; Google Fonts network access is required by the current implementation. Do not regenerate the lockfile or change application code merely to work around an audit-machine network restriction.

## Environment contract

| Variable | Current consumer | Requirement |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser/server Supabase clients and `proxy.ts` | Required project URL; browser-visible |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Same clients and proxy | Required publishable key for that project; never substitute a secret/service-role key |
| `GROQ_API_KEY` | `lib/groq.ts` | Required server-only parsing credential |
| `NEXT_PUBLIC_OCR_API_URL` | `requestOcr` in `useAnalysisMutation.ts` | Full browser-accessible POST URL, including `/ocr`; must support the web origin through CORS |
| `NEXT_PUBLIC_SITE_URL` | OAuth and reset-password redirects in `useAuth.ts` | Set explicitly for deployment; code falls back to `window.location.origin` |
| `SUPABASE_URL`, `SUPABASE_SECRET_KEY` | `lib/supabase/admin.ts` | Optional for this baseline: the helper has no current callers; keep server-only |

All seven names were present in the local environment, and the two Supabase URL values matched. Values were not printed or committed. Presence does **not** establish credential validity or deployed configuration. Hosted environment variables were not inspected. Public Next.js variables are embedded during a build; correct the hosting settings and rebuild when changing them.

Current browser flow: image → external OCR → authenticated `/api/parse-receipt` → `/api/geocode` → user confirmation → `/api/receipts`. There is no current `/api/ocr` or `/api/graphql` route. Do not configure the planned `OCR_API_URL`/`OCR_API_KEY` proxy contract until #38 implements it. The existing external OCR service must accept multipart `image` and return `{ "text": "..." }`. A browser request must also pass CORS/mixed-content checks; a command-line response alone does not prove that.

## Recorded checks

| Check | Result | Interpretation |
| --- | --- | --- |
| `pnpm lint` | PASS, 0 errors and 4 existing unused-variable warnings | Warnings in result page, `Input.tsx`, `app/lib/image.ts`, `lib/apiHandler.ts`; #31's blocking lint issue is already resolved |
| `pnpm exec next typegen` | PASS | Run before TypeScript on a clean checkout |
| `pnpm exec tsc --noEmit` | PASS | No diagnostics |
| `pnpm build` | PASS after network-enabled retry | First sandbox attempt failed downloading Google Fonts; retry compiled and generated all 34 pages |
| Build workspace-root detection | Warning | A parent `yarn.lock` caused Next.js to infer the parent directory as its root; not changed in this task |
| GitHub latest Production deployment | `success`, ID `6802751481`, SHA matches source baseline | Recorded at `2026-10-02T06:32:09Z`; this is deployment metadata, not application acceptance |
| Direct deployment URL GET | HTTP 302 to Vercel `/sso-api` | Deployment access is protected; page contents not verified |
| Locally configured site URL GET | HTTP 307 to `/onboarding` | Site responds; this does not verify login, DB or receipt behavior |
| Configured OCR endpoint GET | Timed out at 12 seconds | Reachability inconclusive; GET is not the multipart POST contract and no OCR accuracy claim is made |
| Configured Supabase Auth settings GET | `ENOTFOUND` after network permission was enabled | Unable to resolve the configured project host from this environment; not proof that the production project is down |
| Configured receipt bucket metadata GET | Same DNS failure | Public/private flag, size/MIME limits and policies remain unverified |
| Groq parsing request | NOT RUN | No authenticated working receipt flow or approved receipt fixture; key validity/model availability unverified |
| Actual receipt image request / save / map reopen | NOT RUN | No receipt image fixture was found in the checkout, no authenticated tester session was available, and backend reachability is unresolved |

Vercel and Supabase CLIs and local `.vercel` project metadata were not available. GitHub deployment metadata was accessible through `gh`. No private receipt records were fetched to fill these gaps.

## Repeat the read-only service probes

These commands require GitHub access and the local environment. Never print `.env.local`, enable shell tracing, paste keys into tickets or include provider response bodies in audit output.

```sh
gh repo view cathyleeu/slip-trail-web --json defaultBranchRef,url
gh api repos/cathyleeu/slip-trail-web/deployments --jq '.[0:3] | map({id,environment,sha,created_at})'
# Substitute the current deployment ID from the previous output.
gh api repos/cathyleeu/slip-trail-web/deployments/6802751481/statuses --jq '.[0] | {state,environment_url,created_at}'
```

For Node.js 22 (also supported by the audit's Node.js 20.17.0), print only response statuses. The optional bucket metadata probe uses an existing server-only `SUPABASE_SECRET_KEY` for the same project; it skips the request when that key is absent. Do not provision an elevated key solely for this probe: use the read-only Dashboard inspection below instead.

```sh
node --env-file=.env.local - <<'NODE'
async function probe(label, url, headers = {}) {
  try {
    const response = await fetch(url, {
      headers, redirect: 'manual', signal: AbortSignal.timeout(12000),
    });
    console.log(label, response.status);
  } catch (error) {
    console.log(label, error.cause?.code ?? error.name);
  }
}
(async () => {
  await probe('site', process.env.NEXT_PUBLIC_SITE_URL);
  await probe('OCR GET, not an image test', process.env.NEXT_PUBLIC_OCR_API_URL);
  await probe('Auth settings', `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
    apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  if (process.env.SUPABASE_SECRET_KEY) {
    await probe('Receipt bucket metadata', `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/bucket/sliptrail-bills`, {
      apikey: process.env.SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
    });
  } else {
    console.log('Receipt bucket metadata: SKIPPED (server-only key unavailable)');
  }
})();
NODE
```

## Database, storage and Auth audit

**Remote schema, RPC signatures, storage policies and Auth settings could not be verified.** The following are repository-contract findings, not confirmed differences against production. Do not apply the initial SQL blindly to an existing project: it contains non-idempotent `CREATE POLICY` statements.

| Dependency | Checked-in definition versus web expectation | Follow-up |
| --- | --- | --- |
| `dashboard_summary` | SQL returns a JSON object with `total_spend`/`avg_spend`; route reads `data[0]`, hook expects `total`/`avg_per_receipt` | #35 |
| `dashboard_top_places` | Route supplies `sort_by`, absent from SQL signature; SQL returns `visit_count`/`total_spend`, while hook expects `count`/`total` and location fields | #35 |
| `dashboard_recent_places` | SQL returns `id`/`purchased_at`; hook expects `place_id`/`last_visited` | #35 |
| `dashboard_mom`, `dashboard_timeseries` | Called by routes but absent from checked-in migration | #36; verify active consumers and remote definitions first |
| Spend-series HTTP response | Route returns `{ points, currency }`; hook declares an array | #37; independent of remote DB state |
| `save_receipt_with_place` | SQL copies place coordinates inside its transaction; route performs an additional update and ignores that update's error | #42 |
| Row ownership | Checked-in RLS exists for `profiles` and `receipts`; `places` has no RLS enablement in that file; SECURITY DEFINER functions require deployed grants/search-path inspection | Verify actual policies and grants; absence in the file is not proof of exploitability |
| Storage | Code uses `sliptrail-bills` and `getPublicUrl`; bucket creation and storage policies are not in the checked-in SQL | #44; actual bucket visibility is unknown |

Once the project host/access is restored, an authorized operator should use Supabase Dashboard's read-only inspection or run these SELECTs in the SQL editor. Keep full definitions in a private audit channel if they contain sensitive configuration:

```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name IN ('profiles', 'receipts', 'places')
ORDER BY table_name, ordinal_position;

SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS arguments,
       pg_get_function_result(p.oid) AS result, p.prosecdef, p.proconfig,
       p.proacl, pg_get_functiondef(p.oid) AS definition
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND (p.proname LIKE 'dashboard_%' OR p.proname IN ('save_receipt_with_place', 'handle_new_user'));

SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE (schemaname = 'public' AND tablename IN ('profiles', 'receipts', 'places'))
   OR (schemaname = 'storage' AND tablename = 'objects');

SELECT n.nspname, c.relname, c.relrowsecurity, c.relforcerowsecurity
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE (n.nspname = 'public' AND c.relname IN ('profiles', 'receipts', 'places'))
   OR (n.nspname = 'storage' AND c.relname = 'objects');

SELECT id, public, file_size_limit, allowed_mime_types
FROM storage.buckets WHERE id = 'sliptrail-bills';
```

Compare results with `supabase/migrations/20240101000000_initial_schema.sql` and the route consumers, recording differences without applying changes. In Auth settings inspect signup enablement, email confirmation, Site URL, redirect allowlist (including `/auth/callback` and `/reset-password` for the intended origins), and enabled Google/Apple providers. Inspect the `auth.users` signup trigger and function grants as well. Merely seeing a login button or possessing a local key does not verify these settings. Two-account ownership testing remains part of #58.

## Single-receipt baseline to complete after access is restored

Current result: **blocked before an authenticated image request; no record was saved**. Do not mark the following as passed based on a build or a GET probe.

1. Confirm the intended Supabase project and deployed environment agree; resolve the DNS/configuration issue without assuming a project reset is needed. Confirm OCR POST reachability and browser CORS. Use a tester account and a receipt fixture the tester is willing to send to OCR/Groq.
2. Sign in at the intended HTTPS origin, open `/upload` (then repeat with `/camera`), and select one English CAD receipt with known vendor, date, total and address.
3. In browser Network tools verify external multipart OCR `image` → `{ text }`, `/api/parse-receipt`, and `/api/geocode`. Record stage, elapsed time and HTTP status, not raw receipt contents or tokens. Missing location should still allow reviewing the parsed receipt.
4. Compare parsed fields with the fixture, correct them, add a feeling/memo, and explicitly save in the designated test account. Saving creates test data and belongs to this later functional check, not the read-only probes above.
5. Verify `/api/receipts` succeeds; reopen the record from `/receipts`, then `/map` using a period containing its purchase date. Refresh and re-login to verify persistence.
6. Record pass/fail per stage and the first reproducible blocker. Do not assume retry, deletion or image privacy works; use #40, #43, #44 and #45 for their dedicated checks.

Next action is to verify the intended project URL and restore backend reachability with the account owner. Then compare the remote definitions and execute the receipt baseline. Keep unavailable results explicit until those checks actually run; #58 remains the final deployed acceptance gate.
