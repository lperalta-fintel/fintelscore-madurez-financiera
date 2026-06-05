/*
  # Add Email to Admins Table

  1. Modifications
    - Add email column to admins table (for Supabase Auth integration)
    - Update existing admin with email
    - Add unique constraint on email

  2. Notes
    - Email will be used for Supabase Auth login
    - Username remains for display purposes
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admins' AND column_name = 'email'
  ) THEN
    ALTER TABLE admins ADD COLUMN email text;
  END IF;
END $$;

UPDATE admins SET email = username || '@fintel.local' WHERE email IS NULL;

ALTER TABLE admins ALTER COLUMN email SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
