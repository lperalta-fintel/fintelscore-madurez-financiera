/*
  # Add anon access policies for admin panel

  Since this is a simple admin panel with basic authentication (stored in admins table),
  we need to allow anon role to access the admin tables for CRUD operations.

  1. Security Updates
    - Add anon SELECT/INSERT/UPDATE/DELETE policies for admins table (for login)
    - Add anon full access policies for clients table
    - Add anon full access policies for questions_config table
    - Add anon full access policies for anchor_rules table
    - Add anon SELECT/UPDATE/DELETE policies for quiz_leads and quiz_responses

  Note: This is a simplified security model. For production, consider using
  Supabase Auth with proper JWT-based authentication.
*/

CREATE POLICY "Allow anon to select admins for login"
  ON admins
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to select clients"
  ON clients
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert clients"
  ON clients
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to update clients"
  ON clients
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon to delete clients"
  ON clients
  FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow anon to update questions_config"
  ON questions_config
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon to update anchor_rules"
  ON anchor_rules
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon to select quiz_leads"
  ON quiz_leads
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to update quiz_leads"
  ON quiz_leads
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon to delete quiz_leads"
  ON quiz_leads
  FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow anon to select quiz_responses"
  ON quiz_responses
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to delete quiz_responses"
  ON quiz_responses
  FOR DELETE
  TO anon
  USING (true);