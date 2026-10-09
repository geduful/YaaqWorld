"use client";

import { Badge } from "@/components/ui/badge";
import { AdminStatus, AnnouncementStatus, InvitationStatus } from "@/types";
import { cn } from "@/lib/utils";

/* Tone classes use the semantic state tokens (WCAG AA text on soft backgrounds). */
const TONE = {
  blue: "bg-info-soft text-info border-info/30",
  green: "bg-success-soft text-success border-success/30",
  amber: "bg-warning-soft text-warning border-warning/30",
  red: "bg-error-soft text-error border-error/30",
  indigo: "bg-info-soft text-indigo-700 border-indigo-700/30",
  violet: "bg-info-soft text-violet-700 border-violet-700/30",
  neutral: "bg-muted text-muted-foreground border-border",
} as const;

const ADMIN_STATUS_STYLES: Record<AdminStatus, { label: string; className: string }> = {
  invited: { label: "Invited", className: TONE.blue },
  active: { label: "Active", className: TONE.green },
  suspended: { label: "Suspended", className: TONE.amber },
  revoked: { label: "Revoked", className: TONE.red },
};

const INVITATION_STATUS_STYLES: Record<InvitationStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: TONE.blue },
  accepted: { label: "Accepted", className: TONE.green },
  expired: { label: "Expired", className: TONE.amber },
  revoked: { label: "Revoked", className: TONE.red },
};

const ANNOUNCEMENT_STATUS_STYLES: Record<AnnouncementStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: TONE.neutral },
  published: { label: "Published", className: TONE.green },
};

const ACCOUNT_STYLES: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: TONE.green },
  inactive: { label: "Inactive", className: TONE.neutral },
};

const NEWS_STYLES: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: TONE.neutral },
  published: { label: "Published", className: TONE.green },
  archived: { label: "Archived", className: TONE.amber },
};

const BOOKING_STYLES: Record<string, { label: string; className: string }> = {
  new: { label: "New", className: TONE.blue },
  pending: { label: "Pending", className: TONE.blue },
  contacted: { label: "Contacted", className: TONE.indigo },
  quoted: { label: "Quoted", className: TONE.violet },
  confirmed: { label: "Confirmed", className: TONE.green },
  completed: { label: "Completed", className: TONE.green },
  cancelled: { label: "Cancelled", className: TONE.neutral },
  declined: { label: "Declined", className: TONE.red },
};

const OPPORTUNITY_STYLES: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: TONE.neutral },
  open: { label: "Open", className: TONE.green },
  closed: { label: "Closed", className: TONE.amber },
  archived: { label: "Archived", className: TONE.neutral },
};

const APPLICATION_STYLES: Record<string, { label: string; className: string }> = {
  submitted: { label: "Submitted", className: TONE.blue },
  shortlisted: { label: "Shortlisted", className: TONE.violet },
  accepted: { label: "Accepted", className: TONE.green },
  rejected: { label: "Rejected", className: TONE.red },
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
    <Badge variant="outline" className={cn("font-medium", style.className, className)}>
      {style.label}
    </Badge>
  );
}
