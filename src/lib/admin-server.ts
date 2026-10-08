import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerAuthClient, getServerSession } from "@/lib/auth-server";
import { isSupabaseConfigured } from "@/lib/supabase-browser";
import { ALL_PERMISSION_KEYS, hasPermission, isAdminRole } from "@/lib/permissions";
import { Administrator, PermissionKey, Profile } from "@/types";

export interface AdminContext {
  userId: string;
  email: string | null;
  profile: Profile;
  administrator: Administrator | null;
  isSuperAdmin: boolean;
  permissions: ReadonlySet<PermissionKey>;
}

/**
 * Resolve the admin context for the current request (cached per request).
 * Returns null when the user is signed out, is not an admin role, or has
 * no active administrator record.
 */
export const getAdminContext = cache(async (): Promise<AdminContext | null> => {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createServerAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || !isAdminRole(profile.role)) return null;

  const isSuperAdmin = profile.role === "super_admin";

  const base = {
    userId: user.id,
    email: user.email ?? null,
    profile: profile as Profile,
    administrator: null as Administrator | null,
    isSuperAdmin,
    permissions: new Set<PermissionKey>(
      isSuperAdmin ? ALL_PERMISSION_KEYS : []
    ),
  };

  if (isSuperAdmin) return base;

  const { data: administrator } = await supabase
    .from("administrators")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!administrator || administrator.status !== "active") return null;

  const { data: grants } = await supabase
    .from("admin_permission_grants")
    .select("permission_key")
    .eq("administrator_id", administrator.id);

  const permissions = new Set<PermissionKey>(
    (grants ?? []).map((g) => g.permission_key as PermissionKey)
  );

  return {
    ...base,
    administrator: administrator as Administrator,
    permissions,
  };
});

/**
 * Require a signed-in admin (any admin role with an active administrator
 * record, or Super Admin). Redirects unauthenticated users to the login
 * page and authenticated non-admins to their dashboard.
 */
export async function requireAdminAccess(): Promise<AdminContext> {
  if (!isSupabaseConfigured()) {
    // Cannot verify identity without configuration: never render admin UI.
    redirect("/auth/login?redirect=%2Fadmin");
  }

  const session = await getServerSession();
  if (!session) {
    redirect("/auth/login?redirect=%2Fadmin");
  }

  const context = await getAdminContext();
  if (!context) {
    redirect("/dashboard");
  }
  return context;
}

/**
 * Require a specific permission inside an admin page. Unauthenticated
 * users go to login; admins lacking the permission are sent back to
 * their dashboard (RLS remains the final data-level guard).
 */
export async function requirePermission(key: PermissionKey): Promise<AdminContext> {
  const context = await requireAdminAccess();
  if (!hasPermission(context.permissions, key)) {
    redirect("/dashboard");
  }
  return context;
}
