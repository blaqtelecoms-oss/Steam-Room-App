-- Schema adjustments applied during Base44 -> Supabase data migration.
-- Base44 record ids are 24-char hex strings (Mongo-style ObjectIds), not UUIDs,
-- so id + created_by_id are widened from uuid -> text to preserve the original
-- values and all foreign-key-style references (member_id, trainer_id, ...).
-- Extra columns present in the actual Base44 data but absent from the initial
-- schema are added here so nothing is lost. RLS stays enabled on every table.

-- Advert -> advert
ALTER TABLE public.advert ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.advert ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.advert ALTER COLUMN created_by_id TYPE text USING created_by_id::text;
ALTER TABLE public.advert ADD COLUMN IF NOT EXISTS "is_sample" boolean;

-- Agreement -> agreement
ALTER TABLE public.agreement ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.agreement ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.agreement ALTER COLUMN created_by_id TYPE text USING created_by_id::text;
ALTER TABLE public.agreement ADD COLUMN IF NOT EXISTS "is_sample" boolean;

-- Booking -> booking
ALTER TABLE public.booking ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.booking ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.booking ALTER COLUMN created_by_id TYPE text USING created_by_id::text;

-- Challenge -> challenge
ALTER TABLE public.challenge ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.challenge ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.challenge ALTER COLUMN created_by_id TYPE text USING created_by_id::text;
ALTER TABLE public.challenge ADD COLUMN IF NOT EXISTS "before_image_url" text;
ALTER TABLE public.challenge ADD COLUMN IF NOT EXISTS "after_image_url" text;
ALTER TABLE public.challenge ADD COLUMN IF NOT EXISTS "is_sample" boolean;

-- DebitRecord -> debitrecord
ALTER TABLE public.debitrecord ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.debitrecord ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.debitrecord ALTER COLUMN created_by_id TYPE text USING created_by_id::text;
ALTER TABLE public.debitrecord ADD COLUMN IF NOT EXISTS "is_sample" boolean;

-- Employee -> employee
ALTER TABLE public.employee ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.employee ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.employee ALTER COLUMN created_by_id TYPE text USING created_by_id::text;
ALTER TABLE public.employee ADD COLUMN IF NOT EXISTS "is_sample" boolean;

-- Mandate -> mandate
ALTER TABLE public.mandate ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.mandate ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.mandate ALTER COLUMN created_by_id TYPE text USING created_by_id::text;

-- Member -> member
ALTER TABLE public.member ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.member ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.member ALTER COLUMN created_by_id TYPE text USING created_by_id::text;
ALTER TABLE public.member ADD COLUMN IF NOT EXISTS "is_sample" boolean;

-- Order -> orders
ALTER TABLE public.orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.orders ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.orders ALTER COLUMN created_by_id TYPE text USING created_by_id::text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "is_sample" boolean;

-- Payment -> payment
ALTER TABLE public.payment ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.payment ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.payment ALTER COLUMN created_by_id TYPE text USING created_by_id::text;
ALTER TABLE public.payment ADD COLUMN IF NOT EXISTS "is_sample" boolean;

-- Product -> product
ALTER TABLE public.product ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.product ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.product ALTER COLUMN created_by_id TYPE text USING created_by_id::text;
ALTER TABLE public.product ADD COLUMN IF NOT EXISTS "is_sample" boolean;

-- Program -> program
ALTER TABLE public.program ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.program ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.program ALTER COLUMN created_by_id TYPE text USING created_by_id::text;
ALTER TABLE public.program ADD COLUMN IF NOT EXISTS "is_sample" boolean;

-- Progress -> progress
ALTER TABLE public.progress ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.progress ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.progress ALTER COLUMN created_by_id TYPE text USING created_by_id::text;
ALTER TABLE public.progress ADD COLUMN IF NOT EXISTS "is_sample" boolean;

-- Promotion -> promotion
ALTER TABLE public.promotion ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.promotion ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.promotion ALTER COLUMN created_by_id TYPE text USING created_by_id::text;
ALTER TABLE public.promotion ADD COLUMN IF NOT EXISTS "is_sample" boolean;

-- Testimonial -> testimonial
ALTER TABLE public.testimonial ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.testimonial ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.testimonial ALTER COLUMN created_by_id TYPE text USING created_by_id::text;

-- Trainer -> trainer
ALTER TABLE public.trainer ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.trainer ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.trainer ALTER COLUMN created_by_id TYPE text USING created_by_id::text;
ALTER TABLE public.trainer ADD COLUMN IF NOT EXISTS "is_sample" boolean;

-- User -> users
ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.users ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.users ALTER COLUMN created_by_id TYPE text USING created_by_id::text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "auth_id" uuid; -- links to auth.users.id (Supabase Auth migration)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "full_name" text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "disabled" text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "disabled_reason" text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "is_verified" boolean;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "force_password_reset" boolean;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "app_id" text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "is_service" boolean;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "collaborator_role" text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "_app_role" text;

-- Vote -> vote
ALTER TABLE public.vote ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.vote ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.vote ALTER COLUMN created_by_id TYPE text USING created_by_id::text;

