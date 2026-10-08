import { requirePermission } from "@/lib/admin-server";
import { hasPermission } from "@/lib/permissions";
import { CreatorsClient } from "@/components/admin/creators-client";

export const dynamic = "force-dynamic";

export default async function AdminCreatorsPage() {
  const context = await requirePermission("creators.view");
  const canManage = hasPermission(context.permissions, "creators.manage");

  return <CreatorsClient canManage={canManage} />;
}
