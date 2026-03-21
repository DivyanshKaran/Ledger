UPDATE public.profiles
SET is_public = false
WHERE is_public = true;

UPDATE public.activity_feed
SET is_public = false
WHERE is_public = true;

UPDATE public.cooking_history
SET recipe_title = left(recipe_title, 200)
WHERE length(recipe_title) > 200;

UPDATE public.cooking_history
SET notes = left(notes, 2000)
WHERE notes IS NOT NULL
  AND length(notes) > 2000;

UPDATE public.activity_feed
SET activity_type = left(activity_type, 64)
WHERE length(activity_type) > 64;

UPDATE public.activity_feed
SET target_id = left(target_id, 128)
WHERE target_id IS NOT NULL
  AND length(target_id) > 128;

UPDATE public.activity_feed
SET metadata = '{}'::jsonb
WHERE metadata IS NULL
   OR jsonb_typeof(metadata) <> 'object'
   OR pg_column_size(metadata) > 8192;

ALTER TABLE public.activity_feed
ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;

ALTER TABLE public.activity_feed
ALTER COLUMN metadata SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cooking_history_recipe_title_len_chk'
      AND conrelid = 'public.cooking_history'::regclass
  ) THEN
    ALTER TABLE public.cooking_history
      ADD CONSTRAINT cooking_history_recipe_title_len_chk
      CHECK (length(recipe_title) BETWEEN 1 AND 200);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cooking_history_notes_len_chk'
      AND conrelid = 'public.cooking_history'::regclass
  ) THEN
    ALTER TABLE public.cooking_history
      ADD CONSTRAINT cooking_history_notes_len_chk
      CHECK (notes IS NULL OR length(notes) <= 2000);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'activity_feed_activity_type_len_chk'
      AND conrelid = 'public.activity_feed'::regclass
  ) THEN
    ALTER TABLE public.activity_feed
      ADD CONSTRAINT activity_feed_activity_type_len_chk
      CHECK (length(activity_type) BETWEEN 1 AND 64);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'activity_feed_target_id_len_chk'
      AND conrelid = 'public.activity_feed'::regclass
  ) THEN
    ALTER TABLE public.activity_feed
      ADD CONSTRAINT activity_feed_target_id_len_chk
      CHECK (target_id IS NULL OR length(target_id) <= 128);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'activity_feed_metadata_object_chk'
      AND conrelid = 'public.activity_feed'::regclass
  ) THEN
    ALTER TABLE public.activity_feed
      ADD CONSTRAINT activity_feed_metadata_object_chk
      CHECK (jsonb_typeof(metadata) = 'object');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'activity_feed_metadata_size_chk'
      AND conrelid = 'public.activity_feed'::regclass
  ) THEN
    ALTER TABLE public.activity_feed
      ADD CONSTRAINT activity_feed_metadata_size_chk
      CHECK (pg_column_size(metadata) <= 8192);
  END IF;
END
$$;
