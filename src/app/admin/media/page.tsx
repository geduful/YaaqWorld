import { requirePermission } from "@/lib/admin-server";
import { hasPermission } from "@/lib/permissions";
import { MediaClient } from "@/components/admin/media-client";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const context = await requirePermission("media.view");
  const canManage = hasPermission(context.permissions, "media.manage");

  return <MediaClient canManage={canManage} />;
}
