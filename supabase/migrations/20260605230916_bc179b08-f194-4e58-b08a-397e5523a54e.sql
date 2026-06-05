
CREATE TABLE public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier public.sponsor_tier NOT NULL,
  name_ar TEXT NOT NULL, name_en TEXT NOT NULL,
  logo_url TEXT NOT NULL, link TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);
GRANT SELECT ON public.sponsors TO anon, authenticated;
GRANT ALL ON public.sponsors TO service_role;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read sponsors" ON public.sponsors FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage sponsors" ON public.sponsors FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL, name_en TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  start_date DATE, end_date DATE,
  image TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);
GRANT SELECT ON public.cities TO anon, authenticated;
GRANT ALL ON public.cities TO service_role;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read cities" ON public.cities FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage cities" ON public.cities FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL, name_en TEXT NOT NULL,
  logo_url TEXT NOT NULL, category TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);
GRANT SELECT ON public.brands TO anon, authenticated;
GRANT ALL ON public.brands TO service_role;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read brands" ON public.brands FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage brands" ON public.brands FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
