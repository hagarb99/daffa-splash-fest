
ALTER TABLE public.bookings ALTER COLUMN activity_id DROP NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN time_slot_id DROP NOT NULL;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_target_chk CHECK (
  (package_id IS NOT NULL) OR (activity_id IS NOT NULL AND time_slot_id IS NOT NULL)
);
