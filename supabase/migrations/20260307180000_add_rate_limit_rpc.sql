CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.api_rate_limits FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.api_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_key text, p_limit integer, p_window_ms integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
  v_window interval;
  v_window_start timestamptz;
  v_request_count integer;
  v_allowed boolean;
  v_retry_after integer;
BEGIN
  IF p_key IS NULL OR length(trim(p_key)) = 0 THEN
    RAISE EXCEPTION 'p_key is required';
  END IF;

  IF p_limit IS NULL OR p_limit < 1 THEN
    RAISE EXCEPTION 'p_limit must be >= 1';
  END IF;

  IF p_window_ms IS NULL OR p_window_ms < 1000 THEN
    RAISE EXCEPTION 'p_window_ms must be >= 1000';
  END IF;

  v_window := make_interval(secs => p_window_ms::numeric / 1000);

  INSERT INTO public.api_rate_limits AS r (key, window_start, request_count, updated_at)
  VALUES (p_key, v_now, 1, v_now)
  ON CONFLICT (key) DO UPDATE
  SET
    window_start = CASE
      WHEN EXCLUDED.updated_at - r.window_start >= v_window THEN EXCLUDED.updated_at
      ELSE r.window_start
    END,
    request_count = CASE
      WHEN EXCLUDED.updated_at - r.window_start >= v_window THEN 1
      ELSE r.request_count + 1
    END,
    updated_at = EXCLUDED.updated_at
  RETURNING window_start, request_count INTO v_window_start, v_request_count;

  v_allowed := v_request_count <= p_limit;

  IF v_allowed THEN
    v_retry_after := 0;
  ELSE
    v_retry_after := GREATEST(
      0,
      CEIL(EXTRACT(EPOCH FROM ((v_window_start + v_window) - v_now)))::integer
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'remaining', GREATEST(0, p_limit - v_request_count),
    'retry_after_seconds', v_retry_after
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) TO service_role;

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_updated_at ON public.api_rate_limits(updated_at);
