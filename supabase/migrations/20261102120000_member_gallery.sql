-- Member media gallery: images/videos published by admins for the member portal.
-- Records are Base44-style 24-char hex ids (like the other migrated entities), so
-- id / created_by_id are text, not uuid.

CREATE TABLE IF NOT EXISTS public.gallery_item (
  id text PRIMARY KEY,
  title text NOT NULL,
  caption text,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  active boolean DEFAULT true,
  "order" double precision DEFAULT 0,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now(),
  created_by_id text
);

ALTER TABLE public.gallery_item ENABLE ROW LEVEL SECURITY;

-- Members use the SR-number portal login (anon role) and may only see published
-- media; the admin console runs as an authenticated user and sees everything.
DROP POLICY IF EXISTS app_read_published ON public.gallery_item;
CREATE POLICY app_read_published ON public.gallery_item
  FOR SELECT TO anon USING (active = true);

DROP POLICY IF EXISTS app_read ON public.gallery_item;
CREATE POLICY app_read ON public.gallery_item
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS app_write ON public.gallery_item;
CREATE POLICY app_write ON public.gallery_item
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS app_update ON public.gallery_item;
CREATE POLICY app_update ON public.gallery_item
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS app_delete ON public.gallery_item;
CREATE POLICY app_delete ON public.gallery_item
  FOR DELETE TO authenticated USING (true);

-- Bucket for gallery uploads (images + video).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at, type)
VALUES ('gallery', 'gallery', true, 52428800,
        ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'],
        now(), now(), 'STANDARD')
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public read gallery" ON storage.objects;
CREATE POLICY "public read gallery" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "auth write gallery" ON storage.objects;
CREATE POLICY "auth write gallery" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "auth update gallery" ON storage.objects;
CREATE POLICY "auth update gallery" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "auth delete gallery" ON storage.objects;
CREATE POLICY "auth delete gallery" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'gallery');
