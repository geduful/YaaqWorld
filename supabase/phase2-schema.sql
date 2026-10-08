-- ============================================================
-- YAAQ World Phase 2: Authentication, Members, Creators, RLS
-- ============================================================
-- Run this in the Supabase SQL Editor to create/verify the
-- Phase 2 database schema and security policies.
-- ============================================================

-- ============================================================
-- 1. ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('member', 'creator', 'admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE institution_type AS ENUM ('university', 'polytechnic', 'college', 'training', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE availability AS ENUM ('full_time', 'part_time', 'freelance', 'student');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE social_platform AS ENUM ('instagram', 'tiktok', 'linkedin', 'portfolio', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'announcement', 'opportunity', 'casting', 'crew', 'booking', 'system',
    'info', 'success', 'warning', 'error'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 2. TABLES
-- ============================================================

-- Institutions (extensible: any Ghanaian institution)
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT,
  location TEXT,
  type institution_type NOT NULL DEFAULT 'other',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_institutions_active ON institutions (is_active);
CREATE INDEX IF NOT EXISTS idx_institutions_name ON institutions (name);

-- Creator types (extensible talent categories)
CREATE TABLE IF NOT EXISTS creator_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles: one row per auth.users.id
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'member',
  department TEXT CHECK (department IN ('executive', 'production', 'talent', 'digital')),
  bio TEXT,
  moniker TEXT,
  instagram TEXT,
  linkedin TEXT,
  tiktok TEXT,
  whatsapp TEXT,
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  level TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_institution ON profiles (institution_id);

-- Members (public/student registrations)
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  student_id TEXT,
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  program TEXT,
  level TEXT,
  interests TEXT[] NOT NULL DEFAULT '{}',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_members_profile ON members (profile_id);

-- Creators
CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  creator_type_id UUID REFERENCES creator_types(id) ON DELETE SET NULL,
  bio TEXT,
  portfolio_url TEXT,
  additional_portfolio_url TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  availability availability,
  is_public BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  completed_projects INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_creators_profile ON creators (profile_id);
CREATE INDEX IF NOT EXISTS idx_creators_public ON creators (is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_creators_type ON creators (creator_type_id);

-- Creator social links
CREATE TABLE IF NOT EXISTS creator_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (creator_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_creator_links_creator ON creator_social_links (creator_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (user_id) WHERE read = false;

-- ============================================================
-- 3. AUTO-PROFILE TRIGGER
-- ============================================================

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
        WHEN meta_role IN ('member', 'creator', 'admin', 'super_admin')
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles','members','creators','creator_social_links','notifications','institutions','creator_types']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at()', t);
  END LOOP;
END $$;

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Institutions: public read, admin write
DROP POLICY IF EXISTS "Institutions are viewable by everyone" ON institutions;
CREATE POLICY "Institutions are viewable by everyone"
  ON institutions FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Only admins manage institutions" ON institutions;
CREATE POLICY "Only admins manage institutions"
  ON institutions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Creator types: public read, admin write
DROP POLICY IF EXISTS "Creator types are viewable by everyone" ON creator_types;
CREATE POLICY "Creator types are viewable by everyone"
  ON creator_types FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Only admins manage creator types" ON creator_types;
CREATE POLICY "Only admins manage creator types"
  ON creator_types FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Profiles: users read/update own profile only; role never updatable by user
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Public creators viewable by everyone" ON profiles;
CREATE POLICY "Public creators viewable by everyone"
  ON profiles FOR SELECT
  USING (
    role = 'creator'
    AND EXISTS (
      SELECT 1 FROM creators c
      WHERE c.profile_id = profiles.id
        AND c.is_public = true
    )
  );

DROP POLICY IF EXISTS "Users can update own profile (no role change)" ON profiles;
CREATE POLICY "Users can update own profile (no role change)"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Only admins can change roles" ON profiles;
CREATE POLICY "Only admins can change roles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'super_admin'
    )
  )
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users cannot insert arbitrary profiles" ON profiles;
CREATE POLICY "Users cannot insert arbitrary profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Members: users manage own rows only
DROP POLICY IF EXISTS "Members can view own record" ON members;
CREATE POLICY "Members can view own record"
  ON members FOR SELECT
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Members can insert own record" ON members;
CREATE POLICY "Members can insert own record"
  ON members FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Members can update own record" ON members;
CREATE POLICY "Members can update own record"
  ON members FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Admins can view all members" ON members;
CREATE POLICY "Admins can view all members"
  ON members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Creators: manage own rows; public creator rows viewable by everyone
DROP POLICY IF EXISTS "Creators can view own record" ON creators;
CREATE POLICY "Creators can view own record"
  ON creators FOR SELECT
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Public creators viewable" ON creators;
CREATE POLICY "Public creators viewable"
  ON creators FOR SELECT
  USING (is_public = true);

DROP POLICY IF EXISTS "Creators can insert own record" ON creators;
CREATE POLICY "Creators can insert own record"
  ON creators FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Creators can update own record" ON creators;
CREATE POLICY "Creators can update own record"
  ON creators FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Admins can view all creators" ON creators;
CREATE POLICY "Admins can view all creators"
  ON creators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Admins can manage creators" ON creators;
CREATE POLICY "Admins can manage creators"
  ON creators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Creator social links: manage through owning creator record
DROP POLICY IF EXISTS "Creator links viewable" ON creator_social_links;
CREATE POLICY "Creator links viewable"
  ON creator_social_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM creators c
      WHERE c.id = creator_id
        AND (c.is_public = true OR c.profile_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Creators manage own links" ON creator_social_links;
CREATE POLICY "Creators manage own links"
  ON creator_social_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM creators c
      WHERE c.id = creator_id
        AND c.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM creators c
      WHERE c.id = creator_id
        AND c.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins manage all creator links" ON creator_social_links;
CREATE POLICY "Admins manage all creator links"
  ON creator_social_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Notifications: users read/mark own only; nobody inserts via client (server only)
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can mark own notifications read" ON notifications;
CREATE POLICY "Users can mark own notifications read"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users cannot insert notifications" ON notifications;
CREATE POLICY "Users cannot insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (false);

-- ============================================================
-- 5. STORAGE: avatars bucket
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND (storage.foldername(name))[1] IS NOT NULL
    AND (
      COALESCE(
        (storage.foldername(name))[1] = auth.uid()::text,
        false
      )
      OR name LIKE auth.uid()::text || '.%'
    )
  );

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (name LIKE auth.uid()::text || '.%' OR (storage.foldername(name))[1] = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (name LIKE auth.uid()::text || '.%' OR (storage.foldername(name))[1] = auth.uid()::text)
  );

-- ============================================================
-- 6. SEED: Institutions (Ghanaian tertiary institutions)
-- ============================================================

INSERT INTO institutions (name, short_name, location, type) VALUES
  ('Koforidua Technical University', 'KTU', 'Koforidua, Eastern Region', 'polytechnic'),
  ('Kwame Nkrumah University of Science and Technology', 'KNUST', 'Kumasi, Ashanti Region', 'university'),
  ('University of Ghana', 'UG', 'Legon, Greater Accra Region', 'university'),
  ('University of Cape Coast', 'UCC', 'Cape Coast, Central Region', 'university'),
  ('University of Education, Winneba', 'UEW', 'Winneba, Central Region', 'university'),
  ('University of Professional Studies, Accra', 'UPSA', 'Accra, Greater Accra Region', 'university'),
  ('Accra Technical University', 'ATU', 'Accra, Greater Accra Region', 'polytechnic'),
  ('Tamale Technical University', 'TaTU', 'Tamale, Northern Region', 'polytechnic'),
  ('Ho Technical University', 'HTU', 'Ho, Volta Region', 'polytechnic'),
  ('Sunyani Technical University', 'STU', 'Sunyani, Bono Region', 'polytechnic'),
  ('Bolgatanga Technical University', 'BTU', 'Bolgatanga, Upper East Region', 'polytechnic'),
  ('Wa Technical University', 'WTU', 'Wa, Upper West Region', 'polytechnic'),
  ('Other Institution', NULL, 'Ghana', 'other')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. SEED: Creator types
-- ============================================================

INSERT INTO creator_types (name, slug, display_order) VALUES
  ('Photographer', 'photographer', 1),
  ('Videographer', 'videographer', 2),
  ('Video Editor', 'video-editor', 3),
  ('Graphic Designer', 'graphic-designer', 4),
  ('Model', 'model', 5),
  ('Presenter', 'presenter', 6),
  ('Content Creator', 'content-creator', 7),
  ('Influencer', 'influencer', 8),
  ('Social Media Manager', 'social-media-manager', 9),
  ('Writer', 'writer', 10),
  ('Other', 'other', 11)
ON CONFLICT (slug) DO NOTHING;
