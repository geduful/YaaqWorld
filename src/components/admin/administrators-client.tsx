"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase-browser";
import { getRpcError } from "@/lib/errors";
import { AdminRole, PermissionKey } from "@/types";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { PermissionEditor } from "@/components/admin/permission-editor";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  UserMinus,
  UserPlus,
} from "lucide-react";

interface AdminListRow {
  administrator_id: string | null;
  admin_profile_id: string;
  email: string;
  display_name: string | null;
  role_key: string;
  role_name: string;
  status: string;
  previous_role: string | null;
  permission_keys: string[] | null;
  is_super: boolean;
}

interface CandidateRow {
  profile_id: string;
  email: string;
  full_name: string | null;
  role: string;
}

interface AdministratorsClientProps {
  currentUserId: string;
  canManage: boolean;
}

const GRANT_ROLES: { key: Exclude<AdminRole, "super_admin">; label: string; description: string }[] = [
  { key: "admin", label: "Administrator", description: "Full operational administration preset." },
  { key: "editor", label: "Editor", description: "Content-focused administration preset." },
  { key: "viewer", label: "Viewer", description: "Read-only administration preset." },
];

function personLabel(row: Pick<AdminListRow, "display_name" | "email">): string {
  return row.display_name || row.email;
}

function previousRoleLabel(row: AdminListRow): string {
  return row.previous_role === "creator" ? "a creator account" : "a normal member";
}

export function AdministratorsClient({ currentUserId, canManage }: AdministratorsClientProps) {
  const [rows, setRows] = useState<AdminListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // User search (direct grant)
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const searchReqRef = useRef(0);

  // Grant dialog
  const [grantTarget, setGrantTarget] = useState<CandidateRow | null>(null);
  const [grantRole, setGrantRole] = useState<Exclude<AdminRole, "super_admin">>("admin");
  const [grantSaving, setGrantSaving] = useState(false);
  const [grantError, setGrantError] = useState<string | null>(null);

  // Permission editing
  const [editOpen, setEditOpenState] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminListRow | null>(null);
  const [editPermissions, setEditPermissions] = useState<Set<PermissionKey>>(new Set());
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Confirm dialogs
  const [removeTarget, setRemoveTarget] = useState<AdminListRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    profile_id: string;
    email: string;
    label: string;
  } | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    admin: AdminListRow;
    action: "active" | "suspended";
  } | null>(null);
  const [actionSaving, setActionSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    const supabase = getBrowserClient();
    const { data, error: rpcError } = await supabase.rpc("list_administrators");

    if (rpcError) {
      setError(getRpcError(rpcError));
      return;
    }
    setRows((data ?? []) as AdminListRow[]);
    setError(null);
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchAll();
      setLoading(false);
    };
    run();
  }, [fetchAll]);

  // Debounced user search
  useEffect(() => {
    const query = searchQuery.trim();
    const requestId = ++searchReqRef.current;
    if (query.length < 2) return;

    const timer = setTimeout(async () => {
      const supabase = getBrowserClient();
      const { data, error: rpcError } = await supabase.rpc("search_admin_candidates", {
        p_query: query,
        p_limit: 10,
      });
      if (requestId !== searchReqRef.current) return;
      setSearching(false);
      if (rpcError) {
        setSearchError(getRpcError(rpcError));
      } else {
        setCandidates((data ?? []) as CandidateRow[]);
        setHasSearched(true);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length < 2) {
      setCandidates([]);
      setHasSearched(false);
      setSearchError(null);
      setSearching(false);
    } else {
      setSearching(true);
      setSearchError(null);
    }
  };

  const openGrant = (candidate: CandidateRow) => {
    setGrantTarget(candidate);
    setGrantRole("admin");
    setGrantError(null);
  };

  const runGrant = async () => {
    if (!grantTarget) return;
    setGrantSaving(true);
    setGrantError(null);
    const supabase = getBrowserClient();
    const { error: rpcError } = await supabase.rpc("grant_admin_access", {
      p_profile_id: grantTarget.profile_id,
      p_role_key: grantRole,
      p_permission_keys: null,
    });

    if (rpcError) {
      setGrantError(getRpcError(rpcError));
      setGrantSaving(false);
      return;
    }

    const grantedName = grantTarget.full_name || grantTarget.email;
    setGrantTarget(null);
    setSearchQuery("");
    setCandidates([]);
    setHasSearched(false);
    setGrantSaving(false);
    await fetchAll();
    setNotice(`Admin access granted to ${grantedName}. They can sign in to the admin panel right away.`);
  };

  const openEditPermissions = (admin: AdminListRow) => {
    if (!admin.administrator_id) return;
    setEditTarget(admin);
    setEditPermissions(new Set((admin.permission_keys ?? []) as PermissionKey[]));
    setEditError(null);
    setEditOpenState(true);
  };

  const savePermissions = async () => {
    if (!editTarget?.administrator_id) return;
    if (editPermissions.size === 0) {
      setEditError("Select at least one permission.");
      return;
    }
    setEditSaving(true);
    setEditError(null);
    const supabase = getBrowserClient();
    const { error: rpcError } = await supabase.rpc("update_admin_permissions", {
      p_admin_id: editTarget.administrator_id,
      p_permission_keys: Array.from(editPermissions),
    });

    if (rpcError) {
      setEditError(getRpcError(rpcError));
    } else {
      await fetchAll();
      setEditOpenState(false);
      setEditTarget(null);
      setNotice("Permissions updated.");
    }
    setEditSaving(false);
  };

  const runRemove = async () => {
    if (!removeTarget) return;
    setActionSaving(true);
    setError(null);
    const supabase = getBrowserClient();
    const { error: rpcError } = await supabase.rpc("remove_admin_access", {
      p_profile_id: removeTarget.admin_profile_id,
    });

    if (rpcError) {
      setError(getRpcError(rpcError));
      setRemoveTarget(null);
    } else {
      const removedEmail = removeTarget.email;
      setRemoveTarget(null);
      await fetchAll();
      setNotice(`Admin access removed from ${removedEmail}. They are a normal user again.`);
    }
    setActionSaving(false);
  };

  const runDelete = async () => {
    if (!deleteTarget) return;
    setActionSaving(true);
    setError(null);
    const supabase = getBrowserClient();
    const { error: rpcError } = await supabase.rpc("delete_user_account", {
      p_profile_id: deleteTarget.profile_id,
    });

    if (rpcError) {
      setError(getRpcError(rpcError));
      setDeleteTarget(null);
    } else {
      const deletedLabel = deleteTarget.label;
      const deletedId = deleteTarget.profile_id;
      setDeleteTarget(null);
      setCandidates((prev) => prev.filter((c) => c.profile_id !== deletedId));
      await fetchAll();
      const rootNames = ["webp", "jpg", "jpeg", "png", "gif", "avif"].map(
        (ext) => `${deletedId}.${ext}`
      );
      await supabase.storage.from("avatars").remove(rootNames).catch(() => undefined);
      const { data: folderFiles } = await supabase.storage
        .from("avatars")
        .list(`${deletedId}`, { limit: 100 })
        .catch(() => ({ data: null, error: null }));
      const avatarPaths = (folderFiles ?? [])
        .filter((entry) => entry.name.startsWith("avatar-"))
        .map((entry) => `${deletedId}/${entry.name}`);
      if (avatarPaths.length > 0) {
        await supabase.storage.from("avatars").remove(avatarPaths).catch(() => undefined);
      }
      setNotice(`${deletedLabel} was permanently deleted.`);
    }
    setActionSaving(false);
  };

  const runStatusAction = async () => {
    if (!statusTarget?.admin.administrator_id) return;
    setActionSaving(true);
    setError(null);
    const supabase = getBrowserClient();
    const { error: rpcError } = await supabase.rpc("set_admin_status", {
      p_admin_id: statusTarget.admin.administrator_id,
      p_status: statusTarget.action,
    });

    if (rpcError) {
      setError(getRpcError(rpcError));
    } else {
      setStatusTarget(null);
      await fetchAll();
      setNotice(statusTarget.action === "suspended" ? "Administrator suspended." : "Administrator restored.");
    }
    setActionSaving(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administrator Control Center"
        description={
          canManage
            ? "Search for a user, grant admin access directly, and manage current administrators."
            : "Read-only view of the administrators list."
        }
      />

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-lg bg-success-soft px-4 py-3 text-sm text-success" role="status">
          {notice}
        </div>
      )}

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-yaaq-gold-ink" aria-hidden="true" />
              Grant admin access
            </CardTitle>
            <CardDescription>
              Search any registered user by name or email to grant administrator access directly —
              or permanently delete a test account. No invitation needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-user-search">Search users</Label>
              <Input
                id="admin-user-search"
                type="search"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Type a name or email address…"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Type at least 2 characters. Existing administrators are excluded from results.
              </p>
            </div>

            {searchError && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                {searchError}
              </div>
            )}

            {searching && (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            )}

            {!searching && hasSearched && candidates.length === 0 && (
              <EmptyState
                icon={<Search className="h-6 w-6" />}
                title="No matching users"
                description="Check the spelling, or make sure the person has already created an account."
                className="py-6"
              />
            )}

            {!searching && candidates.length > 0 && (
              <div className="space-y-2">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.profile_id}
                    className="rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">
                        {candidate.full_name || candidate.email}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{candidate.email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                        Current role: {candidate.role.replace("_", " ")}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Button
                        variant="gold"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => openGrant(candidate)}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Grant admin
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1.5"
                        onClick={() =>
                          setDeleteTarget({
                            profile_id: candidate.profile_id,
                            email: candidate.email,
                            label: candidate.full_name || candidate.email,
                          })
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCog className="h-5 w-5 text-yaaq-gold-ink" aria-hidden="true" />
            Administrators
          </CardTitle>
          <CardDescription>Accounts with administrative access to YAAQ World</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck className="h-6 w-6" />}
              title="No administrators yet"
              description={
                canManage
                  ? "Search for a user above to grant your first administrator access."
                  : "Administrators will appear here once granted."
              }
            />
          ) : (
            <div className="space-y-3">
              {rows.map((admin) => {
                const permissionCount = admin.permission_keys?.length ?? 0;
                const isSelf = admin.admin_profile_id === currentUserId;
                const hasRow = admin.administrator_id !== null;
                return (
                  <div
                    key={admin.admin_profile_id}
                    className="rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground truncate">{personLabel(admin)}</p>
                        <StatusBadge kind="admin" status={admin.is_super ? "active" : admin.status} />
                        {admin.is_super && (
                          <span className="rounded-full bg-yaaq-gold/10 px-2 py-0.5 text-xs font-semibold text-yaaq-gold-ink">
                            Super Admin
                          </span>
                        )}
                        {isSelf && (
                          <span className="text-xs text-muted-foreground">(you)</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{admin.email}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {admin.role_name} ·{" "}
                        {admin.is_super
                          ? "Full unrestricted access"
                          : admin.status === "active"
                            ? `${permissionCount} permission${permissionCount === 1 ? "" : "s"}`
                            : "No active permissions"}
                      </p>
                    </div>
                    {canManage && !isSelf && !admin.is_super && (
                      <div className="flex flex-wrap gap-2">
                        {hasRow && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditPermissions(admin)}
                          >
                            Edit permissions
                          </Button>
                        )}
                        {hasRow && admin.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStatusTarget({ admin, action: "suspended" })}
                          >
                            Suspend
                          </Button>
                        )}
                        {hasRow && admin.status === "suspended" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setStatusTarget({ admin, action: "active" })}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Restore
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => setRemoveTarget(admin)}
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                          Remove admin
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1.5"
                          onClick={() =>
                            setDeleteTarget({
                              profile_id: admin.admin_profile_id,
                              email: admin.email,
                              label: personLabel(admin),
                            })
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete account
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grant confirmation dialog */}
      <Dialog
        open={grantTarget !== null}
        onOpenChange={(open) => !grantSaving && open === false && setGrantTarget(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Grant administrator access?</DialogTitle>
            <DialogDescription>
              {grantTarget
                ? `${grantTarget.full_name || grantTarget.email} (${grantTarget.email}) will immediately be able to sign in to the admin panel. No invitation or approval is needed from their side.`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {grantError && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {grantError}
            </div>
          )}

          <div className="space-y-2">
            <Label>Role preset</Label>
            <Select
              value={grantRole}
              onValueChange={(value) => setGrantRole(value as Exclude<AdminRole, "super_admin">)}
              disabled={grantSaving}
            >
              <SelectTrigger aria-label="Role preset">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {GRANT_ROLES.map((role) => (
                  <SelectItem key={role.key} value={role.key}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {GRANT_ROLES.find((role) => role.key === grantRole)?.description} You can fine-tune
              individual permissions from their row after granting.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setGrantTarget(null)} disabled={grantSaving}>
              Cancel
            </Button>
            <Button variant="gold" onClick={runGrant} isLoading={grantSaving}>
              Grant access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit permissions dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => !editSaving && setEditOpenState(open)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit permissions</DialogTitle>
            <DialogDescription>
              {editTarget ? `Choose the permissions granted to ${editTarget.email}.` : ""}
            </DialogDescription>
          </DialogHeader>

          {editError && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {editError}
            </div>
          )}

          <div className="max-h-96 overflow-y-auto rounded-lg border border-border p-3">
            <PermissionEditor
              selected={editPermissions}
              onChange={setEditPermissions}
              disabled={editSaving}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditOpenState(false)} disabled={editSaving}>
              Cancel
            </Button>
            <Button variant="gold" onClick={savePermissions} isLoading={editSaving}>
              Save permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove admin (demote) confirm */}
      <ConfirmDialog
        open={removeTarget !== null}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove admin access?"
        description={
          removeTarget
            ? `${personLabel(removeTarget)} will be demoted back to ${previousRoleLabel(removeTarget)} and will immediately lose all administrative permissions.`
            : ""
        }
        confirmLabel="Remove admin"
        destructive
        isLoading={actionSaving}
        onConfirm={runRemove}
      />

      {/* Delete account (permanent) confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete account permanently?"
        description={
          deleteTarget
            ? `${deleteTarget.label} (${deleteTarget.email}) will be permanently deleted — their sign-in, profile, and all related records (member/creator data, admin access) are removed. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete forever"
        destructive
        isLoading={actionSaving}
        onConfirm={runDelete}
      />

      {/* Suspend / restore confirm */}
      <ConfirmDialog
        open={statusTarget !== null}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        title={statusTarget?.action === "suspended" ? "Suspend administrator?" : "Restore administrator?"}
        description={
          statusTarget?.action === "suspended"
            ? `${statusTarget?.admin.email} will immediately lose administrative access. Their grants are kept for a future restore.`
            : `${statusTarget?.admin.email} will regain administrative access with their existing grants.`
        }
        confirmLabel={statusTarget?.action === "suspended" ? "Suspend" : "Restore"}
        destructive={statusTarget?.action === "suspended"}
        isLoading={actionSaving}
        onConfirm={runStatusAction}
      />
    </div>
  );
}
