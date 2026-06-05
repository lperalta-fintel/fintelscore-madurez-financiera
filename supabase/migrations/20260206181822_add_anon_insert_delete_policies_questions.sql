/*
  # Add insert and delete policies for questions_config

  Adds anon policies to allow creating and deleting questions
  from the admin panel.

  1. Security
    - Allow anon to insert into questions_config
    - Allow anon to delete from questions_config
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'questions_config' AND policyname = 'Allow anon to insert questions_config'
  ) THEN
    CREATE POLICY "Allow anon to insert questions_config"
      ON questions_config
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'questions_config' AND policyname = 'Allow anon to delete questions_config'
  ) THEN
    CREATE POLICY "Allow anon to delete questions_config"
      ON questions_config
      FOR DELETE
      TO anon
      USING (true);
  END IF;
END $$;
