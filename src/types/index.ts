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
  department: "executive" | "production" | "talent" | "digital";
  bio: string | null;
  image_url: string | null;
  moniker: string | null;
  instagram: string | null;
  linkedin: string | null;
  tiktok: string | null;
  display_order: number;
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
  status: "pending" | "contacted" | "quoted" | "confirmed" | "completed" | "cancelled";
  assigned_to: string | null; // References profiles.id
  notes: string | null;
  quoted_amount: number | null;
  deposit_paid: boolean;
  deposit_amount: number | null;
}

// Notifications
export interface Notification extends BaseEntity {
  user_id: string; // References profiles.id
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "booking" | "system";
  read: boolean;
  action_url: string | null;
  metadata: Record<string, unknown> | null;
}

// Admin roles & permissions
export type AdminRole = "super_admin" | "admin" | "editor" | "viewer";

export interface AdminPermission {
  resource: "members" | "creators" | "team" | "news" | "media" | "bookings" | "services" | "users" | "settings";
  actions: ("create" | "read" | "update" | "delete" | "publish" | "manage")[];
}

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    { resource: "members", actions: ["create", "read", "update", "delete"] },
    { resource: "creators", actions: ["create", "read", "update", "delete"] },
    { resource: "team", actions: ["create", "read", "update", "delete"] },
    { resource: "news", actions: ["create", "read", "update", "delete", "publish"] },
    { resource: "media", actions: ["create", "read", "update", "delete"] },
    { resource: "bookings", actions: ["create", "read", "update", "delete", "manage"] },
    { resource: "services", actions: ["create", "read", "update", "delete"] },
    { resource: "users", actions: ["create", "read", "update", "delete", "manage"] },
    { resource: "settings", actions: ["read", "update", "manage"] },
  ],
  admin: [
    { resource: "members", actions: ["create", "read", "update"] },
    { resource: "creators", actions: ["create", "read", "update"] },
    { resource: "team", actions: ["create", "read", "update"] },
    { resource: "news", actions: ["create", "read", "update", "publish"] },
    { resource: "media", actions: ["create", "read", "update"] },
    { resource: "bookings", actions: ["read", "update", "manage"] },
    { resource: "services", actions: ["create", "read", "update"] },
    { resource: "users", actions: ["read"] },
    { resource: "settings", actions: ["read"] },
  ],
  editor: [
    { resource: "members", actions: ["read"] },
    { resource: "creators", actions: ["read"] },
    { resource: "team", actions: ["read"] },
    { resource: "news", actions: ["create", "read", "update"] },
    { resource: "media", actions: ["create", "read", "update"] },
    { resource: "bookings", actions: ["read"] },
    { resource: "services", actions: ["read"] },
    { resource: "users", actions: [] },
    { resource: "settings", actions: [] },
  ],
  viewer: [
    { resource: "members", actions: ["read"] },
    { resource: "creators", actions: ["read"] },
    { resource: "team", actions: ["read"] },
    { resource: "news", actions: ["read"] },
    { resource: "media", actions: ["read"] },
    { resource: "bookings", actions: ["read"] },
    { resource: "services", actions: ["read"] },
    { resource: "users", actions: [] },
    { resource: "settings", actions: [] },
  ],
};

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