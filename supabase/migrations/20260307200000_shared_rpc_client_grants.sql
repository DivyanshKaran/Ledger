REVOKE ALL ON FUNCTION public.get_shared_recipe_by_code(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_shared_recipe_by_code(text) TO service_role;

REVOKE ALL ON FUNCTION public.increment_share_view_count(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_share_view_count(text) TO service_role;
