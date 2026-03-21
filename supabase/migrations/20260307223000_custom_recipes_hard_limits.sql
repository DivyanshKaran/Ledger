UPDATE public.custom_recipes
SET title = COALESCE(NULLIF(left(trim(title), 200), ''), 'Untitled Recipe');

UPDATE public.custom_recipes
SET description = left(description, 4000)
WHERE description IS NOT NULL
  AND length(description) > 4000;

UPDATE public.custom_recipes
SET cuisine = COALESCE(NULLIF(left(trim(cuisine), 80), ''), 'Custom');

UPDATE public.custom_recipes
SET image_url = left(image_url, 2048)
WHERE image_url IS NOT NULL
  AND length(image_url) > 2048;

UPDATE public.custom_recipes
SET servings = LEAST(100, GREATEST(1, servings));

UPDATE public.custom_recipes
SET ingredients = '[]'::jsonb
WHERE ingredients IS NULL
   OR jsonb_typeof(ingredients) <> 'array'
   OR pg_column_size(ingredients) > 65536;

UPDATE public.custom_recipes
SET steps = '[]'::jsonb
WHERE steps IS NULL
   OR jsonb_typeof(steps) <> 'array'
   OR pg_column_size(steps) > 65536;

UPDATE public.custom_recipes
SET nutrition = NULL
WHERE nutrition IS NOT NULL
  AND (jsonb_typeof(nutrition) <> 'object' OR pg_column_size(nutrition) > 16384);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'custom_recipes_title_len_chk'
      AND conrelid = 'public.custom_recipes'::regclass
  ) THEN
    ALTER TABLE public.custom_recipes
      ADD CONSTRAINT custom_recipes_title_len_chk
      CHECK (length(title) BETWEEN 1 AND 200);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'custom_recipes_description_len_chk'
      AND conrelid = 'public.custom_recipes'::regclass
  ) THEN
    ALTER TABLE public.custom_recipes
      ADD CONSTRAINT custom_recipes_description_len_chk
      CHECK (description IS NULL OR length(description) <= 4000);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'custom_recipes_cuisine_len_chk'
      AND conrelid = 'public.custom_recipes'::regclass
  ) THEN
    ALTER TABLE public.custom_recipes
      ADD CONSTRAINT custom_recipes_cuisine_len_chk
      CHECK (length(cuisine) BETWEEN 1 AND 80);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'custom_recipes_image_url_len_chk'
      AND conrelid = 'public.custom_recipes'::regclass
  ) THEN
    ALTER TABLE public.custom_recipes
      ADD CONSTRAINT custom_recipes_image_url_len_chk
      CHECK (image_url IS NULL OR length(image_url) <= 2048);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'custom_recipes_servings_range_chk'
      AND conrelid = 'public.custom_recipes'::regclass
  ) THEN
    ALTER TABLE public.custom_recipes
      ADD CONSTRAINT custom_recipes_servings_range_chk
      CHECK (servings BETWEEN 1 AND 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'custom_recipes_ingredients_shape_chk'
      AND conrelid = 'public.custom_recipes'::regclass
  ) THEN
    ALTER TABLE public.custom_recipes
      ADD CONSTRAINT custom_recipes_ingredients_shape_chk
      CHECK (jsonb_typeof(ingredients) = 'array' AND pg_column_size(ingredients) <= 65536);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'custom_recipes_steps_shape_chk'
      AND conrelid = 'public.custom_recipes'::regclass
  ) THEN
    ALTER TABLE public.custom_recipes
      ADD CONSTRAINT custom_recipes_steps_shape_chk
      CHECK (jsonb_typeof(steps) = 'array' AND pg_column_size(steps) <= 65536);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'custom_recipes_nutrition_shape_chk'
      AND conrelid = 'public.custom_recipes'::regclass
  ) THEN
    ALTER TABLE public.custom_recipes
      ADD CONSTRAINT custom_recipes_nutrition_shape_chk
      CHECK (
        nutrition IS NULL
        OR (jsonb_typeof(nutrition) = 'object' AND pg_column_size(nutrition) <= 16384)
      );
  END IF;
END
$$;
