-- ============================================================
-- Phase 7: Remove the Creator role
-- The Creator registration path and /creator/* pages are gone.
-- This converts every existing creator account into a regular
-- member so those users keep working and land on /dashboard.
--
-- The `creators` table and its portfolio rows are intentionally
-- left untouched (historical data, still visible in admin).
-- ============================================================

-- Idempotent: safe to re-run.
UPDATE public.profiles
SET role = 'member'
WHERE role = 'creator';

-- Reload PostgREST schema cache.
NOTIFY pgrst, 'reload schema';
