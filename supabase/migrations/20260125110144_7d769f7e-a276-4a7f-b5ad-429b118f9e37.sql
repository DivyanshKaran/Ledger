-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_favorites table
CREATE TABLE public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Create custom_recipes table
CREATE TABLE public.custom_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cuisine TEXT NOT NULL DEFAULT 'Custom',
  servings INTEGER NOT NULL DEFAULT 4,
  image_url TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]',
  steps JSONB NOT NULL DEFAULT '[]',
  nutrition JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shared_recipes table for public sharing
CREATE TABLE public.shared_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_code TEXT NOT NULL UNIQUE,
  recipe_id UUID REFERENCES public.custom_recipes(id) ON DELETE CASCADE,
  preset_recipe_id TEXT,
  shared_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_ingredient_prices for custom pricing
CREATE TABLE public.user_ingredient_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  price_per_unit DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, ingredient_name)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ingredient_prices ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- User favorites policies
CREATE POLICY "Users can view their own favorites" ON public.user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their favorites" ON public.user_favorites FOR DELETE USING (auth.uid() = user_id);

-- Custom recipes policies
CREATE POLICY "Users can view their own recipes" ON public.custom_recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create recipes" ON public.custom_recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their recipes" ON public.custom_recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their recipes" ON public.custom_recipes FOR DELETE USING (auth.uid() = user_id);

-- Shared recipes policies (public read for shared links)
CREATE POLICY "Anyone can view shared recipes" ON public.shared_recipes FOR SELECT USING (true);
CREATE POLICY "Users can share their recipes" ON public.shared_recipes FOR INSERT WITH CHECK (auth.uid() = shared_by);
CREATE POLICY "Users can delete their shared links" ON public.shared_recipes FOR DELETE USING (auth.uid() = shared_by);
CREATE POLICY "Anyone can increment view count" ON public.shared_recipes FOR UPDATE USING (true);

-- User ingredient prices policies
CREATE POLICY "Users can view their prices" ON public.user_ingredient_prices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add prices" ON public.user_ingredient_prices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their prices" ON public.user_ingredient_prices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their prices" ON public.user_ingredient_prices FOR DELETE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_custom_recipes_updated_at BEFORE UPDATE ON public.custom_recipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_ingredient_prices_updated_at BEFORE UPDATE ON public.user_ingredient_prices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create index for share codes
CREATE INDEX idx_shared_recipes_share_code ON public.shared_recipes(share_code);
CREATE INDEX idx_custom_recipes_user_id ON public.custom_recipes(user_id);
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);