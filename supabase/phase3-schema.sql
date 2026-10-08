-- ============================================================
-- YAAQ World Phase 3: Admin CMS + Super Admin Control Center
-- ============================================================
-- Run this in the Supabase SQL Editor AFTER phase2-schema.sql.
--
-- Design summary:
--   * Super Admin (profiles.role = 'super_admin') has unrestricted
--     access and is the ONLY actor who may manage administrators.
--   * Admins (profiles.role = 'admin') are backed by an
--     administrators row with status + granular permission grants.
--   * Effective permissions = permission grants issued by the
--     Super Admin. admin_roles / admin_role_permissions are the
--     reusable presets pre-filled when inviting an official.
--   * All sensitive mutations run through SECURITY DEFINER
--     functions (RPCs) that authorize server-side and write audit
--     logs. Direct client writes are denied for those tables.
--   * No service-role key is used anywhere.
-- ============================================================

-- pgcrypto: digest() for invitation tokens, gen_random_bytes() for tokens
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE admin_status AS ENUM ('invited', 'active', 'suspended', 'revoked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE announcement_audience AS ENUM ('all', 'members', 'creators', 'selected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE announcement_status AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 2. TABLES
-- ============================================================

-- Permission catalog (seeded; source key list mirrored in
-- src/lib/permissions.ts â€” keep in sync)
CREATE TABLE IF NOT EXISTS admin_permissions (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Named roles = assignment presets (super_admin is the built-in
-- unrestricted level and is never assigned through invitations)
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Default permission presets per role
CREATE TABLE IF NOT EXISTS admin_role_permissions (
  role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL REFERENCES admin_permissions(key) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (role_id, permission_key)
);

-- One row per official (invited or active administrator)
CREATE TABLE IF NOT EXISTS administrators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  role_id UUID NOT NULL REFERENCES admin_roles(id),
  previous_role user_role,
  status admin_status NOT NULL DEFAULT 'invited',
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_administrators_status ON administrators (status);
CREATE INDEX IF NOT EXISTS idx_administrators_profile ON administrators (profile_id);
CREATE INDEX IF NOT EXISTS idx_administrators_role ON administrators (role_id);

-- Granular permission grants (effective permissions = these grants;
-- Super Admin bypasses them entirely)
CREATE TABLE IF NOT EXISTS admin_permission_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  administrator_id UUID NOT NULL REFERENCES administrators(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL REFERENCES admin_permissions(key) ON DELETE CASCADE,
  granted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (administrator_id, permission_key)
);

CREATE INDEX IF NOT EXISTS idx_admin_grants_admin ON admin_permission_grants (administrator_id);

-- Invitations (token is generated server-side; only its SHA-256 hash
-- is stored. The plaintext token is returned once to the Super Admin)
CREATE TABLE IF NOT EXISTS admin_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  display_name TEXT,
  role_id UUID NOT NULL REFERENCES admin_roles(id),
  permission_keys TEXT[] NOT NULL DEFAULT '{}',
  token_hash BYTEA NOT NULL UNIQUE,
  status invitation_status NOT NULL DEFAULT 'pending',
  administrator_id UUID NOT NULL REFERENCES administrators(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invitations_email_status ON admin_invitations (email, status);
CREATE INDEX IF NOT EXISTS idx_invitations_expiry ON admin_invitations (expires_at) WHERE status = 'pending';

-- Immutable audit trail (client can never insert/update/delete)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_label TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor_user_id);

-- Official team directory (public site can be wired to this later)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN ('executive', 'editorial', 'creative', 'digital', 'operations')),
  bio TEXT,
  image_url TEXT,
  moniker TEXT,
  instagram TEXT,
  linkedin TEXT,
  tiktok TEXT,
  email TEXT,
  profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL,
  display_order INT NOT NULL DEFAULT 0,
  on_board BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_department ON team_members (department, display_order);
CREATE INDEX IF NOT EXISTS idx_team_active ON team_members (is_active);
CREATE INDEX IF NOT EXISTS idx_team_members_profile ON team_members (profile_id);

-- Services catalogue (pricing optional â€” NULL means inquiry-based)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  short_description TEXT,
  category TEXT NOT NULL DEFAULT 'core' CHECK (category IN ('core', 'partnership', 'consulting', 'content')),
  icon TEXT,
  image_url TEXT,
  features TEXT[] NOT NULL DEFAULT '{}',
  cta_text TEXT NOT NULL DEFAULT 'Get Started',
  pricing_note TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_services_active ON services (is_active, display_order);

-- Admin announcements (drafts via direct write; publishing fans out
-- to notifications through publish_announcement())
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  audience announcement_audience NOT NULL DEFAULT 'all',
  recipient_ids UUID[] NOT NULL DEFAULT '{}',
  status announcement_status NOT NULL DEFAULT 'draft',
  type notification_type NOT NULL DEFAULT 'announcement',
  action_url TEXT,
  recipient_count INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements (status, created_at DESC);

-- Platform settings (key/value). Banner keys are publicly readable
-- so the public site can render the optional announcement banner.
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. HELPER FUNCTIONS
-- ============================================================

-- Slug generator for services
CREATE OR REPLACE FUNCTION public.slugify(input TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(both '-' from regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '-', 'g'));
$$;

-- Super Admin check used by triggers and RPCs.
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_role user_role;
BEGIN
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;
  SELECT role INTO v_role FROM profiles WHERE id = v_uid;
  RETURN v_role = 'super_admin';
END;
$$;

-- Authoritative permission check used by RLS and server helpers.
-- SECURITY DEFINER: reads admin tables without policy recursion.
-- Effective permissions = grants issued to the active administrator.
-- Super Admin always returns true.
CREATE OR REPLACE FUNCTION public.has_admin_permission(perm_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_role user_role;
  v_admin_id UUID;
BEGIN
  IF v_uid IS NULL OR perm_key IS NULL THEN
    RETURN false;
  END IF;

  SELECT role INTO v_role FROM profiles WHERE id = v_uid;
  IF v_role = 'super_admin' THEN
    RETURN true;
  END IF;
  IF v_role <> 'admin' THEN
    RETURN false;
  END IF;

  SELECT id INTO v_admin_id FROM administrators
  WHERE profile_id = v_uid AND status = 'active';
  IF v_admin_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM admin_permission_grants g
    WHERE g.administrator_id = v_admin_id
      AND g.permission_key = perm_key
  );
END;
$$;

-- Read access to a specific administrator row: holders of
-- administrators.view, or the administrator themselves.
CREATE OR REPLACE FUNCTION public.can_view_administrator(p_admin_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  IF p_admin_id IS NULL THEN
    RETURN false;
  END IF;
  IF public.has_admin_permission('administrators.view') THEN
    RETURN true;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM administrators
    WHERE id = p_admin_id AND profile_id = auth.uid()
  );
END;
$$;

-- ============================================================
-- 4. SECURITY TRIGGERS ON PROFILES
-- ============================================================

-- Blocks privilege escalation and unauthorized account changes.
CREATE OR REPLACE FUNCTION public.enforce_profile_security()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  -- SQL editor / migrations / service role: allow (not a browser actor)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- 1. Role changes: Super Admin only, never self-service
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF COALESCE(current_setting('yaaq.allow_self_role_change', true), 'off') = 'on' THEN
      NULL; -- controlled system flow (invitation acceptance)
    ELSIF auth.uid() = OLD.id THEN
      RAISE EXCEPTION 'You cannot change your own role.' USING ERRCODE = '42501';
    ELSIF NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'Only Super Admin can change roles.' USING ERRCODE = '42501';
    END IF;
  END IF;

  -- 2. Super Admin accounts are only editable by Super Admin
  IF OLD.role = 'super_admin' AND auth.uid() <> OLD.id AND NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'This account can only be modified by Super Admin.' USING ERRCODE = '42501';
  END IF;

  -- 3. Active administrators are managed through the control center
  IF auth.uid() <> OLD.id
     AND NOT public.is_super_admin()
     AND EXISTS (
       SELECT 1 FROM administrators a
       WHERE a.profile_id = OLD.id AND a.status = 'active'
     ) THEN
    RAISE EXCEPTION 'Administrator accounts are managed in the Administrator Control Center.' USING ERRCODE = '42501';
  END IF;

  -- 4. Account status changes require member/creator management permission
  IF NEW.is_active IS DISTINCT FROM OLD.is_active
     AND auth.uid() <> OLD.id
     AND NOT public.has_admin_permission('members.manage')
     AND NOT public.has_admin_permission('creators.manage') THEN
    RAISE EXCEPTION 'You do not have permission to change account status.' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_profile_security ON profiles;
CREATE TRIGGER enforce_profile_security
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_security();

-- Audit sensitive profile changes (role + status)
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    INSERT INTO audit_logs (actor_user_id, actor_label, action, entity_type, entity_id, metadata)
    VALUES (
      auth.uid(),
      auth.jwt() ->> 'email',
      'profile_role_changed',
      'profiles',
      NEW.id::text,
      jsonb_build_object('from', OLD.role, 'to', NEW.role)
    );
  END IF;

  IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    INSERT INTO audit_logs (actor_user_id, actor_label, action, entity_type, entity_id, metadata)
    VALUES (
      auth.uid(),
      auth.jwt() ->> 'email',
      CASE WHEN NEW.role = 'creator' THEN 'creator_status_changed' ELSE 'member_status_changed' END,
      'profiles',
      NEW.id::text,
      jsonb_build_object('is_active', NEW.is_active, 'role', NEW.role)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_profile_changes ON profiles;
CREATE TRIGGER log_profile_changes
  AFTER UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_profile_changes();

-- ============================================================
-- 5. AUDIT TRIGGER FOR DIRECT-WRITE MANAGED TABLES
-- ============================================================

CREATE OR REPLACE FUNCTION public.audit_managed_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_action TEXT;
  v_entity_id TEXT;
  v_meta JSONB := '{}'::jsonb;
BEGIN
  v_action := CASE TG_OP
    WHEN 'INSERT' THEN 'created'
    WHEN 'UPDATE' THEN 'updated'
    ELSE 'deleted'
  END;

  IF TG_OP = 'UPDATE' AND NEW.* IS NOT DISTINCT FROM OLD.* THEN
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'platform_settings' THEN
    v_entity_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.key ELSE NEW.key END;
    v_meta := jsonb_build_object('key', v_entity_id);
  ELSIF TG_TABLE_NAME = 'team_members' THEN
    v_entity_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.id::text ELSE NEW.id::text END;
    v_meta := jsonb_build_object(
      'name', CASE WHEN TG_OP = 'DELETE' THEN OLD.full_name ELSE NEW.full_name END
    );
  ELSIF TG_TABLE_NAME = 'services' THEN
    v_entity_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.id::text ELSE NEW.id::text END;
    v_meta := jsonb_build_object(
      'title', CASE WHEN TG_OP = 'DELETE' THEN OLD.title ELSE NEW.title END
    );
  ELSIF TG_TABLE_NAME = 'announcements' THEN
    v_entity_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.id::text ELSE NEW.id::text END;
    v_meta := jsonb_build_object(
      'title', CASE WHEN TG_OP = 'DELETE' THEN OLD.title ELSE NEW.title END,
      'status', CASE WHEN TG_OP = 'DELETE' THEN OLD.status::text ELSE NEW.status::text END
    );
  ELSE
    v_entity_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.id::text ELSE NEW.id::text END;
  END IF;

  INSERT INTO audit_logs (actor_user_id, actor_label, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    auth.jwt() ->> 'email',
    TG_ARGV[0] || '_' || v_action,
    TG_TABLE_NAME,
    v_entity_id,
    v_meta
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_team_members ON team_members;
CREATE TRIGGER audit_team_members
  AFTER INSERT OR UPDATE OR DELETE ON team_members
  FOR EACH ROW EXECUTE FUNCTION public.audit_managed_changes('team_member');

DROP TRIGGER IF EXISTS audit_services ON services;
CREATE TRIGGER audit_services
  AFTER INSERT OR UPDATE OR DELETE ON services
  FOR EACH ROW EXECUTE FUNCTION public.audit_managed_changes('service');

DROP TRIGGER IF EXISTS audit_announcements ON announcements;
CREATE TRIGGER audit_announcements
  AFTER INSERT OR UPDATE OR DELETE ON announcements
  FOR EACH ROW EXECUTE FUNCTION public.audit_managed_changes('announcement');

DROP TRIGGER IF EXISTS audit_platform_settings ON platform_settings;
CREATE TRIGGER audit_platform_settings
  AFTER INSERT OR UPDATE OR DELETE ON platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.audit_managed_changes('setting');

-- Auto-generate service slugs
CREATE OR REPLACE FUNCTION public.set_service_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR length(trim(NEW.slug)) = 0 THEN
    NEW.slug := public.slugify(NEW.title);
  ELSE
    NEW.slug := public.slugify(NEW.slug);
  END IF;
  IF NEW.slug IS NULL OR length(NEW.slug) = 0 THEN
    NEW.slug := 'service-' || substr(md5(random()::text), 1, 8);
  END IF;
  IF EXISTS (SELECT 1 FROM services s WHERE s.slug = NEW.slug AND s.id <> NEW.id) THEN
    NEW.slug := NEW.slug || '-' || substr(md5(random()::text), 1, 6);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_service_slug ON services;
CREATE TRIGGER set_service_slug
  BEFORE INSERT OR UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION public.set_service_slug();

-- updated_at maintenance (reuses Phase 2 update_updated_at function)
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['administrators','admin_invitations','team_members','services','announcements','platform_settings','admin_roles']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at()', t);
  END LOOP;
END $$;

-- ============================================================
-- 6. ADMINISTRATION RPCs (SECURITY DEFINER, server-authorized)
-- ============================================================

-- 6.1 Create an invitation (Super Admin only)
CREATE OR REPLACE FUNCTION public.create_admin_invitation(
  p_email TEXT,
  p_display_name TEXT,
  p_role_key TEXT,
  p_permission_keys TEXT[]
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_role_id UUID;
  v_admin_id UUID;
  v_inv_id UUID;
  v_token TEXT;
  v_email TEXT := lower(trim(coalesce(p_email, '')));
  v_keys TEXT[] := coalesce(p_permission_keys, '{}');
  v_existing administrators%ROWTYPE;
  v_key TEXT;
BEGIN
  IF v_uid IS NULL OR NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only Super Admin can manage administrators.' USING ERRCODE = '42501';
  END IF;

  IF v_email = '' OR position('@' in v_email) < 2 OR position('.' in substring(v_email from position('@' in v_email))) < 1 THEN
    RAISE EXCEPTION 'Enter a valid email address.' USING ERRCODE = '22023';
  END IF;

  SELECT id INTO v_role_id FROM admin_roles WHERE key = p_role_key;
  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Select a valid administrator role.' USING ERRCODE = '22023';
  END IF;
  IF p_role_key = 'super_admin' THEN
    RAISE EXCEPTION 'Super Admin access is never granted through invitations.' USING ERRCODE = '42501';
  END IF;

  FOREACH v_key IN ARRAY v_keys LOOP
    IF NOT EXISTS (SELECT 1 FROM admin_permissions ap WHERE ap.key = v_key) THEN
      RAISE EXCEPTION 'Unknown permission: %', v_key USING ERRCODE = '22023';
    END IF;
    IF v_key = 'administrators.manage' THEN
      RAISE EXCEPTION 'Administrator management is restricted to Super Admin.' USING ERRCODE = '42501';
    END IF;
  END LOOP;

  SELECT * INTO v_existing FROM administrators WHERE email = v_email;

  IF v_existing.id IS NOT NULL AND v_existing.status = 'active' THEN
    RAISE EXCEPTION 'This person is already an active administrator.' USING ERRCODE = '23505';
  END IF;

  IF EXISTS (
    SELECT 1 FROM admin_invitations i
    WHERE i.email = v_email AND i.status = 'pending' AND i.expires_at > now()
  ) THEN
    RAISE EXCEPTION 'A pending invitation already exists for this email.' USING ERRCODE = '23505';
  END IF;

  v_token := encode(gen_random_bytes(32), 'hex');

  IF v_existing.id IS NOT NULL THEN
    v_admin_id := v_existing.id;
    UPDATE administrators SET
      display_name = coalesce(nullif(trim(coalesce(p_display_name, '')), ''), display_name),
      role_id = v_role_id,
      status = 'invited',
      invited_at = now(),
      invited_by = v_uid,
      accepted_at = NULL,
      suspended_at = NULL,
      revoked_at = NULL,
      updated_at = now()
    WHERE id = v_admin_id;
  ELSE
    INSERT INTO administrators (email, display_name, role_id, status, invited_by)
    VALUES (v_email, nullif(trim(coalesce(p_display_name, '')), ''), v_role_id, 'invited', v_uid)
    RETURNING id INTO v_admin_id;
  END IF;

  DELETE FROM admin_permission_grants WHERE administrator_id = v_admin_id;
  INSERT INTO admin_permission_grants (administrator_id, permission_key, granted_by)
  SELECT v_admin_id, k, v_uid FROM unnest(v_keys) AS k;

  INSERT INTO admin_invitations (
    email, display_name, role_id, permission_keys, token_hash,
    administrator_id, invited_by, expires_at
  ) VALUES (
    v_email, nullif(trim(coalesce(p_display_name, '')), ''), v_role_id, v_keys,
    digest(v_token, 'sha256'), v_admin_id, v_uid, now() + interval '7 days'
  )
  RETURNING id INTO v_inv_id;

  INSERT INTO audit_logs (actor_user_id, actor_label, action, entity_type, entity_id, metadata)
  VALUES (
    v_uid, auth.jwt() ->> 'email', 'admin_invited', 'administrators', v_admin_id::text,
    jsonb_build_object('email', v_email, 'role', p_role_key, 'permissions', coalesce(array_length(v_keys, 1), 0))
  );

  RETURN jsonb_build_object(
    'invitation_id', v_inv_id,
    'administrator_id', v_admin_id,
    'token', v_token,
    'expires_in_days', 7
  );
END;
$$;

-- 6.2 Accept an invitation (invited person, signed in with matching email)
CREATE OR REPLACE FUNCTION public.accept_admin_invitation(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_email TEXT := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_inv admin_invitations%ROWTYPE;
  v_prev user_role;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Sign in first, then accept the invitation.' USING ERRCODE = '42501';
  END IF;
  IF v_email = '' THEN
    RAISE EXCEPTION 'Your account has no email address, so this invitation cannot be accepted.' USING ERRCODE = '42501';
  END IF;
  IF p_token IS NULL OR length(p_token) < 32 THEN
    RAISE EXCEPTION 'This invitation link is not valid.' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_inv FROM admin_invitations
  WHERE token_hash = digest(p_token, 'sha256') AND status = 'pending';

  IF v_inv.id IS NULL THEN
    RAISE EXCEPTION 'This invitation was not found. It may have been revoked or already used.' USING ERRCODE = '22023';
  END IF;
  IF v_inv.expires_at < now() THEN
    RAISE EXCEPTION 'This invitation has expired. Ask Super Admin to send a new one.' USING ERRCODE = '22023';
  END IF;
  IF v_inv.email <> v_email THEN
    RAISE EXCEPTION 'This invitation was sent to a different email address. Sign in with the invited account.' USING ERRCODE = '42501';
  END IF;

  SELECT role INTO v_prev FROM profiles WHERE id = v_uid;

  -- Allow this controlled self role change inside the trigger
  PERFORM set_config('yaaq.allow_self_role_change', 'on', true);

  UPDATE administrators SET
    profile_id = v_uid,
    status = 'active',
    accepted_at = now(),
    last_activity_at = now(),
    previous_role = CASE WHEN v_prev IN ('member', 'creator') THEN v_prev ELSE 'member' END,
    updated_at = now()
  WHERE id = v_inv.administrator_id;

  UPDATE profiles SET role = 'admin', updated_at = now()
  WHERE id = v_uid AND role <> 'super_admin';

  UPDATE admin_invitations SET
    status = 'accepted',
    accepted_at = now(),
    updated_at = now()
  WHERE id = v_inv.id;

  INSERT INTO audit_logs (actor_user_id, actor_label, action, entity_type, entity_id, metadata)
  VALUES (
    v_uid, v_email, 'admin_activated', 'administrators', v_inv.administrator_id::text,
    jsonb_build_object('email', v_email, 'via', 'invitation')
  );

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- 6.3 Replace an administrator's permission grants (Super Admin only)
CREATE OR REPLACE FUNCTION public.update_admin_permissions(
  p_admin_id UUID,
  p_permission_keys TEXT[]
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_keys TEXT[] := coalesce(p_permission_keys, '{}');
  v_old TEXT[];
  v_added TEXT[];
  v_removed TEXT[];
  v_key TEXT;
  v_email TEXT;
BEGIN
  IF v_uid IS NULL OR NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only Super Admin can manage administrators.' USING ERRCODE = '42501';
  END IF;

  SELECT email INTO v_email FROM administrators WHERE id = p_admin_id;
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Administrator not found.' USING ERRCODE = '22023';
  END IF;

  FOREACH v_key IN ARRAY v_keys LOOP
    IF NOT EXISTS (SELECT 1 FROM admin_permissions ap WHERE ap.key = v_key) THEN
      RAISE EXCEPTION 'Unknown permission: %', v_key USING ERRCODE = '22023';
    END IF;
    IF v_key = 'administrators.manage' THEN
      RAISE EXCEPTION 'Administrator management is restricted to Super Admin.' USING ERRCODE = '42501';
    END IF;
  END LOOP;

  SELECT coalesce(array_agg(g.permission_key), '{}') INTO v_old
  FROM admin_permission_grants g WHERE g.administrator_id = p_admin_id;

  SELECT coalesce(array_agg(k), '{}') INTO v_keys FROM (
    SELECT DISTINCT unnest(v_keys) AS k
  ) d;

  SELECT coalesce(array_agg(k), '{}') INTO v_added
  FROM (SELECT unnest(v_keys) AS k EXCEPT SELECT unnest(v_old)) a;
  SELECT coalesce(array_agg(k), '{}') INTO v_removed
  FROM (SELECT unnest(v_old) AS k EXCEPT SELECT unnest(v_keys)) r;

  IF v_added = '{}'::TEXT[] AND v_removed = '{}'::TEXT[] THEN
    RETURN jsonb_build_object('changed', false);
  END IF;

  DELETE FROM admin_permission_grants WHERE administrator_id = p_admin_id;
  INSERT INTO admin_permission_grants (administrator_id, permission_key, granted_by)
  SELECT p_admin_id, k, v_uid FROM unnest(v_keys) AS k;

  INSERT INTO audit_logs (actor_user_id, actor_label, action, entity_type, entity_id, metadata)
  VALUES (
    v_uid, auth.jwt() ->> 'email', 'admin_permissions_changed', 'administrators', p_admin_id::text,
    jsonb_build_object('email', v_email, 'added', to_jsonb(v_added), 'removed', to_jsonb(v_removed))
  );

  RETURN jsonb_build_object('changed', true, 'count', coalesce(array_length(v_keys, 1), 0));
END;
$$;

-- 6.4 Suspend / restore / revoke an administrator (Super Admin only)
CREATE OR REPLACE FUNCTION public.set_admin_status(
  p_admin_id UUID,
  p_status TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_admin administrators%ROWTYPE;
  v_action TEXT;
BEGIN
  IF v_uid IS NULL OR NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only Super Admin can manage administrators.' USING ERRCODE = '42501';
  END IF;
  IF p_status NOT IN ('active', 'suspended', 'revoked') THEN
    RAISE EXCEPTION 'Invalid administrator status.' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_admin FROM administrators WHERE id = p_admin_id FOR UPDATE;
  IF v_admin.id IS NULL THEN
    RAISE EXCEPTION 'Administrator not found.' USING ERRCODE = '22023';
  END IF;

  IF p_status = v_admin.status::text THEN
    RETURN jsonb_build_object('changed', false, 'status', v_admin.status);
  END IF;

  IF p_status = 'active' THEN
    IF v_admin.status NOT IN ('suspended', 'invited') THEN
      RAISE EXCEPTION 'This administrator cannot be activated from their current status.' USING ERRCODE = '22023';
    END IF;
    IF v_admin.profile_id IS NULL THEN
      RAISE EXCEPTION 'This invitation has not been accepted yet.' USING ERRCODE = '22023';
    END IF;
    UPDATE administrators SET status = 'active', suspended_at = NULL, last_activity_at = now(), updated_at = now()
    WHERE id = p_admin_id;
    v_action := CASE WHEN v_admin.status = 'suspended' THEN 'admin_restored' ELSE 'admin_activated' END;

  ELSIF p_status = 'suspended' THEN
    IF v_admin.status <> 'active' THEN
      RAISE EXCEPTION 'Only active administrators can be suspended.' USING ERRCODE = '22023';
    END IF;
    UPDATE administrators SET status = 'suspended', suspended_at = now(), last_activity_at = now(), updated_at = now()
    WHERE id = p_admin_id;
    v_action := 'admin_suspended';

  ELSE -- revoked
    IF v_admin.status NOT IN ('active', 'suspended', 'invited') THEN
      RAISE EXCEPTION 'This administrator is already revoked.' USING ERRCODE = '22023';
    END IF;

    UPDATE administrators SET
      status = 'revoked',
      revoked_at = now(),
      last_activity_at = now(),
      updated_at = now()
    WHERE id = p_admin_id;

    -- Revoke any pending invitation for this email
    UPDATE admin_invitations SET status = 'revoked', updated_at = now()
    WHERE email = v_admin.email AND status = 'pending';

    -- Restore the profile role they held before gaining admin access
    IF v_admin.profile_id IS NOT NULL THEN
      PERFORM set_config('yaaq.allow_self_role_change', 'on', true);
      UPDATE profiles SET
        role = coalesce(v_admin.previous_role, 'member'),
        updated_at = now()
      WHERE id = v_admin.profile_id AND role = 'admin';
    END IF;

    v_action := 'admin_access_revoked';
  END IF;

  INSERT INTO audit_logs (actor_user_id, actor_label, action, entity_type, entity_id, metadata)
  VALUES (
    v_uid, auth.jwt() ->> 'email', v_action, 'administrators', p_admin_id::text,
    jsonb_build_object('email', v_admin.email, 'status', p_status, 'previous_status', v_admin.status)
  );

  RETURN jsonb_build_object('changed', true, 'status', p_status);
END;
$$;

-- 6.5 Revoke a pending invitation (Super Admin only)
CREATE OR REPLACE FUNCTION public.revoke_admin_invitation(p_invitation_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_inv admin_invitations%ROWTYPE;
BEGIN
  IF v_uid IS NULL OR NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only Super Admin can manage administrators.' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_inv FROM admin_invitations WHERE id = p_invitation_id FOR UPDATE;
  IF v_inv.id IS NULL THEN
    RAISE EXCEPTION 'Invitation not found.' USING ERRCODE = '22023';
  END IF;
  IF v_inv.status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending invitations can be revoked.' USING ERRCODE = '22023';
  END IF;

  UPDATE admin_invitations SET status = 'revoked', updated_at = now()
  WHERE id = p_invitation_id;

  UPDATE administrators SET status = 'revoked', revoked_at = now(), updated_at = now()
  WHERE id = v_inv.administrator_id AND status = 'invited';

  INSERT INTO audit_logs (actor_user_id, actor_label, action, entity_type, entity_id, metadata)
  VALUES (
    v_uid, auth.jwt() ->> 'email', 'invitation_revoked', 'admin_invitations', p_invitation_id::text,
    jsonb_build_object('email', v_inv.email)
  );

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- 6.5A Search existing signed-in users by name or email so the
-- Super Admin can grant admin access directly (no invitation).
CREATE OR REPLACE FUNCTION public.search_admin_candidates(
  p_query TEXT,
  p_limit INT DEFAULT 10
) RETURNS TABLE (
  profile_id UUID,
  email TEXT,
  full_name TEXT,
  role user_role
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_query TEXT := trim(coalesce(p_query, ''));
  v_limit INT := LEAST(GREATEST(coalesce(p_limit, 10), 1), 25);
BEGIN
  IF v_uid IS NULL OR NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only Super Admin can manage administrators.' USING ERRCODE = '42501';
  END IF;
  IF length(v_query) < 2 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT u.id, u.email::text, p.full_name, p.role
  FROM auth.users u
  JOIN profiles p ON p.id = u.id
  WHERE (u.email ILIKE '%' || v_query || '%' OR coalesce(p.full_name, '') ILIKE '%' || v_query || '%')
    AND p.role NOT IN ('admin', 'super_admin')
    AND u.email_confirmed_at IS NOT NULL
    AND (u.banned_until IS NULL OR u.banned_until < now())
  ORDER BY u.email
  LIMIT v_limit;
END;
$$;

-- 6.5B List everyone who currently holds admin access. Driven by
-- profiles.role so Super Admin always appears and role-only admins
-- (granted outside the control center) can still be demoted here.
CREATE OR REPLACE FUNCTION public.list_administrators()
RETURNS TABLE (
  administrator_id UUID,
  admin_profile_id UUID,
  email TEXT,
  display_name TEXT,
  role_key TEXT,
  role_name TEXT,
  status TEXT,
  previous_role TEXT,
  permission_keys TEXT[],
  is_super BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL OR NOT public.has_admin_permission('administrators.view') THEN
    RAISE EXCEPTION 'You do not have permission to view administrators.' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    a.id,
    p.id,
    u.email::text,
    coalesce(a.display_name, p.full_name),
    coalesce(r.key, 'super_admin'),
    coalesce(r.name, 'Super Admin'),
    coalesce(a.status::text, 'active'),
    coalesce(a.previous_role::text, 'member'),
    coalesce(agg.keys, '{}'::text[]),
    (p.role = 'super_admin')
  FROM profiles p
  JOIN auth.users u ON u.id = p.id
  LEFT JOIN administrators a ON a.profile_id = p.id
  LEFT JOIN admin_roles r ON r.id = a.role_id
  LEFT JOIN LATERAL (
    SELECT array_agg(g.permission_key ORDER BY g.permission_key) AS keys
    FROM admin_permission_grants g
    WHERE g.administrator_id = a.id
  ) agg ON true
  WHERE p.role IN ('admin', 'super_admin')
  ORDER BY (p.role = 'super_admin') DESC, u.email;
END;
$$;

-- 6.5C Grant admin access directly to an existing user (Super Admin).
-- Creates/refreshes the administrators row, applies the role preset's
-- permission grants, and promotes profiles.role to 'admin'.
CREATE OR REPLACE FUNCTION public.grant_admin_access(
  p_profile_id UUID,
  p_role_key TEXT DEFAULT 'admin',
  p_permission_keys TEXT[] DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_profile profiles%ROWTYPE;
  v_existing administrators%ROWTYPE;
  v_role_id UUID;
  v_admin_id UUID;
  v_email TEXT;
  v_keys TEXT[];
  v_key TEXT;
BEGIN
  IF v_uid IS NULL OR NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only Super Admin can manage administrators.' USING ERRCODE = '42501';
  END IF;
  IF p_profile_id IS NULL THEN
    RAISE EXCEPTION 'Select a user to grant access to.' USING ERRCODE = '22023';
  END IF;
  IF coalesce(p_role_key, '') NOT IN ('admin', 'editor', 'viewer') THEN
    RAISE EXCEPTION 'Select a valid administrator role.' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_profile FROM profiles WHERE id = p_profile_id FOR UPDATE;
  IF v_profile.id IS NULL THEN
    RAISE EXCEPTION 'User not found.' USING ERRCODE = '22023';
  END IF;
  IF v_profile.role = 'super_admin' THEN
    RAISE EXCEPTION 'This account is already a Super Admin.' USING ERRCODE = '23505';
  END IF;

  SELECT u.email INTO v_email FROM auth.users u WHERE u.id = p_profile_id;
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'User not found.' USING ERRCODE = '22023';
  END IF;

  SELECT id INTO v_role_id FROM admin_roles WHERE key = p_role_key;
  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Select a valid administrator role.' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_existing FROM administrators WHERE profile_id = p_profile_id;
  IF v_existing.id IS NULL THEN
    SELECT * INTO v_existing FROM administrators WHERE email = lower(v_email);
  END IF;

  IF v_profile.role = 'admin' AND v_existing.id IS NOT NULL AND v_existing.status = 'active' THEN
    RAISE EXCEPTION 'This person is already an active administrator.' USING ERRCODE = '23505';
  END IF;

  -- Resolve permission keys: the role preset when none were supplied.
  IF p_permission_keys IS NULL THEN
    SELECT coalesce(array_agg(arp.permission_key ORDER BY ap.sort_order, arp.permission_key), '{}')
    INTO v_keys
    FROM admin_role_permissions arp
    JOIN admin_permissions ap ON ap.key = arp.permission_key
    WHERE arp.role_id = v_role_id;
  ELSE
    v_keys := coalesce(p_permission_keys, '{}');
  END IF;

  FOREACH v_key IN ARRAY v_keys LOOP
    IF NOT EXISTS (SELECT 1 FROM admin_permissions ap WHERE ap.key = v_key) THEN
      RAISE EXCEPTION 'Unknown permission: %', v_key USING ERRCODE = '22023';
    END IF;
  END LOOP;
  v_keys := array_remove(v_keys, 'administrators.manage');
  IF coalesce(array_length(v_keys, 1), 0) = 0 THEN
    RAISE EXCEPTION 'Select at least one permission.' USING ERRCODE = '22023';
  END IF;

  IF v_existing.id IS NOT NULL THEN
    UPDATE administrators SET
      profile_id = p_profile_id,
      email = lower(v_email),
      display_name = coalesce(v_profile.full_name, display_name),
      role_id = v_role_id,
      previous_role = CASE
        WHEN v_profile.role = 'admin' THEN coalesce(v_existing.previous_role, 'member')
        ELSE v_profile.role
      END,
      status = 'active',
      invited_by = v_uid,
      invited_at = now(),
      accepted_at = now(),
      suspended_at = NULL,
      revoked_at = NULL,
      last_activity_at = now(),
      updated_at = now()
    WHERE id = v_existing.id
    RETURNING id INTO v_admin_id;
  ELSE
    INSERT INTO administrators (
      profile_id, email, display_name, role_id, previous_role,
      status, invited_by, invited_at, accepted_at
    ) VALUES (
      p_profile_id, lower(v_email), v_profile.full_name, v_role_id,
      CASE WHEN v_profile.role = 'admin' THEN 'member' ELSE v_profile.role END,
      'active', v_uid, now(), now()
    )
    RETURNING id INTO v_admin_id;
  END IF;

  DELETE FROM admin_permission_grants WHERE administrator_id = v_admin_id;
  INSERT INTO admin_permission_grants (administrator_id, permission_key, granted_by)
  SELECT v_admin_id, k, v_uid FROM unnest(v_keys) AS k;

  IF v_profile.role <> 'admin' THEN
    PERFORM set_config('yaaq.allow_self_role_change', 'on', true);
    UPDATE profiles SET role = 'admin', updated_at = now() WHERE id = p_profile_id;
  END IF;

  INSERT INTO audit_logs (actor_user_id, actor_label, action, entity_type, entity_id, metadata)
  VALUES (
    v_uid, auth.jwt() ->> 'email', 'admin_granted', 'administrators', v_admin_id::text,
    jsonb_build_object(
      'email', lower(v_email),
      'profile_id', p_profile_id,
      'role', p_role_key,
      'permissions', coalesce(array_length(v_keys, 1), 0)
    )
  );

  RETURN jsonb_build_object('administrator_id', v_admin_id, 'profile_id', p_profile_id, 'status', 'active');
END;
$$;

-- 6.5D Remove (demote) admin access: revokes the administrators row,
-- clears pending invitations, and returns the profile to its
-- previous role (normally 'member').
CREATE OR REPLACE FUNCTION public.remove_admin_access(p_profile_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_profile profiles%ROWTYPE;
  v_admin administrators%ROWTYPE;
  v_email TEXT;
BEGIN
  IF v_uid IS NULL OR NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only Super Admin can manage administrators.' USING ERRCODE = '42501';
  END IF;
  IF p_profile_id IS NULL THEN
    RAISE EXCEPTION 'Select a user.' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_profile FROM profiles WHERE id = p_profile_id FOR UPDATE;
  IF v_profile.id IS NULL THEN
    RAISE EXCEPTION 'User not found.' USING ERRCODE = '22023';
  END IF;
  IF v_profile.role = 'super_admin' THEN
    RAISE EXCEPTION 'Super Admin access cannot be removed here.' USING ERRCODE = '42501';
  END IF;
  IF v_profile.role <> 'admin' THEN
    RAISE EXCEPTION 'This person is not an administrator.' USING ERRCODE = '22023';
  END IF;

  SELECT u.email INTO v_email FROM auth.users u WHERE u.id = p_profile_id;

  SELECT * INTO v_admin FROM administrators WHERE profile_id = p_profile_id;
  IF v_admin.id IS NULL AND v_email IS NOT NULL THEN
    SELECT * INTO v_admin FROM administrators WHERE email = lower(v_email);
  END IF;

  IF v_admin.id IS NOT NULL THEN
    UPDATE administrators SET
      status = 'revoked',
      revoked_at = now(),
      last_activity_at = now(),
      updated_at = now()
    WHERE id = v_admin.id;

    UPDATE admin_invitations SET status = 'revoked', updated_at = now()
    WHERE email = v_admin.email AND status = 'pending';
  END IF;

  PERFORM set_config('yaaq.allow_self_role_change', 'on', true);
  UPDATE profiles SET
    role = coalesce(v_admin.previous_role, 'member'),
    updated_at = now()
  WHERE id = p_profile_id AND role = 'admin';

  INSERT INTO audit_logs (actor_user_id, actor_label, action, entity_type, entity_id, metadata)
  VALUES (
    v_uid, auth.jwt() ->> 'email', 'admin_access_revoked', 'administrators',
    coalesce(v_admin.id::text, p_profile_id::text),
    jsonb_build_object(
      'email', v_email,
      'profile_id', p_profile_id,
      'previous_role', coalesce(v_admin.previous_role, 'member')
    )
  );

  RETURN jsonb_build_object('ok', true, 'administrator_id', v_admin.id, 'previous_role', coalesce(v_admin.previous_role, 'member'));
END;
$$;

-- 6.5E Permanently delete an account (Super Admin only): removes the
-- sign-in (auth.users) so profiles/members/creators cascade away,
-- plus any administrators row (grants cascade) and invitations first.
DO $$
BEGIN
  IF NOT has_table_privilege(current_user::text, 'auth.users', 'DELETE') THEN
    RAISE EXCEPTION 'Role % lacks DELETE on auth.users — run: GRANT DELETE ON auth.users TO %;', current_user::text, current_user::text;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.delete_user_account(p_profile_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_profile profiles%ROWTYPE;
  v_email TEXT;
BEGIN
  IF v_uid IS NULL OR NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only Super Admin can manage administrators.' USING ERRCODE = '42501';
  END IF;
  IF p_profile_id IS NULL THEN
    RAISE EXCEPTION 'Select a user.' USING ERRCODE = '22023';
  END IF;
  IF p_profile_id = v_uid THEN
    RAISE EXCEPTION 'You cannot delete your own account.' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_profile FROM profiles WHERE id = p_profile_id FOR UPDATE;
  IF v_profile.id IS NULL THEN
    RAISE EXCEPTION 'User not found.' USING ERRCODE = '22023';
  END IF;
  IF v_profile.role = 'super_admin' THEN
    RAISE EXCEPTION 'Super Admin accounts cannot be deleted here.' USING ERRCODE = '42501';
  END IF;

  SELECT u.email::text INTO v_email FROM auth.users u WHERE u.id = p_profile_id;
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'User not found.' USING ERRCODE = '22023';
  END IF;

  DELETE FROM administrators a
  WHERE a.profile_id = p_profile_id OR a.email = lower(v_email);
  DELETE FROM admin_invitations i WHERE i.email = lower(v_email);

  DELETE FROM auth.users u WHERE u.id = p_profile_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found.' USING ERRCODE = '22023';
  END IF;

  INSERT INTO audit_logs (actor_user_id, actor_label, action, entity_type, entity_id, metadata)
  VALUES (
    v_uid, auth.jwt() ->> 'email', 'user_deleted', 'profiles', p_profile_id::text,
    jsonb_build_object(
      'email', lower(v_email),
      'profile_id', p_profile_id,
      'full_name', v_profile.full_name,
      'previous_role', v_profile.role
    )
  );

  RETURN jsonb_build_object('ok', true, 'profile_id', p_profile_id, 'email', lower(v_email));
END;
$$;

-- 6.6 Publish an announcement: fan out to matching users (audited)
CREATE OR REPLACE FUNCTION public.publish_announcement(p_announcement_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_ann announcements%ROWTYPE;
  v_count INT;
BEGIN
  IF v_uid IS NULL OR NOT public.has_admin_permission('notifications.manage') THEN
    RAISE EXCEPTION 'You do not have permission to publish announcements.' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_ann FROM announcements WHERE id = p_announcement_id FOR UPDATE;
  IF v_ann.id IS NULL THEN
    RAISE EXCEPTION 'Announcement not found.' USING ERRCODE = '22023';
  END IF;
  IF v_ann.status = 'published' THEN
    RAISE EXCEPTION 'This announcement has already been published.' USING ERRCODE = '22023';
  END IF;
  IF v_ann.audience = 'selected' AND coalesce(array_length(v_ann.recipient_ids, 1), 0) = 0 THEN
    RAISE EXCEPTION 'Select at least one recipient before publishing.' USING ERRCODE = '22023';
  END IF;

  WITH targets AS (
    SELECT id FROM profiles WHERE is_active = true
      AND CASE v_ann.audience
            WHEN 'all' THEN true
            WHEN 'members' THEN role = 'member'
            WHEN 'creators' THEN role = 'creator'
            WHEN 'selected' THEN id = ANY (v_ann.recipient_ids)
          END
  )
  INSERT INTO notifications (user_id, title, message, type, action_url, metadata)
  SELECT t.id, v_ann.title, v_ann.message, v_ann.type, v_ann.action_url,
         jsonb_build_object('announcement_id', v_ann.id)
  FROM targets t;
  GET DIAGNOSTICS v_count = ROW_COUNT;

  UPDATE announcements SET
    status = 'published',
    published_at = now(),
    recipient_count = v_count,
    updated_at = now()
  WHERE id = p_announcement_id;

  INSERT INTO audit_logs (actor_user_id, actor_label, action, entity_type, entity_id, metadata)
  VALUES (
    v_uid, auth.jwt() ->> 'email', 'announcement_published', 'announcements', p_announcement_id::text,
    jsonb_build_object('title', v_ann.title, 'audience', v_ann.audience, 'recipients', v_count)
  );

  RETURN jsonb_build_object('ok', true, 'recipients', v_count);
END;
$$;

-- 6.7 Team account linking (badge + manual link)
-- Stores an optional official email on a team listing and links it to
-- a signed-in account: automatically when a matching email signs up,
-- or manually by a team manager. Linking grants no permissions.
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_team_members_profile ON team_members (profile_id);

-- One-time backfill: link listings whose email already matches an account.
UPDATE team_members t
SET profile_id = m.profile_id
FROM (
  SELECT DISTINCT ON (lower(u.email)) t2.id AS team_id, u.id AS profile_id
  FROM team_members t2
  JOIN auth.users u ON lower(u.email) = t2.email
  WHERE t2.profile_id IS NULL
  ORDER BY lower(u.email), t2.created_at
) m
WHERE t.id = m.team_id
  AND NOT EXISTS (SELECT 1 FROM team_members x WHERE x.profile_id = m.profile_id);

-- Normalize email (lowercase, blank -> NULL) and auto-match an existing
-- account when the email is first set or changed. A link is only ever
-- removed manually, so unrelated edits never break it.
CREATE OR REPLACE FUNCTION public.normalize_and_match_team_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  NEW.email := nullif(lower(trim(coalesce(NEW.email, ''))), '');

  IF NEW.profile_id IS NULL
     AND NEW.email IS NOT NULL
     AND (TG_OP = 'INSERT' OR NEW.email IS DISTINCT FROM OLD.email) THEN
    SELECT p.id INTO NEW.profile_id
    FROM auth.users u
    JOIN profiles p ON p.id = u.id
    WHERE lower(u.email) = NEW.email
      AND NOT EXISTS (
        SELECT 1 FROM team_members t
        WHERE t.profile_id = p.id AND t.id IS DISTINCT FROM NEW.id
      )
    ORDER BY u.created_at
    LIMIT 1;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_match_team_email ON team_members;
CREATE TRIGGER trg_match_team_email
  BEFORE INSERT OR UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION public.normalize_and_match_team_email();

-- When a new account is created, attach it to the first unlinked team
-- listing that already carries that email.
CREATE OR REPLACE FUNCTION public.link_team_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_email TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM team_members WHERE profile_id = NEW.id) THEN
    RETURN NULL;
  END IF;

  SELECT lower(u.email) INTO v_email FROM auth.users u WHERE u.id = NEW.id;
  IF v_email IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE team_members SET profile_id = NEW.id
  WHERE id = (
    SELECT t.id FROM team_members t
    WHERE t.email = v_email AND t.profile_id IS NULL
    ORDER BY t.created_at
    LIMIT 1
  );
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_link_team_on_signup ON profiles;
CREATE TRIGGER trg_link_team_on_signup
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.link_team_on_signup();

-- Find signed-in accounts that are not yet linked to a team listing.
CREATE OR REPLACE FUNCTION public.search_linkable_users(
  p_query TEXT,
  p_limit INT DEFAULT 10
) RETURNS TABLE (
  profile_id UUID,
  email TEXT,
  full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_query TEXT := trim(coalesce(p_query, ''));
  v_limit INT := LEAST(GREATEST(coalesce(p_limit, 10), 1), 25);
BEGIN
  IF v_uid IS NULL OR NOT public.has_admin_permission('team.manage') THEN
    RAISE EXCEPTION 'You do not have permission to manage the team.' USING ERRCODE = '42501';
  END IF;
  IF length(v_query) < 2 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT u.id, u.email::text, p.full_name
  FROM auth.users u
  JOIN profiles p ON p.id = u.id
  WHERE (u.email ILIKE '%' || v_query || '%' OR coalesce(p.full_name, '') ILIKE '%' || v_query || '%')
    AND NOT EXISTS (SELECT 1 FROM team_members t WHERE t.profile_id = u.id)
    AND u.email_confirmed_at IS NOT NULL
    AND (u.banned_until IS NULL OR u.banned_until < now())
  ORDER BY u.email
  LIMIT v_limit;
END;
$$;

-- Manually link a team listing to an account (or unlink with NULL).
CREATE OR REPLACE FUNCTION public.link_team_member(
  p_team_id UUID,
  p_profile_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_team team_members%ROWTYPE;
  v_email TEXT;
BEGIN
  IF v_uid IS NULL OR NOT public.has_admin_permission('team.manage') THEN
    RAISE EXCEPTION 'You do not have permission to manage the team.' USING ERRCODE = '42501';
  END IF;
  IF p_team_id IS NULL THEN
    RAISE EXCEPTION 'Select a team member.' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_team FROM team_members WHERE id = p_team_id FOR UPDATE;
  IF v_team.id IS NULL THEN
    RAISE EXCEPTION 'Team member not found.' USING ERRCODE = '22023';
  END IF;

  IF p_profile_id IS NULL THEN
    UPDATE team_members SET profile_id = NULL WHERE id = p_team_id;
    RETURN jsonb_build_object('ok', true, 'linked', false, 'team_id', p_team_id);
  END IF;

  SELECT u.email::text INTO v_email FROM auth.users u WHERE u.id = p_profile_id;
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Account not found.' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (SELECT 1 FROM team_members WHERE profile_id = p_profile_id AND id <> p_team_id) THEN
    RAISE EXCEPTION 'This account is already linked to another team member.' USING ERRCODE = '22023';
  END IF;

  UPDATE team_members SET profile_id = p_profile_id, email = lower(v_email) WHERE id = p_team_id;

  RETURN jsonb_build_object('ok', true, 'linked', true, 'team_id', p_team_id, 'profile_id', p_profile_id, 'email', lower(v_email));
END;
$$;

-- 6.8 Constitutional team structure (Articles 3 & 4)
-- Departments follow Article 3.2 (Editorial, Creative & Design,
-- Digital & Engagement, Operations); 'executive' hosts board-only roles.
-- on_board marks Article 3.1 Executive Board positions (CEO + the four heads).
-- NOTE: the old constraint must go FIRST, otherwise the legacy-value
-- remap below fails the old check (23514) before the new one exists.
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_department_check;
UPDATE team_members SET department = 'creative' WHERE department = 'production';
UPDATE team_members SET department = 'editorial' WHERE department = 'talent';
ALTER TABLE team_members ADD CONSTRAINT team_members_department_check CHECK (department IN ('executive', 'editorial', 'creative', 'digital', 'operations'));
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS on_board BOOLEAN NOT NULL DEFAULT false;
UPDATE team_members SET on_board = true
WHERE role ILIKE 'CEO%'
   OR role IN ('Head of Editors', 'Head of Operations', 'Head of Creative & Design', 'Head of Social Media & Engagement');

-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permission_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Catalog tables: readable when signed in, never writable from client
DROP POLICY IF EXISTS "Permission catalog readable by signed-in users" ON admin_permissions;
CREATE POLICY "Permission catalog readable by signed-in users"
  ON admin_permissions FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admin roles readable by signed-in users" ON admin_roles;
CREATE POLICY "Admin roles readable by signed-in users"
  ON admin_roles FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Role presets readable by signed-in users" ON admin_role_permissions;
CREATE POLICY "Role presets readable by signed-in users"
  ON admin_role_permissions FOR SELECT USING (auth.uid() IS NOT NULL);

-- Administrators: read via permission or own row. NO write policies â€”
-- all mutations go through the audited SECURITY DEFINER RPCs above.
DROP POLICY IF EXISTS "Administrators visibility" ON administrators;
CREATE POLICY "Administrators visibility"
  ON administrators FOR SELECT
  USING (public.can_view_administrator(id));

DROP POLICY IF EXISTS "Permission grants visibility" ON admin_permission_grants;
CREATE POLICY "Permission grants visibility"
  ON admin_permission_grants FOR SELECT
  USING (public.can_view_administrator(administrator_id));

DROP POLICY IF EXISTS "Invitations visibility" ON admin_invitations;
CREATE POLICY "Invitations visibility"
  ON admin_invitations FOR SELECT
  USING (public.can_view_administrator(administrator_id));

-- Audit logs: read-only, permission gated, no client writes at all
DROP POLICY IF EXISTS "Audit logs viewable with permission" ON audit_logs;
CREATE POLICY "Audit logs viewable with permission"
  ON audit_logs FOR SELECT
  USING (public.has_admin_permission('audit_logs.view'));

-- Team members: public reads active rows; admins read/manage by permission
DROP POLICY IF EXISTS "Active team members publicly readable" ON team_members;
CREATE POLICY "Active team members publicly readable"
  ON team_members FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins with team.view read team members" ON team_members;
CREATE POLICY "Admins with team.view read team members"
  ON team_members FOR SELECT USING (public.has_admin_permission('team.view'));

DROP POLICY IF EXISTS "Admins with team.manage insert team members" ON team_members;
CREATE POLICY "Admins with team.manage insert team members"
  ON team_members FOR INSERT WITH CHECK (public.has_admin_permission('team.manage'));

DROP POLICY IF EXISTS "Admins with team.manage update team members" ON team_members;
CREATE POLICY "Admins with team.manage update team members"
  ON team_members FOR UPDATE
  USING (public.has_admin_permission('team.manage'))
  WITH CHECK (public.has_admin_permission('team.manage'));

DROP POLICY IF EXISTS "Admins with team.manage delete team members" ON team_members;
CREATE POLICY "Admins with team.manage delete team members"
  ON team_members FOR DELETE
  USING (public.has_admin_permission('team.manage'));

-- Services: public reads active rows; admins read/manage by permission
DROP POLICY IF EXISTS "Active services publicly readable" ON services;
CREATE POLICY "Active services publicly readable"
  ON services FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins with services.view read services" ON services;
CREATE POLICY "Admins with services.view read services"
  ON services FOR SELECT USING (public.has_admin_permission('services.view'));

DROP POLICY IF EXISTS "Admins with services.manage insert services" ON services;
CREATE POLICY "Admins with services.manage insert services"
  ON services FOR INSERT WITH CHECK (public.has_admin_permission('services.manage'));

DROP POLICY IF EXISTS "Admins with services.manage update services" ON services;
CREATE POLICY "Admins with services.manage update services"
  ON services FOR UPDATE
  USING (public.has_admin_permission('services.manage'))
  WITH CHECK (public.has_admin_permission('services.manage'));

DROP POLICY IF EXISTS "Admins with services.manage delete services" ON services;
CREATE POLICY "Admins with services.manage delete services"
  ON services FOR DELETE
  USING (public.has_admin_permission('services.manage'));

-- Announcements: drafts can be written directly; only the
-- publish_announcement() RPC can move them to published (and fan out)
DROP POLICY IF EXISTS "Admins with notifications.view read announcements" ON announcements;
CREATE POLICY "Admins with notifications.view read announcements"
  ON announcements FOR SELECT
  USING (public.has_admin_permission('notifications.view'));

DROP POLICY IF EXISTS "Admins with notifications.manage insert drafts" ON announcements;
CREATE POLICY "Admins with notifications.manage insert drafts"
  ON announcements FOR INSERT
  WITH CHECK (public.has_admin_permission('notifications.manage') AND status = 'draft');

DROP POLICY IF EXISTS "Admins with notifications.manage edit drafts" ON announcements;
CREATE POLICY "Admins with notifications.manage edit drafts"
  ON announcements FOR UPDATE
  USING (public.has_admin_permission('notifications.manage') AND status = 'draft')
  WITH CHECK (public.has_admin_permission('notifications.manage') AND status = 'draft');

DROP POLICY IF EXISTS "Admins with notifications.manage delete announcements" ON announcements;
CREATE POLICY "Admins with notifications.manage delete announcements"
  ON announcements FOR DELETE
  USING (public.has_admin_permission('notifications.manage'));

-- Platform settings: banner keys readable by everyone (public site),
-- the rest require settings.view; writes require settings.manage
DROP POLICY IF EXISTS "Settings visibility" ON platform_settings;
CREATE POLICY "Settings visibility"
  ON platform_settings FOR SELECT
  USING (
    left(key, 20) = 'announcement_banner_'
    OR public.has_admin_permission('settings.view')
  );

DROP POLICY IF EXISTS "Admins with settings.manage insert settings" ON platform_settings;
CREATE POLICY "Admins with settings.manage insert settings"
  ON platform_settings FOR INSERT
  WITH CHECK (public.has_admin_permission('settings.manage'));

DROP POLICY IF EXISTS "Admins with settings.manage update settings" ON platform_settings;
CREATE POLICY "Admins with settings.manage update settings"
  ON platform_settings FOR UPDATE
  USING (public.has_admin_permission('settings.manage'))
  WITH CHECK (public.has_admin_permission('settings.manage'));

DROP POLICY IF EXISTS "Admins with settings.manage delete settings" ON platform_settings;
CREATE POLICY "Admins with settings.manage delete settings"
  ON platform_settings FOR DELETE
  USING (public.has_admin_permission('settings.manage'));

-- ============================================================
-- 8. TIGHTEN PHASE 2 ADMIN POLICIES (role -> permission based)
-- ============================================================

-- profiles: replace blanket admin read with permission-gated reads
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins with members.view read all profiles" ON profiles;
CREATE POLICY "Admins with members.view read all profiles"
  ON profiles FOR SELECT
  USING (public.has_admin_permission('members.view'));

DROP POLICY IF EXISTS "Admins with creators.view read all profiles" ON profiles;
CREATE POLICY "Admins with creators.view read all profiles"
  ON profiles FOR SELECT
  USING (public.has_admin_permission('creators.view'));

-- profiles: admins may update accounts they manage; the security
-- trigger above blocks role changes / administrator edits
DROP POLICY IF EXISTS "Only admins can change roles" ON profiles;
DROP POLICY IF EXISTS "Only Super Admin can change roles" ON profiles;
CREATE POLICY "Only Super Admin can change roles"
  ON profiles FOR UPDATE
  USING (public.is_super_admin())
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins with members.manage update profiles" ON profiles;
CREATE POLICY "Admins with members.manage update profiles"
  ON profiles FOR UPDATE
  USING (public.has_admin_permission('members.manage'))
  WITH CHECK (public.has_admin_permission('members.manage'));

-- 8-fix. Profiles self-update recursion (42P17)
-- The phase 2 self-update policy subqueried profiles inside its own WITH
-- CHECK, which Postgres rejects as infinite recursion — breaking every
-- profiles UPDATE from the browser (e.g. avatar saves). Role protection is
-- enforced by the enforce_profile_security trigger instead.
DROP POLICY IF EXISTS "Users can update own profile (no role change)" ON profiles;
CREATE POLICY "Users can update own profile (no role change)"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- members: permission-gated read
DROP POLICY IF EXISTS "Admins can view all members" ON members;
DROP POLICY IF EXISTS "Admins with members.view read all members" ON members;
CREATE POLICY "Admins with members.view read all members"
  ON members FOR SELECT
  USING (public.has_admin_permission('members.view'));

-- creators: permission-gated read/manage
DROP POLICY IF EXISTS "Admins can view all creators" ON creators;
DROP POLICY IF EXISTS "Admins with creators.view read all creators" ON creators;
CREATE POLICY "Admins with creators.view read all creators"
  ON creators FOR SELECT
  USING (public.has_admin_permission('creators.view'));

DROP POLICY IF EXISTS "Admins can manage creators" ON creators;
DROP POLICY IF EXISTS "Admins with creators.manage manage creators" ON creators;
CREATE POLICY "Admins with creators.manage manage creators"
  ON creators FOR ALL
  USING (public.has_admin_permission('creators.manage'))
  WITH CHECK (public.has_admin_permission('creators.manage'));

-- creator social links: permission-gated manage
DROP POLICY IF EXISTS "Admins manage all creator links" ON creator_social_links;
DROP POLICY IF EXISTS "Admins with creators.manage manage creator links" ON creator_social_links;
CREATE POLICY "Admins with creators.manage manage creator links"
  ON creator_social_links FOR ALL
  USING (public.has_admin_permission('creators.manage'))
  WITH CHECK (public.has_admin_permission('creators.manage'));

-- lookup tables: only settings managers may edit
DROP POLICY IF EXISTS "Only admins manage institutions" ON institutions;
DROP POLICY IF EXISTS "Only settings managers manage institutions" ON institutions;
CREATE POLICY "Only settings managers manage institutions"
  ON institutions FOR ALL
  USING (public.has_admin_permission('settings.manage'))
  WITH CHECK (public.has_admin_permission('settings.manage'));

DROP POLICY IF EXISTS "Only admins manage creator types" ON creator_types;
DROP POLICY IF EXISTS "Only settings managers manage creator types" ON creator_types;
CREATE POLICY "Only settings managers manage creator types"
  ON creator_types FOR ALL
  USING (public.has_admin_permission('settings.manage'))
  WITH CHECK (public.has_admin_permission('settings.manage'));

-- ============================================================
-- 8b. GRANTS (defense against missing default privileges)
-- ============================================================
-- Supabase projects normally ship with default privileges that grant
-- table access to anon/authenticated/service_role; RLS is the real
-- gate. Re-stating the grants makes this migration safe on any
-- project configuration. RPCs are SECURITY DEFINER and run as the
-- function owner, so they are unaffected by these grants.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- ============================================================
-- 9. SEEDS
-- ============================================================

-- Permissions (keep in sync with src/lib/permissions.ts)
INSERT INTO admin_permissions (key, label, category, description, sort_order) VALUES
  ('dashboard.view', 'View dashboard', 'Dashboard', 'Access the admin dashboard overview.', 1),
  ('members.view', 'View members', 'People', 'View the member directory and profiles.', 10),
  ('members.manage', 'Manage members', 'People', 'Change member account status.', 11),
  ('creators.view', 'View creators', 'People', 'View creator profiles and portfolios.', 12),
  ('creators.manage', 'Manage creators', 'People', 'Change creator visibility and profile data.', 13),
  ('team.view', 'View team', 'Content', 'View the official team directory.', 20),
  ('team.manage', 'Manage team', 'Content', 'Add, edit and remove team members.', 21),
  ('services.view', 'View services', 'Content', 'View the services catalogue.', 22),
  ('services.manage', 'Manage services', 'Content', 'Create, edit and publish services.', 23),
  ('media.view', 'View media', 'Content', 'View the media library.', 30),
  ('media.manage', 'Manage media', 'Content', 'Manage media library items.', 31),
  ('news.view', 'View news', 'Content', 'View news articles.', 32),
  ('news.manage', 'Manage news', 'Content', 'Create, edit and publish news.', 33),
  ('bookings.view', 'View bookings', 'Operations', 'View booking requests.', 40),
  ('bookings.manage', 'Manage bookings', 'Operations', 'Update booking statuses.', 41),
  ('notifications.view', 'View announcements', 'Operations', 'View admin announcements.', 50),
  ('notifications.manage', 'Manage announcements', 'Operations', 'Create and publish announcements.', 51),
  ('administrators.view', 'View administrators', 'Administration', 'View the administrators list.', 60),
  ('administrators.manage', 'Manage administrators', 'Administration', 'Super Admin only. Invite and manage administrators.', 61),
  ('settings.view', 'View settings', 'System', 'View platform settings.', 70),
  ('settings.manage', 'Manage settings', 'System', 'Change platform settings.', 71),
  ('audit_logs.view', 'View audit logs', 'System', 'View the administrative audit trail.', 80)
ON CONFLICT (key) DO NOTHING;

-- Roles
INSERT INTO admin_roles (key, name, description, is_system) VALUES
  ('super_admin', 'Super Admin', 'Unrestricted control of the platform.', true),
  ('admin', 'Administrator', 'Full operational administration preset.', false),
  ('editor', 'Editor', 'Content-focused administration preset.', false),
  ('viewer', 'Viewer', 'Read-only administration preset.', false)
ON CONFLICT (key) DO NOTHING;

-- Role permission presets (keep in sync with ROLE_PERMISSION_PRESETS
-- in src/lib/permissions.ts)
INSERT INTO admin_role_permissions (role_id, permission_key)
SELECT r.id, ap.key
FROM admin_roles r
JOIN (VALUES
  ('admin', 'dashboard.view'), ('admin', 'members.view'), ('admin', 'members.manage'),
  ('admin', 'creators.view'), ('admin', 'creators.manage'), ('admin', 'team.view'),
  ('admin', 'team.manage'), ('admin', 'services.view'), ('admin', 'services.manage'),
  ('admin', 'notifications.view'), ('admin', 'notifications.manage'), ('admin', 'media.view'),
  ('admin', 'news.view'), ('admin', 'bookings.view'), ('admin', 'settings.view'),
  ('admin', 'audit_logs.view'),
  ('editor', 'dashboard.view'), ('editor', 'members.view'), ('editor', 'creators.view'),
  ('editor', 'team.view'), ('editor', 'team.manage'), ('editor', 'services.view'),
  ('editor', 'media.view'), ('editor', 'media.manage'), ('editor', 'news.view'),
  ('editor', 'news.manage'), ('editor', 'notifications.view'), ('editor', 'bookings.view'),
  ('viewer', 'dashboard.view'), ('viewer', 'members.view'), ('viewer', 'creators.view'),
  ('viewer', 'team.view'), ('viewer', 'services.view'), ('viewer', 'media.view'),
  ('viewer', 'news.view'), ('viewer', 'notifications.view'), ('viewer', 'bookings.view')
) AS presets(role_key, perm_key) ON presets.role_key = r.key
JOIN admin_permissions ap ON ap.key = presets.perm_key
ON CONFLICT (role_id, permission_key) DO NOTHING;

-- Platform settings (banner disabled by default â€” public site unchanged)
INSERT INTO platform_settings (key, value, description) VALUES
  ('announcement_banner_enabled', 'false'::jsonb, 'Show the announcement banner on the public site.'),
  ('announcement_banner_message', '""'::jsonb, 'Message shown in the public announcement banner.')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 10. MANUAL STEPS (documented, required)
-- ============================================================
-- 1. Promote your own account to Super Admin (run in SQL Editor):
--
--      UPDATE profiles SET role = 'super_admin'
--      WHERE id = (SELECT id FROM auth.users WHERE email = 'you@example.com');
--
--    The enforce_profile_security trigger allows this because
--    auth.uid() is NULL in the SQL Editor (not a browser actor).
--
-- 2. Super Admin grants officials access directly from
--    /admin/administrators: search a user by name or email, confirm,
--    and grant. Invitations are no longer required; Super Admin can
--    also demote any administrator back to a normal member there,
--    or permanently delete any non-super account (delete_user_account).
--
-- 3. Legacy invitation flow: the admin_invitations table and the
--    create/accept/revoke invitation RPCs remain for compatibility
--    but are no longer exposed in the UI.
--    The acceptance link always requires the invited email account.
