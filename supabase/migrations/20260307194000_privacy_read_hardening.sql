ALTER TABLE public.profiles
ALTER COLUMN is_public SET DEFAULT false;

ALTER TABLE public.activity_feed
ALTER COLUMN is_public SET DEFAULT false;

DROP POLICY IF EXISTS "Anyone can view follows" ON public.user_follows;
DROP POLICY IF EXISTS "Authenticated users can view follows" ON public.user_follows;
CREATE POLICY "Authenticated users can view follows"
ON public.user_follows
FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view ratings" ON public.recipe_ratings;
DROP POLICY IF EXISTS "Authenticated users can view ratings" ON public.recipe_ratings;
CREATE POLICY "Authenticated users can view ratings"
ON public.recipe_ratings
FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view comments" ON public.recipe_comments;
DROP POLICY IF EXISTS "Authenticated users can view comments" ON public.recipe_comments;
CREATE POLICY "Authenticated users can view comments"
ON public.recipe_comments
FOR SELECT
USING (auth.uid() IS NOT NULL);
