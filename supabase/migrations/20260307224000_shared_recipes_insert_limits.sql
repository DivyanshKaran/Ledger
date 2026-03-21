WITH recipe_dupes AS (
  SELECT ctid
  FROM (
    SELECT
      ctid,
      row_number() OVER (
        PARTITION BY shared_by, recipe_id
        ORDER BY created_at DESC, id DESC
      ) AS rn
    FROM public.shared_recipes
    WHERE shared_by IS NOT NULL
      AND recipe_id IS NOT NULL
  ) ranked
  WHERE ranked.rn > 1
)
DELETE FROM public.shared_recipes sr
USING recipe_dupes
WHERE sr.ctid = recipe_dupes.ctid;

WITH preset_dupes AS (
  SELECT ctid
  FROM (
    SELECT
      ctid,
      row_number() OVER (
        PARTITION BY shared_by, preset_recipe_id
        ORDER BY created_at DESC, id DESC
      ) AS rn
    FROM public.shared_recipes
    WHERE shared_by IS NOT NULL
      AND preset_recipe_id IS NOT NULL
      AND recipe_id IS NULL
  ) ranked
  WHERE ranked.rn > 1
)
DELETE FROM public.shared_recipes sr
USING preset_dupes
WHERE sr.ctid = preset_dupes.ctid;

CREATE UNIQUE INDEX IF NOT EXISTS shared_recipes_unique_user_recipe_idx
  ON public.shared_recipes (shared_by, recipe_id)
  WHERE shared_by IS NOT NULL AND recipe_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS shared_recipes_unique_user_preset_idx
  ON public.shared_recipes (shared_by, preset_recipe_id)
  WHERE shared_by IS NOT NULL AND recipe_id IS NULL AND preset_recipe_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS shared_recipes_shared_by_created_at_idx
  ON public.shared_recipes (shared_by, created_at DESC)
  WHERE shared_by IS NOT NULL;

CREATE OR REPLACE FUNCTION public.enforce_shared_recipe_insert_limits()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_recent_count integer;
  v_total_count integer;
BEGIN
  IF NEW.shared_by IS NULL THEN
    RAISE EXCEPTION 'shared_by_required';
  END IF;

  SELECT COUNT(*)::integer
  INTO v_recent_count
  FROM public.shared_recipes sr
  WHERE sr.shared_by = NEW.shared_by
    AND sr.created_at >= now() - interval '10 minutes';

  IF v_recent_count >= 10 THEN
    RAISE EXCEPTION 'share_rate_limit_exceeded';
  END IF;

  SELECT COUNT(*)::integer
  INTO v_total_count
  FROM public.shared_recipes sr
  WHERE sr.shared_by = NEW.shared_by;

  IF v_total_count >= 200 THEN
    RAISE EXCEPTION 'share_quota_exceeded';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_shared_recipe_insert_limits_trigger ON public.shared_recipes;
CREATE TRIGGER enforce_shared_recipe_insert_limits_trigger
BEFORE INSERT ON public.shared_recipes
FOR EACH ROW
EXECUTE FUNCTION public.enforce_shared_recipe_insert_limits();
