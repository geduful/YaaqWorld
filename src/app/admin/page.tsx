import Link from "next/link";
import { ReactNode } from "react";
import { requirePermission } from "@/lib/admin-server";
import { hasPermission } from "@/lib/permissions";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createServerAuthClient } from "@/lib/auth-server";
import { getDbErrorMessage } from "@/lib/errors";
import { AuditLog, PermissionKey } from "@/types";
import { PostgrestError } from "@supabase/supabase-js";
import {
  Users,
  Star,
  LayoutGrid,
  UserCog,
  ShieldCheck,
  ScrollText,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

type CountResult = { count: number; error?: never } | { count?: never; error: PostgrestError };

async function countRows(
  supabase: Awaited<ReturnType<typeof createServerAuthClient>>,
  table: string,
  filters?: { column: string; value: string }
): Promise<CountResult> {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (filters) query = query.eq(filters.column, filters.value);
  const { count, error } = await query;
  if (error) return { error };
  return { count: count ?? 0 };
}

export default async function AdminOverviewPage() {
  const context = await requirePermission("dashboard.view");
  const supabase = await createServerAuthClient();

  const can = (key: PermissionKey) => hasPermission(context.permissions, key);

  const [memberResult, creatorResult, teamResult, adminResult] = await Promise.all([
    can("members.view") ? countRows(supabase, "profiles", { column: "role", value: "member" }) : Promise.resolve(undefined),
    can("creators.view") ? countRows(supabase, "creators") : Promise.resolve(undefined),
    can("team.view") ? countRows(supabase, "team_members", { column: "is_active", value: "true" }) : Promise.resolve(undefined),
    can("administrators.view")
      ? countRows(supabase, "administrators", { column: "status", value: "active" })
      : Promise.resolve(undefined),
  ]);

  const memberCount = memberResult?.count ?? null;
  const creatorCount = creatorResult?.count ?? null;
  const teamCount = teamResult?.count ?? null;
  const adminCount = adminResult?.count ?? null;

  const auditQuery = can("audit_logs.view")
    ? await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8)
    : { data: [] as AuditLog[], error: null };

  const recentAudit: AuditLog[] = (auditQuery.data ?? []) as AuditLog[];

  const firstError: PostgrestError | undefined = [
    auditQuery.error ?? undefined,
    memberResult?.error,
    creatorResult?.error,
    teamResult?.error,
    adminResult?.error,
  ].find((value) => value !== undefined);
  const loadError = firstError ? getDbErrorMessage(firstError) : null;

  const quickActionList: {
    name: string;
    href: string;
    icon: ReactNode;
    permission: PermissionKey;
  }[] = [
    { name: "Members", href: "/admin/members", icon: <Users className="h-5 w-5" />, permission: "members.view" },
    { name: "Creators", href: "/admin/creators", icon: <Star className="h-5 w-5" />, permission: "creators.view" },
    { name: "Team", href: "/admin/team", icon: <LayoutGrid className="h-5 w-5" />, permission: "team.view" },
    { name: "Administrators", href: "/admin/administrators", icon: <UserCog className="h-5 w-5" />, permission: "administrators.view" },
  ];
  const quickActions = quickActionList.filter((action) => can(action.permission));

  const stats: { label: string; value: number | null | "—"; icon: ReactNode }[] = [];
  if (can("members.view")) stats.push({ label: "Members", value: memberCount ?? "—", icon: <Users className="h-5 w-5" /> });
  if (can("creators.view")) stats.push({ label: "Creators", value: creatorCount ?? "—", icon: <Star className="h-5 w-5" /> });
  if (can("team.view")) stats.push({ label: "Active Team", value: teamCount ?? "—", icon: <LayoutGrid className="h-5 w-5" /> });
  if (can("administrators.view")) stats.push({ label: "Active Admins", value: adminCount ?? "—", icon: <UserCog className="h-5 w-5" /> });

  const auditRows =
    recentAudit.length > 0 ? (
      <div className="divide-y divide-border">
        {recentAudit.map((log) => (
          <div key={log.id} className="flex items-start justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground break-words">{log.action}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {log.entity_type}
                {log.actor_label ? ` · ${log.actor_label}` : ""}
              </p>
            </div>
            <time
              className="text-xs text-muted-foreground whitespace-nowrap"
              dateTime={log.created_at}
            >
              {new Date(log.created_at).toLocaleString("en-GH", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </div>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={<ScrollText className="h-6 w-6" />}
        title="No audit activity yet"
        description="Administrative actions will be recorded here."
      />
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Overview"
        description={`Signed in as ${context.email ?? "administrator"}${
          context.isSuperAdmin ? " · Super Admin" : ""
        }`}
        actions={
          <Link href="/admin/settings">
            <Button variant="outline" size="sm" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        }
      />

      {loadError && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{loadError}</span>
        </div>
      )}

      {stats.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
          ))}
        </div>
      )}

      {quickActions.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="h-full transition-all hover:border-yaaq-gold/50 group">
                <CardContent className="p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yaaq-gold/10 text-yaaq-gold-ink">
                    {action.icon}
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-foreground group-hover:text-yaaq-gold-ink transition-colors">
                    {action.name}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-yaaq-gold-ink" aria-hidden="true" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest audited administrative actions</CardDescription>
          </CardHeader>
          <CardContent>{auditRows}</CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Access</CardTitle>
              <CardDescription>Effective permissions for this session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <Badge variant="gold" className="capitalize">
                  {context.isSuperAdmin ? "Super Admin" : "Administrator"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Access level</span>
                <span className="text-sm font-medium text-foreground">
                  {context.isSuperAdmin
                    ? "Super Admin (all permissions)"
                    : `${context.permissions.size} granted permission${context.permissions.size === 1 ? "" : "s"}`}
                </span>
              </div>
              {!context.isSuperAdmin && !context.permissions.has("administrators.manage") && (
                <p className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-warning" aria-hidden="true" />
                  Administrator management is restricted to Super Admin accounts.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-yaaq-navy text-white border-none">
            <CardContent className="p-6">
              <p className="font-display text-lg font-semibold">Need the full picture?</p>
              <p className="mt-1 text-sm text-white/70">
                Open the audit trail to review every administrative change.
              </p>
              <Link href="/admin/audit-logs" className="mt-4 block">
                <Button variant="gold" size="sm" className="gap-2">
                  View Audit Logs
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
