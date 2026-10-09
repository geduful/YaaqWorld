-- ============================================================
-- Phase 4 patch: restore the public booking submission policy
-- ============================================================
-- Headless verification found the LIVE "Anyone can submit a
-- booking request" policy rejects status='new' inserts from
-- anon and authenticated users (drift from phase4-schema.sql).
-- This re-creates it exactly as defined in phase4-schema.sql.
-- Idempotent; safe to re-run.
-- ============================================================

DROP POLICY IF EXISTS "Anyone can submit a booking request" ON public.bookings;
CREATE POLICY "Anyone can submit a booking request"
  ON public.bookings FOR INSERT
  WITH CHECK (
    status = 'new'
    OR public.has_admin_permission('bookings.manage')
  );

GRANT INSERT ON public.bookings TO anon;

-- Verify: should show exactly one INSERT policy with the
-- status = 'new' path in its with_check.
SELECT policyname, cmd, roles, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'bookings'
ORDER BY policyname;
