import { requirePermission } from "@/lib/admin-server";
import { hasPermission } from "@/lib/permissions";
import { OpportunitiesClient } from "@/components/admin/opportunities-client";

export const dynamic = "force-dynamic";

export default async function AdminOpportunitiesPage() {
  const context = await requirePermission("opportunities.view");
  const canManage = hasPermission(context.permissions, "opportunities.manage");

  return <OpportunitiesClient canManage={canManage} />;
}
