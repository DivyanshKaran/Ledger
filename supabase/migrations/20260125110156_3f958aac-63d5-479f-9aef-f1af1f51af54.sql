-- Fix overly permissive UPDATE policy on shared_recipes
DROP POLICY "Anyone can increment view count" ON public.shared_recipes;

-- Create a more restrictive update policy - only allow owner to update
CREATE POLICY "Owners can update their shared recipes" ON public.shared_recipes 
  FOR UPDATE USING (auth.uid() = shared_by);

-- Create a function to increment view count securely (allows anonymous increment)
CREATE OR REPLACE FUNCTION public.increment_share_view_count(p_share_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.shared_recipes 
  SET view_count = view_count + 1 
  WHERE share_code = p_share_code;
END;
$$;