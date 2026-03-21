ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Users can view public or own profiles"
ON public.profiles
FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

ALTER TABLE public.activity_feed
ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "Anyone can view activity feed" ON public.activity_feed;
CREATE POLICY "Users can view public or own activity feed"
ON public.activity_feed
FOR SELECT
USING (is_public = true OR auth.uid() = user_id);
