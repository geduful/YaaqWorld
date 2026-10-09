"use client";

import { useCallback, useEffect, useState } from "react";
import { getBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";
import { getDbErrorMessage } from "@/lib/errors";
import { PERMISSIONS } from "@/lib/permissions";
import { PageHeader } from "@/components/admin/page-header";
import { PermissionEditor } from "@/components/admin/permission-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionKey, PlatformSetting } from "@/types";
import { CheckCircle2, Eye, Info, Save, ShieldCheck, XCircle } from "lucide-react";

interface SettingsClientProps {
  canManage: boolean;
  isSuperAdmin: boolean;
  permissionCount: number;
}

export function SettingsClient({ canManage, isSuperAdmin, permissionCount }: SettingsClientProps) {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [previewPerms, setPreviewPerms] = useState<Set<PermissionKey>>(new Set());

  const fetchSettings = useCallback(async () => {
    const supabase = getBrowserClient();
    const { data, error: queryError } = await supabase
      .from("platform_settings")
      .select("key, value")
      .in("key", ["announcement_banner_enabled", "announcement_banner_message"]);

    if (queryError) {
      setError(getDbErrorMessage(queryError));
      return;
    }

    const rows = (data ?? []) as Pick<PlatformSetting, "key" | "value">[];
    const enabledRow = rows.find((row) => row.key === "announcement_banner_enabled");
    const messageRow = rows.find((row) => row.key === "announcement_banner_message");
    setEnabled(enabledRow?.value === true);
    setMessage(typeof messageRow?.value === "string" ? messageRow.value : "");
    setError(null);
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchSettings();
      setLoading(false);
    };
    run();
  }, [fetchSettings]);

  const saveBanner = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    const supabase = getBrowserClient();

    const { error: upsertError } = await supabase.from("platform_settings").upsert(
      [
        { key: "announcement_banner_enabled", value: enabled, description: "Show the announcement banner on the public site." },
        { key: "announcement_banner_message", value: message, description: "Message shown in the public announcement banner." },
      ],
      { onConflict: "key" }
    );

    if (upsertError) {
      setError(getDbErrorMessage(upsertError));
    } else {
      setSaved(true);
    }
    setSaving(false);
  };

  const supabaseConfigured = isSupabaseConfigured();

  const statusItems = [
    {
      label: "Supabase connection",
      ok: supabaseConfigured,
      detail: supabaseConfigured ? "Environment variables detected" : "Environment variables missing",
    },
    {
      label: "Phase 3 migration",
      ok: !error || !error.includes("migration"),
      detail: "Administrative tables are in use on this page",
    },
    {
      label: "Signed-in access level",
      ok: true,
      detail: isSuperAdmin
        ? "Super Admin (all permissions)"
        : `${permissionCount} granted permission${permissionCount === 1 ? "" : "s"}`,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Platform configuration and system status." />

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-yaaq-gold-ink" aria-hidden="true" />
              System Status
            </CardTitle>
            <CardDescription>Live checks for this environment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusItems.map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                {item.ok ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-yaaq-gold-ink" aria-hidden="true" />
              Public Announcement Banner
            </CardTitle>
            <CardDescription>
              Optional banner shown on the public site. Disabled by default.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    disabled={!canManage || saving}
                    className="h-4 w-4 rounded border-input accent-[color:var(--yaaq-gold)]"
                  />
                  <span className="text-sm font-medium">Show banner on the public site</span>
                </label>

                <div className="space-y-2">
                  <Label htmlFor="banner-message">Banner message</Label>
                  <Input
                    id="banner-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. Registrations for the next showcase close on Friday!"
                    disabled={!canManage || saving}
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground">{message.length}/200 characters</p>
                </div>

                {saved && (
                  <p className="flex items-center gap-1.5 text-sm text-success" role="status">
                    <CheckCircle2 className="h-4 w-4" />
                    Settings saved.
                  </p>
                )}

                {canManage ? (
                  <Button variant="gold" onClick={saveBanner} isLoading={saving} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save banner settings
                  </Button>
                ) : (
                  <p className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning-soft p-3 text-xs text-foreground">
                    <Info className="h-4 w-4 shrink-0 mt-0.5 text-warning" aria-hidden="true" />
                    You have read-only access. Ask an administrator with settings.manage to change
                    platform settings.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Permission Reference</CardTitle>
          <CardDescription>
            The full permission catalogue ({PERMISSIONS.length} permissions). Administrators only
            receive the permissions explicitly granted to them (Super Admin bypasses grants).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed p-3">
            <span className="text-sm text-muted-foreground">
              Preview the standard <strong className="text-foreground">Administrator</strong> preset
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPreviewPerms((current) =>
                  current.size > 0 ? new Set() : new Set(PERMISSIONS.map((p) => p.key))
                )
              }
            >
              {previewPerms.size > 0 ? "Clear preview" : "Preview all"}
            </Button>
          </div>
          <div className="max-h-96 overflow-y-auto rounded-lg border border-border p-3">
            <PermissionEditor selected={previewPerms} onChange={setPreviewPerms} disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
