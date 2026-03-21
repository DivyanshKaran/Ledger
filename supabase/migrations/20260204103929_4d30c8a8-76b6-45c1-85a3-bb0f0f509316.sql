-- Create cooking_history table to track when users view/cook recipes
CREATE TABLE public.cooking_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipe_id TEXT NOT NULL,
  recipe_title TEXT NOT NULL,
  cooked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5)
);

-- Enable RLS
ALTER TABLE public.cooking_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own cooking history"
ON public.cooking_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their cooking history"
ON public.cooking_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their cooking history"
ON public.cooking_history
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their cooking history"
ON public.cooking_history
FOR DELETE
USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_cooking_history_user_id ON public.cooking_history(user_id);
CREATE INDEX idx_cooking_history_cooked_at ON public.cooking_history(cooked_at DESC);