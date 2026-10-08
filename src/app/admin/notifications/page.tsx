import { requirePermission } from "@/lib/admin-server";
import { hasPermission } from "@/lib/permissions";
import { AnnouncementsClient } from "@/components/admin/announcements-client";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const context = await requirePermission("notifications.view");
  const canManage = hasPermission(context.permissions, "notifications.manage");

  return <AnnouncementsClient canManage={canManage} />;
}
