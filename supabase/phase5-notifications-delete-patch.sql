-- ============================================================
-- PHASE 5: Notifications delete policy (dismiss/dismiss)
-- Run AFTER phase2-schema.sql.
-- ============================================================
-- Rationale: notifications currently support SELECT (own) and
-- UPDATE (own, mark read) but no DELETE. Orphaned rows (e.g.
-- fan-out notifications whose related record was removed) can
-- never be dismissed by the user. This allows users to delete
-- their OWN notifications only.

-- Idempotent: safe to re-run.
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Reload PostgREST schema cache.
NOTIFY pgrst, 'reload schema';
