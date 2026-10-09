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
import { Eye, EyeOff, Search, Star } from "lucide-react";

interface CreatorRow {
  profile: Profile;
  is_public: boolean;
}

interface CreatorsClientProps {
  canManage: boolean;
}

export function CreatorsClient({ canManage }: CreatorsClientProps) {
  const [rows, setRows] = useState<CreatorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<CreatorRow | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCreators = useCallback(async () => {
    const supabase = getBrowserClient();
    const { data, error: queryError } = await supabase
      .from("creators")
      .select("is_public, profile:profiles(*)")
      .order("created_at", { ascending: false })
      .limit(500);

    if (queryError) {
      setError(getDbErrorMessage(queryError));
      return;
    }

    const mapped: CreatorRow[] = (data ?? [])
      .map((row) => {
        const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile;
        return profile ? { profile: profile as Profile, is_public: Boolean(row.is_public) } : null;
      })
      .filter((row): row is CreatorRow => row !== null);

    setRows(mapped);
    setError(null);
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchCreators();
      setLoading(false);
    };
    run();
  }, [fetchCreators]);

  const toggleVisibility = async () => {
    if (!target || !canManage) return;
    setSaving(true);
    const supabase = getBrowserClient();
    const { error: updateError } = await supabase
      .from("creators")
      .update({ is_public: !target.is_public })
      .eq("profile_id", target.profile.id);

    if (updateError) {
      setError(getDbErrorMessage(updateError));
    } else {
      setRows((current) =>
        current.map((row) =>
          row.profile.id === target.profile.id
            ? { ...row, is_public: !target.is_public }
            : row
        )
      );
      setTarget(null);
    }
    setSaving(false);
  };

  const filtered = rows.filter((row) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (row.profile.full_name ?? "").toLowerCase().includes(term) ||
      (row.profile.bio ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Creators"
        description="Review creator profiles and control public visibility."
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search creators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-44 bg-transparent text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring sm:w-56"
              aria-label="Search creators"
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
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Star className="h-6 w-6" />}
          title={rows.length === 0 ? "No creators yet" : "No creators match your search"}
          description={
            rows.length === 0
              ? "Creator registrations will appear here."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-semibold">Creator</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Bio</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Visibility</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Account</th>
                  {canManage && <th scope="col" className="px-4 py-3 font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((row) => (
                  <tr key={row.profile.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={row.profile.avatar_url || undefined} alt="" />
                          <AvatarFallback className="bg-yaaq-gold/20 text-yaaq-gold-ink text-xs font-semibold">
                            {(row.profile.full_name ?? "C")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {row.profile.full_name || "Unnamed creator"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {row.profile.moniker || row.profile.level || ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs">
                      <span className="line-clamp-2">{row.profile.bio || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        kind="account"
                        status={row.is_public ? "active" : "inactive"}
                      />
                      <span className="ml-2 text-xs text-muted-foreground">
                        {row.is_public ? "Public" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        kind="account"
                        status={row.profile.is_active ? "active" : "inactive"}
                      />
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => setTarget(row)}
                        >
                          {row.is_public ? (
                            <>
                              <EyeOff className="h-3.5 w-3.5" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5" />
                              Publish
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
        title={target?.is_public ? "Hide creator profile?" : "Publish creator profile?"}
        description={
          target?.is_public
            ? `${target?.profile.full_name || "This creator"} will be removed from the public creator directory.`
            : `${target?.profile.full_name || "This creator"} will appear in the public creator directory.`
        }
        confirmLabel={target?.is_public ? "Hide" : "Publish"}
        isLoading={saving}
        onConfirm={toggleVisibility}
      />
    </div>
  );
}
