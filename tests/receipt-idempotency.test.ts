// Run: node -e "require.extensions['.ts']=(m,f)=>m._compile(require('typescript').transpile(require('fs').readFileSync(f,'utf8'),{module:1,target:9}),f);require('./tests/receipt-idempotency.test.ts')"
import * as assert from 'node:assert/strict'
import { File as NodeFile } from 'node:buffer'
import { randomUUID, webcrypto } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import { transpile, ModuleKind, ScriptTarget } from 'typescript'

globalThis.File ??= NodeFile as unknown as typeof File
globalThis.crypto ??= webcrypto as unknown as Crypto
const nativeRequire = createRequire(`${process.cwd()}/package.json`)
type Saved = { id: string; img_url: string }
let userId: string | null = 'user-a'
let rpcMode = 'success'
let lookupFails = false
let release: (() => void) | undefined
let pending: Promise<void> | undefined
const receipts = new Map<string, Saved>()
const images = new Set<string>()
let uploads = 0
const removed: string[] = []
const supabase = {
  auth: { getUser: async () => ({ data: { user: userId ? { id: userId } : null }, error: null }) },
  from: () => {
    const filters: Record<string, string> = {}
    const query = {
      select: () => query,
      eq: (key: string, value: string) => { filters[key] = value; return query },
      maybeSingle: async () => ({
        data: lookupFails ? null : receipts.get(`${filters.user_id}:${filters.submission_id}`) ?? null,
        error: lookupFails ? { message: 'offline' } : null,
      }),
    }
    return query
  },
  storage: { from: () => ({
    upload: async (path: string) => { uploads++; images.add(path); return { data: { path }, error: null } },
    getPublicUrl: (path: string) => ({ data: { publicUrl: `https://storage.example/${path}` } }),
    remove: async (paths: string[]) => {
      for (const path of paths) { images.delete(path); removed.push(path) }
      return { error: null }
    },
  }) },
  rpc: async (name: string, args: { submission_id: string; img_url: string }) => {
    assert.equal(name, 'save_receipt_submission')
    const owner = userId
    if (pending) await pending
    if (rpcMode === 'sql-failure') return { data: null, error: { code: '23514', message: 'constraint' } }
    if (rpcMode === 'unknown') throw new Error('connection lost before outcome')
    const key = `${owner}:${args.submission_id}`
    const saved = receipts.get(key) ?? { id: randomUUID(), img_url: args.img_url }
    receipts.set(key, saved)
    if (rpcMode === 'unreconciled-commit') lookupFails = true
    if (rpcMode === 'lost-response' || rpcMode === 'unreconciled-commit') throw new Error('response lost after commit')
    return { data: saved, error: null }
  },
}
const cache = new Map<string, unknown>()
function load(path: string): unknown {
  if (cache.has(path)) return cache.get(path)
  const mod = { exports: {} }
  const source = transpile(readFileSync(`${path}.ts`, 'utf8'), {
    module: ModuleKind.CommonJS, target: ScriptTarget.ES2022,
  })
  const requireModule = (name: string): unknown => {
    if (name === './supabase/server') return { supabaseServer: async () => supabase }
    if (name === 'next/server') return { NextResponse: Response }
    if (name === '@lib/supabase/client') return { supabaseClient: () => supabase }
    if (name === '@tanstack/react-query') return {}
    if (name.startsWith('@lib/')) return load(name.replace('@lib/', 'lib/'))
    if (name.startsWith('./')) return load(`${path.slice(0, path.lastIndexOf('/'))}/${name.slice(2)}`)
    return nativeRequire(name)
  }
  new Function('require', 'module', 'exports', source)(requireModule, mod, mod.exports)
  cache.set(path, mod.exports)
  return mod.exports
}
const { POST } = load('app/api/receipts/route') as { POST: (req: Request) => Promise<Response> }
function request(id: string | null): Request {
  const body = new FormData()
  if (id !== null) body.append('submission_id', id)
  body.append('image', new File(['image'], 'receipt.webp', { type: 'image/webp' }))
  body.append('receipt', JSON.stringify({ vendor: 'Cafe', category: 'coffee', total: 12 }))
  return new Request('http://localhost/api/receipts', { method: 'POST', body })
}
async function result(response: Response): Promise<Saved> {
  assert.equal(response.status, 200)
  return (await response.json()).data as Saved
}
function reset() {
  userId = 'user-a'; rpcMode = 'success'; lookupFails = false
  receipts.clear(); images.clear(); removed.length = 0; uploads = 0; pending = undefined
}

test('lost response is reconciled and replay returns the original image without uploading', async () => {
  reset()
  const id = randomUUID()
  rpcMode = 'lost-response'
  const first = await result(await POST(request(id)))
  rpcMode = 'success'
  assert.deepEqual(await result(await POST(request(id))), first)
  assert.equal(receipts.size, 1)
  assert.equal(images.size, 1)
  assert.equal(uploads, 1)
  assert.equal(removed.length, 0)
})

test('lost response and unavailable reconciliation remain safe to retry', async () => {
  reset()
  const id = randomUUID()
  rpcMode = 'unreconciled-commit'
  assert.equal((await POST(request(id))).status, 503)
  const committed = receipts.get(`user-a:${id}`)
  assert.ok(committed)
  assert.equal(images.size, 1)
  assert.equal(removed.length, 0)
  rpcMode = 'success'; lookupFails = false
  assert.deepEqual(await result(await POST(request(id))), committed)
  assert.equal(uploads, 1)
})

test('concurrent submissions return one receipt and clean only the losing upload', async () => {
  reset()
  pending = new Promise<void>((resolve) => { release = resolve })
  const id = randomUUID()
  const first = POST(request(id))
  const second = POST(request(id))
  while (uploads < 2) await new Promise<void>((resolve) => setImmediate(resolve))
  release?.()
  const [a, b] = await Promise.all([first.then(result), second.then(result)])
  assert.deepEqual(a, b)
  assert.equal(receipts.size, 1)
  assert.equal(images.size, 1)
  assert.equal(removed.length, 1)
  assert.ok(!a.img_url.endsWith(removed[0]))
})

test('same submission ID is isolated by authenticated owner', async () => {
  reset()
  const id = randomUUID()
  const a = await result(await POST(request(id)))
  userId = 'user-b'
  const b = await result(await POST(request(id)))
  assert.notEqual(a.id, b.id)
  assert.notEqual(a.img_url, b.img_url)
  userId = 'user-a'
  assert.deepEqual(await result(await POST(request(id))), a)
  assert.equal(receipts.size, 2)
  assert.equal(images.size, 2)
})

test('confirmed failure cleans its attempt and remains retryable; unknown outcomes retain images', async () => {
  reset()
  const id = randomUUID()
  rpcMode = 'sql-failure'
  assert.equal((await POST(request(id))).status, 500)
  assert.equal(images.size, 0)
  rpcMode = 'success'
  const saved = await result(await POST(request(id)))
  assert.equal(receipts.size, 1)
  assert.equal(images.size, 1)
  rpcMode = 'unknown'
  assert.equal((await POST(request(randomUUID()))).status, 503)
  assert.equal(images.size, 2)
  assert.ok([...images].some((path) => saved.img_url.endsWith(path)))
})

test('authentication, invalid IDs and failed preflight do not upload', async () => {
  reset()
  userId = null
  assert.equal((await POST(request(randomUUID()))).status, 401)
  userId = 'user-a'
  for (const id of [null, 'bad-id']) assert.equal((await POST(request(id))).status, 400)
  lookupFails = true
  assert.equal((await POST(request(randomUUID()))).status, 503)
  assert.equal(uploads, 0)
})

test('draft edits and failed saves retain the ID, reset and a new image create a new ID', () => {
  const { useAnalysisDraftStore: store } = load('store/analysisDraftStore') as {
    useAnalysisDraftStore: { getState: () => {
      submissionId: string | null
      setFile: (file: File | null) => void
      setReceipt: (receipt: { vendor: string }) => void
      updateReceipt: (partial: { vendor: string }) => void
      reset: () => void
    } }
  }
  const file = new File(['image'], 'receipt.webp')
  store.getState().setFile(file)
  const id = store.getState().submissionId
  assert.ok(id)
  store.getState().setReceipt({ vendor: 'Cafe' })
  store.getState().updateReceipt({ vendor: 'Edited cafe' })
  assert.equal(store.getState().submissionId, id)
  store.getState().reset()
  assert.equal(store.getState().submissionId, null)
  store.getState().setFile(file)
  assert.ok(store.getState().submissionId)
  assert.notEqual(store.getState().submissionId, id)
  store.getState().setFile(null)
  assert.equal(store.getState().submissionId, null)
})

test('receipt save hook forwards the caller-owned submission ID unchanged on retries', async () => {
  const { useReceipt } = load('app/hooks/useReceipt') as {
    useReceipt: () => { saveReceipt: (payload: {
      submissionId: string; receipt: { vendor: string; total: number }
      location: { lat: number; lon: number }; imageFile: File
    }) => Promise<Response> }
  }
  const payload = { submissionId: randomUUID(), receipt: { vendor: 'Cafe', total: 12 },
    location: { lat: 49, lon: -123 }, imageFile: new File(['image'], 'receipt.webp') }
  const originalFetch = globalThis.fetch
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, '/api/receipts')
      assert.equal((options?.body as FormData).get('submission_id'), payload.submissionId)
      return Response.json({ success: true })
    }
    const { saveReceipt } = useReceipt()
    await saveReceipt(payload)
    await saveReceipt(payload)
  } finally {
    globalThis.fetch = originalFetch
  }
})

// Optional real SQL check: install @electric-sql/pglite outside the repo and set
// RECEIPT_TEST_PGLITE_MODULE to its absolute module directory before running this file.
test('SQL migration replays without place mutations and rolls back failed attempts', {
  skip: !process.env.RECEIPT_TEST_PGLITE_MODULE,
}, async () => {
  type Database = {
    exec: (sql: string) => Promise<unknown>
    query: (sql: string, args?: string[]) => Promise<{ rows: Record<string, unknown>[] }>
    close: () => Promise<void>
  }
  const { PGlite } = nativeRequire(process.env.RECEIPT_TEST_PGLITE_MODULE!) as {
    PGlite: new () => Database
  }
  const db = new PGlite()
  try {
    await db.exec(`CREATE SCHEMA auth;
      CREATE TABLE auth.users(id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb);
      CREATE ROLE anon; CREATE ROLE authenticated;
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$
        SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;`)
    const schema = readFileSync('supabase/migrations/20240101000000_initial_schema.sql', 'utf8')
    await db.exec(schema.slice(0, schema.indexOf('-- ─── save_receipt_with_place RPC')))
    await db.exec(readFileSync('supabase/migrations/20261006000000_receipt_atomic_save.sql', 'utf8'))
    await db.exec(readFileSync('supabase/migrations/20261006000100_receipt_submission_id.sql', 'utf8'))
    const a = randomUUID(), b = randomUUID(), key = randomUUID(), failedKey = randomUUID()
    await db.query('INSERT INTO auth.users(id) VALUES ($1), ($2)', [a, b])
    const setUser = (id: string) => db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [id])
    const save = async (url: string, category = 'coffee', id = key) => (await db.query(
      'SELECT public.save_receipt_submission($1::jsonb, $2::jsonb, $3, $4::uuid) AS saved',
      [JSON.stringify({ vendor: 'Cafe', category, total: 12 }),
        JSON.stringify({ name: 'Cafe', lat: 49, lon: -123 }), url, id],
    )).rows[0].saved as Saved
    await setUser(a)
    const first = await save('first-image')
    assert.deepEqual(await save('replay-image'), first)
    assert.equal((await db.query('SELECT count(*)::int AS n FROM places')).rows[0].n, 1)
    await setUser(b)
    assert.notEqual((await save('other-user-image')).id, first.id)
    await setUser(a)
    assert.deepEqual(await save('edited-retry-image'), first)
    await assert.rejects(save('failed-image', 'invalid-category', failedKey))
    assert.equal((await db.query('SELECT count(*)::int AS n FROM places')).rows[0].n, 2)
    await save('retry-image', 'coffee', failedKey)
    assert.equal((await db.query('SELECT count(*)::int AS n FROM receipts')).rows[0].n, 3)
    await db.exec('SET ROLE authenticated')
    assert.deepEqual(await save('authenticated-replay'), first)
    await setUser('')
    await assert.rejects(save('unauthenticated'))
    await db.exec('RESET ROLE; SET ROLE anon')
    await assert.rejects(save('anonymous'), /permission denied/)
  } finally {
    await db.close()
  }
})
