import { requirePermission } from "@/lib/admin-server";
import { hasPermission } from "@/lib/permissions";
import { TeamClient } from "@/components/admin/team-client";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const context = await requirePermission("team.view");
  const canManage = hasPermission(context.permissions, "team.manage");

  return <TeamClient canManage={canManage} />;
}
