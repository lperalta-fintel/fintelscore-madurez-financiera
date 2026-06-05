/*
  # Restore Anon Policies for Admin Panel Functionality

  ⚠️ CRITICAL SECURITY WARNING ⚠️
  
  This admin panel currently uses localStorage sessions with the anon key.
  This is NOT production-secure because:
  - Anyone with the anon key can bypass authentication
  - Sessions can be forged in localStorage
  - No server-side session validation
  - All "authentication" is client-side only

  RECOMMENDED PRODUCTION SOLUTION:
  1. Implement Supabase Auth with proper user accounts
  2. Store user_role in auth.users.raw_app_meta_data
  3. Use authenticated role with JWT-based RLS policies
  4. Remove all anon write policies
  
  ALTERNATIVE SOLUTIONS:
  - Use Edge Functions with service_role key for admin operations
  - Implement API key authentication with server-side validation
  - Add IP whitelist for admin operations
  
  Current policies below enable admin panel to function with localStorage auth.
*/

CREATE POLICY "Anon can manage admins (INSECURE)"
  ON admins FOR ALL TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Anon can manage clients (INSECURE)"
  ON clients FOR ALL TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Anon can manage questions (INSECURE)"
  ON questions_config FOR ALL TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Anon can manage anchor rules (INSECURE)"
  ON anchor_rules FOR ALL TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Anon can update quiz leads (INSECURE)"
  ON quiz_leads FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Anon can delete quiz leads (INSECURE)"
  ON quiz_leads FOR DELETE TO anon
  USING (true);

CREATE POLICY "Anon can read quiz leads"
  ON quiz_leads FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can delete quiz responses (INSECURE)"
  ON quiz_responses FOR DELETE TO anon
  USING (true);

CREATE POLICY "Anon can read quiz responses"
  ON quiz_responses FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can update system settings (INSECURE)"
  ON system_settings FOR UPDATE TO anon
  USING (true) WITH CHECK (true);
