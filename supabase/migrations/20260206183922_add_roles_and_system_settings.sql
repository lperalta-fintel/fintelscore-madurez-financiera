/*
  # Add Roles to Admins and Create System Settings

  1. Modified Tables
    - `admins`
      - Added `role` (text) - User role: 'admin', 'editor', or 'viewer'. Defaults to 'viewer'.
      - Added `is_active` (boolean) - Whether the user account is active. Defaults to true.
      - Updated existing admin user to have 'admin' role.

  2. New Tables
    - `system_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Setting key name
      - `value` (text) - Setting value
      - `category` (text) - Category: 'general', 'integrations', etc.
      - `updated_at` (timestamptz) - Last update timestamp

  3. Security
    - Enable RLS on `system_settings`
    - Anon can read system_settings (needed for pixel/integrations on public pages)
    - Service role has full access

  4. Initial Data
    - Default system settings for general config and integrations
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admins' AND column_name = 'role'
  ) THEN
    ALTER TABLE admins ADD COLUMN role text NOT NULL DEFAULT 'viewer';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admins' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE admins ADD COLUMN is_active boolean NOT NULL DEFAULT true;
  END IF;
END $$;

UPDATE admins SET role = 'admin' WHERE username = 'admin';

CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon to read system settings"
  ON system_settings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow service role full access to system_settings"
  ON system_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon to read admins for login"
  ON admins
  FOR SELECT
  TO anon
  USING (true);

INSERT INTO system_settings (key, value, category) VALUES
  ('system_name', 'FINTEL Score', 'general'),
  ('company_name', 'FINTEL', 'general'),
  ('company_description', 'Asesoria e Inteligencia Financiera', 'general'),
  ('contact_email', '', 'general'),
  ('facebook_pixel_id', '', 'integrations'),
  ('webhook_url', '', 'integrations'),
  ('webhook_enabled', 'false', 'integrations'),
  ('google_analytics_id', '', 'integrations'),
  ('calendar_url', 'https://web.fintel.do/CALENDARIO', 'general')
ON CONFLICT (key) DO NOTHING;
