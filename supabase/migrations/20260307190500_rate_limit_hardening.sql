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
  v_key text := trim(p_key);
BEGIN
  IF v_key IS NULL OR length(v_key) = 0 THEN
    RAISE EXCEPTION 'p_key is required';
  END IF;

  IF length(v_key) > 128 THEN
    RAISE EXCEPTION 'p_key must be <= 128 characters';
  END IF;

  IF p_limit IS NULL OR p_limit < 1 THEN
    RAISE EXCEPTION 'p_limit must be >= 1';
  END IF;

  IF p_window_ms IS NULL OR p_window_ms < 1000 THEN
    RAISE EXCEPTION 'p_window_ms must be >= 1000';
  END IF;

  v_window := make_interval(secs => p_window_ms::numeric / 1000);

  INSERT INTO public.api_rate_limits AS r (key, window_start, request_count, updated_at)
  VALUES (v_key, v_now, 1, v_now)
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

CREATE OR REPLACE FUNCTION public.cleanup_api_rate_limits(p_ttl interval DEFAULT interval '1 day')
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer;
BEGIN
  DELETE FROM public.api_rate_limits
  WHERE updated_at < now() - p_ttl;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_api_rate_limits(interval) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_api_rate_limits(interval) TO service_role;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname = 'cleanup_api_rate_limits_job';

    PERFORM cron.schedule(
      'cleanup_api_rate_limits_job',
      '*/30 * * * *',
      'SELECT public.cleanup_api_rate_limits(interval ''1 day'');'
    );
  END IF;
EXCEPTION
  WHEN undefined_table OR undefined_function THEN
    NULL;
END
$$;
