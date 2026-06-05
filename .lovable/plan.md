
# Daffa Water Festival — Updated Build Plan

Premium bilingual (AR-RTL / EN-LTR) festival platform on TanStack Start + Lovable Cloud (Supabase) with Fawry payments, role-based admin, and hardened booking/capacity logic.

Stack note: TanStack Start (Lovable's supported React/TS/Tailwind/SSR framework) — equivalent to Next.js for the requirements (SSR, file routing, SEO, Supabase, Fawry).

---

## 1. Bilingual System (full parity)

- `LanguageProvider` React context, default `ar`; persists to `localStorage`; instant switch (no reload).
- Sets `<html lang dir>` (`ar`/`rtl` ↔ `en`/`ltr`) on toggle.
- Dictionaries: `src/i18n/ar.json`, `src/i18n/en.json` for all static UI strings (hero, nav, sections, buttons, form labels, errors).
- Dynamic DB content uses paired columns (`*_ar` / `*_en`) and a `t(row, field)` helper that picks by current locale.
- Tailwind logical properties + `dir`-aware spacing/icons; mirrored chevrons; AR font (Cairo) and EN font (Inter + Playfair display) loaded via `<link>` in `__root.tsx`.

### Static content seeded in both languages

- **Festival Overview**: "THE FESTIVAL EXPERIENCES — Daffa Water Festival Series. Egypt's majestic waterways hold untapped potential for modern entertainment, regional tourism, and sustainable maritime technology. Daffa is steering this transformation." + Arabic translation.
- **Curated Day-to-Night Entertainment** list.
- **Morning Activities** (Kayak, Paddle Board, Banana Boat, Doughnut Boat, SUP, Water Bike, Canoeing, Chair Boat).
- **Night Activities** (Kayak Cinema, Boat Cinema, Night shows on land, Special shows on boats, Henna Drawing, Sunset Tours, Oriental Boat Breakfast, Water Challenges, Water Skiing Board).
- **F&B & Brands Marketplace** section with provided copy + AR translation.

---

## 2. Pages

**Public**
1. `/` Home — hero (video bg, dual CTA), Festival Experiences block, Curated Day-to-Night entertainment, Morning vs Night activity tabs (preview), Sponsors grid (Platinum/Gold/Silver/Partners), Cities journey timeline (Aswan → Alexandria), Festival timeline (10 days/city), F&B & Brands Marketplace, final CTA.
2. `/event-details` — full responsive grid of active activities with Morning/Night category badges, type (Individual/Group + size), price.
3. `/activities/$slug` — hero + gallery (carousel + fullscreen), full info (description, rules, safety, requirements, duration), booking widget.

**Auth / Admin**
- `/auth` — email + password.
- `/_authenticated/admin/*` — gated by `has_role(user,'admin')`: activities CRUD (Morning/Night category, single form template, image upload, active toggle), time slots, bookings (view/cancel/override capacity), sponsors, cities, marketplace brands.

---

## 3. Database (Supabase, RLS on, GRANTs explicit)

- `profiles` (id→auth.users, full_name, phone)
- `user_roles` + `app_role` enum + `has_role()` SECURITY DEFINER
- `activities` — `name_ar/en, description_ar/en, rules_ar/en, safety_ar/en, requirements_ar/en, duration_min, price, type (individual|group), group_size, category (morning|night), cover_image, slug, is_active`
- `activity_images` (activity_id, url, sort)
- `time_slots` — `activity_id, date, start_time, end_time, total_capacity, reserved_capacity` (denormalized counter, maintained atomically)
- `bookings` — `id, user_id, activity_id, time_slot_id, persons, total_price, status (pending|confirmed|cancelled|expired), fawry_ref, expires_at`
- `payments` — `booking_id, provider, amount, status, signature, raw_payload, processed_at`
- `sponsors` (tier, name_ar/en, logo_url, link, sort)
- `cities` (name_ar/en, order_index, start_date, end_date, image)
- `brands` (name_ar/en, logo_url, category)

---

## 4. Booking & Capacity (hardened, server-side only)

All state changes go through `createServerFn` — client never trusts or writes booking state.

### Atomic reserve (prevent double booking)
- SQL function `reserve_slot(slot_id, persons, user_id, activity_id, total_price)` runs inside a transaction:
  1. `SELECT … FOR UPDATE` the `time_slots` row (row-level lock).
  2. Check `total_capacity - reserved_capacity >= persons` → else raise `INSUFFICIENT_CAPACITY`.
  3. `UPDATE time_slots SET reserved_capacity = reserved_capacity + persons`.
  4. `INSERT INTO bookings (... status='pending', expires_at = now() + interval '15 minutes')`.
  5. Return booking row.
- Server fn `createBooking` calls this RPC, then issues Fawry checkout URL.

### Auto-expire pending bookings
- SQL function `expire_pending_bookings()`:
  - For each `bookings` row where `status='pending' AND expires_at < now()`:
    - `UPDATE bookings SET status='expired'`
    - `UPDATE time_slots SET reserved_capacity = reserved_capacity - persons`
- Scheduled via Supabase `pg_cron` every 1 minute. Also invoked lazily at the top of availability queries as a safety net.

### Availability query
- Server fn `getSlotAvailability(activity_id, date)` returns slots with `remaining = total_capacity - reserved_capacity`. Slots with `remaining = 0` are returned as `disabled`.

---

## 5. Fawry Payment (secure callback)

### Checkout
- Server fn `createFawryCheckout(booking_id)` (auth required):
  - Verifies booking belongs to user and is `pending`.
  - Builds signed request using `FAWRY_MERCHANT_CODE` + `FAWRY_SECURE_KEY` (Fawry's documented SHA-256 signature order).
  - Stores `fawry_ref` on booking; returns checkout URL; client redirects.

### Webhook — `src/routes/api/public/fawry/callback.ts` (POST + GET)
Performs **all** validations before any state change; rejects with appropriate status otherwise:

1. **Merchant code** matches `FAWRY_MERCHANT_CODE` env.
2. **Signature** recomputed from payload + secure key matches `messageSignature`.
3. **Booking exists** by `merchantRefNumber` and is in `pending` state.
4. **Amount** in callback equals booking `total_price` exactly (to 2 decimals).
5. **Idempotency**: payment row keyed on `fawry_ref` with unique constraint — re-deliveries are no-ops returning 200.

If all pass:
- Transaction: insert/update `payments` (`status='success'`, store full signed payload), `UPDATE bookings SET status='confirmed'` (slot stays reserved; capacity already deducted — no double-decrement).

If any fail:
- Log reason server-side, do **not** touch booking/capacity, return `401`/`400`.
- Explicit `FAILED`/`CANCELED` Fawry statuses: mark booking `cancelled` AND release capacity via `reserved_capacity -= persons` (idempotent guard).

Secrets needed (requested via `add_secret` when we reach that step): `FAWRY_MERCHANT_CODE`, `FAWRY_SECURE_KEY`, `FAWRY_BASE_URL`.

### Confirmation page
- `/booking/$id` polls booking status; shows confirmed receipt + activity/slot/time when status flips.

---

## 6. Design

- Premium aquatic palette (deep navy, aqua, sand), generous whitespace, large editorial type, full-bleed media, Framer Motion (hero reveal, timeline path draw, card lifts, section fades). All colors/fonts as semantic tokens in `src/styles.css`. Mobile-first responsive.

---

## 7. Build order

1. Enable Lovable Cloud; create schema, RLS, GRANTs, roles, storage bucket, `reserve_slot` + `expire_pending_bookings` SQL, pg_cron schedule.
2. i18n provider + RTL setup + design tokens + fonts + dictionaries (AR & EN).
3. Auth page + `_authenticated/admin` gate + `has_role` check.
4. Admin CRUD (activities, slots, bookings, sponsors, cities, brands).
5. Public Home (with overview, day-to-night, morning/night, F&B sections), Event Details, Activity Details pages.
6. Booking widget + atomic reserve server fn + availability query.
7. Fawry checkout server fn + `/api/public/fawry/callback` with full validation + idempotency.
8. Confirmation page, seed sample data, polish animations, run security scan.

Confirm to proceed and I'll start building.
