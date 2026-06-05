import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BookingInput = z.object({
  time_slot_id: z.string().uuid(),
  persons: z.number().int().min(1).max(50),
  contact_name: z.string().min(1).max(120),
  contact_phone: z.string().min(6).max(30),
  contact_email: z.string().email().max(200),
});

export const createBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => BookingInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { buildFawryCheckoutUrl } = await import("@/lib/fawry.server");

    const { data: booking, error } = await supabaseAdmin.rpc("reserve_slot", {
      _slot_id: data.time_slot_id,
      _persons: data.persons,
      _user_id: context.userId,
      _contact_name: data.contact_name,
      _contact_phone: data.contact_phone,
      _contact_email: data.contact_email,
    });
    if (error) {
      const msg = error.message || "BOOKING_FAILED";
      throw new Error(msg.includes("INSUFFICIENT_CAPACITY") ? "INSUFFICIENT_CAPACITY" : msg);
    }
    const b = booking as { id: string; total_price: number };

    // Generate signed Fawry checkout URL
    const origin = process.env.PUBLIC_APP_URL || "";
    const returnUrl = `${origin}/booking/${b.id}`;
    const url = buildFawryCheckoutUrl({
      merchantRefNumber: b.id,
      customerName: data.contact_name,
      customerMobile: data.contact_phone,
      customerEmail: data.contact_email,
      amount: Number(b.total_price),
      description: `Daffa booking ${b.id}`,
      returnUrl,
    });
    await supabaseAdmin.from("bookings").update({ fawry_ref: b.id }).eq("id", b.id);
    return { booking_id: b.id, checkout_url: url };
  });

export const getMyBooking = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("bookings")
      .select("id, status, total_price, persons, expires_at, activity_id, time_slot_id, activities(name_ar,name_en,slug), time_slots(slot_date,start_time,end_time)")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });
