import { requirePermission } from "@/lib/admin-server";
import { hasPermission } from "@/lib/permissions";
import { AmbassadorsClient } from "@/components/admin/ambassadors-client";

export const dynamic = "force-dynamic";

export default async function AdminAmbassadorsPage() {
  const context = await requirePermission("ambassadors.view");
  const canManage = hasPermission(context.permissions, "ambassadors.manage");

  return <AmbassadorsClient canManage={canManage} />;
}
