import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getActivities = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("activities")
    .select("id, slug, name_ar, name_en, description_ar, description_en, duration_min, price, type, group_size, category, cover_image, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getActivityBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(100) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: act, error } = await supabaseAdmin
      .from("activities")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!act) return null;
    const { data: images } = await supabaseAdmin
      .from("activity_images").select("url, sort_order").eq("activity_id", act.id).order("sort_order");
    return { ...act, images: images ?? [] };
  });

export const getSlots = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ activity_id: z.string().uuid(), date: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Lazy-expire stale pendings so availability is fresh
    await supabaseAdmin.rpc("expire_pending_bookings");
    const { data: slots, error } = await supabaseAdmin
      .from("time_slots")
      .select("id, start_time, end_time, total_capacity, reserved_capacity, slot_date")
      .eq("activity_id", data.activity_id)
      .eq("slot_date", data.date)
      .eq("is_active", true)
      .order("start_time");
    if (error) throw new Error(error.message);
    return (slots ?? []).map((s) => ({ ...s, remaining: s.total_capacity - s.reserved_capacity }));
  });

export const getSponsors = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("sponsors").select("*").eq("is_active", true).order("sort_order");
  return data ?? [];
});

export const getCities = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("cities").select("*").eq("is_active", true).order("order_index");
  return data ?? [];
});

export const getBrands = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("brands").select("*").eq("is_active", true).order("sort_order");
  return data ?? [];
});
