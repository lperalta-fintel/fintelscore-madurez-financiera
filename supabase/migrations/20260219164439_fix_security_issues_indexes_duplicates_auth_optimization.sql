/*
  # Security Cleanup: Indexes, Duplicate Policies & Auth Optimization

  1. Index Fixes
    - Add index on `quiz_leads.client_id` to cover foreign key `quiz_leads_client_id_fkey`
    - This prevents sequential scans on cascade/join operations

  2. Duplicate Policy Removal
    - `admins`: Remove duplicate anon SELECT "Anon can read admins for login check" (covered by "Anon can manage admins" ALL policy)
    - `admins`: Remove duplicate authenticated SELECT "Authenticated users can read admins" (covered by "Admin role can manage admins" ALL policy)
    - `anchor_rules`: Remove duplicate anon SELECT "Anon can read active rules" (duplicate of "Allow anon to read active rules" with same condition)
    - `anchor_rules`: Remove duplicate authenticated SELECT "Authenticated users can read anchor rules" (covered by "Admin role can manage anchor rules" ALL policy)
    - `clients`: Remove duplicate authenticated SELECT "Authenticated users can read clients" (covered by "Editor and admin can manage clients" ALL policy)
    - `questions_config`: Remove duplicate anon SELECT "Anon can read active questions" (duplicate of "Allow anon to read active questions" with same condition)
    - `questions_config`: Remove duplicate authenticated SELECT "Authenticated users can read questions" (covered by "Admin role can manage questions" ALL policy)
    - `quiz_leads`: Remove duplicate anon INSERT "Anon can insert quiz leads" (duplicate of "Allow public insert on quiz_leads")
    - `quiz_leads`: Remove duplicate anon SELECT "Anon can read quiz leads" (covered by broader anon policies)
    - `quiz_leads`: Remove duplicate authenticated SELECT "Authenticated users can read quiz leads" (duplicate of "Allow authenticated select on quiz_leads")
    - `quiz_responses`: Remove duplicate anon INSERT "Anon can insert quiz responses" (duplicate of "Allow public insert on quiz_responses")
    - `quiz_responses`: Remove duplicate anon SELECT "Anon can read quiz responses" (covered by broader anon policies)
    - `quiz_responses`: Remove duplicate authenticated SELECT "Authenticated users can read quiz responses" (duplicate of "Allow authenticated select on quiz_responses")
    - `system_settings`: Remove duplicate anon SELECT "Anon can read system settings" (duplicate of "Allow anon to read system settings")
    - `system_settings`: Remove duplicate authenticated SELECT "Authenticated users can read system settings" (covered by admin UPDATE policy + anon read)

  3. Auth Function Optimization
    - Wrap `auth.jwt()` calls with `(select ...)` in all authenticated policies to prevent
      per-row re-evaluation and improve query performance at scale
    - Affected tables: admins, clients, quiz_leads, quiz_responses, questions_config,
      anchor_rules, system_settings

  4. Important Notes
    - The application currently uses custom admin auth (not Supabase Auth), so all admin
      operations run as the `anon` role. The anon CRUD policies marked (INSECURE) are
      intentionally kept because the admin panel depends on them.
    - The authenticated policies with auth.jwt() are retained and optimized for future
      migration to Supabase Auth.
    - No data is modified by this migration - only indexes and policies are affected.
*/

-- ============================================================
-- 1. Add missing index on quiz_leads.client_id foreign key
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_quiz_leads_client_id
  ON public.quiz_leads (client_id);


-- ============================================================
-- 2. Remove duplicate permissive policies
-- ============================================================

-- admins: remove duplicate anon SELECT (covered by ALL policy)
DROP POLICY IF EXISTS "Anon can read admins for login check" ON public.admins;

-- admins: remove duplicate authenticated SELECT (covered by ALL policy)
DROP POLICY IF EXISTS "Authenticated users can read admins" ON public.admins;

-- anchor_rules: remove exact duplicate anon SELECT
DROP POLICY IF EXISTS "Anon can read active rules" ON public.anchor_rules;

-- anchor_rules: remove duplicate authenticated SELECT (covered by ALL policy)
DROP POLICY IF EXISTS "Authenticated users can read anchor rules" ON public.anchor_rules;

-- clients: remove duplicate authenticated SELECT (covered by ALL policy)
DROP POLICY IF EXISTS "Authenticated users can read clients" ON public.clients;

-- questions_config: remove exact duplicate anon SELECT
DROP POLICY IF EXISTS "Anon can read active questions" ON public.questions_config;

-- questions_config: remove duplicate authenticated SELECT (covered by ALL policy)
DROP POLICY IF EXISTS "Authenticated users can read questions" ON public.questions_config;

-- quiz_leads: remove duplicate anon INSERT
DROP POLICY IF EXISTS "Anon can insert quiz leads" ON public.quiz_leads;

-- quiz_leads: remove duplicate anon SELECT (covered by broader anon policies)
DROP POLICY IF EXISTS "Anon can read quiz leads" ON public.quiz_leads;

-- quiz_leads: remove duplicate authenticated SELECT
DROP POLICY IF EXISTS "Authenticated users can read quiz leads" ON public.quiz_leads;

-- quiz_responses: remove duplicate anon INSERT
DROP POLICY IF EXISTS "Anon can insert quiz responses" ON public.quiz_responses;

-- quiz_responses: remove duplicate anon SELECT (covered by broader anon policies)
DROP POLICY IF EXISTS "Anon can read quiz responses" ON public.quiz_responses;

-- quiz_responses: remove duplicate authenticated SELECT
DROP POLICY IF EXISTS "Authenticated users can read quiz responses" ON public.quiz_responses;

-- system_settings: remove duplicate anon SELECT
DROP POLICY IF EXISTS "Anon can read system settings" ON public.system_settings;

-- system_settings: remove duplicate authenticated SELECT
DROP POLICY IF EXISTS "Authenticated users can read system settings" ON public.system_settings;


-- ============================================================
-- 3. Optimize auth.jwt() calls with (select ...) wrapper
-- ============================================================

-- admins: "Admin role can manage admins"
DROP POLICY IF EXISTS "Admin role can manage admins" ON public.admins;
CREATE POLICY "Admin role can manage admins"
  ON public.admins
  FOR ALL
  TO authenticated
  USING (
    COALESCE(((select auth.jwt()) -> 'app_metadata'::text) ->> 'user_role'::text, 'viewer'::text) = 'admin'::text
  )
  WITH CHECK (
    COALESCE(((select auth.jwt()) -> 'app_metadata'::text) ->> 'user_role'::text, 'viewer'::text) = 'admin'::text
  );

-- anchor_rules: "Admin role can manage anchor rules"
DROP POLICY IF EXISTS "Admin role can manage anchor rules" ON public.anchor_rules;
CREATE POLICY "Admin role can manage anchor rules"
  ON public.anchor_rules
  FOR ALL
  TO authenticated
  USING (
    COALESCE(((select auth.jwt()) -> 'app_metadata'::text) ->> 'user_role'::text, 'viewer'::text) = 'admin'::text
  )
  WITH CHECK (
    COALESCE(((select auth.jwt()) -> 'app_metadata'::text) ->> 'user_role'::text, 'viewer'::text) = 'admin'::text
  );

-- clients: "Editor and admin can manage clients"
DROP POLICY IF EXISTS "Editor and admin can manage clients" ON public.clients;
CREATE POLICY "Editor and admin can manage clients"
  ON public.clients
  FOR ALL
  TO authenticated
  USING (
    COALESCE(((select auth.jwt()) -> 'app_metadata'::text) ->> 'user_role'::text, 'viewer'::text) = ANY (ARRAY['admin'::text, 'editor'::text])
  )
  WITH CHECK (
    COALESCE(((select auth.jwt()) -> 'app_metadata'::text) ->> 'user_role'::text, 'viewer'::text) = ANY (ARRAY['admin'::text, 'editor'::text])
  );

-- questions_config: "Admin role can manage questions"
DROP POLICY IF EXISTS "Admin role can manage questions" ON public.questions_config;
CREATE POLICY "Admin role can manage questions"
  ON public.questions_config
  FOR ALL
  TO authenticated
  USING (
    COALESCE(((select auth.jwt()) -> 'app_metadata'::text) ->> 'user_role'::text, 'viewer'::text) = 'admin'::text
  )
  WITH CHECK (
    COALESCE(((select auth.jwt()) -> 'app_metadata'::text) ->> 'user_role'::text, 'viewer'::text) = 'admin'::text
  );

-- quiz_leads: "Editor and admin can manage quiz leads"
DROP POLICY IF EXISTS "Editor and admin can manage quiz leads" ON public.quiz_leads;
CREATE POLICY "Editor and admin can manage quiz leads"
  ON public.quiz_leads
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE(((select auth.jwt()) -> 'app_metadata'::text) ->> 'user_role'::text, 'viewer'::text) = ANY (ARRAY['admin'::text, 'editor'::text])
  )
  WITH CHECK (
    COALESCE(((select auth.jwt()) -> 'app_metadata'::text) ->> 'user_role'::text, 'viewer'::text) = ANY (ARRAY['admin'::text, 'editor'::text])
  );

-- quiz_leads: "Editor and admin can delete quiz leads"
DROP POLICY IF EXISTS "Editor and admin can delete quiz leads" ON public.quiz_leads;
CREATE POLICY "Editor and admin can delete quiz leads"
  ON public.quiz_leads
  FOR DELETE
  TO authenticated
  USING (
    COALESCE(((select auth.jwt()) -> 'app_metadata'::text) ->> 'user_role'::text, 'viewer'::text) = ANY (ARRAY['admin'::text, 'editor'::text])
  );

-- quiz_responses: "Editor and admin can delete quiz responses"
DROP POLICY IF EXISTS "Editor and admin can delete quiz responses" ON public.quiz_responses;
CREATE POLICY "Editor and admin can delete quiz responses"
  ON public.quiz_responses
  FOR DELETE
  TO authenticated
  USING (
    COALESCE(((select auth.jwt()) -> 'app_metadata'::text) ->> 'user_role'::text, 'viewer'::text) = ANY (ARRAY['admin'::text, 'editor'::text])
  );

-- system_settings: "Admin role can manage system settings"
DROP POLICY IF EXISTS "Admin role can manage system settings" ON public.system_settings;
CREATE POLICY "Admin role can manage system settings"
  ON public.system_settings
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE(((select auth.jwt()) -> 'app_metadata'::text) ->> 'user_role'::text, 'viewer'::text) = 'admin'::text
  )
  WITH CHECK (
    COALESCE(((select auth.jwt()) -> 'app_metadata'::text) ->> 'user_role'::text, 'viewer'::text) = 'admin'::text
  );
