CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

ALTER TABLE public.shared_recipes
ADD COLUMN IF NOT EXISTS share_secret_hash text;

UPDATE public.shared_recipes
SET share_secret_hash = encode(digest(gen_random_uuid()::text, 'sha256'), 'hex')
WHERE share_secret_hash IS NULL;

ALTER TABLE public.shared_recipes
ALTER COLUMN share_secret_hash SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'shared_recipes_share_secret_hash_chk'
      AND conrelid = 'public.shared_recipes'::regclass
  ) THEN
    ALTER TABLE public.shared_recipes
    ADD CONSTRAINT shared_recipes_share_secret_hash_chk
    CHECK (share_secret_hash ~ '^[0-9a-f]{64}$');
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.lookup_shared_recipe_and_increment(
  p_share_code text,
  p_share_secret_hash text
)
RETURNS TABLE (
  share_code text,
  recipe_id uuid,
  preset_recipe_id text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_share_code text := trim(p_share_code);
  v_secret_hash text := lower(trim(p_share_secret_hash));
BEGIN
  IF v_share_code IS NULL OR v_share_code !~ '^[A-Za-z0-9_-]{6,64}$' THEN
    RAISE EXCEPTION 'invalid_share_code';
  END IF;

  IF v_secret_hash IS NULL OR v_secret_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid_share_secret_hash';
  END IF;

  RETURN QUERY
  WITH updated AS (
    UPDATE public.shared_recipes sr
    SET view_count = sr.view_count + 1
    WHERE sr.share_code = v_share_code
      AND sr.share_secret_hash = v_secret_hash
    RETURNING sr.share_code, sr.recipe_id, sr.preset_recipe_id, sr.created_at
  )
  SELECT u.share_code, u.recipe_id, u.preset_recipe_id, u.created_at
  FROM updated u
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.lookup_shared_recipe_and_increment(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_shared_recipe_and_increment(text, text) TO anon, authenticated, service_role;
