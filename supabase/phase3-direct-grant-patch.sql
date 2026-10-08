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

-- Permanently delete an account (Super Admin only): removes the
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

-- 8b-post: These functions were created after the blanket GRANT at the
-- end of phase3 ran, so they need explicit EXECUTE grants (PostgREST
-- resolves RPCs as anon/authenticated/service_role).
GRANT EXECUTE ON FUNCTION
  public.search_admin_candidates(TEXT, INT),
  public.list_administrators(),
  public.grant_admin_access(UUID, TEXT, TEXT[]),
  public.remove_admin_access(UUID),
  public.delete_user_account(UUID)
TO anon, authenticated, service_role;
