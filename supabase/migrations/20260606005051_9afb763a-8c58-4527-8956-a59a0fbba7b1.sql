
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS supplier_name_2 text,
  ADD COLUMN IF NOT EXISTS supplier_logo_2 text;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS supplier_choice text;

UPDATE public.activities
SET supplier_name   = COALESCE(supplier_name, 'Nile Kayak Co.'),
    supplier_name_2 = COALESCE(supplier_name_2, 'Aswan Watersports')
WHERE slug = 'kayak' OR lower(name_en) LIKE '%kayak%' OR name_ar LIKE '%كاياك%';
