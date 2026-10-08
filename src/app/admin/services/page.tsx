import { requirePermission } from "@/lib/admin-server";
import { hasPermission } from "@/lib/permissions";
import { ServicesClient } from "@/components/admin/services-client";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const context = await requirePermission("services.view");
  const canManage = hasPermission(context.permissions, "services.manage");

  return <ServicesClient canManage={canManage} />;
}
