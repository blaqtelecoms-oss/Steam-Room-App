-- Dedicated public storage bucket for the admin-managed gallery (images + videos).
-- Public read so the gallery renders for signed-in viewers; only authenticated
-- users may upload/update/delete (the UI further restricts those actions to admins).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at, type)
VALUES (
  'gallery', 'gallery', true, 52428800,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webp','video/quicktime'],
  now(), now(), 'STANDARD'
)
ON CONFLICT (id) DO NOTHING;

-- Public read for the gallery bucket
DROP POLICY IF EXISTS "public read gallery" ON storage.objects;
CREATE POLICY "public read gallery" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'gallery');

-- Authenticated users can upload/update/delete gallery objects
DROP POLICY IF EXISTS "auth write gallery" ON storage.objects;
CREATE POLICY "auth write gallery" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "auth update gallery" ON storage.objects;
CREATE POLICY "auth update gallery" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "auth delete gallery" ON storage.objects;
CREATE POLICY "auth delete gallery" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'gallery');
