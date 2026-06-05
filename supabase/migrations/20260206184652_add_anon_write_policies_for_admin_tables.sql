/*
  # Add anon write policies for admin-managed tables

  Since the admin panel operates using the anon key (not service_role),
  we need anon write policies for tables that admins modify through the UI.

  1. Security Changes
    - Allow anon to insert/update/delete on `admins` (user management)
    - Allow anon to insert/update/delete on `system_settings` (config management)
    - Allow anon to insert/update/delete on `clients`
    - Allow anon to insert/update/delete on `quiz_leads` (for linking)
    - Allow anon to insert/update/delete on `quiz_responses` (for delete)

  2. Notes
    - These tables already have RLS enabled
    - The admin auth check happens at the application layer (session validation)
    - Anon select policies already exist from previous migrations
*/

CREATE POLICY "Allow anon insert on admins"
  ON admins FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update on admins"
  ON admins FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon delete on admins"
  ON admins FOR DELETE TO anon
  USING (true);

CREATE POLICY "Allow anon update on system_settings"
  ON system_settings FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon insert on clients"
  ON clients FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update on clients"
  ON clients FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon delete on clients"
  ON clients FOR DELETE TO anon
  USING (true);

CREATE POLICY "Allow anon select on clients"
  ON clients FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow anon update on quiz_leads"
  ON quiz_leads FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon delete on quiz_leads"
  ON quiz_leads FOR DELETE TO anon
  USING (true);

CREATE POLICY "Allow anon select on quiz_responses for admin"
  ON quiz_responses FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow anon delete on quiz_responses"
  ON quiz_responses FOR DELETE TO anon
  USING (true);

CREATE POLICY "Allow anon select on quiz_leads for admin"
  ON quiz_leads FOR SELECT TO anon
  USING (true);
