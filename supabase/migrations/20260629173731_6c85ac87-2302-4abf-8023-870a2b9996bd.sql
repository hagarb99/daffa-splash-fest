
DROP POLICY IF EXISTS "public read app settings" ON public.app_settings;

CREATE POLICY "public read whitelisted app settings"
  ON public.app_settings
  FOR SELECT
  TO anon, authenticated
  USING (key IN ('whatsapp_number'));

CREATE POLICY "admins read all app settings"
  ON public.app_settings
  FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));
