import { requirePermission } from "@/lib/admin-server";
import { AuditLogsClient } from "@/components/admin/audit-logs-client";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  await requirePermission("audit_logs.view");

  return <AuditLogsClient />;
}
