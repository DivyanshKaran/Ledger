DROP POLICY IF EXISTS "Users can share their recipes" ON public.shared_recipes;

CREATE POLICY "Users can share their own recipes"
ON public.shared_recipes
FOR INSERT
WITH CHECK (
  auth.uid() = shared_by
  AND (
    (
      recipe_id IS NOT NULL
      AND preset_recipe_id IS NULL
      AND EXISTS (
        SELECT 1
        FROM public.custom_recipes cr
        WHERE cr.id = recipe_id
          AND cr.user_id = auth.uid()
      )
    )
    OR (
      recipe_id IS NULL
      AND preset_recipe_id IS NOT NULL
    )
  )
);
