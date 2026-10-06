// Run: node -e "require.extensions['.ts']=(m,f)=>m._compile(require('typescript').transpile(require('fs').readFileSync(f,'utf8'),{module:1,target:9}),f);require('./tests/ocr-route.test.ts')"
import * as assert from 'node:assert/strict'
import { File as NodeFile } from 'node:buffer'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import * as zod from 'zod'
import * as nodeCrypto from 'node:crypto'
import { transpile, ModuleKind, ScriptTarget } from 'typescript'

// Node 20's File is available through node:buffer; Next.js supplies it in production.
globalThis.File ??= NodeFile as unknown as typeof File

let authenticated = true
let uploads = 0
let removals: string[] = []
let rpcError: { code: string; message: string } | null = null
let rpcThrows = false
let savedId: string | null = 'receipt-id'
let foundId: string | null = null
let lookupFails = false
let imageUrl = ''
let submissionHash = ''
let uploadPath = ''
const supabase = {
  auth: { getUser: async () => ({ data: { user: authenticated ? { id: 'tester' } : null }, error: null }) },
  storage: { from: () => ({
    upload: async (path: string) => { uploads++; uploadPath = path; return { data: { path }, error: null } },
    getPublicUrl: (path: string) => { imageUrl = `https://storage.example/${path}`; return { data: { publicUrl: imageUrl } } },
    remove: async (paths: string[]) => { removals.push(...paths); return { error: null } },
  }) },
  rpc: async (name: string, args: { receipt: unknown; place: unknown; img_url: string; submission_hash: string }) => {
    assert.equal(name, 'save_receipt_submission')
    assert.equal(args.img_url, imageUrl)
    submissionHash = args.submission_hash
    assert.ok(!('user_id' in args))
    if (rpcThrows) throw new Error('Connection lost')
    return { data: savedId ? { id: savedId, img_url: imageUrl } : null, error: rpcError }
  },
  from: (table: string) => {
    assert.equal(table, 'receipts')
    const query = {
      select: (fields: string) => { assert.equal(fields, 'id, img_url, submission_hash'); return query },
      eq: (field: string, value: string) => {
        assert.equal(value, field === 'user_id' ? 'tester' : '00000000-0000-4000-8000-000000000001')
        return query
      },
      maybeSingle: async () => ({ data: foundId && imageUrl ? { id: foundId, img_url: imageUrl, submission_hash: submissionHash } : null, error: lookupFails ? { message: 'Unavailable' } : null }),
    }
    return query
  },
}
const cache = new Map<string, unknown>()
function load(path: string): unknown {
  if (cache.has(path)) return cache.get(path)
  const mod = { exports: {} }
  const source = transpile(readFileSync(`${process.cwd()}/${path}.ts`, 'utf8'), {
    module: ModuleKind.CommonJS,
    target: ScriptTarget.ES2022,
  })
  const requireModule = (name: string): unknown => {
    if (name === './supabase/server') {
      return { supabaseServer: async () => supabase }
    }
    if (name === 'zod') return zod
    if (name === 'node:crypto') return nodeCrypto
    if (name === 'next/server') return { NextResponse: Response }
    if (name.startsWith('@lib/')) return load(name.replace('@lib/', 'lib/'))
    if (name.startsWith('./')) return load(`${path.slice(0, path.lastIndexOf('/'))}/${name.slice(2)}`)
    throw new Error(`Unexpected runtime import: ${name}`)
  }
  new Function('require', 'module', 'exports', source)(requireModule, mod, mod.exports)
  cache.set(path, mod.exports)
  return mod.exports
}
const { POST } = load('app/api/receipts/route') as { POST: (request: Request) => Promise<Response> }

function request(image: File | string = new File(['image'], 'receipt.png', { type: 'image/png' })): Request {
  imageUrl = ''
  const body = new FormData()
  body.append('submission_id', '00000000-0000-4000-8000-000000000001')
  body.append('image', image)
  body.append('receipt', JSON.stringify({ vendor: 'Cafe', total: 5, user_id: 'another-user' }))
  body.append('place', JSON.stringify({ name: 'Cafe', address: 'Street', lat: 49, lon: -123 }))
  return new Request('http://localhost/api/receipts', { method: 'POST', body })
}

test('receipt upload validation, authenticated save, and failure reconciliation', async () => {
  authenticated = false
  assert.equal((await POST(request())).status, 401)
  authenticated = true
  for (const [file, status] of [
    ['not a file', 400],
    [new File([], 'empty.png', { type: 'image/png' }), 400],
    [new File(['x'], 'bad.txt', { type: 'text/plain' }), 422],
    [new File(['x'], 'bad.png', { type: 'constructor' }), 422],
    [new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' }), 422],
  ] as const) assert.equal((await POST(request(file))).status, status)
  assert.equal(uploads, 0)
  for (const [type, ext] of [['image/png', 'png'], ['image/jpeg', 'jpg'], ['image/webp', 'webp']]) {
    assert.equal((await POST(request(new File(['x'], 'receipt', { type })))).status, 200)
    assert.match(uploadPath, new RegExp(`^tester/.*\\.${ext}$`))
  }
  savedId = null
  rpcError = { code: '23514', message: 'Place save failed' }
  assert.equal((await POST(request())).status, 500)
  assert.deepEqual(removals, [uploadPath])
  removals = []
  for (const code of ['', '08006', '57014', '40003']) {
    rpcError = { code, message: 'Unknown outcome' }
    foundId = 'committed-receipt'
    assert.deepEqual(await (await POST(request())).json(), { success: true, data: { id: foundId, img_url: imageUrl } })
    foundId = null
    assert.equal((await POST(request())).status, 503)
    assert.deepEqual(removals, [])
  }
  rpcThrows = true
  foundId = 'committed-after-disconnect'
  assert.equal((await POST(request())).status, 200)
  lookupFails = true
  assert.equal((await POST(request())).status, 503)
  assert.deepEqual(removals, [])
})
