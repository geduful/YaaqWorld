import { requirePermission } from "@/lib/admin-server";
import { hasPermission } from "@/lib/permissions";
import { AdministratorsClient } from "@/components/admin/administrators-client";

export const dynamic = "force-dynamic";

export default async function AdminAdministratorsPage() {
  const context = await requirePermission("administrators.view");
  // administrators.manage is never grantable: only Super Admin can manage.
  const canManage = hasPermission(context.permissions, "administrators.manage");

  return (
    <AdministratorsClient currentUserId={context.userId} canManage={canManage} />
  );
}
