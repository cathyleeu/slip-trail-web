// Run: node -e "require.extensions['.ts']=(m,f)=>m._compile(require('typescript').transpile(require('fs').readFileSync(f,'utf8'),{module:1,target:9}),f);require('./tests/receipt-parsing.test.ts')"
import * as assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { transpile, ModuleKind, ScriptTarget } from 'typescript'
import type { ParsedReceipt } from '@types'
import * as zod from 'zod'

let authenticated = true
let llmResponse: string | null = '{}'
let llmError = false
let calls = 0
const cache = new Map<string, unknown>()
function load(path: string): unknown {
  if (cache.has(path)) return cache.get(path)
  const mod = { exports: {} }
  const source = transpile(readFileSync(`${process.cwd()}/${path}.ts`, 'utf8'), {
    module: ModuleKind.CommonJS, target: ScriptTarget.ES2022,
  })
  const requireModule = (name: string): unknown => {
    if (name === 'zod') return zod
    if (name === 'groq-sdk') return { default: class {} }
    if (name === './supabase/server') return { supabaseServer: async () => ({
      auth: { getUser: async () => ({ data: { user: authenticated ? { id: 'tester' } : null }, error: null }) },
    }) }
    if (name === '@tanstack/react-query') return {}
    if (name === 'next/server') return { NextResponse: Response }
    if (name === '@lib/groq') return {
      ...(load('lib/groq') as object),
      parseReceipt: async () => {
        calls++
        if (llmError) throw new Error('secret-key-and-raw-response')
        return llmResponse
      },
    }
    if (name === '@lib/logger') return { log: { warn: () => {}, apiError: () => {} } }
    if (name.startsWith('@lib/')) return load(name.replace('@lib/', 'lib/'))
    if (name === '@types') return load('types/index')
    if (name.startsWith('@types/')) return load(name.replace('@types/', 'types/'))
    if (name.startsWith('./')) return load(`${path.slice(0, path.lastIndexOf('/'))}/${name.slice(2)}`)
    throw new Error(`Unexpected runtime import: ${name}`)
  }
  new Function('require', 'module', 'exports', source)(requireModule, mod, mod.exports)
  cache.set(path, mod.exports)
  return mod.exports
}
const { POST } = load('app/api/parse-receipt/route') as { POST: (request: Request) => Promise<Response> }
const rawText = '  Cafe receipt\nCoffee 5.00\nTOTAL 5.00\n  '
function request(): Request {
  return new Request('http://localhost/api/parse-receipt', {
    method: 'POST', body: JSON.stringify({ rawText }),
  })
}

test('receipt drafts validate unknowns, normalize addresses and fail safely', async () => {
  authenticated = false
  assert.equal((await POST(request())).status, 401)
  assert.equal(calls, 0)
  authenticated = true
  llmResponse = JSON.stringify({ vendor: null, total: null, items: null, charges: null, raw_text: 'fabricated' })
  const draft = (await (await POST(request())).json()).data as ParsedReceipt
  assert.equal(draft.vendor, null)
  assert.equal(draft.total, null)
  assert.equal(draft.currency, 'CAD')
  assert.equal(draft.purchased_at, null)
  assert.equal(draft.category, 'other')
  assert.equal(draft.raw_text, rawText)
  assert.deepEqual(draft.items, [])
  assert.deepEqual(draft.charges, [])
  assert.equal(draft.address_normalized.query, null)
  assert.equal(draft.address_normalized.components.road, null)

  const valid = {
    vendor: ' Cafe ', total: 5, category: 'CAFE',
    items: [{ name: 'Coffee', quantity: 1, price: 5 }],
    charges: [{ type: 'discount', label: 'Promo', amount: -1 }, { type: 'tax', label: 'GST', amount: null }],
    address_normalized: {
      components: { house_number: ' 123 ', road: ' Main   St ', city: 'Vancouver', region: 'B.C.' },
      query: 'fabricated', alternates: null,
    },
  }
  llmResponse = JSON.stringify(valid)
  const normalized = (await (await POST(request())).json()).data as ParsedReceipt
  assert.equal(normalized.vendor, 'Cafe')
  assert.equal(normalized.category, 'coffee')
  assert.deepEqual(normalized.charges, valid.charges)
  assert.equal(normalized.address_normalized.query, '123 Main St, Vancouver, BC')
  assert.deepEqual(normalized.address_normalized.alternates, ['123 Main St, Vancouver', 'Main St, Vancouver, BC'])
  assert.equal(normalized.address_normalized.components.region, null)

  for (const output of [
    'not-json-secret-key-and-raw-response', 'null', '[]', '42', '',
    JSON.stringify({ total: '5.00' }), JSON.stringify({ vendor: 42 }),
    JSON.stringify({ total: { value: 5 } }), '{"total":1e999}',
    JSON.stringify({ items: [{ name: 'Coffee', price: '5' }] }),
    JSON.stringify({ charges: [{ type: 'unknown', label: 'GST', amount: 1 }] }),
    JSON.stringify({ charges: [{ type: 'tax', label: 'GST', amount: '1' }] }),
    JSON.stringify({ items: {} }), JSON.stringify({ charges: {} }),
    JSON.stringify({ address_normalized: { components: { road: 123 } } }),
    JSON.stringify({ purchased_at: 'not-a-date' }),
  ]) {
    llmResponse = output
    const response = await POST(request())
    assert.equal(response.status, 502, output)
    const failure = await response.json()
    assert.equal(failure.success, false)
    assert.equal(failure.details, undefined)
    assert.ok(!JSON.stringify(failure).includes('secret-key-and-raw-response'))
  }
  llmError = true
  const failed = await POST(request())
  assert.equal(failed.status, 502)
  assert.ok(!(await failed.text()).includes('secret-key-and-raw-response'))
  llmError = false

  const { parsedReceiptSchema } = load('lib/validation') as {
    parsedReceiptSchema: { safeParse: (value: unknown) => { success: boolean; data?: unknown } }
  }
  assert.equal(parsedReceiptSchema.safeParse(draft).success, false)
  const saved = parsedReceiptSchema.safeParse({ vendor: 'Cafe', total: 5, charges: [valid.charges[0]] })
  assert.equal(saved.success, true)
  assert.deepEqual((saved.data as { charges: unknown }).charges, [valid.charges[0]])
})

test('parse failures enter the existing client recovery result', async () => {
  const { requestParsing } = load('app/hooks/useAnalysisMutation') as {
    requestParsing: (options: { rawText: string }) => Promise<unknown>
  }
  const originalFetch = globalThis.fetch
  try {
    llmResponse = '{bad-json}'
    globalThis.fetch = async () => POST(request())
    assert.deepEqual(await requestParsing({ rawText }), {
      success: false, error: 'Could not parse receipt. Please try again.',
      details: { success: false, error: 'Could not parse receipt. Please try again.' },
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('draft amount edits preserve unknowns until enough information is available', () => {
  const { draftTotal } = load('lib/receiptDraft') as {
    draftTotal: (items: ParsedReceipt['items'], charges: ParsedReceipt['charges'], subtotal: number | null) => number | null
  }
  assert.equal(draftTotal([], [], null), null)
  assert.equal(draftTotal([{ name: 'Coffee', quantity: null, price: 5 }], [], null), null)
  assert.equal(draftTotal([{ name: 'Coffee', quantity: 1, price: null }], [], null), null)
  assert.equal(draftTotal([], [{ type: 'tax' as ParsedReceipt['charges'][number]['type'], label: 'GST', amount: null }], 5), null)
  assert.equal(draftTotal([{ name: 'Coffee', quantity: 1, price: 5 }], [], null), 5)
  assert.equal(draftTotal([], [], 0), 0)
})
