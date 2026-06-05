/*
  # Setup Authenticated Role Policies

  1. RLS Policies for Authenticated Users
    - Use JWT claims for role-based access control
    - Role stored in raw_app_meta_data.user_role
    - Admins can manage based on their role
    - Questions/Rules: Only admin role
    - Clients/Submissions: Admin and editor roles  
    - Settings/Users: Only admin role
    - Dashboard: All authenticated users

  2. Policy Structure
    - Check role from JWT: (auth.jwt() -> 'app_metadata' ->> 'user_role')
    - Default to viewer if role not set
    - Separate policies for different permission levels
*/

CREATE POLICY "Authenticated users can read admins"
  ON admins FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin role can manage admins"
  ON admins FOR ALL TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'user_role')::text,
      'viewer'
    ) = 'admin'
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'user_role')::text,
      'viewer'
    ) = 'admin'
  );

CREATE POLICY "Editor and admin can manage clients"
  ON clients FOR ALL TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'user_role')::text,
      'viewer'
    ) IN ('admin', 'editor')
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'user_role')::text,
      'viewer'
    ) IN ('admin', 'editor')
  );

CREATE POLICY "Authenticated users can read clients"
  ON clients FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Editor and admin can manage quiz leads"
  ON quiz_leads FOR UPDATE TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'user_role')::text,
      'viewer'
    ) IN ('admin', 'editor')
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'user_role')::text,
      'viewer'
    ) IN ('admin', 'editor')
  );

CREATE POLICY "Editor and admin can delete quiz leads"
  ON quiz_leads FOR DELETE TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'user_role')::text,
      'viewer'
    ) IN ('admin', 'editor')
  );

CREATE POLICY "Authenticated users can read quiz leads"
  ON quiz_leads FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Editor and admin can delete quiz responses"
  ON quiz_responses FOR DELETE TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'user_role')::text,
      'viewer'
    ) IN ('admin', 'editor')
  );

CREATE POLICY "Authenticated users can read quiz responses"
  ON quiz_responses FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin role can manage questions"
  ON questions_config FOR ALL TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'user_role')::text,
      'viewer'
    ) = 'admin'
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'user_role')::text,
      'viewer'
    ) = 'admin'
  );

CREATE POLICY "Authenticated users can read questions"
  ON questions_config FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin role can manage anchor rules"
  ON anchor_rules FOR ALL TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'user_role')::text,
      'viewer'
    ) = 'admin'
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'user_role')::text,
      'viewer'
    ) = 'admin'
  );

CREATE POLICY "Authenticated users can read anchor rules"
  ON anchor_rules FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin role can manage system settings"
  ON system_settings FOR UPDATE TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'user_role')::text,
      'viewer'
    ) = 'admin'
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'user_role')::text,
      'viewer'
    ) = 'admin'
  );

CREATE POLICY "Authenticated users can read system settings"
  ON system_settings FOR SELECT TO authenticated
  USING (true);
