-- ============================================================
-- Phase 6: Ambassadors
-- Members from non-KTU institutions can request to represent
-- YAAQ World on their campus. Admins approve/revoke. Approved
-- ambassadors appear publicly on the Team page.
-- ============================================================

-- Status enum
DO $$ BEGIN
  CREATE TYPE ambassador_status AS ENUM ('pending', 'approved', 'rejected', 'revoked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Ambassadors table
CREATE TABLE IF NOT EXISTS public.ambassadors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  -- Snapshot at request time so the public page works without
  -- exposing the full profiles table to anonymous visitors.
  full_name TEXT NOT NULL,
  photo_url TEXT,
  phone TEXT NOT NULL,
  instagram TEXT,
  tiktok TEXT,
  twitter TEXT,
  message TEXT,
  status ambassador_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- One ambassador record per person; admins can reset status to
  -- pending to allow re-review after a rejection.
  CONSTRAINT ambassadors_one_per_profile UNIQUE (profile_id)
);

CREATE INDEX IF NOT EXISTS idx_ambassadors_status ON public.ambassadors (status);
CREATE INDEX IF NOT EXISTS idx_ambassadors_institution ON public.ambassadors (institution_id);

-- updated_at maintenance (matches existing table conventions)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ambassadors_updated_at ON public.ambassadors;
CREATE TRIGGER trg_ambassadors_updated_at
  BEFORE UPDATE ON public.ambassadors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.ambassadors ENABLE ROW LEVEL SECURITY;

-- INSERT: own pending request only, and the institution must match
-- the institution on the requester's own profile.
DROP POLICY IF EXISTS "Members can request ambassadorship" ON public.ambassadors;
CREATE POLICY "Members can request ambassadorship"
  ON public.ambassadors FOR INSERT
  WITH CHECK (
    profile_id = auth.uid()
    AND status = 'pending'
    AND institution_id = (
      SELECT institution_id FROM profiles WHERE id = auth.uid()
    )
  );

-- SELECT: own row, admins with permission, or any approved row
-- (public directory on the Team page).
DROP POLICY IF EXISTS "Ambassador visibility" ON public.ambassadors;
CREATE POLICY "Ambassador visibility"
  ON public.ambassadors FOR SELECT
  USING (
    profile_id = auth.uid()
    OR status = 'approved'
    OR public.has_admin_permission('ambassadors.view')
  );

-- UPDATE: admins with ambassadors.manage only (approve/reject/revoke).
DROP POLICY IF EXISTS "Ambassador admins can update" ON public.ambassadors;
CREATE POLICY "Ambassador admins can update"
  ON public.ambassadors FOR UPDATE
  USING (public.has_admin_permission('ambassadors.manage'))
  WITH CHECK (public.has_admin_permission('ambassadors.manage'));

-- DELETE: admins with ambassadors.manage only.
DROP POLICY IF EXISTS "Ambassador admins can delete" ON public.ambassadors;
CREATE POLICY "Ambassador admins can delete"
  ON public.ambassadors FOR DELETE
  USING (public.has_admin_permission('ambassadors.manage'));

-- New ambassador request -> notification for every admin profile.
CREATE OR REPLACE FUNCTION public.notify_admins_of_ambassador_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notifications (user_id, title, message, type, action_url, metadata)
    SELECT
      p.id,
      'New ambassador request',
      NEW.full_name || ' requested to represent YAAQ World at ' ||
        COALESCE((SELECT name FROM institutions WHERE id = NEW.institution_id), 'their institution') || '.',
      'info',
      '/admin/ambassadors',
      jsonb_build_object(
        'ambassador_id', NEW.id,
        'full_name', NEW.full_name,
        'institution_id', NEW.institution_id
      )
    FROM profiles p
    WHERE p.role IN ('admin', 'super_admin');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ambassador_request_admin_notification ON public.ambassadors;
CREATE TRIGGER ambassador_request_admin_notification
  AFTER INSERT ON public.ambassadors
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_of_ambassador_request();

-- Admin permission keys (keep in sync with src/lib/permissions.ts)
INSERT INTO admin_permissions (key, label, category, description, sort_order) VALUES
  ('ambassadors.view', 'View ambassadors', 'People', 'View ambassador requests and profiles.', 14),
  ('ambassadors.manage', 'Manage ambassadors', 'People', 'Approve, reject, and revoke ambassadors.', 15)
ON CONFLICT (key) DO NOTHING;

-- Role permission presets (keep in sync with ROLE_PERMISSION_PRESETS)
INSERT INTO admin_role_permissions (role_id, permission_key)
SELECT r.id, ap.key
FROM admin_roles r
JOIN (VALUES
  ('admin', 'ambassadors.view'), ('admin', 'ambassadors.manage'),
  ('editor', 'ambassadors.view'),
  ('viewer', 'ambassadors.view')
) AS presets(role_key, perm_key) ON presets.role_key = r.key
JOIN admin_permissions ap ON ap.key = presets.perm_key
ON CONFLICT (role_id, permission_key) DO NOTHING;
