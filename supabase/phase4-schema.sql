-- ============================================================
-- YAAQ World Phase 4: Media Hub, News, Bookings, Opportunities
-- ============================================================
-- Run this in the Supabase SQL Editor (same database as
-- Phase 2 + Phase 3). Safe to re-run: every statement is
-- idempotent (IF NOT EXISTS / ON CONFLICT / CREATE OR REPLACE
-- / DROP ... IF EXISTS).
-- ============================================================

-- ============================================================
-- 1. ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE media_type AS ENUM ('image', 'video');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE news_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM (
    'new', 'pending', 'contacted', 'quoted', 'confirmed', 'completed', 'cancelled', 'declined'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE opportunity_status AS ENUM ('draft', 'open', 'closed', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE opportunity_type AS ENUM ('casting', 'crew', 'production', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('submitted', 'shortlisted', 'accepted', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 2. TABLES
-- ============================================================

-- Media library. published_at NULL = draft (hidden from the
-- public site); published_at set = live. Videos are trusted
-- embeds only (YouTube/Vimeo id) or a direct media_url.
CREATE TABLE IF NOT EXISTS media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type media_type NOT NULL DEFAULT 'image',
  thumbnail_url TEXT NOT NULL,
  media_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  duration TEXT,
  description TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  youtube_id TEXT,
  vimeo_id TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT media_items_video_embed CHECK (
    type = 'image' OR media_url IS NOT NULL OR youtube_id IS NOT NULL OR vimeo_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_media_items_public ON media_items (published_at DESC NULLS LAST) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_items_category ON media_items (category);
CREATE INDEX IF NOT EXISTS idx_media_items_featured ON media_items (featured) WHERE featured = true;

-- News articles. Public visibility = status 'published' AND
-- published_at set. Content is plain text (rendered as React
-- text nodes — no raw HTML) so no HTML sanitizer is needed.
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] NOT NULL DEFAULT '{}',
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  read_time INT NOT NULL DEFAULT 1 CHECK (read_time > 0),
  featured BOOLEAN NOT NULL DEFAULT false,
  status news_status NOT NULL DEFAULT 'draft',
  seo_title TEXT,
  seo_description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_news_articles_public ON news_articles (published_at DESC NULLS LAST) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_news_articles_status ON news_articles (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles (category);

-- Public booking requests. Anyone (no account) may INSERT a row
-- with status 'new' via the anon key; only admins with
-- bookings.view / bookings.manage can read or change them.
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  organization TEXT,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  service_category TEXT NOT NULL,
  event_date DATE NOT NULL,
  location TEXT NOT NULL,
  details TEXT NOT NULL,
  budget TEXT,
  status booking_status NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  quoted_amount NUMERIC(12,2),
  deposit_paid BOOLEAN NOT NULL DEFAULT false,
  deposit_amount NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings (created_at DESC);

-- Creator opportunities (casting calls, crew recruitment,
-- production roles). Public open list = status 'open' +
-- published_at set + deadline not passed.
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type opportunity_type NOT NULL DEFAULT 'casting',
  description TEXT NOT NULL,
  requirements TEXT,
  location TEXT,
  compensation TEXT,
  deadline DATE,
  status opportunity_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  apply_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_public ON opportunities (published_at DESC NULLS LAST) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities (status, created_at DESC);

-- Creator applications. One application per creator per
-- opportunity (UNIQUE). Creators can withdraw (DELETE) their own.
CREATE TABLE IF NOT EXISTS opportunity_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_note TEXT,
  portfolio_url TEXT,
  status application_status NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (opportunity_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS idx_opportunity_apps_opportunity ON opportunity_applications (opportunity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunity_apps_applicant ON opportunity_applications (applicant_id, created_at DESC);

-- ============================================================
-- 3. TRIGGERS
-- ============================================================

-- Generic slug generator (reuses Phase 3 slugify).
CREATE OR REPLACE FUNCTION public.apply_title_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_slug TEXT;
  v_exists BOOLEAN;
BEGIN
  IF NEW.slug IS NULL OR length(trim(NEW.slug)) = 0 THEN
    NEW.slug := public.slugify(NEW.title);
  ELSE
    NEW.slug := public.slugify(NEW.slug);
  END IF;
  IF NEW.slug IS NULL OR length(trim(NEW.slug)) = 0 THEN
    NEW.slug := TG_TABLE_NAME || '-' || substr(md5(random()::text), 1, 8);
  END IF;
  EXECUTE format('SELECT EXISTS (SELECT 1 FROM %I s WHERE s.slug = $1 AND s.id <> $2)', TG_TABLE_NAME)
    INTO v_exists USING NEW.slug, NEW.id;
  IF v_exists THEN
    NEW.slug := NEW.slug || '-' || substr(md5(random()::text), 1, 6);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_media_slug ON media_items;
CREATE TRIGGER set_media_slug
  BEFORE INSERT OR UPDATE ON media_items
  FOR EACH ROW EXECUTE FUNCTION public.apply_title_slug();

DROP TRIGGER IF EXISTS set_news_slug ON news_articles;
CREATE TRIGGER set_news_slug
  BEFORE INSERT OR UPDATE ON news_articles
  FOR EACH ROW EXECUTE FUNCTION public.apply_title_slug();

DROP TRIGGER IF EXISTS set_opportunity_slug ON opportunities;
CREATE TRIGGER set_opportunity_slug
  BEFORE INSERT OR UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION public.apply_title_slug();

-- Publishing a news article stamps published_at once.
CREATE OR REPLACE FUNCTION public.set_news_published_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_news_published_at ON news_articles;
CREATE TRIGGER set_news_published_at
  BEFORE INSERT OR UPDATE ON news_articles
  FOR EACH ROW EXECUTE FUNCTION public.set_news_published_at();

-- Audit trail: extend the Phase 3 managed-table trigger with the
-- Phase 4 tables (entity metadata includes title/name + status).
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
  ELSIF TG_TABLE_NAME = 'media_items' THEN
    v_entity_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.id::text ELSE NEW.id::text END;
    v_meta := jsonb_build_object(
      'title', CASE WHEN TG_OP = 'DELETE' THEN OLD.title ELSE NEW.title END,
      'type', CASE WHEN TG_OP = 'DELETE' THEN OLD.type::text ELSE NEW.type::text END
    );
  ELSIF TG_TABLE_NAME = 'news_articles' THEN
    v_entity_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.id::text ELSE NEW.id::text END;
    v_meta := jsonb_build_object(
      'title', CASE WHEN TG_OP = 'DELETE' THEN OLD.title ELSE NEW.title END,
      'status', CASE WHEN TG_OP = 'DELETE' THEN OLD.status::text ELSE NEW.status::text END
    );
  ELSIF TG_TABLE_NAME = 'bookings' THEN
    v_entity_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.id::text ELSE NEW.id::text END;
    v_meta := jsonb_build_object(
      'name', CASE WHEN TG_OP = 'DELETE' THEN OLD.name ELSE NEW.name END,
      'email', CASE WHEN TG_OP = 'DELETE' THEN OLD.email ELSE NEW.email END,
      'status', CASE WHEN TG_OP = 'DELETE' THEN OLD.status::text ELSE NEW.status::text END
    );
  ELSIF TG_TABLE_NAME = 'opportunities' THEN
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

DROP TRIGGER IF EXISTS audit_media_items ON media_items;
CREATE TRIGGER audit_media_items
  AFTER INSERT OR UPDATE OR DELETE ON media_items
  FOR EACH ROW EXECUTE FUNCTION public.audit_managed_changes('media_item');

DROP TRIGGER IF EXISTS audit_news_articles ON news_articles;
CREATE TRIGGER audit_news_articles
  AFTER INSERT OR UPDATE OR DELETE ON news_articles
  FOR EACH ROW EXECUTE FUNCTION public.audit_managed_changes('news');

DROP TRIGGER IF EXISTS audit_bookings ON bookings;
CREATE TRIGGER audit_bookings
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION public.audit_managed_changes('booking');

DROP TRIGGER IF EXISTS audit_opportunities ON opportunities;
CREATE TRIGGER audit_opportunities
  AFTER INSERT OR UPDATE OR DELETE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION public.audit_managed_changes('opportunity');

-- New public booking -> notification for every admin profile.
CREATE OR REPLACE FUNCTION public.notify_admins_of_booking()
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
      'New booking request',
      'New booking request from ' || NEW.name || ' (' || NEW.service_category || ').',
      'booking',
      '/admin/bookings',
      jsonb_build_object(
        'booking_id', NEW.id,
        'name', NEW.name,
        'email', NEW.email,
        'service_category', NEW.service_category
      )
    FROM profiles p
    WHERE p.role IN ('admin', 'super_admin');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS booking_admin_notification ON bookings;
CREATE TRIGGER booking_admin_notification
  AFTER INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_of_booking();

-- Opportunity goes live -> notification for every creator profile.
CREATE OR REPLACE FUNCTION public.notify_creators_of_opportunity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  IF NEW.status = 'open' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'open') THEN
    INSERT INTO notifications (user_id, title, message, type, action_url, metadata)
    SELECT
      p.id,
      'New opportunity',
      'New ' || NEW.type::text || ' opportunity: ' || NEW.title,
      'opportunity',
      '/creator/opportunities',
      jsonb_build_object(
        'opportunity_id', NEW.id,
        'title', NEW.title,
        'type', NEW.type::text,
        'deadline', NEW.deadline
      )
    FROM profiles p
    WHERE p.role = 'creator';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS opportunity_creator_notification ON opportunities;
CREATE TRIGGER opportunity_creator_notification
  AFTER INSERT OR UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION public.notify_creators_of_opportunity();

-- updated_at maintenance (reuses Phase 2 update_updated_at function)
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['media_items','news_articles','bookings','opportunities','opportunity_applications']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at()', t);
  END LOOP;
END $$;

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_applications ENABLE ROW LEVEL SECURITY;

-- Media: public reads published items; holders of media.view also
-- read drafts; media.manage handles all writes.
DROP POLICY IF EXISTS "Media items are viewable by everyone when published" ON media_items;
CREATE POLICY "Media items are viewable by everyone when published"
  ON media_items FOR SELECT
  USING (
    (published_at IS NOT NULL AND published_at <= now())
    OR public.has_admin_permission('media.view')
  );

DROP POLICY IF EXISTS "Admins can insert media items" ON media_items;
CREATE POLICY "Admins can insert media items"
  ON media_items FOR INSERT
  WITH CHECK (public.has_admin_permission('media.manage'));

DROP POLICY IF EXISTS "Admins can update media items" ON media_items;
CREATE POLICY "Admins can update media items"
  ON media_items FOR UPDATE
  USING (public.has_admin_permission('media.manage'))
  WITH CHECK (public.has_admin_permission('media.manage'));

DROP POLICY IF EXISTS "Admins can delete media items" ON media_items;
CREATE POLICY "Admins can delete media items"
  ON media_items FOR DELETE
  USING (public.has_admin_permission('media.manage'));

-- News: public reads published articles; news.view also reads
-- drafts; news.handle all writes.
DROP POLICY IF EXISTS "Published news is viewable by everyone" ON news_articles;
CREATE POLICY "Published news is viewable by everyone"
  ON news_articles FOR SELECT
  USING (
    (status = 'published' AND published_at IS NOT NULL AND published_at <= now())
    OR public.has_admin_permission('news.view')
  );

DROP POLICY IF EXISTS "Admins can insert news articles" ON news_articles;
CREATE POLICY "Admins can insert news articles"
  ON news_articles FOR INSERT
  WITH CHECK (public.has_admin_permission('news.manage'));

DROP POLICY IF EXISTS "Admins can update news articles" ON news_articles;
CREATE POLICY "Admins can update news articles"
  ON news_articles FOR UPDATE
  USING (public.has_admin_permission('news.manage'))
  WITH CHECK (public.has_admin_permission('news.manage'));

DROP POLICY IF EXISTS "Admins can delete news articles" ON news_articles;
CREATE POLICY "Admins can delete news articles"
  ON news_articles FOR DELETE
  USING (public.has_admin_permission('news.manage'));

-- Bookings: anonymous + signed-in visitors may submit a request
-- (always as status 'new'); only bookings.view reads the table
-- and only bookings.manage changes it.
DROP POLICY IF EXISTS "Anyone can submit a booking request" ON bookings;
CREATE POLICY "Anyone can submit a booking request"
  ON bookings FOR INSERT
  WITH CHECK (
    status = 'new'
    OR public.has_admin_permission('bookings.manage')
  );

DROP POLICY IF EXISTS "Booking requests are viewable by booking admins" ON bookings;
CREATE POLICY "Booking requests are viewable by booking admins"
  ON bookings FOR SELECT
  USING (public.has_admin_permission('bookings.view'));

DROP POLICY IF EXISTS "Booking admins can update bookings" ON bookings;
CREATE POLICY "Booking admins can update bookings"
  ON bookings FOR UPDATE
  USING (public.has_admin_permission('bookings.manage'))
  WITH CHECK (public.has_admin_permission('bookings.manage'));

DROP POLICY IF EXISTS "Booking admins can delete bookings" ON bookings;
CREATE POLICY "Booking admins can delete bookings"
  ON bookings FOR DELETE
  USING (public.has_admin_permission('bookings.manage'));

-- Opportunities: public reads live, open, unexpired listings;
-- opportunities.view also reads everything else; writes need
-- opportunities.manage.
DROP POLICY IF EXISTS "Open opportunities are viewable by everyone" ON opportunities;
CREATE POLICY "Open opportunities are viewable by everyone"
  ON opportunities FOR SELECT
  USING (
    (
      status = 'open'
      AND published_at IS NOT NULL
      AND published_at <= now()
      AND (deadline IS NULL OR deadline >= CURRENT_DATE)
    )
    OR public.has_admin_permission('opportunities.view')
  );

DROP POLICY IF EXISTS "Admins can insert opportunities" ON opportunities;
CREATE POLICY "Admins can insert opportunities"
  ON opportunities FOR INSERT
  WITH CHECK (public.has_admin_permission('opportunities.manage'));

DROP POLICY IF EXISTS "Admins can update opportunities" ON opportunities;
CREATE POLICY "Admins can update opportunities"
  ON opportunities FOR UPDATE
  USING (public.has_admin_permission('opportunities.manage'))
  WITH CHECK (public.has_admin_permission('opportunities.manage'));

DROP POLICY IF EXISTS "Admins can delete opportunities" ON opportunities;
CREATE POLICY "Admins can delete opportunities"
  ON opportunities FOR DELETE
  USING (public.has_admin_permission('opportunities.manage'));

-- Applications: signed-in creators apply to live opportunities;
-- applicants read/withdraw their own; opportunities.manage reads
-- and manages everything.
DROP POLICY IF EXISTS "Creators can apply to open opportunities" ON opportunity_applications;
CREATE POLICY "Creators can apply to open opportunities"
  ON opportunity_applications FOR INSERT
  WITH CHECK (
    applicant_id = auth.uid()
    AND status = 'submitted'
    AND EXISTS (
      SELECT 1 FROM opportunities o
      WHERE o.id = opportunity_id
        AND o.status = 'open'
        AND (o.deadline IS NULL OR o.deadline >= CURRENT_DATE)
    )
  );

DROP POLICY IF EXISTS "Applicants and opportunity admins can view applications" ON opportunity_applications;
CREATE POLICY "Applicants and opportunity admins can view applications"
  ON opportunity_applications FOR SELECT
  USING (
    applicant_id = auth.uid()
    OR public.has_admin_permission('opportunities.manage')
  );

DROP POLICY IF EXISTS "Opportunity admins can update applications" ON opportunity_applications;
CREATE POLICY "Opportunity admins can update applications"
  ON opportunity_applications FOR UPDATE
  USING (public.has_admin_permission('opportunities.manage'))
  WITH CHECK (public.has_admin_permission('opportunities.manage'));

DROP POLICY IF EXISTS "Applicants can withdraw and admins can delete applications" ON opportunity_applications;
CREATE POLICY "Applicants can withdraw and admins can delete applications"
  ON opportunity_applications FOR DELETE
  USING (
    applicant_id = auth.uid()
    OR public.has_admin_permission('opportunities.manage')
  );

-- ============================================================
-- 5. STORAGE: media bucket (CMS uploads, admin-managed)
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  20971520,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/quicktime'];

DROP POLICY IF EXISTS "Media files are publicly accessible" ON storage.objects;
CREATE POLICY "Media files are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Admins can upload media files" ON storage.objects;
CREATE POLICY "Admins can upload media files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND public.has_admin_permission('media.manage'));

DROP POLICY IF EXISTS "Admins can update media files" ON storage.objects;
CREATE POLICY "Admins can update media files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'media' AND public.has_admin_permission('media.manage'))
  WITH CHECK (bucket_id = 'media' AND public.has_admin_permission('media.manage'));

DROP POLICY IF EXISTS "Admins can delete media files" ON storage.objects;
CREATE POLICY "Admins can delete media files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND public.has_admin_permission('media.manage'));

-- ============================================================
-- 6. GRANTS
-- ============================================================
-- Re-state the grants so this migration is safe on any project
-- configuration. RLS remains the data-level guard. The anon
-- INSERT on bookings is what powers the public booking form.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT INSERT ON public.bookings TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- ============================================================
-- 7. SEEDS
-- ============================================================

-- Permissions (keep in sync with src/lib/permissions.ts).
-- media/news/bookings keys already exist from the Phase 3 seed;
-- only the opportunities keys are new.
INSERT INTO admin_permissions (key, label, category, description, sort_order) VALUES
  ('opportunities.view', 'View opportunities', 'Content', 'View casting calls and crew opportunities.', 34),
  ('opportunities.manage', 'Manage opportunities', 'Content', 'Create, edit and publish opportunities.', 35)
ON CONFLICT (key) DO NOTHING;

-- Role preset additions (keep in sync with ROLE_PERMISSION_PRESETS
-- in src/lib/permissions.ts). Existing preset rows are untouched.
INSERT INTO admin_role_permissions (role_id, permission_key)
SELECT r.id, ap.key
FROM admin_roles r
JOIN (VALUES
  ('admin', 'opportunities.view'), ('admin', 'opportunities.manage'),
  ('editor', 'opportunities.view'), ('editor', 'opportunities.manage'),
  ('viewer', 'opportunities.view')
) AS presets(role_key, perm_key) ON presets.role_key = r.key
JOIN admin_permissions ap ON ap.key = presets.perm_key
ON CONFLICT (role_id, permission_key) DO NOTHING;

-- ============================================================
-- 8. DONE
-- ============================================================
-- After running this file:
--   * Admin CMS pages: /admin/media, /admin/news, /admin/bookings,
--     /admin/opportunities
--   * Public site reads live data at /media, /news, /booking,
--     /services
--   * Creators see open opportunities at /creator/opportunities
-- ============================================================
