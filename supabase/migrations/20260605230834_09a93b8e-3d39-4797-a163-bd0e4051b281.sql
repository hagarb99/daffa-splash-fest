
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL, name_en TEXT NOT NULL,
  description_ar TEXT, description_en TEXT,
  rules_ar TEXT, rules_en TEXT,
  safety_ar TEXT, safety_en TEXT,
  requirements_ar TEXT, requirements_en TEXT,
  duration_min INTEGER DEFAULT 30,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  type public.activity_type NOT NULL DEFAULT 'individual',
  group_size INTEGER,
  category public.activity_category NOT NULL DEFAULT 'morning',
  cover_image TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.activities TO anon, authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active activities" ON public.activities FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage activities" ON public.activities FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.activity_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
GRANT SELECT ON public.activity_images TO anon, authenticated;
GRANT ALL ON public.activity_images TO service_role;
ALTER TABLE public.activity_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read activity images" ON public.activity_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage activity images" ON public.activity_images FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
