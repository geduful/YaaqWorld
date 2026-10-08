import { AdminRole, PermissionKey } from "@/types";

export interface PermissionDef {
  key: PermissionKey;
  label: string;
  category: string;
  description: string;
}

// Source of truth for the client. Keep in sync with the admin_permissions
// seed in supabase/phase3-schema.sql.
export const PERMISSIONS: PermissionDef[] = [
  { key: "dashboard.view", label: "View dashboard", category: "Dashboard", description: "Access the admin dashboard overview." },
  { key: "members.view", label: "View members", category: "People", description: "View the member directory and profiles." },
  { key: "members.manage", label: "Manage members", category: "People", description: "Change member account status." },
  { key: "creators.view", label: "View creators", category: "People", description: "View creator profiles and portfolios." },
  { key: "creators.manage", label: "Manage creators", category: "People", description: "Change creator visibility and profile data." },
  { key: "team.view", label: "View team", category: "Content", description: "View the official team directory." },
  { key: "team.manage", label: "Manage team", category: "Content", description: "Add, edit and remove team members." },
  { key: "services.view", label: "View services", category: "Content", description: "View the services catalogue." },
  { key: "services.manage", label: "Manage services", category: "Content", description: "Create, edit and publish services." },
  { key: "media.view", label: "View media", category: "Content", description: "View the media library." },
  { key: "media.manage", label: "Manage media", category: "Content", description: "Manage media library items." },
  { key: "news.view", label: "View news", category: "Content", description: "View news articles." },
  { key: "news.manage", label: "Manage news", category: "Content", description: "Create, edit and publish news." },
  { key: "bookings.view", label: "View bookings", category: "Operations", description: "View booking requests." },
  { key: "bookings.manage", label: "Manage bookings", category: "Operations", description: "Update booking statuses." },
  { key: "notifications.view", label: "View announcements", category: "Operations", description: "View admin announcements." },
  { key: "notifications.manage", label: "Manage announcements", category: "Operations", description: "Create and publish announcements." },
  { key: "administrators.view", label: "View administrators", category: "Administration", description: "View the administrators list." },
  { key: "administrators.manage", label: "Manage administrators", category: "Administration", description: "Super Admin only. Invite and manage administrators." },
  { key: "settings.view", label: "View settings", category: "System", description: "View platform settings." },
  { key: "settings.manage", label: "Manage settings", category: "System", description: "Change platform settings." },
  { key: "audit_logs.view", label: "View audit logs", category: "System", description: "View the administrative audit trail." },
];

export const ALL_PERMISSION_KEYS: PermissionKey[] = PERMISSIONS.map((p) => p.key);

// administrators.manage is never granted to non-Super-Admin accounts.
export const ASSIGNABLE_PERMISSION_KEYS: PermissionKey[] = PERMISSIONS.filter(
  (p) => p.key !== "administrators.manage"
).map((p) => p.key);

export function hasPermission(
  permissions: ReadonlySet<PermissionKey> | ReadonlyArray<PermissionKey> | null | undefined,
  key: PermissionKey
): boolean {
  if (!permissions) return false;
  if (permissions instanceof Set) return permissions.has(key);
  return (permissions as ReadonlyArray<PermissionKey>).includes(key);
}

export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin" || role === "super_admin";
}

// Route -> permission required to see/enter that admin section.
export const ADMIN_ROUTE_PERMISSIONS: Record<string, PermissionKey> = {
  "/admin": "dashboard.view",
  "/admin/members": "members.view",
  "/admin/creators": "creators.view",
  "/admin/team": "team.view",
  "/admin/services": "services.view",
  "/admin/notifications": "notifications.view",
  "/admin/administrators": "administrators.view",
  "/admin/audit-logs": "audit_logs.view",
  "/admin/settings": "settings.view",
};

// Permission presets applied when inviting an admin with a given role key.
// Mirrors admin_role_permissions seed data in supabase/phase3-schema.sql.
export const ROLE_PERMISSION_PRESETS: Record<Exclude<AdminRole, "super_admin">, PermissionKey[]> = {
  admin: [
    "dashboard.view",
    "members.view",
    "members.manage",
    "creators.view",
    "creators.manage",
    "team.view",
    "team.manage",
    "services.view",
    "services.manage",
    "notifications.view",
    "notifications.manage",
    "media.view",
    "news.view",
    "bookings.view",
    "settings.view",
    "audit_logs.view",
  ],
  editor: [
    "dashboard.view",
    "members.view",
    "creators.view",
    "team.view",
    "team.manage",
    "services.view",
    "media.view",
    "media.manage",
    "news.view",
    "news.manage",
    "notifications.view",
    "bookings.view",
  ],
  viewer: [
    "dashboard.view",
    "members.view",
    "creators.view",
    "team.view",
    "services.view",
    "media.view",
    "news.view",
    "notifications.view",
    "bookings.view",
  ],
};
