// Run with the same TypeScript loader as receipt-save.test.ts and PGLITE_PATH pointing
// to an installed @electric-sql/pglite package. This exercises PostgreSQL, not SQL mocks.
import * as assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'

test('atomic RPC migration, owner isolation, snapshot, and rollback', async () => {
  assert.ok(process.env.PGLITE_PATH, 'Set PGLITE_PATH to an installed @electric-sql/pglite package')
  const { PGlite } = createRequire(`${process.cwd()}/package.json`)(process.env.PGLITE_PATH) as {
    PGlite: new () => {
      exec: (sql: string) => Promise<unknown>
      query: <T>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>
      close: () => Promise<void>
    }
  }
  const db = new PGlite()
  try {
    await db.exec(`
      CREATE SCHEMA auth;
      CREATE TABLE auth.users (id UUID PRIMARY KEY, email TEXT, raw_user_meta_data JSONB);
      CREATE FUNCTION auth.uid() RETURNS UUID LANGUAGE SQL AS
        $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      CREATE ROLE anon;
      CREATE ROLE authenticated;
    `)
    await db.exec(readFileSync('supabase/migrations/20240101000000_initial_schema.sql', 'utf8'))
    await db.exec(readFileSync('supabase/migrations/20261006000000_receipt_atomic_save.sql', 'utf8'))
    await db.exec(`
      INSERT INTO auth.users (id) VALUES ('00000000-0000-0000-0000-000000000001');
      SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
      SET ROLE authenticated;
    `)
    const receipt = { vendor: 'Cafe', total: 5, user_id: '00000000-0000-0000-0000-000000000002' }
    const place = { osm_ref: 'node:1', name: 'Cafe', address: 'Street', lat: 49, lon: -123 }
    const save = (r: unknown, p: unknown) => db.query('SELECT public.save_receipt_with_place_v2($1, $2, $3)', [r, p, 'image-url'])
    await save(receipt, place)
    await db.exec('RESET ROLE')
    const result = await db.query<{ user_id: string; lat: string; lon: string; place_name: string; place_address: string }>('SELECT * FROM receipts')
    assert.equal(result.rows.length, 1)
    assert.equal(result.rows[0].user_id, '00000000-0000-0000-0000-000000000001')
    assert.equal(Number(result.rows[0].lat), 49)
    assert.equal(Number(result.rows[0].lon), -123)
    assert.equal(result.rows[0].place_name, 'Cafe')
    assert.equal(result.rows[0].place_address, 'Street')
    await db.exec(`ALTER TABLE places ADD CONSTRAINT injected_place_failure CHECK (name <> 'Fail'); SET ROLE authenticated`)
    await assert.rejects(save(receipt, { ...place, osm_ref: 'node:2', name: 'Fail' }))
    await assert.rejects(save({ ...receipt, total: 'invalid' }, { ...place, name: 'Changed' }))
    await db.exec('RESET ROLE')
    assert.equal((await db.query('SELECT * FROM receipts')).rows.length, 1)
    const places = await db.query<{ name: string }>('SELECT name FROM places')
    assert.deepEqual(places.rows, [{ name: 'Cafe' }])
    await db.exec(`SET request.jwt.claim.sub = ''; SET ROLE authenticated`)
    await assert.rejects(save(receipt, place), /Unauthorized/)
    await db.exec('RESET ROLE; SET ROLE anon')
    await assert.rejects(save(receipt, place), /permission denied/)
  } finally {
    await db.close()
  }
})
