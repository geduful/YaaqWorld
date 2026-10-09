-- ============================================================
-- PHASE 5 SECURITY PATCH — PRIVILEGE ESCALATION + INPUT GUARDS
-- Run in Supabase SQL Editor, then NOTIFY pgrst, 'reload schema';
-- Idempotent: safe to re-run. No destructive changes.
-- ============================================================

-- ------------------------------------------------------------
-- 1. CRITICAL FIX: Block super_admin/admin escalation via signup
--    metadata. Client-controlled raw_user_meta_data->>'role' was
--    trusted verbatim, letting anyone mint super_admin at signup.
--    Now only 'member' and 'creator' (the two self-service roles)
--    are honored; anything else falls back to 'member'. Admin and
--    super_admin profiles are created only by trusted backend
--    paths (service role / admin dashboard grants), never from
--    client metadata.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  meta_role TEXT;
  meta_institution TEXT;
BEGIN
  meta_role := NULLIF(NEW.raw_user_meta_data->>'role', '');
  meta_institution := NULLIF(NEW.raw_user_meta_data->>'institution_id', '');

  INSERT INTO public.profiles (id, full_name, role, whatsapp, institution_id, level)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), ''),
    COALESCE(
      CASE
        WHEN meta_role IN ('member', 'creator')
          THEN meta_role::public.user_role
      END,
      'member'
    ),
    NULLIF(NEW.raw_user_meta_data->>'whatsapp', ''),
    CASE
      WHEN meta_institution ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
        THEN meta_institution::uuid
    END,
    NULLIF(NEW.raw_user_meta_data->>'level', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ------------------------------------------------------------
-- 2. Defense in depth: BEFORE INSERT trigger on profiles that
--    coerces role to 'member' when the insert comes directly
--    from an untrusted API role (authenticated/anon). Only
--    postgres/service_role (backend, SECURITY DEFINER triggers)
--    can set admin/super_admin on insert. The registration
--    client flow is unaffected: handle_new_user runs as postgres
--    and already restricts to member/creator.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_profile_role_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    IF NEW.role NOT IN ('member', 'creator') THEN
      NEW.role := 'member';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_profile_role_insert ON public.profiles;
CREATE TRIGGER enforce_profile_role_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_role_insert();

-- ------------------------------------------------------------
-- 3. URL guards: stored links must be http(s) only. Blocks
--    javascript:, data:, vbscript: and other XSS vectors from
--    being stored and later rendered as href values.
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'creators_portfolio_url_http_check'
      AND conrelid = 'public.creators'::regclass
  ) THEN
    ALTER TABLE public.creators
      ADD CONSTRAINT creators_portfolio_url_http_check
      CHECK (portfolio_url IS NULL OR portfolio_url ~* '^https?://');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'creators_additional_portfolio_url_http_check'
      AND conrelid = 'public.creators'::regclass
  ) THEN
    ALTER TABLE public.creators
      ADD CONSTRAINT creators_additional_portfolio_url_http_check
      CHECK (additional_portfolio_url IS NULL OR additional_portfolio_url ~* '^https?://');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'opportunities_apply_url_http_check'
      AND conrelid = 'public.opportunities'::regclass
  ) THEN
    ALTER TABLE public.opportunities
      ADD CONSTRAINT opportunities_apply_url_http_check
      CHECK (apply_url IS NULL OR apply_url ~* '^https?://');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'opportunity_applications_portfolio_url_http_check'
      AND conrelid = 'public.opportunity_applications'::regclass
  ) THEN
    ALTER TABLE public.opportunity_applications
      ADD CONSTRAINT opportunity_applications_portfolio_url_http_check
      CHECK (portfolio_url IS NULL OR portfolio_url ~* '^https?://');
  END IF;
END $$;

-- ------------------------------------------------------------
-- 4. Reload PostgREST schema cache so new constraints/trigger
--    take effect immediately.
-- ------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
