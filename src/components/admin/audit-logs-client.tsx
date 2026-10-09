"use client";

import { useCallback, useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase-browser";
import { getDbErrorMessage } from "@/lib/errors";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditLog } from "@/types";
import { ScrollText, Search } from "lucide-react";

export function AuditLogsClient() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchLogs = useCallback(async () => {
    const supabase = getBrowserClient();
    const { data, error: queryError } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (queryError) {
      setError(getDbErrorMessage(queryError));
      return;
    }
    setLogs((data ?? []) as AuditLog[]);
    setError(null);
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchLogs();
      setLoading(false);
    };
    run();
  }, [fetchLogs]);

  const filtered = logs.filter((log) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.entity_type.toLowerCase().includes(term) ||
      (log.actor_label ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Immutable record of administrative actions (most recent 200 entries)."
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search actions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-44 bg-transparent text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring sm:w-56"
              aria-label="Search audit logs"
            />
          </div>
        }
      />

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="h-6 w-6" />}
          title={logs.length === 0 ? "No audit activity yet" : "No matching entries"}
          description={
            logs.length === 0
              ? "Administrative actions such as invitations, permission changes and content updates will appear here."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-semibold">Action</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Entity</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Actor</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Details</th>
                  <th scope="col" className="px-4 py-3 font-semibold">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-accent/40 transition-colors align-top">
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{log.entity_type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{log.actor_label || "system"}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs">
                      <span className="line-clamp-2 text-xs">
                        {Object.keys(log.metadata ?? {}).length > 0
                          ? JSON.stringify(log.metadata)
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                      {new Date(log.created_at).toLocaleString("en-GH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
