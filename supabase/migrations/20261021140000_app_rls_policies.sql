-- Permissive RLS policies so the migrated app works with the Supabase anon/authenticated client.
-- NOTE: these are intentionally broad to preserve the original app behaviour (public marketing
-- pages + SR-number/EMP-number portal logins that are not tied to Supabase Auth sessions).
-- TODO for production: tighten to row-level security per role (admin vs. member-owned rows).

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'advert','agreement','booking','challenge','debitrecord','employee','mandate',
    'member','orders','payment','product','program','progress','promotion',
    'testimonial','trainer','users','vote'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'app_read', t);
    EXECUTE format('CREATE POLICY app_read ON public.%I FOR SELECT TO anon, authenticated USING (true);', t);

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'app_write', t);
    EXECUTE format('CREATE POLICY app_write ON public.%I FOR INSERT TO authenticated WITH CHECK (true);', t);

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'app_update', t);
    EXECUTE format('CREATE POLICY app_update ON public.%I FOR UPDATE TO authenticated USING (true);', t);

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'app_delete', t);
    EXECUTE format('CREATE POLICY app_delete ON public.%I FOR DELETE TO authenticated USING (true);', t);
  END LOOP;
END $$;

-- Default public bucket for generic uploads that don't map to a specific domain bucket.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at, type)
VALUES ('media', 'media', true, 52428800,
        ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4'], now(), now(), 'STANDARD')
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public read media" ON storage.objects;
CREATE POLICY "public read media" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'media');
DROP POLICY IF EXISTS "auth write media" ON storage.objects;
CREATE POLICY "auth write media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');
