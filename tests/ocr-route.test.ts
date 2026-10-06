// Run: node -e "require.extensions['.ts']=(m,f)=>m._compile(require('typescript').transpile(require('fs').readFileSync(f,'utf8'),{module:1,target:9}),f);require('./tests/ocr-route.test.ts')"
import * as assert from 'node:assert/strict'
import { File as NodeFile } from 'node:buffer'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { transpile, ModuleKind, ScriptTarget } from 'typescript'

// Node 20's File is available through node:buffer; Next.js supplies it in production.
globalThis.File ??= NodeFile as unknown as typeof File

let authenticated = true
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
      return { supabaseServer: async () => ({ auth: { getUser: async () => ({
        data: { user: authenticated ? { id: 'tester' } : null }, error: null,
      }) } }) }
    }
    if (name === '@tanstack/react-query') return {}
    if (name === 'next/server') return { NextResponse: Response }
    if (name.startsWith('@lib/')) return load(name.replace('@lib/', 'lib/'))
    if (name.startsWith('./')) return load(`${path.slice(0, path.lastIndexOf('/'))}/${name.slice(2)}`)
    throw new Error(`Unexpected runtime import: ${name}`)
  }
  new Function('require', 'module', 'exports', source)(requireModule, mod, mod.exports)
  cache.set(path, mod.exports)
  return mod.exports
}
const { POST } = load('app/api/ocr/route') as { POST: (request: Request) => Promise<Response> }

function imageRequest(image: File | string = new File(['image'], 'receipt.png', { type: 'image/png' }), signal?: AbortSignal): Request {
  const body = new FormData()
  body.append('image', image)
  return new Request('http://localhost/api/ocr', { method: 'POST', body, signal })
}

test('authenticated OCR boundary and outcomes', async () => {
  const originalFetch = globalThis.fetch
  const originalTimeout = AbortSignal.timeout
  const originalUrl = process.env.OCR_API_URL
  const originalKey = process.env.OCR_API_KEY
  process.env.OCR_API_URL = 'https://ocr.example/ocr'
  process.env.OCR_API_KEY = 'secret-service-key'
  let calls = 0
  globalThis.fetch = async (_input, options) => {
    calls++
    assert.equal(new Headers(options?.headers).get('X-API-Key'), 'secret-service-key')
    assert.equal(options?.redirect, 'error')
    const image = (options?.body as FormData).get('image') as File
    assert.equal(image.name, 'receipt.png')
    assert.equal(await image.text(), 'image')
    return Response.json({ text: 'Receipt text' })
  }
  try {
    authenticated = false
    assert.equal((await POST(imageRequest())).status, 401)
    assert.equal(calls, 0)
    authenticated = true
    for (const [image, status] of [
      ['not a file', 400],
      [new File([], 'empty.png', { type: 'image/png' }), 400],
      [new File(['x'], 'bad.txt', { type: 'text/plain' }), 422],
      [new File([new Uint8Array(4 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' }), 413],
    ] as const) {
      assert.equal((await POST(imageRequest(image))).status, status)
    }
    assert.equal((await POST(new Request('http://localhost/api/ocr', { method: 'POST', body: 'bad' }))).status, 400)
    assert.equal(calls, 0)
    assert.deepEqual(await (await POST(imageRequest())).json(), { success: true, data: { text: 'Receipt text' } })
    delete process.env.OCR_API_KEY
    assert.equal((await POST(imageRequest())).status, 503)
    process.env.OCR_API_KEY = 'secret-service-key'
    for (const status of [429, 503, 500, 401]) {
      globalThis.fetch = async () => new Response('secret-service-key', { status })
      const response = await POST(imageRequest())
      assert.equal(response.status, [429, 503].includes(status) ? 503 : 502)
      assert.ok(!(await response.text()).includes('secret-service-key'))
    }
    for (const body of [{ text: '' }, { text: 42 }, null]) {
      globalThis.fetch = async () => Response.json(body)
      assert.equal((await POST(imageRequest())).status, 502)
    }
    globalThis.fetch = async () => { throw new Error('secret-service-key') }
    const failed = await POST(imageRequest())
    assert.equal(failed.status, 502)
    assert.ok(!(await failed.text()).includes('secret-service-key'))
    globalThis.fetch = async (_input, options) => new Promise((_resolve, reject) => {
      const signal = options?.signal
      signal?.addEventListener('abort', () => reject(signal.reason), { once: true })
      if (signal?.aborted) reject(signal.reason)
    })
    const controller = new AbortController()
    const pending = POST(imageRequest(undefined, controller.signal))
    setTimeout(() => controller.abort(), 10)
    assert.equal((await pending).status, 499)
    AbortSignal.timeout = () => {
      const controller = new AbortController()
      setTimeout(() => controller.abort(new DOMException('Timeout', 'TimeoutError')), 10)
      return controller.signal
    }
    assert.equal((await POST(imageRequest())).status, 504)
  } finally {
    globalThis.fetch = originalFetch
    AbortSignal.timeout = originalTimeout
    authenticated = true
    if (originalUrl === undefined) delete process.env.OCR_API_URL
    else process.env.OCR_API_URL = originalUrl
    if (originalKey === undefined) delete process.env.OCR_API_KEY
    else process.env.OCR_API_KEY = originalKey
  }
})


test('client uses the authenticated endpoint and reports cancellation', async () => {
  const { requestOcr } = load('app/hooks/useAnalysisMutation') as {
    requestOcr: (options: { file: File }, signal?: AbortSignal) => Promise<unknown>
  }
  const originalFetch = globalThis.fetch
  const file = new File(['image'], 'receipt.png', { type: 'image/png' })
  try {
    globalThis.fetch = async () => { throw new Error('Oversized image must not be sent') }
    assert.deepEqual(await requestOcr({ file: new File([new Uint8Array(4 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' }) }), {
      success: false, error: 'Image exceeds the 4MB OCR limit. Please choose a smaller image.',
    })
    globalThis.fetch = async (input, options) => {
      assert.equal(input, '/api/ocr')
      assert.equal((options?.body as FormData).get('image') instanceof File, true)
      return Response.json({ success: true, data: { text: 'Receipt text' } })
    }
    assert.deepEqual(await requestOcr({ file }), { success: true, text: 'Receipt text' })
    globalThis.fetch = async () => Response.json({ success: false, error: 'OCR request timed out. Please try again.' }, { status: 504 })
    assert.deepEqual(await requestOcr({ file }), {
      success: false, error: 'OCR request timed out. Please try again.', details: undefined,
    })
    const controller = new AbortController()
    controller.abort()
    globalThis.fetch = async () => { throw controller.signal.reason }
    assert.deepEqual(await requestOcr({ file }, controller.signal), {
      success: false, error: 'OCR request cancelled',
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})
