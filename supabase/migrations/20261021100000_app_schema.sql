-- SR Fits / Apex Vitality — app schema migrated from Base44 entity definitions.
-- All 18 entities (including ones that will stay empty) get a table here.
-- Base44 standard columns per entity: id, created_date, updated_date, created_by_id.
-- Table names follow the entity name (lowercased); reserved words use a plural form.
-- RLS is enabled on every table (matches Base44's auto-enable); service_role bypasses it.

SET check_function_bodies = off;

-- ============================================================
-- users  (Base44 "User" entity — app users + their role)
-- ============================================================
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  role text NOT NULL DEFAULT 'user',
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now(),
  created_by_id uuid
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- member
-- ============================================================
CREATE TABLE public.member (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  date_joined date,
  membership_tier text DEFAULT 'Pro',
  status text DEFAULT 'active',
  card_id text,
  id_type text DEFAULT 'RSA ID',
  id_number text,
  phone text,
  email text,
  avatar_url text,
  next_payment_date date,
  next_payment_amount double precision,
  contract_start_date date,
  contract_length_months double precision,
  joining_fee double precision,
  monthly_premium double precision,
  credit_limit double precision DEFAULT 500,
  credit_balance double precision DEFAULT 0,
  credit_streak double precision DEFAULT 0,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now(),
  created_by_id uuid
);
ALTER TABLE public.member ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- trainer
-- ============================================================
CREATE TABLE public.trainer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialty text,
  image text,
  image_fit text DEFAULT 'cover',
  image_position text DEFAULT 'top',
  bio text,
  certifications jsonb,
  experience text,
  rating double precision DEFAULT 5,
  "order" double precision DEFAULT 0,
  active boolean DEFAULT true,
  sr_code text,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now(),
  created_by_id uuid
);
ALTER TABLE public.trainer ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- booking
-- ============================================================
CREATE TABLE public.booking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id text,
  member_name text,
  member_phone text,
  trainer_id text,
  trainer_name text,
  session_type text DEFAULT 'One-on-One',
  price double precision,
  date date,
  time text,
  second_participant text,
  status text DEFAULT 'pending',
  notes text,
  trainer_paid boolean DEFAULT false,
  trainer_paid_date date,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now(),
  created_by_id uuid
);
ALTER TABLE public.booking ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- payment
-- ============================================================
CREATE TABLE public.payment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id text,
  amount double precision,
  date date,
  status text DEFAULT 'pending',
  description text,
  due_date date,
  method text,
  invoice_no text,
  type text DEFAULT 'membership',
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now(),
  created_by_id uuid
);
ALTER TABLE public.payment ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- orders  (Base44 "Order" entity — "order" is a SQL reserved word)
-- ============================================================
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text,
  member_id text,
  email text,
  amount double precision,
  type text DEFAULT 'merchandise',
  description text,
  items jsonb,
  status text DEFAULT 'pending',
  fulfillment_status text DEFAULT 'pending',
  payment_reference text,
  payment_id text,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now(),
  created_by_id uuid
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- product
-- ============================================================
CREATE TABLE public.product (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price double precision,
  image_url text,
  description text,
  category text,
  stock double precision,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now(),
  created_by_id uuid
);
ALTER TABLE public.product ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- program
-- ============================================================
CREATE TABLE public.program (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id text,
  title text NOT NULL,
  description text,
  focus_area text,
  exercises jsonb,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now(),
  created_by_id uuid
);
ALTER TABLE public.program ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- progress
-- ============================================================
CREATE TABLE public.progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id text,
  date date,
  weight double precision,
  body_fat double precision,
  workout_completed text,
  personal_record text,
  notes text,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now(),
  created_by_id uuid
);
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- agreement
-- ============================================================
CREATE TABLE public.agreement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id text,
  type text DEFAULT 'terms',
  agreed boolean DEFAULT false,
  signature text,
  signed_date date,
  answers jsonb,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now(),
  created_by_id uuid
);
ALTER TABLE public.agreement ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- mandate
-- ============================================================
CREATE TABLE public.mandate (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id text,
  membership_type text,
  id_type text DEFAULT 'RSA ID',
  id_number text,
  other_id text,
  cell_number text,
  email_address text,
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  country text,
  nok_name text,
  nok_relationship text,
  nok_contact text,
  nok_alt_contact text,
  account_holder_type text DEFAULT 'Individual',
  account_holder text,
  bank text,
  branch_code text,
  account_number text,
  account_type text DEFAULT 'Current (Cheque)',
  contract_reference text,
  contract_amount double precision,
  max_collection_amount double precision,
  mandate_type text DEFAULT 'FIXED',
  instalment_occurrence text DEFAULT 'RECURRING',
  frequency text DEFAULT 'MONTHLY',
  start_date date,
  debit_day text,
  agreed boolean DEFAULT false,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now(),
  created_by_id uuid
);
ALTER TABLE public.mandate ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- challenge
-- ============================================================
CREATE TABLE public.challenge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  phone text,
  division text DEFAULT 'Men''s',
  before_front text,
  before_side text,
  before_back text,
  after_front text,
  after_side text,
  after_back text,
  ai_score double precision,
  ai_feedback text,
  status text DEFAULT 'submitted',
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now(),
  created_by_id uuid
);
ALTER TABLE public.challenge ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- vote
-- ============================================================
CREATE TABLE public.vote (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id text NOT NULL,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now(),
  created_by_id uuid
);
ALTER TABLE public.vote ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- testimonial
-- ============================================================
CREATE TABLE public.testimonial (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id text,
  member_name text NOT NULL,
  text text NOT NULL,
  rating double precision DEFAULT 5,
  status text DEFAULT 'pending',
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now(),
  created_by_id uuid
);
ALTER TABLE public.testimonial ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- debitrecord  (Base44 "DebitRecord" entity)
-- ============================================================
CREATE TABLE public.debitrecord (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text,
  member_id text,
  amount double precision,
  action_date date,
  month text,
  outcome text,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now(),
  created_by_id uuid
);
ALTER TABLE public.debitrecord ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- employee
-- ============================================================
CREATE TABLE public.employee (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emp_number text NOT NULL,
  email text NOT NULL,
  full_name text,
  user_id text,
  member_id text,
  permitted_tabs jsonb DEFAULT '[]',
  active boolean DEFAULT true,
  invited_date date,
  accepted_date date,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now(),
  created_by_id uuid
);
ALTER TABLE public.employee ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- advert
-- ============================================================
CREATE TABLE public.advert (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text,
  media_type text DEFAULT 'image',
  link_url text DEFAULT '/challenge',
  active boolean DEFAULT true,
  "order" double precision DEFAULT 0,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now(),
  created_by_id uuid
);
ALTER TABLE public.advert ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- promotion
-- ============================================================
CREATE TABLE public.promotion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  discount text,
  valid_until date,
  badge text,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now(),
  created_by_id uuid
);
ALTER TABLE public.promotion ENABLE ROW LEVEL SECURITY;
