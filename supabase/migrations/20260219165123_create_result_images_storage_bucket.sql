/*
  # Create Storage Bucket for Result Images

  1. New Storage Bucket
    - `result-images` - Public bucket for storing generated quiz result images
    - Contains score gauge PNGs and pyramid visualization PNGs

  2. Security
    - Public read access for all (images need to be shareable via webhook)
    - Insert/update restricted to service_role (edge function uses service role key)
    - Delete restricted to service_role
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'result-images',
  'result-images',
  true,
  5242880,
  ARRAY['image/png', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read result images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'result-images');

CREATE POLICY "Service role can insert result images"
  ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'result-images');

CREATE POLICY "Service role can update result images"
  ON storage.objects
  FOR UPDATE
  TO service_role
  USING (bucket_id = 'result-images')
  WITH CHECK (bucket_id = 'result-images');

CREATE POLICY "Service role can delete result images"
  ON storage.objects
  FOR DELETE
  TO service_role
  USING (bucket_id = 'result-images');
