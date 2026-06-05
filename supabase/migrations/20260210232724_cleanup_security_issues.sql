/*
  # Security Cleanup - Remove Duplicates and Fix Overly Permissive Policies

  1. Drop unused indexes
    - quiz_leads: email, created_at, client_id indexes (not used in queries)
    - clients: name, company indexes (not used in queries)

  2. Remove duplicate and overly permissive anon policies
    - Keep service_role policies (secure)
    - Remove anon write policies (security risk - anyone can modify data)
    - Keep minimal anon read policies for public quiz functionality
    - Keep anon insert for quiz submissions (required for public quiz)

  3. Important Security Note
    - The admin panel currently uses anon key with localStorage sessions
    - This is NOT production-secure - sessions can be forged
    - RECOMMENDED: Migrate to Supabase Auth with proper user authentication
    - Alternative: Use Edge Functions with service_role key and session validation
*/

DROP INDEX IF EXISTS idx_quiz_leads_email;
DROP INDEX IF EXISTS idx_quiz_leads_created_at;
DROP INDEX IF EXISTS idx_quiz_leads_client_id;
DROP INDEX IF EXISTS idx_clients_name;
DROP INDEX IF EXISTS idx_clients_company;

DROP POLICY IF EXISTS "Allow anon to read admins for login" ON admins;
DROP POLICY IF EXISTS "Allow anon to select admins for login" ON admins;
DROP POLICY IF EXISTS "Allow anon insert on admins" ON admins;
DROP POLICY IF EXISTS "Allow anon update on admins" ON admins;
DROP POLICY IF EXISTS "Allow anon delete on admins" ON admins;

DROP POLICY IF EXISTS "Allow anon to insert clients" ON clients;
DROP POLICY IF EXISTS "Allow anon insert on clients" ON clients;
DROP POLICY IF EXISTS "Allow anon to update clients" ON clients;
DROP POLICY IF EXISTS "Allow anon update on clients" ON clients;
DROP POLICY IF EXISTS "Allow anon to delete clients" ON clients;
DROP POLICY IF EXISTS "Allow anon delete on clients" ON clients;
DROP POLICY IF EXISTS "Allow anon to select clients" ON clients;
DROP POLICY IF EXISTS "Allow anon select on clients" ON clients;

DROP POLICY IF EXISTS "Allow anon to insert questions_config" ON questions_config;
DROP POLICY IF EXISTS "Allow anon to update questions_config" ON questions_config;
DROP POLICY IF EXISTS "Allow anon to delete questions_config" ON questions_config;

DROP POLICY IF EXISTS "Allow anon to update anchor_rules" ON anchor_rules;
DROP POLICY IF EXISTS "Allow anon to delete anchor_rules" ON anchor_rules;
DROP POLICY IF EXISTS "Allow anon to insert anchor_rules" ON anchor_rules;

DROP POLICY IF EXISTS "Allow anon to update quiz_leads" ON quiz_leads;
DROP POLICY IF EXISTS "Allow anon update on quiz_leads" ON quiz_leads;
DROP POLICY IF EXISTS "Allow anon to delete quiz_leads" ON quiz_leads;
DROP POLICY IF EXISTS "Allow anon delete on quiz_leads" ON quiz_leads;
DROP POLICY IF EXISTS "Allow anon to select quiz_leads" ON quiz_leads;
DROP POLICY IF EXISTS "Allow anon select on quiz_leads for admin" ON quiz_leads;

DROP POLICY IF EXISTS "Allow anon to delete quiz_responses" ON quiz_responses;
DROP POLICY IF EXISTS "Allow anon delete on quiz_responses" ON quiz_responses;
DROP POLICY IF EXISTS "Allow anon to select quiz_responses" ON quiz_responses;
DROP POLICY IF EXISTS "Allow anon select on quiz_responses for admin" ON quiz_responses;

DROP POLICY IF EXISTS "Allow anon update on system_settings" ON system_settings;
DROP POLICY IF EXISTS "Allow anon to update system_settings" ON system_settings;

CREATE POLICY "Anon can read admins for login check"
  ON admins FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can read active questions"
  ON questions_config FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Anon can read active rules"
  ON anchor_rules FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Anon can insert quiz leads"
  ON quiz_leads FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can insert quiz responses"
  ON quiz_responses FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can read system settings"
  ON system_settings FOR SELECT TO anon
  USING (true);
