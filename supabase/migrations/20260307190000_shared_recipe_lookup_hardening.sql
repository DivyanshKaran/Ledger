DROP POLICY IF EXISTS "Anyone can view shared recipes" ON public.shared_recipes;
DROP POLICY IF EXISTS "Owners can view their shared recipes" ON public.shared_recipes;

CREATE POLICY "Owners can view their shared recipes"
ON public.shared_recipes
FOR SELECT
USING (auth.uid() = shared_by);

CREATE OR REPLACE FUNCTION public.get_shared_recipe_by_code(p_share_code text)
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
BEGIN
  IF v_share_code IS NULL OR v_share_code !~ '^[A-Za-z0-9_-]{6,64}$' THEN
    RAISE EXCEPTION 'invalid_share_code';
  END IF;

  RETURN QUERY
  SELECT sr.share_code, sr.recipe_id, sr.preset_recipe_id, sr.created_at
  FROM public.shared_recipes sr
  WHERE sr.share_code = v_share_code
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.get_shared_recipe_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_recipe_by_code(text) TO anon, authenticated;
