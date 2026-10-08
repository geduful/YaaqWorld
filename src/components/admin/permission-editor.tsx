"use client";

import { ASSIGNABLE_PERMISSION_KEYS, PERMISSIONS } from "@/lib/permissions";
import { PermissionKey } from "@/types";

interface PermissionEditorProps {
  selected: ReadonlySet<PermissionKey>;
  onChange: (next: Set<PermissionKey>) => void;
  disabled?: boolean;
}

// administrators.manage is Super Admin only and can never be granted here.
const GRANTABLE = PERMISSIONS.filter((p) =>
  (ASSIGNABLE_PERMISSION_KEYS as readonly string[]).includes(p.key)
);

const CATEGORIES = Array.from(new Set(GRANTABLE.map((p) => p.category)));

export function PermissionEditor({ selected, onChange, disabled = false }: PermissionEditorProps) {
  const toggle = (key: PermissionKey) => {
    if (disabled) return;
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  };

  const toggleCategory = (category: string, value: boolean) => {
    if (disabled) return;
    const next = new Set(selected);
    for (const permission of PERMISSIONS) {
      if (permission.category !== category) continue;
      if (value) next.add(permission.key);
      else next.delete(permission.key);
    }
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {CATEGORIES.map((category) => {
        const permissions = GRANTABLE.filter((p) => p.category === category);
        const allSelected = permissions.every((p) => selected.has(p.key));
        return (
          <div key={category} className="rounded-lg border border-border">
            <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-border bg-muted/40">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleCategory(category, e.target.checked)}
                  disabled={disabled}
                  className="h-4 w-4 rounded border-input accent-[color:var(--yaaq-gold)]"
                />
                {category}
              </label>
              <span className="text-xs text-muted-foreground">
                {permissions.filter((p) => selected.has(p.key)).length}/{permissions.length}
              </span>
            </div>
            <div className="divide-y divide-border">
              {permissions.map((permission) => (
                <label
                  key={permission.key}
                  className="flex items-start gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(permission.key)}
                    onChange={() => toggle(permission.key)}
                    disabled={disabled}
                    className="mt-0.5 h-4 w-4 rounded border-input accent-[color:var(--yaaq-gold)]"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">{permission.label}</span>
                    <span className="block text-xs text-muted-foreground">{permission.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
