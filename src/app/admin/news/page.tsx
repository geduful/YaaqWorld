import { requirePermission } from "@/lib/admin-server";
import { hasPermission } from "@/lib/permissions";
import { NewsClient } from "@/components/admin/news-client";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const context = await requirePermission("news.view");
  const canManage = hasPermission(context.permissions, "news.manage");

  return <NewsClient canManage={canManage} />;
}
