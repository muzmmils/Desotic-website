-- ============================================================
-- MIGRATION 002: SCHEMA ENHANCEMENTS & REALTIME PUBLICATION
-- Idempotent upgrades for existing tables, columns, and enums
-- ============================================================

-- 1. Ensure enum values
DO $$ BEGIN
  ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'out_for_delivery' AFTER 'ready';
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Menu Items enhancements
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS ingredients text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS customization_options jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS prep_time_minutes int DEFAULT 15;

CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_tags ON public.menu_items USING GIN(tags);

-- 3. Profiles enhancement & trigger update
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Subscriptions enhancements
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS billing_cycle text NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS delivery_days text[] DEFAULT ARRAY['mon','tue','wed','thu','fri'],
  ADD COLUMN IF NOT EXISTS delivery_slot text DEFAULT 'morning',
  ADD COLUMN IF NOT EXISTS delivery_address jsonb,
  ADD COLUMN IF NOT EXISTS pause_resume_date date,
  ADD COLUMN IF NOT EXISTS cancel_reason text;

CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Orders enhancements
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number text,
  ADD COLUMN IF NOT EXISTS subtotal numeric(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS tax numeric(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS delivery_fee numeric(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS discount numeric(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS delivery_slot text DEFAULT 'morning',
  ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS razorpay_order_id text,
  ADD COLUMN IF NOT EXISTS estimated_delivery_time timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

-- Ensure order_number unique constraint if exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_order_number_key'
  ) THEN
    -- Only set constraint if order_number column exists
    ALTER TABLE public.orders ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
  END IF;
EXCEPTION
  WHEN duplicate_table THEN null;
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

DROP POLICY IF EXISTS "Users can update own pending orders" ON public.orders;
CREATE POLICY "Users can update own pending orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- 6. Order Items enhancements
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS item_name text DEFAULT 'Meal Item',
  ADD COLUMN IF NOT EXISTS total_price numeric(10,2) DEFAULT 0.00;

-- 7. Realtime Publication
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN undefined_object THEN null;
END $$;
