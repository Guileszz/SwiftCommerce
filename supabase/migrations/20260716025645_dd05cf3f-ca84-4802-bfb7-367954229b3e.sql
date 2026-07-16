
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

-- Order status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled');

-- =========================
-- profiles
-- =========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  wallet_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by owner" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- =========================
-- user_roles
-- =========================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- has_role fn
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- =========================
-- updated_at helper + new-user trigger
-- =========================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- categories
-- =========================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================
-- products
-- =========================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  image_url TEXT NOT NULL DEFAULT '',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active products are public" ON public.products FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- orders
-- =========================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.order_status NOT NULL DEFAULT 'pending',
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  wallet_address TEXT NOT NULL,
  shipping_name TEXT NOT NULL,
  shipping_email TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_country TEXT NOT NULL,
  tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own pending orders" ON public.orders FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete orders" ON public.orders FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- order_items
-- =========================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT NOT NULL DEFAULT '',
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "Users insert own order items" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- =========================
-- Seed categories + products
-- =========================
INSERT INTO public.categories (id, name, slug) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Audio', 'audio'),
  ('11111111-1111-1111-1111-111111111102', 'Wearables', 'wearables'),
  ('11111111-1111-1111-1111-111111111103', 'Computing', 'computing'),
  ('11111111-1111-1111-1111-111111111104', 'Cameras', 'cameras'),
  ('11111111-1111-1111-1111-111111111105', 'Gaming', 'gaming'),
  ('11111111-1111-1111-1111-111111111106', 'Accessories', 'accessories');

INSERT INTO public.products (name, slug, description, price_cents, image_url, category_id, stock) VALUES
  ('Aurora Wireless Headphones', 'aurora-wireless-headphones', 'Studio-grade active noise cancellation with 40h battery life and adaptive spatial audio.', 24900, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', '11111111-1111-1111-1111-111111111101', 42),
  ('Pulse Pro Earbuds', 'pulse-pro-earbuds', 'Compact wireless earbuds with hybrid ANC and lossless codec support.', 14900, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80', '11111111-1111-1111-1111-111111111101', 88),
  ('Nova Smart Watch', 'nova-smart-watch', 'Titanium smartwatch with ECG, always-on AMOLED and 7-day battery.', 32900, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', '11111111-1111-1111-1111-111111111102', 30),
  ('Trek Fitness Band', 'trek-fitness-band', 'Lightweight activity tracker with SpO2, sleep insight and 14-day battery.', 6900, 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80', '11111111-1111-1111-1111-111111111102', 120),
  ('Vector 14 Laptop', 'vector-14-laptop', 'Ultralight 14" laptop, 32GB RAM, 1TB SSD, dedicated GPU, 18h battery.', 189900, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80', '11111111-1111-1111-1111-111111111103', 12),
  ('Kernel Mechanical Keyboard', 'kernel-mechanical-keyboard', 'Hot-swappable 75% mechanical keyboard with per-key RGB and wireless.', 15900, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', '11111111-1111-1111-1111-111111111103', 60),
  ('Prism 4K Mirrorless Camera', 'prism-4k-mirrorless-camera', 'Full-frame mirrorless, 33MP sensor, 8K video, in-body stabilization.', 249900, 'https://images.unsplash.com/photo-1519638831568-d9897f54ed69?w=800&q=80', '11111111-1111-1111-1111-111111111104', 8),
  ('Lens Kit 24-70mm', 'lens-kit-24-70mm', 'Constant f/2.8 pro zoom, weather-sealed with fast silent autofocus.', 129900, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80', '11111111-1111-1111-1111-111111111104', 15),
  ('Ember Gaming Console', 'ember-gaming-console', 'Next-gen 4K120 gaming console, ray tracing, 2TB NVMe storage.', 54900, 'https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42?w=800&q=80', '11111111-1111-1111-1111-111111111105', 25),
  ('Fusion Wireless Controller', 'fusion-wireless-controller', 'Hall-effect sticks, adjustable triggers, low-latency wireless.', 8900, 'https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=800&q=80', '11111111-1111-1111-1111-111111111105', 90),
  ('Loom Leather Backpack', 'loom-leather-backpack', 'Full-grain leather commuter backpack with 16" laptop sleeve.', 18900, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', '11111111-1111-1111-1111-111111111106', 45),
  ('Halo Sunglasses', 'halo-sunglasses', 'Polarized titanium sunglasses with photochromic lenses.', 12900, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80', '11111111-1111-1111-1111-111111111106', 75);
