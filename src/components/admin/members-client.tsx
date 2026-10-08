"use client";

import { useCallback, useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase-browser";
import { getDbErrorMessage } from "@/lib/errors";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from "@/types";
import { Ban, CheckCircle2, Search, Users } from "lucide-react";

interface MembersClientProps {
  canManage: boolean;
}

type StatusFilter = "all" | "active" | "inactive";

export function MembersClient({ canManage }: MembersClientProps) {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [target, setTarget] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchMembers = useCallback(async () => {
    const supabase = getBrowserClient();
    setError(null);
    const { data, error: queryError } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "member")
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(getDbErrorMessage(queryError));
      return;
    }
    setMembers((data ?? []) as Profile[]);
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchMembers();
      setLoading(false);
    };
    run();
  }, [fetchMembers]);

  const toggleStatus = async () => {
    if (!target || !canManage) return;
    setSaving(true);
    setError(null);
    const supabase = getBrowserClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ is_active: !target.is_active })
      .eq("id", target.id);

    if (updateError) {
      setError(getDbErrorMessage(updateError));
    } else {
      setMembers((current) =>
        current.map((m) => (m.id === target.id ? { ...m, is_active: !target.is_active } : m))
      );
      setTarget(null);
    }
    setSaving(false);
  };

  const filtered = members.filter((member) => {
    if (statusFilter === "active" && !member.is_active) return false;
    if (statusFilter === "inactive" && member.is_active) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (member.full_name ?? "").toLowerCase().includes(term) ||
      (member.level ?? "").toLowerCase().includes(term) ||
      (member.whatsapp ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        description="Manage member accounts and their access status."
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-44 bg-transparent text-sm focus:outline-none sm:w-56"
              aria-label="Search members"
            />
          </div>
        }
      />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Member status filter">
        {(["all", "active", "inactive"] as StatusFilter[]).map((filter) => (
          <Button
            key={filter}
            variant={statusFilter === filter ? "gold" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(filter)}
            className="capitalize"
          >
            {filter}
          </Button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title={members.length === 0 ? "No members yet" : "No members match your search"}
          description={
            members.length === 0
              ? "Registered members will appear here."
              : "Try a different search term or filter."
          }
        />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-medium">Member</th>
                  <th scope="col" className="px-4 py-3 font-medium">Level</th>
                  <th scope="col" className="px-4 py-3 font-medium">Joined</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  {canManage && <th scope="col" className="px-4 py-3 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((member) => (
                  <tr key={member.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar_url || undefined} alt="" />
                          <AvatarFallback className="bg-yaaq-gold/20 text-yaaq-gold text-xs font-semibold">
                            {(member.full_name ?? "U")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {member.full_name || "Unnamed member"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.whatsapp || member.level || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{member.level || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(member.created_at).toLocaleDateString("en-GH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge kind="account" status={member.is_active ? "active" : "inactive"} />
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <Button
                          variant={member.is_active ? "destructive" : "outline"}
                          size="sm"
                          className="gap-1.5"
                          onClick={() => setTarget(member)}
                        >
                          {member.is_active ? (
                            <>
                              <Ban className="h-3.5 w-3.5" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Activate
                            </>
                          )}
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        title={target?.is_active ? "Deactivate member?" : "Activate member?"}
        description={
          target?.is_active
            ? `${target?.full_name || "This member"} will lose access to their account until reactivated.`
            : `${target?.full_name || "This member"} will regain access to their account.`
        }
        confirmLabel={target?.is_active ? "Deactivate" : "Activate"}
        destructive={Boolean(target?.is_active)}
        isLoading={saving}
        onConfirm={toggleStatus}
      />
    </div>
  );
}
