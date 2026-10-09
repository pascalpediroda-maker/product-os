---
name: pos-check-rls
description: >
  Check row-level security (RLS) on the product's database tables in both directions: what is
  blocked that should not be, and what is open that should not be. Per-table and whole-schema
  queries, the exposure of SECURITY DEFINER functions, the fix patterns, and the public-surface
  invariant test kept green. Run it automatically on any new route that queries a table, any new
  query, any new or seeded table, any unexpected empty result, any schema change; or when someone
  says "check RLS", "check the policies", "why is my query empty", "/pos-check-rls".
---

# Check row-level security

Codes such as S16 refer to the rules of the Build pivot, `<pivots.dir>/product_build_context.md`;
section numbers to its product sections. The queries below are written for Postgres with the
Supabase roles (`anon` for the publishable key, `authenticated` for a signed-in user,
`service_role` for the server).

## When to run this check

Automatically, whenever you:

1. write a new API route that queries a table;
2. add a new query on a table, in server or client code;
3. create or seed a new table;
4. get an unexpected empty result from a query;
5. touch the schema at all; then also read the database's security advisors.

Run every query below as rule S15 says: inside a transaction that starts with a short statement
timeout. Use the database connector found in the session (`pos-tool-conventions`, Supabase
reference).

## Read this first: the two failure modes

This check used to look for one thing only, "why is my query empty", and its fix patterns all opened
access. That framing cost months: dozens of tables sat with RLS disabled, readable AND writable with
the publishable key, and the check would have reported them as fine, because nothing was blocked.

| Symptom | What it means | Direction of the fix |
|---|---|---|
| a query returns empty for a signed-in user | a policy is missing or too narrow | add a SELECT policy for `authenticated` |
| `relrowsecurity = false` | **the table is exposed**: anon can read, insert, update, delete | enable RLS, then write the policies the feature needs |

A table with RLS enabled and NO policy is not broken: it is closed to everyone except the service
role (the server). That is the safe default.

## What to check

```sql
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,          -- false = EXPOSED, treat as a finding
  has_table_privilege('anon', c.oid, 'SELECT') AS anon_select,
  has_table_privilege('anon', c.oid, 'INSERT') AS anon_insert,
  has_table_privilege('anon', c.oid, 'DELETE') AS anon_delete,
  pol.polname AS policy_name,
  CASE pol.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END AS command,
  pol.polroles::regrole[] AS roles,
  pg_get_expr(pol.polqual, pol.polrelid) AS using_expr,
  pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expr
FROM pg_class c
LEFT JOIN pg_policy pol ON pol.polrelid = c.oid
WHERE c.relname = '<table_name>'
  AND c.relnamespace = 'public'::regnamespace;
```

Whole-schema sweep (it should return zero rows):

```sql
SELECT c.relname
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('r','p') AND NOT c.relrowsecurity;
```

## What to look for

- **RLS disabled:** a finding, not a convenience. Enable it. When the product has an event trigger
  that enables RLS on new tables (Build pivot section 6), new tables get it automatically.
- **RLS enabled, no policy:** closed to the API roles, server-side access only. Fine when every
  consumer is server-side; a bug when a screen reads the table with the user's session.
- **A policy with `USING (false)`:** blocks everyone (the service-role-only pattern).
- **No SELECT policy for `authenticated`:** server routes that use the user's session and client
  components both come back empty, silently.
- **No SELECT policy for `anon`:** matters only when a truly public page reads the table WITHOUT the
  admin client. Check how public pages read before opening anything: they often go through the
  server's admin client (S8).
- **A write policy for `authenticated`:** justify it. When the only writer is the server, there must
  be none.

## Common fix patterns

The membership helpers named below are the ones Build pivot section 4 lists for each tenant level.

```sql
-- Reference or global table: every signed-in user reads, nobody writes but the server
ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;
CREATE POLICY <table>_read ON public.<table> FOR SELECT TO authenticated USING (true);

-- Table scoped to a lower tenant level (for example a project)
CREATE POLICY <table>_member_read ON public.<table>
  FOR SELECT TO authenticated USING (<lower_level_membership_helper>(<lower_level>_id));

-- Table scoped to the top tenant level (for example a workspace)
CREATE POLICY <table>_tenant_read ON public.<table>
  FOR SELECT TO authenticated USING (<top_level_membership_helper>(<top_level>_id));
```

A function declared `SECURITY DEFINER` bypasses RLS entirely: check those too.

```sql
SELECT p.proname, p.prosecdef,
       has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_exec,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS auth_exec
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.prosecdef;
```

A definer function that does not check its caller must be revoked:

```sql
REVOKE ALL ON FUNCTION public.<fn>(<types>) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.<fn>(<types>) TO service_role;
```

Revoking `anon` and `authenticated` without `PUBLIC` changes nothing: Postgres grants EXECUTE to
PUBLIC by default.

**Before revoking or closing anything that is in service,** write what a caller obtains today: if the
answer is "nothing more than it already sees", there is nothing to close. A change to the rights or
policies of what is in service is a behaviour-changing migration (S16): it goes on its own line of
the risk card (`pos-post-impl-checklist`, Gate 5b), with its rollback, and is not applied before the
go that names it.

## Output

Report the RLS status and the issues found in both directions: what is blocked that should not be,
and what is open that should not be. Fix through the connector's migration operation, then keep the
public-surface invariant test of Build pivot section 6 green: it fails on any table without RLS, on
any server-only function that regains anon or authenticated EXECUTE, and when the RLS event trigger
is removed. When the product has no such test yet, say so in the report.
