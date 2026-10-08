import { requirePermission } from "@/lib/admin-server";
import { hasPermission } from "@/lib/permissions";
import { SettingsClient } from "@/components/admin/settings-client";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const context = await requirePermission("settings.view");
  const canManage = hasPermission(context.permissions, "settings.manage");

  return (
    <SettingsClient
      canManage={canManage}
      isSuperAdmin={context.isSuperAdmin}
      permissionCount={context.permissions.size}
    />
  );
}
