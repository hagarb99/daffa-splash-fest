
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO postgres, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, anon, service_role;

CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;$$;
REVOKE ALL ON FUNCTION private.handle_new_user() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    DROP TRIGGER on_auth_user_created ON auth.users;
  END IF;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();
END$$;

-- Rebuild every policy that depends on public.has_role
DROP POLICY IF EXISTS "admins manage activities" ON public.activities;
CREATE POLICY "admins manage activities" ON public.activities FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "public read active activities" ON public.activities;
CREATE POLICY "public read active activities" ON public.activities FOR SELECT TO anon, authenticated
  USING (is_active = true OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins manage activity images" ON public.activity_images;
CREATE POLICY "admins manage activity images" ON public.activity_images FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins manage bookings" ON public.bookings;
CREATE POLICY "admins manage bookings" ON public.bookings FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "users read own bookings" ON public.bookings;
CREATE POLICY "users read own bookings" ON public.bookings FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "users insert own bookings" ON public.bookings;
CREATE POLICY "users insert own bookings" ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admins manage brands" ON public.brands;
CREATE POLICY "admins manage brands" ON public.brands FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "public read brands" ON public.brands;
CREATE POLICY "public read brands" ON public.brands FOR SELECT TO anon, authenticated
  USING (is_active = true OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins manage cities" ON public.cities;
CREATE POLICY "admins manage cities" ON public.cities FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "public read cities" ON public.cities;
CREATE POLICY "public read cities" ON public.cities FOR SELECT TO anon, authenticated
  USING (is_active = true OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins read payments" ON public.payments;
CREATE POLICY "admins read payments" ON public.payments FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins manage sponsors" ON public.sponsors;
CREATE POLICY "admins manage sponsors" ON public.sponsors FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "public read sponsors" ON public.sponsors;
CREATE POLICY "public read sponsors" ON public.sponsors FOR SELECT TO anon, authenticated
  USING (is_active = true OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins manage time slots" ON public.time_slots;
CREATE POLICY "admins manage time slots" ON public.time_slots FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "public read time slots" ON public.time_slots;
CREATE POLICY "public read time slots" ON public.time_slots FOR SELECT TO anon, authenticated
  USING (is_active = true OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins manage user roles" ON public.user_roles;
CREATE POLICY "admins manage user roles" ON public.user_roles FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.handle_new_user();
