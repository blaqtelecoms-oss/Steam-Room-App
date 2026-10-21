-- Storage buckets for all app uploads (migrated from Base44 UploadPublicFile / UploadPrivateFile)
-- Public buckets: store/product images, adverts (image+video), trainer images, challenge photos, member avatars
-- Private bucket: debit records & other private documents

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at, type)
VALUES
  ('products',  'products',  true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif'], now(), now(), 'STANDARD'),
  ('adverts',   'adverts',   true, 52428800, ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4'], now(), now(), 'STANDARD'),
  ('trainers',  'trainers',  true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif'], now(), now(), 'STANDARD'),
  ('challenge', 'challenge', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif'], now(), now(), 'STANDARD'),
  ('avatars',   'avatars',   true, 52428800, ARRAY['image/jpeg','image/png','image/webp','image/gif'], now(), now(), 'STANDARD'),
  ('documents', 'documents', false, 10485760, ARRAY['application/pdf'], now(), now(), 'STANDARD')
ON CONFLICT (id) DO NOTHING;

-- Default Storage RLS policies:
--  - public buckets: anyone can read; authenticated users can write their own objects
--  - private bucket (documents): only the owning authenticated user can read/write their own objects
-- (service_role bypasses RLS and can manage all objects)

-- public read for public buckets
DROP POLICY IF EXISTS "public read" ON storage.objects;
CREATE POLICY "public read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('products','adverts','trainers','challenge','avatars'));

-- authenticated users can upload/update/delete in public buckets
DROP POLICY IF EXISTS "auth write public" ON storage.objects;
CREATE POLICY "auth write public" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('products','adverts','trainers','challenge','avatars'));
DROP POLICY IF EXISTS "auth update public" ON storage.objects;
CREATE POLICY "auth update public" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id IN ('products','adverts','trainers','challenge','avatars'));
DROP POLICY IF EXISTS "auth delete public" ON storage.objects;
CREATE POLICY "auth delete public" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id IN ('products','adverts','trainers','challenge','avatars'));

-- private documents: owner-only read/write (auth.uid() = owner_id)
DROP POLICY IF EXISTS "owner read documents" ON storage.objects;
CREATE POLICY "owner read documents" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'documents' AND owner_id = auth.uid()::text);
DROP POLICY IF EXISTS "owner write documents" ON storage.objects;
CREATE POLICY "owner write documents" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents' AND owner_id = auth.uid()::text);
DROP POLICY IF EXISTS "owner update documents" ON storage.objects;
CREATE POLICY "owner update documents" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'documents' AND owner_id = auth.uid()::text);
DROP POLICY IF EXISTS "owner delete documents" ON storage.objects;
CREATE POLICY "owner delete documents" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'documents' AND owner_id = auth.uid()::text);
