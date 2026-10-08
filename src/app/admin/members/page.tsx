import { requirePermission } from "@/lib/admin-server";
import { hasPermission } from "@/lib/permissions";
import { MembersClient } from "@/components/admin/members-client";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const context = await requirePermission("members.view");
  const canManage = hasPermission(context.permissions, "members.manage");

  return <MembersClient canManage={canManage} />;
}
