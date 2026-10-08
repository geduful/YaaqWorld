// Helpers for turning PostgREST / RPC errors into friendly messages.

const MIGRATION_HINT =
  "The Phase 3 database migration has not been applied yet. Run supabase/phase3-schema.sql in the Supabase SQL Editor, then reload this page.";

const GENERIC_ERROR = "Something went wrong. Please try again.";

// Errors raised intentionally by our RPCs (RAISE EXCEPTION ... USING ERRCODE)
// are safe to surface as-is: they are curated, user-facing strings.
const SAFE_ERRCODES = new Set(["42501", "22023", "23505", "P0001"]);

// PostgREST / Postgres codes that mean the Phase 3 schema is missing.
const MIGRATION_ERRCODES = new Set(["PGRST202", "PGRST204", "PGRST205", "42P01", "42883"]);

// Raw engine messages that may share a safe ERRCODE but must never be
// shown to users (they leak table names / internal wording).
const RAW_MESSAGE_PATTERNS = [
  "row-level security policy",
  "permission denied for",
  "duplicate key value violates unique constraint",
  "invalid input syntax",
  "violates check constraint",
  "violates foreign key constraint",
  "null value in column",
];

function isRawEngineMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return RAW_MESSAGE_PATTERNS.some((pattern) => lower.includes(pattern));
}

export function getPostgrestMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const err = error as { code?: string; message?: string };
  const code = typeof err.code === "string" ? err.code : "";
  const message = typeof err.message === "string" ? err.message : "";

  if (!message) return null;
  if (MIGRATION_ERRCODES.has(code)) return MIGRATION_HINT;
  if (isRawEngineMessage(message)) return null;
  if (SAFE_ERRCODES.has(code)) return message;
  // Some drivers surface ERRCODE inside the message text only.
  if (/^\s*(42501|22023|23505)\b/.test(message)) return message.trim();
  return null;
}

export function getDbErrorMessage(error: unknown): string {
  return getPostgrestMessage(error) ?? GENERIC_ERROR;
}

// For supabase.rpc() calls: returns a displayable message for RPC errors.
export function getRpcError(error: unknown): string {
  return getDbErrorMessage(error);
}

export { GENERIC_ERROR, MIGRATION_HINT };
