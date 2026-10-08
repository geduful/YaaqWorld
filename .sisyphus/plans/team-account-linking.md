# Team Account Linking (Option B + C)

## Goal

Let the Super Admin recognize real team members who create accounts:

- **B — Auto badge:** admin stores a team member's email; when that email signs up, the account auto-links ("Team member ✓").
- **C — Manual link:** admin can search signed-up accounts and link/unlink them to a team listing from `/admin/team`.

Rules kept intact: listed on `/team` ≠ has account ≠ can admin. Linking grants **no permissions**.

## Design decisions

1. Two new columns on `team_members`: `email TEXT` (optional, normalized lowercase) and `profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL`.
   - UNIQUE ⇒ one account ↔ at most one listing; account deletion just clears the link (listing survives).
2. **Link is authoritative once set.** It is only removed by explicit Unlink (or account deletion). Email edits never break an existing link.
3. Auto-match runs only when `profile_id IS NULL` AND (INSERT OR email value changed) — prevents the unlink→immediately-relink bug.
4. On manual link, the listing's `email` is synced to the account's real email (keeps future auto-match consistent).
5. Both RPCs gated by `has_admin_permission('team.manage')` (super passes automatically; anon/member → 42501 friendly message via `errors.ts`).
6. Backfill: one-time UPDATE in the patch links any pre-existing listings whose email already matches an account.

## Database changes (identical blocks in BOTH `supabase/phase3-schema.sql` and `supabase/phase3-direct-grant-patch.sql`)

### 1. Columns

- Update `CREATE TABLE team_members` (phase3 line ~153) to include `email TEXT` and `profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL`.
- Immediately after the table (idempotent, for the already-run DB):

```sql
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_team_members_profile ON team_members(profile_id);
```

### 2. Triggers

**`normalize_and_match_team_email()` — BEFORE INSERT OR UPDATE ON team_members** (SECURITY DEFINER, `SET search_path = public, extensions, pg_temp`):

- `NEW.email := nullif(lower(trim(coalesce(NEW.email,''))), '')`
- If `NEW.profile_id IS NULL AND NEW.email IS NOT NULL AND (TG_OP='INSERT' OR NEW.email IS DISTINCT FROM OLD.email)`:
  `SELECT p.id INTO NEW.profile_id FROM auth.users u JOIN profiles p ON p.id = u.id WHERE lower(u.email) = NEW.email AND NOT EXISTS (SELECT 1 FROM team_members t WHERE t.profile_id = p.id AND t.id IS DISTINCT FROM NEW.id) ORDER BY u.created_at LIMIT 1;`
- `RETURN NEW`

**`link_team_on_signup()` — AFTER INSERT ON profiles** (SECURITY DEFINER):

- Skip if `EXISTS (SELECT 1 FROM team_members WHERE profile_id = NEW.id)`
- `SELECT lower(u.email) INTO v_email FROM auth.users u WHERE u.id = NEW.id`; skip if NULL
- `UPDATE team_members SET profile_id = NEW.id WHERE id = (SELECT id FROM team_members WHERE email = v_email AND profile_id IS NULL ORDER BY created_at LIMIT 1);`
- `RETURN NULL`

(Fires inside `handle_new_user()` — signup trigger on `auth.users` confirmed at phase2:165-200.)

Audit: existing `audit_team_members` trigger (AFTER INSERT/UPDATE/DELETE) records the link changes automatically.

### 3. Backfill (runs once when patch is executed)

```sql
UPDATE team_members t
SET profile_id = m.profile_id
FROM (
  SELECT DISTINCT ON (lower(u.email)) t2.id AS team_id, u.id AS profile_id
  FROM team_members t2 JOIN auth.users u ON lower(u.email) = t2.email
  WHERE t2.profile_id IS NULL
  ORDER BY lower(u.email), t2.created_at
) m
WHERE t.id = m.team_id
  AND NOT EXISTS (SELECT 1 FROM team_members x WHERE x.profile_id = m.profile_id);
```

### 4. RPC: `search_linkable_users(p_query TEXT, p_limit INT DEFAULT 10)`

`RETURNS TABLE (profile_id UUID, email TEXT, full_name TEXT)` — SECURITY DEFINER, same shape as `search_admin_candidates`:

- Gate: `IF v_uid IS NULL OR NOT public.has_admin_permission('team.manage') THEN RAISE 'You do not have permission to manage the team.' ERRCODE 42501`
- `length(query) < 2` → return empty; limit clamped 1..25
- Query: `auth.users JOIN profiles` where email/name ILIKE, `NOT EXISTS (team_members.profile_id = u.id)`, `email_confirmed_at IS NOT NULL`, not banned, `ORDER BY u.email LIMIT`

### 5. RPC: `link_team_member(p_team_id UUID, p_profile_id UUID DEFAULT NULL)`

`RETURNS JSONB` — SECURITY DEFINER:

- Same team.manage gate; `p_team_id` NULL → 22023 'Select a team member.'
- Load team row `FOR UPDATE` → 22023 'Team member not found.'
- **If `p_profile_id` IS NULL** (unlink): `UPDATE team_members SET profile_id = NULL WHERE id = p_team_id` → return `{ok, linked:false, team_id}` (email kept; trigger does NOT re-match because email unchanged)
- Else: account email lookup in `auth.users` → 22023 'Account not found.'; already linked elsewhere → 22023 'This account is already linked to another team member.'
- `UPDATE team_members SET profile_id = p_profile_id, email = lower(v_email) WHERE id = p_team_id` (audited by trigger)
- Return `{ok, linked:true, team_id, profile_id, email}`

### 6. Placement & grants

- phase3-schema.sql: new section **`-- 6.7 Team account linking (badge + manual link)`** between end of §6.6 (`$$;` before line ~1351 banner) and the next section.
- Patch file: append the identical block just before the `-- 8b-post` GRANT, and extend that GRANT with:
  `public.search_linkable_users(TEXT, INT), public.link_team_member(UUID, UUID)`
- Verification: extract both blocks from each file and diff → must be byte-identical.

## Frontend changes

### `src/types/index.ts`

- `TeamMember`: add `email: string | null; profile_id: string | null;`
- `TeamMemberFormData`: add `email: string;`

### `src/components/admin/team-client.tsx`

1. `EMPTY_FORM` + `email: ""`; `openEdit` maps `member.email ?? ""`; `payload` adds `email: form.email.trim() || null` (trigger lowercases). Payload never includes `profile_id`.
2. Form: Email input (Label "Email (optional)" + helper: "Used to automatically detect their account when they sign up.")
3. Card row: if `member.profile_id` → gold `<Badge>Account linked</Badge>` (import Badge), else muted "No account".
4. Actions: **Link account** button when `!member.profile_id` (opens link dialog); **Unlink** when linked (direct RPC call — reversible, no confirm); both `canManage`-gated alongside Edit/Delete.
5. Link dialog (pattern copied from administrators-client search):
   - search input, 350ms debounce, min 2 chars, `searchReqRef` stale-guard, calls `search_linkable_users`
   - results: name/email + gold **Link** button → `link_team_member({p_team_id, p_profile_id})` → close, `fetchMembers()`, notice
   - states: skeletons, "No matching users", error banner
6. Add `notice` state + green banner (same style as administrators-client), shown for link/unlink/save outcomes.

### `src/components/admin/members-client.tsx`

- In `fetchMembers`, also fetch `team_members.select("profile_id").not("profile_id","is","null")` (public RLS allows; failure → empty set, non-fatal) → `teamIds: Set<string>` state.
- Badge: `{teamIds.has(member.id) && <Badge variant="gold">Team</Badge>}` next to member name.

### `src/app/dashboard/page.tsx` (member-facing badge — the "✓" the person sees)

- After `user` loads: `team_members.select("id, full_name, role").eq("profile_id", user.id).maybeSingle()` → `teamLink` state.
- Show gold **"Team member ✓"** badge next to the greeting (exact spot confirmed while editing).

## Verification

1. `npx tsc --noEmit`; `npx eslint src/components/admin/team-client.tsx src/components/admin/members-client.tsx src/app/dashboard/page.tsx src/types/index.ts`; full `npx eslint .` must stay **60 (39/21)**.
2. Diff the new SQL block between both files (byte-identical).
3. User re-runs `supabase/phase3-direct-grant-patch.sql` (idempotent).
4. Headless probes (me):
   - anon + member → both new RPCs return 42501 gate messages
   - super → `search_linkable_users('phase3')` returns unlinked candidates
   - e2e: create listing (REST insert as super) with email of new test signup `phase3testd223454@yaaqworld.com` → POST signup → verify `profile_id` auto-set + audit row
   - e2e: `link_team_member` link → badge fields correct + audit; unlink → `profile_id` NULL and stays NULL (no re-link)
5. User UI walkthrough: email field, Link dialog, Unlink, team-card badge, Members-list badge, dashboard badge.

## Out of scope (known gaps, separate tasks)

- Public `/team` directory still uses **hardcoded mock data** ("Data will be populated from Supabase" TODO) — unrelated to linking.
- "Express Interest" button links to `/team#join`, which has no form (dead anchor).
- Email delivery / invites (none configured; not needed for B+C).
