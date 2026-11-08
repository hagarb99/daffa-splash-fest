import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getActivities = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("activities")
    .select("id, slug, name_ar, name_en, description_ar, description_en, duration_min, price, type, group_size, category, cover_image, sort_order, supplier_name, supplier_logo, is_kids, is_show")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  const sushiBoatActivity = {
    id: "99999999-9999-9999-9999-999999999999",
    slug: "sushi-boat",
    name_ar: "مركب سوشي",
    name_en: "Sushi Boat",
    description_ar: "رحلة نيلية صباحية مميزة (19-11) تشمل 10 قطع سوشي طازجة مع اختيار الصوص، ودفع عبر إنستاباي، والركوب مجاناً لأول 40 فرد!",
    description_en: "Morning Nile boat cruise (19-11) with fresh 10-piece sushi platter, sauce selection, InstaPay payment, and free boat ride for the first 40 people!",
    duration_min: 60,
    price: 200,
    type: "group" as const,
    group_size: 40,
    category: "morning" as const,
    cover_image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&q=80",
    sort_order: 0,
    supplier_name: "Daffa Water Festival",
    supplier_logo: null,
    is_kids: false,
    is_show: false,
  };

  const drawingBoatActivity = {
    id: "88888888-8888-8888-8888-888888888888",
    slug: "drawing-boat",
    name_ar: "مركب الرسم",
    name_en: "Art & Drawing Boat",
    description_ar: "ورشة رسم وتلوين تفاعلية ممتعة للأطفال على متن قارب نيلي ساحر في أسوان، مع أدوات رسم كاملة، ألوان آمنة، وجولة مجانية لأول 30 طفل!",
    description_en: "Fun and interactive art & painting workshop for kids aboard an enchanting Nile boat in Aswan, complete with safe art supplies, colors, and free boat ride for the first 30 kids!",
    duration_min: 60,
    price: 150,
    type: "group" as const,
    group_size: 30,
    category: "morning" as const,
    cover_image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=80",
    sort_order: 1,
    supplier_name: "Daffa Kids Art Studio",
    supplier_logo: null,
    is_kids: true,
    is_show: false,
  };

  let list = data ?? [];
  if (!list.some((a) => a.slug === "sushi-boat")) {
    list = [sushiBoatActivity, ...list];
  }
  if (!list.some((a) => a.slug === "drawing-boat")) {
    list = [drawingBoatActivity, ...list];
  }
  return list;
});

export const getActivityBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(100) }).parse(input))
  .handler(async ({ data }) => {
    if (data.slug === "sushi-boat") {
      return {
        id: "99999999-9999-9999-9999-999999999999",
        slug: "sushi-boat",
        name_ar: "مركب سوشي",
        name_en: "Sushi Boat",
        description_ar: "رحلة نيلية صباحية ساحرة في قلب النيل بأسوان بتاريخ 19-11: إبحار هادئ مع وجبة سوشي فاخرة 10 قطع طازجة من اختيارك مع أشهى الصوصات، بأسعار خاصة وعروض حصرية لأول 40 فرد مع الدفع السريع عبر إنستاباي وتأكيد الحجز على واتساب!",
        description_en: "Enchanting morning Nile cruise in Aswan on 19-11: relaxing sail with a fresh 10-piece sushi platter of your choice and sauces, exclusive offer for first 40 people with fast InstaPay payment and WhatsApp confirmation!",
        category: "morning",
        type: "group",
        price: 200,
        duration_min: 60,
        group_size: 40,
        sort_order: 0,
        is_active: true,
        is_kids: false,
        is_show: false,
        cover_image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&q=80",
        supplier_name: "Daffa Water Festival",
        supplier_logo: null,
        supplier_name_2: null,
        supplier_logo_2: null,
        rules_ar: "• الحضور قبل موعد الانطلاق بـ 15 دقيقة على الأقل.\n• الالتزام بتعليمات طاقم المركب وارتداء سترة النجاة أثناء الإبحار.\n• جولة المركب مجانية لأول 40 فرد فقط، وبعد اكتمال العدد يتم تطبيق سعر المركب (+40 ج.م).",
        rules_en: "• Please arrive at least 15 minutes before departure.\n• Follow the boat crew instructions and wear life vests while sailing.\n• Free boat ride is limited to the first 40 people only, regular boat fee applies after (+40 EGP).",
        safety_ar: "جميع قواربنا مجهزة بأعلى معايير السلامة وسترات النجاة المعتمدة وتحت إشراف كباتن محترفين.",
        safety_en: "All our boats are equipped with certified life vests and operated by professional captains.",
        requirements_ar: "تأكيد الحجز عبر إرسال إيصال التحويل عبر إنستاباي على واتساب.",
        requirements_en: "Booking confirmation requires sending the InstaPay transfer receipt on WhatsApp.",
        images: [
          { url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&q=80", sort_order: 1 },
          { url: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=1200&q=80", sort_order: 2 },
          { url: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=1200&q=80", sort_order: 3 }
        ]
      };
    }
    if (data.slug === "drawing-boat") {
      return {
        id: "88888888-8888-8888-8888-888888888888",
        slug: "drawing-boat",
        name_ar: "مركب الرسم",
        name_en: "Art & Drawing Boat",
        description_ar: "ورشة رسم وتلوين تفاعلية ممتعة للأطفال على متن قارب نيلي ساحر في أسوان! أدوات رسم كاملة، ألوان آمنة، إشراف مدربين متخصصين، مع جولة مجانية بالمركب لأول 30 طفل، والدفع عبر إنستاباي، وتأكيد الحجز على واتساب.",
        description_en: "Fun and interactive art & painting workshop for kids aboard an enchanting Nile boat in Aswan! Complete art kit, safe colors, guided by specialized coaches, free boat ride for first 30 kids, InstaPay payment, and WhatsApp confirmation.",
        category: "morning",
        type: "group",
        price: 150,
        duration_min: 60,
        group_size: 30,
        sort_order: 1,
        is_active: true,
        is_kids: true,
        is_show: false,
        cover_image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=80",
        supplier_name: "Daffa Kids Art Studio",
        supplier_logo: null,
        supplier_name_2: null,
        supplier_logo_2: null,
        rules_ar: "• الفعالية مخصصة للأطفال من سن 4 إلى 14 سنة.\n• الحضور قبل موعد الانطلاق بـ 15 دقيقة بصحبة ولي الأمر.\n• جولة المركب مجانية لأول 30 طفل فقط، وبعد اكتمال العدد يضاف سعر تذكرة المركب (+30 ج.م).\n• يتم توفير مريلة واقية للأطفال لحماية ملابسهم أثناء التلوين.",
        rules_en: "• Workshop is designed for kids aged 4 to 14 years.\n• Please arrive 15 minutes before departure with an accompanying guardian.\n• Free boat ride is limited to first 30 kids, regular boat fee applies after (+30 EGP).\n• Protective aprons are provided to keep children's clothes clean.",
        safety_ar: "جميع الألوان والخامات المستخدمة غير سامة وآمنة تماماً للأطفال (Non-toxic). القارب مزود بسترات نجاة مخصصة للأطفال وبإشراف طاقم إنقاذ ومدربين مؤهلين.",
        safety_en: "All colors and craft materials are non-toxic and child-safe. Boats are equipped with certified kids life vests under professional supervision.",
        requirements_ar: "• اختيار أنشطة وأدوات الرسم.\n• اختيار نوع الألوان.\n• تأكيد الحجز بتحويل إنستاباي وإرسال لقطة الشاشة عبر واتساب.",
        requirements_en: "• Choose drawing activities and tools.\n• Select preferred color type.\n• Confirm booking via InstaPay transfer and share screenshot on WhatsApp.",
        images: [
          { url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=80", sort_order: 1 },
          { url: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1200&q=80", sort_order: 2 },
          { url: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=1200&q=80", sort_order: 3 }
        ]
      };
    }
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
    if (data.activity_id === "99999999-9999-9999-9999-999999999999" || data.activity_id === "88888888-8888-8888-8888-888888888888") {
      return [
        { id: "11111111-1111-1111-1111-111111111111", start_time: "10:00:00", end_time: "11:30:00", total_capacity: 30, reserved_capacity: 18, remaining: 12, slot_date: data.date },
        { id: "22222222-2222-2222-2222-222222222222", start_time: "12:00:00", end_time: "13:30:00", total_capacity: 30, reserved_capacity: 10, remaining: 20, slot_date: data.date }
      ];
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await (supabaseAdmin.rpc as unknown as (name: string) => Promise<unknown>)("expire_pending_bookings");
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

export const getSetting = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ key: z.string().min(1).max(100) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("app_settings").select("value").eq("key", data.key).maybeSingle();
    return row?.value ?? null;
  });
