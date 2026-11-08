INSERT INTO public.activities (slug, name_ar, name_en, description_ar, description_en, category, type, price, duration_min, sort_order, is_active, cover_image)
VALUES (
  'sushi-boat',
  'مركب سوشي',
  'Sushi Boat',
  'رحلة نيلية صباحية ساحرة في أسوان تشمل 10 قطع سوشي طازجة مع اختيار نوع السوشي والصوص، والدفع عبر إنستاباي، مع جولة مجانية بالمركب لأول 40 فرد!',
  'Enchanting morning Nile boat cruise in Aswan including 10 pieces of fresh sushi with your choice of rolls and sauces, InstaPay payment, and free boat ride for the first 40 people!',
  'morning',
  'group',
  200,
  60,
  1,
  true,
  'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&q=80'
)
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  description_ar = EXCLUDED.description_ar,
  description_en = EXCLUDED.description_en,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  is_active = EXCLUDED.is_active;

