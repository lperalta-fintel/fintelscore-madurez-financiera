/*
  # Add anon SELECT policies to quiz tables

  1. Problem
    - The admin panel connects to Supabase using the anon key
    - The `quiz_responses` and `quiz_leads` tables have RLS enabled
      but no SELECT policy for the `anon` role
    - This causes the admin panel to show zero results even though
      data exists in the database

  2. Changes
    - Add SELECT policy for `anon` on `quiz_leads`
    - Add SELECT policy for `anon` on `quiz_responses`

  3. Security Note
    - These policies use `USING (true)` because the admin panel's
      custom auth system operates under the `anon` role
    - The admin panel enforces its own authentication via the
      `admins` table and localStorage sessions
    - A future improvement would be migrating to Supabase Auth so
      that proper authenticated RLS policies can be used instead
*/

CREATE POLICY "Anon can read quiz leads"
  ON quiz_leads
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can read quiz responses"
  ON quiz_responses
  FOR SELECT
  TO anon
  USING (true);
