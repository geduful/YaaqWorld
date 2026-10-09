"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { getBrowserClient } from "@/lib/supabase-browser";
import { getDbErrorMessage } from "@/lib/errors";
import { socialUrl } from "@/lib/social-links";
import { socialIcons } from "@/lib/icons";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AmbassadorWithRelations } from "@/types";
import { Globe2, Check, X, Undo2, Phone, MessageSquare } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "revoked", label: "Revoked" },
] as const;

function waLink(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const local = digits.startsWith("233") ? digits : digits.startsWith("0") ? `233${digits.slice(1)}` : `233${digits}`;
  return `https://wa.me/${local}`;
}

interface AmbassadorsClientProps {
  canManage: boolean;
}

export function AmbassadorsClient({ canManage }: AmbassadorsClientProps) {
  const [rows, setRows] = useState<AmbassadorWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewing, setViewing] = useState<AmbassadorWithRelations | null>(null);
  const [reason, setReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchRows = useCallback(async () => {
    const supabase = getBrowserClient();
    const { data, error: queryError } = await supabase
      .from("ambassadors")
      .select("*, institutions(id, name, short_name, location)")
      .order("created_at", { ascending: false })
      .limit(500);

    if (queryError) {
      setError(getDbErrorMessage(queryError));
      return;
    }
    setRows((data ?? []) as AmbassadorWithRelations[]);
    setError(null);
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchRows();
      setLoading(false);
    };
    run();
  }, [fetchRows]);

  const openDetail = (row: AmbassadorWithRelations) => {
    setViewing(row);
    setReason("");
    setActionError(null);
  };

  const review = async (status: "approved" | "rejected" | "revoked") => {
    if (!viewing) return;
    if (status === "rejected" && !reason.trim()) {
      setActionError("A reason is required when rejecting a request.");
      return;
    }
    setSaving(true);
    setActionError(null);
    const supabase = getBrowserClient();
    const { data: userData } = await supabase.auth.getUser();

    const { error: updateError } = await supabase
      .from("ambassadors")
      .update({
        status,
        reviewed_by: userData.user?.id ?? null,
        reviewed_at: new Date().toISOString(),
        rejection_reason: status === "rejected" ? reason.trim() : null,
      })
      .eq("id", viewing.id);

    if (updateError) {
      setActionError(getDbErrorMessage(updateError));
    } else {
      await fetchRows();
      setViewing(null);
    }
    setSaving(false);
  };

  const visible =
    statusFilter === "all"
      ? rows
      : rows.filter((row) => row.status === statusFilter);

  const socials = viewing
    ? ([
        viewing.instagram && { platform: "instagram" as const, value: viewing.instagram },
        viewing.tiktok && { platform: "tiktok" as const, value: viewing.tiktok },
        viewing.twitter && { platform: "twitter" as const, value: viewing.twitter },
      ].filter(Boolean) as { platform: "instagram" | "tiktok" | "twitter"; value: string }[])
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ambassadors"
        description="Review requests from members who want to represent YAAQ World on their campus."
        actions={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Globe2 className="h-6 w-6" />}
          title={statusFilter === "all" ? "No ambassador requests yet" : "No ambassadors with this status"}
          description="Requests submitted through the member dashboard will appear here."
        />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-semibold">Name</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Institution</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Submitted</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((row) => (
                  <tr key={row.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{row.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.institutions?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge kind="ambassador" status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(row.created_at).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetail(row)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog
        open={viewing !== null}
        onOpenChange={(open) => !saving && !open && setViewing(null)}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ambassador request</DialogTitle>
            <DialogDescription>
              Submitted {viewing ? new Date(viewing.created_at).toLocaleString("en-GH", { dateStyle: "medium", timeStyle: "short" }) : ""}
            </DialogDescription>
          </DialogHeader>

          {viewing && (
            <div className="space-y-4">
              {actionError && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                  {actionError}
                </div>
              )}

              <div className="flex items-center gap-4">
                {viewing.photo_url ? (
                  <Image
                    src={viewing.photo_url}
                    alt={`${viewing.full_name} photo`}
                    width={72}
                    height={72}
                    className="h-[72px] w-[72px] rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground">
                    {viewing.full_name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-display text-lg font-semibold text-foreground">{viewing.full_name}</p>
                  <p className="text-sm text-muted-foreground">{viewing.institutions?.name ?? "Unknown institution"}</p>
                  <div className="mt-1">
                    <StatusBadge kind="ambassador" status={viewing.status} />
                  </div>
                </div>
              </div>

              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="font-medium flex items-center gap-2">
                    <a
                      href={`tel:${viewing.phone}`}
                      className="inline-flex items-center gap-1 hover:text-yaaq-gold-ink transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {viewing.phone}
                    </a>
                    {waLink(viewing.phone) && (
                      <a
                        href={waLink(viewing.phone)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-yaaq-gold-ink hover:underline"
                        aria-label={`WhatsApp ${viewing.full_name}`}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        WhatsApp
                      </a>
                    )}
                  </dd>
                </div>
                {socials.map((s) => {
                  const url = socialUrl(s.platform, s.value);
                  const Icon = socialIcons[s.platform];
                  if (!url) return null;
                  return (
                    <div key={s.platform}>
                      <dt className="text-muted-foreground capitalize">{s.platform}</dt>
                      <dd className="font-medium">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 hover:text-yaaq-gold-ink transition-colors"
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {s.value}
                        </a>
                      </dd>
                    </div>
                  );
                })}
              </dl>

              {viewing.message && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Message</p>
                  <p className="text-sm whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3">
                    {viewing.message}
                  </p>
                </div>
              )}

              {viewing.rejection_reason && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Rejection reason</p>
                  <p className="text-sm whitespace-pre-wrap rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-destructive">
                    {viewing.rejection_reason}
                  </p>
                </div>
              )}

              {canManage && (
                <div className="space-y-4 border-t border-border pt-4">
                  {viewing.status === "rejected" && (
                    <div className="space-y-2">
                      <Label htmlFor="ambassador-reason">Reason for rejection</Label>
                      <Textarea
                        id="ambassador-reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        disabled={saving}
                        placeholder="Explain why this request is being rejected..."
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {viewing.status !== "approved" && (
                      <Button
                        variant="gold"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => review("approved")}
                        isLoading={saving}
                      >
                        <Check className="h-3.5 w-3.5" />
                        {viewing.status === "pending" ? "Approve" : "Restore"}
                      </Button>
                    )}
                    {viewing.status === "pending" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => review("rejected")}
                        isLoading={saving}
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    )}
                    {viewing.status === "approved" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => review("revoked")}
                        isLoading={saving}
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                        Revoke
                      </Button>
                    )}
                    {viewing.status === "rejected" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => review("revoked")}
                        isLoading={saving}
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                        Mark Revoked
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)} disabled={saving}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
