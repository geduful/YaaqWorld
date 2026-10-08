import type { SupabaseClient } from "@supabase/supabase-js";

export type InstitutionOption = {
  id: string;
  name: string;
  shortName?: string | null;
  location: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

const baseName = (name: string): string =>
  name.replace(/\s*\([^)]*\)\s*$/, "").trim().toLowerCase();

export type InstitutionsLoadResult = {
  options: InstitutionOption[];
  idMap: Record<string, string>;
};

export async function loadInstitutions(
  supabase: SupabaseClient,
  fallback: InstitutionOption[]
): Promise<InstitutionsLoadResult> {
  const { data, error } = await supabase
    .from("institutions")
    .select("id, name, short_name, location")
    .eq("is_active", true)
    .order("name");

  if (error || !data || data.length === 0) {
    return { options: fallback, idMap: {} };
  }

  const options: InstitutionOption[] = data.map((row: {
    id: string;
    name: string;
    short_name?: string | null;
    location?: string | null;
  }) => ({
    id: row.id,
    name: row.short_name ? `${row.name} (${row.short_name})` : row.name,
    shortName: row.short_name,
    location: row.location || "",
  }));

  const byName = new Map<string, string>();
  const byShort = new Map<string, string>();
  for (const row of data as Array<{ id: string; name: string; short_name?: string | null }>) {
    byName.set(row.name.toLowerCase(), row.id);
    if (row.short_name) byShort.set(row.short_name.toUpperCase(), row.id);
  }

  const idMap: Record<string, string> = {};
  for (const inst of fallback) {
    const match =
      (inst.shortName ? byShort.get(inst.shortName.toUpperCase()) : undefined) ??
      byName.get(baseName(inst.name)) ??
      (baseName(inst.name).startsWith("other")
        ? (data as Array<{ id: string; name: string }>).find((row) =>
            baseName(row.name).startsWith("other")
          )?.id
        : undefined);
    if (match) idMap[inst.id] = match;
  }

  return { options, idMap };
}
