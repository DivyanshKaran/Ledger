-- Create preset_recipes table for admin-managed recipes
CREATE TABLE public.preset_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cuisine TEXT NOT NULL DEFAULT 'International',
  category TEXT NOT NULL DEFAULT 'Main Course',
  difficulty TEXT NOT NULL DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  servings INTEGER NOT NULL DEFAULT 4,
  prep_time INTEGER NOT NULL DEFAULT 15,
  cook_time INTEGER NOT NULL DEFAULT 30,
  image_url TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  nutrition JSONB,
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on preset_recipes
ALTER TABLE public.preset_recipes ENABLE ROW LEVEL SECURITY;

-- Anyone can view preset recipes
CREATE POLICY "Anyone can view preset recipes"
ON public.preset_recipes
FOR SELECT
USING (true);

-- Create user_follows table for following authors
CREATE TABLE public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS on user_follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Users can view all follows (for follower counts)
CREATE POLICY "Anyone can view follows"
ON public.user_follows
FOR SELECT
USING (true);

-- Users can follow others
CREATE POLICY "Users can follow others"
ON public.user_follows
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow"
ON public.user_follows
FOR DELETE
USING (auth.uid() = follower_id);

-- Update profiles table to add author fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Allow anyone to view profiles (for author pages)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Anyone can view profiles"
ON public.profiles
FOR SELECT
USING (true);

-- Update custom_recipes to add visibility
ALTER TABLE public.custom_recipes 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Allow viewing public custom recipes
DROP POLICY IF EXISTS "Users can view their own recipes" ON public.custom_recipes;
CREATE POLICY "Users can view public or own recipes"
ON public.custom_recipes
FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

-- Create trigger for preset_recipes updated_at
CREATE TRIGGER update_preset_recipes_updated_at
BEFORE UPDATE ON public.preset_recipes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();