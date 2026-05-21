-- ============================================================
-- Slip Trail — Full Schema
-- ============================================================

-- ─── profiles ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_owner" ON profiles
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── places ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS places (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  osm_ref            TEXT UNIQUE,
  name               TEXT NOT NULL,
  address            TEXT,
  normalized_address TEXT,
  lat                NUMERIC(10, 7) NOT NULL,
  lon                NUMERIC(10, 7) NOT NULL,
  category           TEXT,
  addresstype        TEXT,
  type               TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── receipts ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS receipts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id      UUID REFERENCES places(id),
  vendor        TEXT NOT NULL,
  category      TEXT CHECK (category IN ('restaurant','coffee','mart','bar','fast_food','bakery','pharmacy','gas','other')),
  address       TEXT,
  phone         TEXT,
  purchased_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  currency      TEXT NOT NULL DEFAULT 'CAD',
  subtotal      NUMERIC(10, 2),
  total         NUMERIC(10, 2),
  items         JSONB NOT NULL DEFAULT '[]',
  charges       JSONB NOT NULL DEFAULT '[]',
  feeling       TEXT CHECK (feeling IN ('Necessary','Impulsive','Social','Treat','Routine','Stress','Celebration')),
  memo          TEXT,
  img_url       TEXT,
  raw_text      TEXT,
  lat           NUMERIC(10, 7),
  lon           NUMERIC(10, 7),
  place_name    TEXT,
  place_address TEXT
);

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "receipts_owner" ON receipts
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS receipts_user_purchased
  ON receipts (user_id, purchased_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS receipts_user_geo
  ON receipts (user_id, purchased_at ASC)
  WHERE lat IS NOT NULL AND lon IS NOT NULL;

-- ─── save_receipt_with_place RPC ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION save_receipt_with_place(
  receipt JSONB,
  place   JSONB,
  img_url TEXT
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_place_id    UUID;
  v_receipt_id  UUID;
  v_lat         NUMERIC;
  v_lon         NUMERIC;
  v_place_name  TEXT;
  v_place_addr  TEXT;
BEGIN
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

    -- osm_ref may be null — handle INSERT without conflict key
    IF v_place_id IS NULL THEN
      INSERT INTO places (osm_ref, name, address, normalized_address, lat, lon, category, addresstype, type)
      VALUES (
        NULL,
        COALESCE(NULLIF(place->>'name', ''), 'Unknown'),
        place->>'address',
        place->>'normalized_address',
        (place->>'lat')::NUMERIC,
        (place->>'lon')::NUMERIC,
        place->>'category',
        place->>'addresstype',
        place->>'type'
      )
      RETURNING id, lat, lon, name, address
      INTO v_place_id, v_lat, v_lon, v_place_name, v_place_addr;
    END IF;
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

-- ─── dashboard_summary ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION dashboard_summary(from_ts TIMESTAMPTZ, to_ts TIMESTAMPTZ)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total      NUMERIC;
  v_count      INT;
  v_avg        NUMERIC;
  v_largest    NUMERIC;
  v_vendor     TEXT;
BEGIN
  SELECT
    COALESCE(SUM(total), 0),
    COUNT(*),
    COALESCE(AVG(total), 0)
  INTO v_total, v_count, v_avg
  FROM receipts
  WHERE user_id = auth.uid()
    AND purchased_at BETWEEN from_ts AND to_ts;

  SELECT total, vendor
  INTO v_largest, v_vendor
  FROM receipts
  WHERE user_id = auth.uid()
    AND purchased_at BETWEEN from_ts AND to_ts
  ORDER BY total DESC NULLS LAST
  LIMIT 1;

  RETURN jsonb_build_object(
    'total_spend',   v_total,
    'receipt_count', v_count,
    'avg_spend',     ROUND(v_avg, 2),
    'largest_spend', v_largest,
    'largest_vendor', v_vendor
  );
END;
$$;

-- ─── dashboard_top_places ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION dashboard_top_places(
  from_ts   TIMESTAMPTZ,
  to_ts     TIMESTAMPTZ,
  limit_n   INT DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(row_to_json(t))
    FROM (
      SELECT
        COALESCE(place_name, vendor) AS name,
        COUNT(*)                     AS visit_count,
        SUM(total)                   AS total_spend
      FROM receipts
      WHERE user_id = auth.uid()
        AND purchased_at BETWEEN from_ts AND to_ts
      GROUP BY COALESCE(place_name, vendor)
      ORDER BY visit_count DESC, total_spend DESC
      LIMIT limit_n
    ) t
  );
END;
$$;

-- ─── dashboard_recent_places ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION dashboard_recent_places(limit_n INT DEFAULT 10)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(row_to_json(t))
    FROM (
      SELECT DISTINCT ON (COALESCE(place_name, vendor))
        id,
        COALESCE(place_name, vendor) AS name,
        place_address                AS address,
        lat,
        lon,
        total,
        purchased_at
      FROM receipts
      WHERE user_id = auth.uid()
        AND purchased_at IS NOT NULL
      ORDER BY COALESCE(place_name, vendor), purchased_at DESC
      LIMIT limit_n
    ) t
  );
END;
$$;

-- ─── dashboard_category_breakdown ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION dashboard_category_breakdown(from_ts TIMESTAMPTZ, to_ts TIMESTAMPTZ)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(row_to_json(t))
    FROM (
      SELECT
        COALESCE(category, 'other') AS category,
        COUNT(*)                    AS receipt_count,
        COALESCE(SUM(total), 0)     AS total_spend
      FROM receipts
      WHERE user_id = auth.uid()
        AND purchased_at BETWEEN from_ts AND to_ts
      GROUP BY COALESCE(category, 'other')
      ORDER BY total_spend DESC
    ) t
  );
END;
$$;

-- ─── dashboard_emotion_breakdown ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION dashboard_emotion_breakdown(from_ts TIMESTAMPTZ, to_ts TIMESTAMPTZ)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(row_to_json(t))
    FROM (
      SELECT
        feeling,
        COUNT(*)                AS receipt_count,
        COALESCE(SUM(total), 0) AS total_spend
      FROM receipts
      WHERE user_id = auth.uid()
        AND purchased_at BETWEEN from_ts AND to_ts
        AND feeling IS NOT NULL
      GROUP BY feeling
      ORDER BY receipt_count DESC
    ) t
  );
END;
$$;

-- ─── dashboard_emotion_by_hour ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION dashboard_emotion_by_hour(from_ts TIMESTAMPTZ, to_ts TIMESTAMPTZ)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(row_to_json(t))
    FROM (
      SELECT
        EXTRACT(HOUR FROM purchased_at AT TIME ZONE 'America/Vancouver') AS hour,
        feeling,
        COUNT(*)                AS receipt_count,
        COALESCE(SUM(total), 0) AS total_spend
      FROM receipts
      WHERE user_id = auth.uid()
        AND purchased_at BETWEEN from_ts AND to_ts
        AND feeling IS NOT NULL
      GROUP BY hour, feeling
      ORDER BY hour, receipt_count DESC
    ) t
  );
END;
$$;
