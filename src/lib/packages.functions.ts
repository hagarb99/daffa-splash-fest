import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PackageActivity = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  price: number;
};

export type PackageRow = {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  price: number;
  display_order: number;
  is_active: boolean;
  activities: PackageActivity[];
};

export const getPackages = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: packages, error } = await supabaseAdmin
    .from("packages")
    .select("id, name_ar, name_en, description_ar, description_en, price, display_order, is_active")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  const rows = packages ?? [];
  if (rows.length === 0) return [] as PackageRow[];

  const { data: links } = await supabaseAdmin
    .from("package_activities")
    .select("package_id, position, activities(id, slug, name_ar, name_en, price)")
    .in("package_id", rows.map((r) => r.id))
    .order("position", { ascending: true });

  return rows.map((p) => ({
    ...p,
    activities: (links ?? [])
      .filter((l) => l.package_id === p.id)
      .map((l) => l.activities as unknown as PackageActivity)
      .filter(Boolean),
  })) as PackageRow[];
});

export const getPackageById = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: pkg, error } = await supabaseAdmin
      .from("packages")
      .select("id, name_ar, name_en, description_ar, description_en, price, display_order, is_active")
      .eq("id", data.id)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!pkg) return null;
    const { data: links } = await supabaseAdmin
      .from("package_activities")
      .select("position, activities(id, slug, name_ar, name_en, price)")
      .eq("package_id", pkg.id)
      .order("position", { ascending: true });
    return {
      ...pkg,
      activities: (links ?? []).map((l) => l.activities as unknown as PackageActivity).filter(Boolean),
    } as PackageRow;
  });

const PackageBookingInput = z.object({
  package_id: z.string().uuid(),
  persons: z.number().int().min(1).max(50),
  booking_date: z.string().min(4).max(20),
  booking_time: z.string().min(1).max(20),
  contact_name: z.string().min(1).max(120),
  contact_phone: z.string().min(6).max(30),
  contact_email: z.string().email().max(200),
  notes: z.string().max(1000).optional(),
});

export const createPackageBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => PackageBookingInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { buildFawryCheckoutUrl } = await import("@/lib/fawry.server");

    const { data: pkg, error: pkgErr } = await supabaseAdmin
      .from("packages")
      .select("id, price, name_en")
      .eq("id", data.package_id)
      .eq("is_active", true)
      .maybeSingle();
    if (pkgErr || !pkg) throw new Error("PACKAGE_NOT_FOUND");

    const total = Number(pkg.price) * data.persons;
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("bookings")
      .insert({
        user_id: context.userId,
        package_id: pkg.id,
        persons: data.persons,
        total_price: total,
        status: "pending",
        expires_at: expires,
        booking_date: data.booking_date,
        booking_time: data.booking_time,
        contact_name: data.contact_name,
        contact_phone: data.contact_phone,
        contact_email: data.contact_email,
        notes: data.notes ?? null,
      })
      .select("id, total_price")
      .single();
    if (insErr || !inserted) throw new Error(insErr?.message || "BOOKING_FAILED");

    const { getRequestHost, getRequestHeader } = await import("@tanstack/react-start/server");
    const proto = getRequestHeader("x-forwarded-proto") || "https";
    const origin = process.env.PUBLIC_APP_URL || `${proto}://${getRequestHost()}`;
    const returnUrl = `${origin}/booking/${inserted.id}`;
    const url = buildFawryCheckoutUrl({
      merchantRefNumber: inserted.id,
      customerName: data.contact_name,
      customerMobile: data.contact_phone,
      customerEmail: data.contact_email,
      amount: Number(inserted.total_price),
      description: `Daffa package ${pkg.name_en}`,
      returnUrl,
    });
    await supabaseAdmin.from("bookings").update({ fawry_ref: inserted.id }).eq("id", inserted.id);
    return { booking_id: inserted.id, checkout_url: url };
  });
