"use client";

import { useCallback, useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase-browser";
import { getDbErrorMessage } from "@/lib/errors";
import { BOOKING_SERVICE_LABELS } from "@/lib/content-categories";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Booking } from "@/types";
import { CalendarCheck, Eye, Trash2 } from "lucide-react";

interface BookingsClientProps {
  canManage: boolean;
}

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "pending", label: "Pending" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "declined", label: "Declined" },
] as const;

function serviceLabel(value: string): string {
  return BOOKING_SERVICE_LABELS[value] ?? value;
}

export function BookingsClient({ canManage }: BookingsClientProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewing, setViewing] = useState<Booking | null>(null);
  const [editStatus, setEditStatus] = useState<string>("new");
  const [editNotes, setEditNotes] = useState("");
  const [editQuoted, setEditQuoted] = useState("");
  const [editDepositPaid, setEditDepositPaid] = useState(false);
  const [editDepositAmount, setEditDepositAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);

  const fetchBookings = useCallback(async () => {
    const supabase = getBrowserClient();
    const { data, error: queryError } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (queryError) {
      setError(getDbErrorMessage(queryError));
      return;
    }
    setBookings((data ?? []) as Booking[]);
    setError(null);
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchBookings();
      setLoading(false);
    };
    run();
  }, [fetchBookings]);

  const openDetail = (booking: Booking) => {
    setViewing(booking);
    setEditStatus(booking.status);
    setEditNotes(booking.notes ?? "");
    setEditQuoted(booking.quoted_amount !== null ? String(booking.quoted_amount) : "");
    setEditDepositPaid(booking.deposit_paid);
    setEditDepositAmount(
      booking.deposit_amount !== null ? String(booking.deposit_amount) : ""
    );
    setDetailError(null);
  };

  const saveDetail = async () => {
    if (!viewing) return;
    setSaving(true);
    setDetailError(null);
    const supabase = getBrowserClient();

    const quoted = editQuoted.trim() ? Number(editQuoted) : null;
    if (quoted !== null && (Number.isNaN(quoted) || quoted < 0)) {
      setDetailError("Quoted amount must be a positive number.");
      setSaving(false);
      return;
    }
    const deposit = editDepositAmount.trim() ? Number(editDepositAmount) : null;
    if (deposit !== null && (Number.isNaN(deposit) || deposit < 0)) {
      setDetailError("Deposit amount must be a positive number.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: editStatus as Booking["status"],
        notes: editNotes.trim() || null,
        quoted_amount: quoted,
        deposit_paid: editDepositPaid,
        deposit_amount: deposit,
      })
      .eq("id", viewing.id);

    if (updateError) {
      setDetailError(getDbErrorMessage(updateError));
    } else {
      await fetchBookings();
      setViewing(null);
    }
    setSaving(false);
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    const supabase = getBrowserClient();
    const { error: deleteError } = await supabase
      .from("bookings")
      .delete()
      .eq("id", deleteTarget.id);

    if (deleteError) {
      setError(getDbErrorMessage(deleteError));
    } else {
      setBookings((current) => current.filter((b) => b.id !== deleteTarget.id));
      setDeleteTarget(null);
      if (viewing?.id === deleteTarget.id) setViewing(null);
    }
    setSaving(false);
  };

  const visible =
    statusFilter === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === statusFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description="Review and manage public booking requests."
        actions={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44" aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
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
          icon={<CalendarCheck className="h-6 w-6" />}
          title={statusFilter === "all" ? "No booking requests yet" : "No bookings with this status"}
          description="Requests submitted through the public booking form will appear here."
        />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-medium">Requester</th>
                  <th scope="col" className="px-4 py-3 font-medium">Service</th>
                  <th scope="col" className="px-4 py-3 font-medium">Event date</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Received</th>
                  <th scope="col" className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((booking) => (
                  <tr key={booking.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{booking.name}</p>
                      <p className="text-xs text-muted-foreground">{booking.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {serviceLabel(booking.service_category)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(booking.event_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge kind="booking" status={booking.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => openDetail(booking)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                        {canManage && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setDeleteTarget(booking)}
                            aria-label={`Delete booking from ${booking.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
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
            <DialogTitle>Booking request</DialogTitle>
            <DialogDescription>
              Submitted {viewing ? new Date(viewing.created_at).toLocaleString() : ""}
            </DialogDescription>
          </DialogHeader>

          {viewing && (
            <div className="space-y-4">
              {detailError && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                  {detailError}
                </div>
              )}

              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium">{viewing.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium">{viewing.email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="font-medium">{viewing.phone}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Organization</dt>
                  <dd className="font-medium">{viewing.organization || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Service</dt>
                  <dd className="font-medium">{serviceLabel(viewing.service_category)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Event date</dt>
                  <dd className="font-medium">
                    {new Date(viewing.event_date).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="font-medium">{viewing.location}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Budget</dt>
                  <dd className="font-medium">{viewing.budget || "—"}</dd>
                </div>
              </dl>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Details</p>
                <p className="text-sm whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3">
                  {viewing.details}
                </p>
              </div>

              {canManage ? (
                <div className="space-y-4 border-t border-border pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={editStatus} onValueChange={setEditStatus} disabled={saving}>
                        <SelectTrigger aria-label="Booking status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="booking-quoted">Quoted amount (GHS)</Label>
                      <Input
                        id="booking-quoted"
                        type="number"
                        min={0}
                        step="0.01"
                        value={editQuoted}
                        onChange={(e) => setEditQuoted(e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editDepositPaid}
                        onChange={(e) => setEditDepositPaid(e.target.checked)}
                        disabled={saving}
                        className="h-4 w-4 rounded border-input accent-[color:var(--yaaq-gold)]"
                      />
                      Deposit paid
                    </label>
                    <div className="space-y-2">
                      <Label htmlFor="booking-deposit">Deposit amount (GHS)</Label>
                      <Input
                        id="booking-deposit"
                        type="number"
                        min={0}
                        step="0.01"
                        value={editDepositAmount}
                        onChange={(e) => setEditDepositAmount(e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="booking-notes">Internal notes</Label>
                    <Textarea
                      id="booking-notes"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={3}
                      disabled={saving}
                    />
                  </div>
                </div>
              ) : (
                viewing.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3">
                      {viewing.notes}
                    </p>
                  </div>
                )
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setViewing(null)} disabled={saving}>
              Close
            </Button>
            {canManage && (
              <Button variant="gold" onClick={saveDetail} isLoading={saving}>
                Save changes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete booking request?"
        description={`The request from "${deleteTarget?.name ?? ""}" will be removed permanently.`}
        confirmLabel="Delete"
        destructive
        isLoading={saving}
        onConfirm={remove}
      />
    </div>
  );
}
