import { requirePermission } from "@/lib/admin-server";
import { hasPermission } from "@/lib/permissions";
import { BookingsClient } from "@/components/admin/bookings-client";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const context = await requirePermission("bookings.view");
  const canManage = hasPermission(context.permissions, "bookings.manage");

  return <BookingsClient canManage={canManage} />;
}
