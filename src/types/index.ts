// YAAQ World Type Definitions
// These types correspond to future Supabase table schemas

// Base types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// User profiles (Supabase Auth + custom profile)
export interface Profile extends BaseEntity {
  id: string; // References auth.users.id
  full_name: string | null;
  avatar_url: string | null;
  role: "member" | "creator" | "admin" | "super_admin";
  department: "executive" | "production" | "talent" | "digital" | null;
  bio: string | null;
  moniker: string | null;
  instagram: string | null;
  linkedin: string | null;
  tiktok: string | null;
  whatsapp: string | null;
  institution_id: string | null;
  level: string | null;
  is_active: boolean;
  email_verified: boolean;
  last_sign_in_at: string | null;
}

// Institutions
export interface Institution extends BaseEntity {
  name: string;
  short_name: string | null;
  location: string | null;
  is_active: boolean;
  type: "university" | "polytechnic" | "college" | "training" | "other";
}

// Creator Types (extensible)
export interface CreatorType extends BaseEntity {
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  display_order: number;
}

// Members (public registration)
export interface Member extends BaseEntity {
  profile_id: string; // References profiles.id
  student_id: string | null;
  institution_id: string | null;
  program: string | null;
  level: string | null;
  interests: string[];
  joined_at: string;
}

// Creators (content creators)
export interface Creator extends BaseEntity {
  profile_id: string; // References profiles.id
  creator_type_id: string | null;
  bio: string | null;
  portfolio_url: string | null;
  additional_portfolio_url: string | null;
  skills: string[];
  availability: "full_time" | "part_time" | "freelance" | "student" | null;
  is_public: boolean;
  rating: number;
  completed_projects: number;
}

// Creator Social Links
export interface CreatorSocialLink extends BaseEntity {
  creator_id: string;
  platform: "instagram" | "tiktok" | "linkedin" | "portfolio" | "other";
  url: string;
  display_order: number;
}

// Team members (internal team)
export interface TeamMember extends BaseEntity {
  full_name: string;
  role: string;
  department: "executive" | "editorial" | "creative" | "digital" | "operations";
  bio: string | null;
  image_url: string | null;
  moniker: string | null;
  instagram: string | null;
  linkedin: string | null;
  tiktok: string | null;
  email: string | null;
  profile_id: string | null;
  display_order: number;
  on_board: boolean;
  is_active: boolean;
}

// Services
export interface Service extends BaseEntity {
  title: string;
  slug: string;
  description: string;
  short_description: string | null;
  category: "core" | "partnership" | "consulting" | "content";
  icon: string | null;
  image_url: string | null;
  features: string[];
  cta_text: string;
  pricing_note: string | null; // null = inquiry-based pricing
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
}

// Media
export interface Media extends BaseEntity {
  title: string;
  slug: string;
  type: "image" | "video";
  thumbnail_url: string;
  media_url: string | null; // For video files
  category: string;
  duration: string | null; // For videos
  description: string | null;
  tags: string[];
  featured: boolean;
  published_at: string | null;
  youtube_id: string | null;
  vimeo_id: string | null;
}

// News/Articles
export interface NewsArticle extends BaseEntity {
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown or HTML
  featured_image_url: string | null;
  category: string;
  tags: string[];
  author_id: string | null; // References profiles.id
  published_at: string | null;
  read_time: number; // Minutes
  featured: boolean;
  status: "draft" | "published" | "archived";
  seo_title: string | null;
  seo_description: string | null;
}

// Bookings
export interface Booking extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  organization: string | null;
  service_id: string | null; // References services.id
  service_category: string;
  event_date: string;
  location: string;
  details: string;
  budget: string | null;
  status: "new" | "pending" | "contacted" | "quoted" | "confirmed" | "completed" | "cancelled" | "declined";
  assigned_to: string | null; // References profiles.id
  notes: string | null;
  quoted_amount: number | null;
  deposit_paid: boolean;
  deposit_amount: number | null;
}

// Creator opportunities (casting calls, crew recruitment, production roles)
export interface CreatorOpportunity extends BaseEntity {
  title: string;
  slug: string;
  type: "casting" | "crew" | "production" | "other";
  description: string;
  requirements: string | null;
  location: string | null;
  compensation: string | null;
  deadline: string | null;
  status: "draft" | "open" | "closed" | "archived";
  published_at: string | null;
  apply_url: string | null;
  created_by: string | null;
}

export interface OpportunityApplication extends BaseEntity {
  opportunity_id: string;
  applicant_id: string;
  cover_note: string | null;
  portfolio_url: string | null;
  status: "submitted" | "shortlisted" | "accepted" | "rejected";
}

// Ambassadors
export interface Ambassador extends BaseEntity {
  profile_id: string;
  institution_id: string;
  full_name: string;
  photo_url: string | null;
  phone: string;
  instagram: string | null;
  tiktok: string | null;
  twitter: string | null;
  message: string | null;
  status: "pending" | "approved" | "rejected" | "revoked";
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

export interface AmbassadorWithRelations extends Ambassador {
  institutions?: Pick<Institution, "id" | "name" | "short_name" | "location"> | null;
}

// Notifications
export interface Notification extends BaseEntity {
  user_id: string; // References profiles.id
  title: string;
  message: string;
  type: "announcement" | "opportunity" | "casting" | "crew" | "booking" | "system" | "info" | "success" | "warning" | "error";
  read: boolean;
  action_url: string | null;
  metadata: Record<string, unknown> | null;
}

// Admin roles & permissions (Phase 3 permission-based model)
// AdminRole keys map to admin_roles.key rows in the database.
export type AdminRole = "super_admin" | "admin" | "editor" | "viewer";

// Flat permission keys. Keep in sync with src/lib/permissions.ts and the
// seed data in supabase/phase3-schema.sql (admin_permissions table).
export type PermissionKey =
  | "dashboard.view"
  | "members.view"
  | "members.manage"
  | "creators.view"
  | "creators.manage"
  | "team.view"
  | "team.manage"
  | "services.view"
  | "services.manage"
  | "media.view"
  | "media.manage"
  | "news.view"
  | "news.manage"
  | "bookings.view"
  | "bookings.manage"
  | "opportunities.view"
  | "opportunities.manage"
  | "ambassadors.view"
  | "ambassadors.manage"
  | "notifications.view"
  | "notifications.manage"
  | "administrators.view"
  | "administrators.manage"
  | "settings.view"
  | "settings.manage"
  | "audit_logs.view";

export type AdminStatus = "invited" | "active" | "suspended" | "revoked";
export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";
export type AnnouncementAudience = "all" | "members" | "creators" | "selected";
export type AnnouncementStatus = "draft" | "published";

// Administrator record (one row per official invited/granted by Super Admin)
export interface Administrator extends BaseEntity {
  profile_id: string | null;
  email: string;
  display_name: string | null;
  role_id: string;
  previous_role: "member" | "creator" | "admin" | null;
  status: AdminStatus;
  invited_by: string | null;
  invited_at: string;
  accepted_at: string | null;
  suspended_at: string | null;
  revoked_at: string | null;
  last_activity_at: string | null;
}

export interface AdminRoleRecord extends BaseEntity {
  key: AdminRole;
  name: string;
  description: string | null;
  is_system: boolean;
}

export interface AdminPermissionDef {
  key: PermissionKey;
  label: string;
  category: string;
  description: string | null;
  sort_order: number;
}

export interface AdminPermissionGrant extends BaseEntity {
  administrator_id: string;
  permission_key: PermissionKey;
  granted_by: string | null;
}

export interface AdminInvitation extends BaseEntity {
  email: string;
  display_name: string | null;
  role_id: string;
  permission_keys: PermissionKey[];
  status: InvitationStatus;
  administrator_id: string | null;
  invited_by: string | null;
  expires_at: string;
  accepted_at: string | null;
}

// Audit log (immutable from the client; written by RPCs and triggers)
export interface AuditLog {
  id: string;
  actor_user_id: string | null;
  actor_label: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Admin announcements (fan-out to notifications happens on publish)
export interface Announcement extends BaseEntity {
  title: string;
  message: string;
  audience: AnnouncementAudience;
  recipient_ids: string[];
  status: AnnouncementStatus;
  type: string;
  action_url: string | null;
  recipient_count: number;
  published_at: string | null;
  created_by: string | null;
}

// Platform settings (key/value JSON store)
export interface PlatformSetting {
  key: string;
  value: unknown;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  organization: string;
  service: string;
  eventDate: string;
  location: string;
  details: string;
  budget?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface NewsletterFormData {
  email: string;
}

// Component prop types
export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface StructuredData {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
}

// Registration Form Types
export interface MemberRegistrationData {
  fullName: string;
  email: string;
  whatsapp: string;
  institutionId: string;
  level: string;
  password: string;
  confirmPassword: string;
  profilePhoto?: File | null;
  instagram?: string;
  linkedin?: string;
  tiktok?: string;
}

export interface CreatorRegistrationData extends MemberRegistrationData {
  creatorTypeId: string;
  bio: string;
  instagram: string;
  tiktok: string;
  linkedin: string;
  portfolioUrl: string;
  additionalPortfolioUrl?: string;
  skills: string[];
  availability: "full_time" | "part_time" | "freelance" | "student";
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface ProfileUpdateData {
  fullName?: string;
  avatarUrl?: string | null;
  whatsapp?: string | null;
  bio?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  tiktok?: string | null;
  level?: string | null;
  institutionId?: string | null;
}

// Password strength
export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
}

// Admin form types (Phase 3)
export interface AdminInviteFormData {
  email: string;
  displayName: string;
  roleKey: AdminRole;
  permissions: PermissionKey[];
}

export interface TeamMemberFormData {
  full_name: string;
  role: string;
  department: "executive" | "editorial" | "creative" | "digital" | "operations";
  bio: string;
  moniker: string;
  instagram: string;
  linkedin: string;
  tiktok: string;
  email: string;
  display_order: number;
  on_board: boolean;
  is_active: boolean;
  image_url: string | null;
}

export interface ServiceFormData {
  title: string;
  slug: string;
  description: string;
  short_description: string;
  category: "core" | "partnership" | "consulting" | "content";
  cta_text: string;
  pricing_note: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  features: string[];
}

export interface AnnouncementFormData {
  title: string;
  message: string;
  audience: AnnouncementAudience;
  recipient_ids: string[];
  publish_now: boolean;
}