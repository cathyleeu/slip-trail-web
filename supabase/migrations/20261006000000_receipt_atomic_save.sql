-- Deploy before the receipt-create route. The versioned name prevents legacy RPC fallback.
CREATE OR REPLACE FUNCTION public.save_receipt_with_place_v2(
  receipt JSONB,
  place   JSONB,
  img_url TEXT
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_place_id    UUID;
  v_receipt_id  UUID;
  v_lat         NUMERIC;
  v_lon         NUMERIC;
  v_place_name  TEXT;
  v_place_addr  TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  -- 1) Upsert place and capture lat/lon for the receipt row
  IF place IS NOT NULL AND (place->>'lat') IS NOT NULL AND (place->>'lon') IS NOT NULL THEN
    INSERT INTO places (osm_ref, name, address, normalized_address, lat, lon, category, addresstype, type)
    VALUES (
      NULLIF(place->>'osm_ref', ''),
      COALESCE(NULLIF(place->>'name', ''), 'Unknown'),
      place->>'address',
      place->>'normalized_address',
      (place->>'lat')::NUMERIC,
      (place->>'lon')::NUMERIC,
      place->>'category',
      place->>'addresstype',
      place->>'type'
    )
    ON CONFLICT (osm_ref) DO UPDATE SET
      name    = EXCLUDED.name,
      address = EXCLUDED.address,
      lat     = EXCLUDED.lat,
      lon     = EXCLUDED.lon
    RETURNING id, lat, lon, name, address
    INTO v_place_id, v_lat, v_lon, v_place_name, v_place_addr;
  END IF;

  -- 2) Insert receipt, copying lat/lon from place
  INSERT INTO receipts (
    user_id, place_id, vendor, category, address, phone,
    purchased_at, currency, subtotal, total, items, charges,
    feeling, memo, img_url, raw_text,
    lat, lon, place_name, place_address
  )
  VALUES (
    auth.uid(),
    v_place_id,
    COALESCE(receipt->>'vendor', 'Unknown'),
    COALESCE(receipt->>'category', 'other'),
    receipt->>'address',
    receipt->>'phone',
    NULLIF(receipt->>'purchased_at', '')::TIMESTAMPTZ,
    COALESCE(NULLIF(receipt->>'currency', ''), 'CAD'),
    NULLIF(receipt->>'subtotal', '')::NUMERIC,
    NULLIF(receipt->>'total', '')::NUMERIC,
    COALESCE(receipt->'items', '[]'::JSONB),
    COALESCE(receipt->'charges', '[]'::JSONB),
    receipt->>'feeling',
    receipt->>'memo',
    img_url,
    receipt->>'raw_text',
    v_lat,
    v_lon,
    v_place_name,
    v_place_addr
  )
  RETURNING id INTO v_receipt_id;

  RETURN jsonb_build_object('id', v_receipt_id);
END;
$$;

REVOKE ALL ON FUNCTION public.save_receipt_with_place_v2(JSONB, JSONB, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_receipt_with_place_v2(JSONB, JSONB, TEXT) TO authenticated;
