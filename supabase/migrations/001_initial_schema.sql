-- ============================================================
-- ENUM TYPES
-- ============================================================

-- Subscription Status Enum
DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM (
    'active', 'paused', 'cancelled', 'past_due', 'trialing'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Order Status Enum (includes out_for_delivery)
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Payment Status Enum
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'unpaid', 'paid', 'failed', 'refunded'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- 1. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  slug        text NOT NULL UNIQUE,
  description text,
  emoji       text,
  image_url   text,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON public.categories(sort_order);

-- ============================================================
-- 2. MENU ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.menu_items (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id           uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name                  text NOT NULL,
  slug                  text NOT NULL UNIQUE,
  description           text,
  price                 numeric(10,2) NOT NULL,
  image_url             text,
  calories              int,
  protein_g             numeric(5,1),
  carbs_g               numeric(5,1),
  fat_g                 numeric(5,1),
  fiber_g               numeric(5,1),
  is_vegan              boolean NOT NULL DEFAULT false,
  is_gluten_free        boolean NOT NULL DEFAULT false,
  is_available          boolean NOT NULL DEFAULT true,
  tags                  text[] DEFAULT '{}',
  ingredients           text[] DEFAULT '{}',
  customization_options jsonb DEFAULT '[]',
  prep_time_minutes     int DEFAULT 15,
  sort_order            int NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_slug ON public.menu_items(slug);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_tags ON public.menu_items USING GIN(tags);

-- ============================================================
-- 3. USER PROFILES (extends Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  phone       text,
  avatar_url  text,
  address     jsonb DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Trigger function: Automatically create or update profile on signup
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. SUBSCRIPTION PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  slug             text NOT NULL UNIQUE,
  description      text,
  price_monthly    numeric(10,2) NOT NULL,
  price_quarterly  numeric(10,2),
  meals_per_week   int NOT NULL,
  features         jsonb DEFAULT '[]',
  is_popular       boolean NOT NULL DEFAULT false,
  is_active        boolean NOT NULL DEFAULT true,
  sort_order       int NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_slug ON public.subscription_plans(slug);

-- ============================================================
-- 5. SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id                 uuid NOT NULL REFERENCES public.subscription_plans(id),
  status                  subscription_status NOT NULL DEFAULT 'active',
  billing_cycle           text NOT NULL DEFAULT 'monthly',
  payment_provider        text DEFAULT 'razorpay',
  payment_provider_sub_id text,
  current_period_start    timestamptz NOT NULL DEFAULT now(),
  current_period_end      timestamptz NOT NULL,
  delivery_days           text[] DEFAULT ARRAY['mon','tue','wed','thu','fri'],
  delivery_slot           text DEFAULT 'morning',
  delivery_address        jsonb,
  pause_started_at        timestamptz,
  pause_resume_date       date,
  cancelled_at            timestamptz,
  cancel_reason           text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- ============================================================
-- 6. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number            text UNIQUE NOT NULL,
  user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id         uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  status                  order_status NOT NULL DEFAULT 'pending',
  subtotal                numeric(10,2) NOT NULL,
  tax                     numeric(10,2) NOT NULL DEFAULT 0.00,
  delivery_fee            numeric(10,2) NOT NULL DEFAULT 0.00,
  discount                numeric(10,2) NOT NULL DEFAULT 0.00,
  total                   numeric(10,2) NOT NULL,
  delivery_date           date NOT NULL,
  delivery_slot           text NOT NULL, -- 'morning' | 'afternoon' | 'evening'
  delivery_address        jsonb NOT NULL,
  payment_provider        text DEFAULT 'razorpay',
  payment_status          payment_status NOT NULL DEFAULT 'unpaid',
  payment_id              text,
  razorpay_order_id       text,
  notes                   text,
  estimated_delivery_time timestamptz,
  delivered_at            timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- ============================================================
-- 7. ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id   uuid NOT NULL REFERENCES public.menu_items(id),
  item_name      text NOT NULL,
  quantity       int NOT NULL DEFAULT 1,
  unit_price     numeric(10,2) NOT NULL,
  total_price    numeric(10,2) NOT NULL,
  customizations jsonb DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Categories (public read)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categories are publicly readable" ON public.categories;
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);

-- Menu Items (public read)
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Menu items are publicly readable" ON public.menu_items;
CREATE POLICY "Menu items are publicly readable" ON public.menu_items FOR SELECT USING (true);

-- Profiles (user owns profile)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Subscription Plans (public read)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Plans are publicly readable" ON public.subscription_plans;
CREATE POLICY "Plans are publicly readable" ON public.subscription_plans FOR SELECT USING (true);

-- Subscriptions (user owns subscription)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Orders (user owns orders)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own pending orders" ON public.orders;
CREATE POLICY "Users can update own pending orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Order Items (scoped via parent order)
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
CREATE POLICY "Users can create order items" ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- ============================================================
-- SUPABASE REALTIME PUBLICATION
-- ============================================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN undefined_object THEN null;
END $$;
