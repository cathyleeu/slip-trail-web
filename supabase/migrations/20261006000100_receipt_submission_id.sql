-- Requires 20261006000000_receipt_atomic_save.sql (#42). Deploy before the API.
ALTER TABLE public.receipts ADD COLUMN submission_id UUID;
ALTER TABLE public.receipts ADD CONSTRAINT receipts_user_submission_unique
  UNIQUE (user_id, submission_id);

CREATE OR REPLACE FUNCTION public.save_receipt_submission(
  receipt JSONB,
  place JSONB,
  img_url TEXT,
  submission_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_existing public.receipts%ROWTYPE;
  v_saved JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;
  IF submission_id IS NULL THEN
    RAISE EXCEPTION 'Submission ID is required' USING ERRCODE = '22004';
  END IF;

  -- Serialize this user's submission before touching places or receipts.
  PERFORM pg_advisory_xact_lock(hashtextextended(v_user_id::TEXT || ':' || submission_id::TEXT, 0));
  SELECT r.* INTO v_existing FROM public.receipts r
    WHERE r.user_id = v_user_id AND r.submission_id = save_receipt_submission.submission_id;
  IF FOUND THEN
    RETURN jsonb_build_object('id', v_existing.id, 'img_url', v_existing.img_url);
  END IF;

  v_saved := public.save_receipt_with_place_v2(receipt, place, img_url);
  UPDATE public.receipts r SET submission_id = save_receipt_submission.submission_id
    WHERE r.id = (v_saved->>'id')::UUID AND r.user_id = v_user_id
    RETURNING r.* INTO STRICT v_existing;
  RETURN jsonb_build_object('id', v_existing.id, 'img_url', v_existing.img_url);
END;
$$;

REVOKE ALL ON FUNCTION public.save_receipt_submission(JSONB, JSONB, TEXT, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_receipt_submission(JSONB, JSONB, TEXT, UUID) TO authenticated;
