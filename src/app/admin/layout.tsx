import { ReactNode } from "react";
import { requireAdminAccess } from "@/lib/admin-server";
import { ADMIN_ROUTE_PERMISSIONS, hasPermission } from "@/lib/permissions";
import { AdminShell } from "@/components/admin/admin-shell";

// Admin areas are personalized and permission-gated: always render dynamically.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const context = await requireAdminAccess();

  const visibleNav = Object.entries(ADMIN_ROUTE_PERMISSIONS)
    .filter(([, permission]) => hasPermission(context.permissions, permission))
    .map(([route]) => route);

  const adminName =
    context.profile.full_name || context.administrator?.display_name || context.email || "Administrator";

  return (
    <AdminShell visibleNav={visibleNav} isSuperAdmin={context.isSuperAdmin} adminName={adminName}>
      {children}
    </AdminShell>
  );
}
