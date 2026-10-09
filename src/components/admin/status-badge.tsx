"use client";

import { Badge } from "@/components/ui/badge";
import { AdminStatus, AnnouncementStatus, InvitationStatus } from "@/types";
import { cn } from "@/lib/utils";

const ADMIN_STATUS_STYLES: Record<AdminStatus, { label: string; className: string }> = {
  invited: { label: "Invited", className: "bg-blue-500/10 text-blue-600 border border-blue-500/20" },
  active: { label: "Active", className: "bg-green-500/10 text-green-600 border border-green-500/20" },
  suspended: { label: "Suspended", className: "bg-amber-500/10 text-amber-600 border border-amber-500/20" },
  revoked: { label: "Revoked", className: "bg-red-500/10 text-red-600 border border-red-500/20" },
};

const INVITATION_STATUS_STYLES: Record<InvitationStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-blue-500/10 text-blue-600 border border-blue-500/20" },
  accepted: { label: "Accepted", className: "bg-green-500/10 text-green-600 border border-green-500/20" },
  expired: { label: "Expired", className: "bg-amber-500/10 text-amber-600 border border-amber-500/20" },
  revoked: { label: "Revoked", className: "bg-red-500/10 text-red-600 border border-red-500/20" },
};

const ANNOUNCEMENT_STATUS_STYLES: Record<AnnouncementStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground border border-border" },
  published: { label: "Published", className: "bg-green-500/10 text-green-600 border border-green-500/20" },
};

const ACCOUNT_STYLES: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-green-500/10 text-green-600 border border-green-500/20" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground border border-border" },
};

const NEWS_STYLES: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground border border-border" },
  published: { label: "Published", className: "bg-green-500/10 text-green-600 border border-green-500/20" },
  archived: { label: "Archived", className: "bg-amber-500/10 text-amber-600 border border-amber-500/20" },
};

const BOOKING_STYLES: Record<string, { label: string; className: string }> = {
  new: { label: "New", className: "bg-blue-500/10 text-blue-600 border border-blue-500/20" },
  pending: { label: "Pending", className: "bg-blue-500/10 text-blue-600 border border-blue-500/20" },
  contacted: { label: "Contacted", className: "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20" },
  quoted: { label: "Quoted", className: "bg-violet-500/10 text-violet-600 border border-violet-500/20" },
  confirmed: { label: "Confirmed", className: "bg-green-500/10 text-green-600 border border-green-500/20" },
  completed: { label: "Completed", className: "bg-green-500/10 text-green-600 border border-green-500/20" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground border border-border" },
  declined: { label: "Declined", className: "bg-red-500/10 text-red-600 border border-red-500/20" },
};

const OPPORTUNITY_STYLES: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground border border-border" },
  open: { label: "Open", className: "bg-green-500/10 text-green-600 border border-green-500/20" },
  closed: { label: "Closed", className: "bg-amber-500/10 text-amber-600 border border-amber-500/20" },
  archived: { label: "Archived", className: "bg-muted text-muted-foreground border border-border" },
};

const APPLICATION_STYLES: Record<string, { label: string; className: string }> = {
  submitted: { label: "Submitted", className: "bg-blue-500/10 text-blue-600 border border-blue-500/20" },
  shortlisted: { label: "Shortlisted", className: "bg-violet-500/10 text-violet-600 border border-violet-500/20" },
  accepted: { label: "Accepted", className: "bg-green-500/10 text-green-600 border border-green-500/20" },
  rejected: { label: "Rejected", className: "bg-red-500/10 text-red-600 border border-red-500/20" },
};

type StatusKind = "admin" | "invitation" | "announcement" | "account" | "news" | "booking" | "opportunity" | "application";

interface StatusBadgeProps {
  kind: StatusKind;
  status: string;
  className?: string;
}

export function StatusBadge({ kind, status, className }: StatusBadgeProps) {
  const maps: Record<StatusKind, Record<string, { label: string; className: string }>> = {
    admin: ADMIN_STATUS_STYLES,
    invitation: INVITATION_STATUS_STYLES,
    announcement: ANNOUNCEMENT_STATUS_STYLES,
    account: ACCOUNT_STYLES,
    news: NEWS_STYLES,
    booking: BOOKING_STYLES,
    opportunity: OPPORTUNITY_STYLES,
    application: APPLICATION_STYLES,
  };

  const style = maps[kind][status] ?? { label: status, className: "" };

  return (
    <Badge variant="outline" className={cn(style.className, className)}>
      {style.label}
    </Badge>
  );
}
