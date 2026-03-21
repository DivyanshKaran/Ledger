
-- Recipe Collections table
CREATE TABLE public.recipe_collections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  is_public boolean NOT NULL DEFAULT false,
  cover_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recipe_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own or public collections" ON public.recipe_collections
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own collections" ON public.recipe_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" ON public.recipe_collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" ON public.recipe_collections
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_recipe_collections_updated_at
  BEFORE UPDATE ON public.recipe_collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Collection Recipes junction table
CREATE TABLE public.collection_recipes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id uuid NOT NULL REFERENCES public.recipe_collections(id) ON DELETE CASCADE,
  recipe_id text NOT NULL,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(collection_id, recipe_id)
);

ALTER TABLE public.collection_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collection recipes for accessible collections" ON public.collection_recipes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recipe_collections rc
      WHERE rc.id = collection_id AND (rc.is_public = true OR rc.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can add recipes to own collections" ON public.collection_recipes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recipe_collections rc
      WHERE rc.id = collection_id AND rc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove recipes from own collections" ON public.collection_recipes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.recipe_collections rc
      WHERE rc.id = collection_id AND rc.user_id = auth.uid()
    )
  );

-- Activity Feed table
CREATE TABLE public.activity_feed (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  target_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view activity feed" ON public.activity_feed
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own activity" ON public.activity_feed
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity" ON public.activity_feed
  FOR DELETE USING (auth.uid() = user_id);

-- Add dietary_tags to preset_recipes and custom_recipes
ALTER TABLE public.preset_recipes ADD COLUMN IF NOT EXISTS dietary_tags text[] DEFAULT '{}'::text[];
ALTER TABLE public.custom_recipes ADD COLUMN IF NOT EXISTS dietary_tags text[] DEFAULT '{}'::text[];

-- Add indexes for performance
CREATE INDEX idx_collection_recipes_collection_id ON public.collection_recipes(collection_id);
CREATE INDEX idx_collection_recipes_recipe_id ON public.collection_recipes(recipe_id);
CREATE INDEX idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX idx_activity_feed_created_at ON public.activity_feed(created_at DESC);
CREATE INDEX idx_recipe_collections_user_id ON public.recipe_collections(user_id);
