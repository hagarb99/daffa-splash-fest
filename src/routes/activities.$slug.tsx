import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { getActivityBySlug, getSlots } from "@/lib/festival.functions";
import { createBooking } from "@/lib/booking.functions";
import { 
  Clock, 
  Users, 
  User as UserIcon, 
  ShieldCheck, 
  ListChecks, 
  AlertTriangle, 
  Store, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  MessageCircle,
  Plus,
  Minus
} from "lucide-react";
import { ActivityGallery } from "@/components/ActivityGallery";
import { toast } from "sonner";

const SUSHI_TYPES = [
  { id: "crunchy", name_ar: "كرانشي رول", name_en: "Crunchy Roll" },
  { id: "california", name_ar: "كاليفورنيا رول", name_en: "California Roll" },
  { id: "crispy-shrimp", name_ar: "كرسبي شريمب", name_en: "Crispy Shrimp Roll" },
  { id: "salmon-avocado", name_ar: "سالمون أفوكادو", name_en: "Salmon Avocado Roll" },
  { id: "philadelphia", name_ar: "فيلادلفيا رول", name_en: "Philadelphia Roll" },
  { id: "dynamite", name_ar: "دايناميت ماكي", name_en: "Dynamite Maki Roll" },
];

const SAUCE_TYPES = [
  { id: "soy", name_ar: "صويا صوص كلاسيك", name_en: "Classic Soy Sauce" },
  { id: "spicy-mayo", name_ar: "سبايسي مايو", name_en: "Spicy Mayo" },
  { id: "teriyaki", name_ar: "ترياكي صوص", name_en: "Sweet Teriyaki Sauce" },
  { id: "sweet-chili", name_ar: "سويت تشيلي", name_en: "Sweet Chili Sauce" },
  { id: "sesame", name_ar: "صوص السمسم الياباني", name_en: "Japanese Sesame Sauce" },
];

const DRAWING_ACTIVITIES = [
  { id: "canvas", name_ar: "رسم وتلوين على كانفاس", name_en: "Canvas Painting" },
  { id: "pottery", name_ar: "تلوين مجسمات وفخار", name_en: "Pottery & Figurine Coloring" },
  { id: "sand-art", name_ar: "فن الرسم بالرمال الملونة", name_en: "Colored Sand Art" },
  { id: "wood-craft", name_ar: "رسم على خشب وديكور", name_en: "Wooden Craft Painting" },
  { id: "face-art", name_ar: "رسم وجوه وتلوين حر", name_en: "Face Painting & Free Sketch" },
];

const COLOR_TYPES = [
  { id: "watercolors", name_ar: "ألوان مائية آمنة للأطفال", name_en: "Washable Watercolors" },
  { id: "acrylic", name_ar: "ألوان أكريليك مبهجة", name_en: "Vibrant Acrylic Paints" },
  { id: "crayons", name_ar: "ألوان شمع وفلوماستر", name_en: "Crayons & Markers" },
  { id: "pastels", name_ar: "ألوان باستيل ناعمة", name_en: "Soft Pastels" },
];

const INSTAPAY_HANDLE = "01031416900";
const INSTAPAY_NAME = "Daffa Water Festival / مهرجان دفة";
const WHATSAPP_NUMBER = "201031416900";

export const Route = createFileRoute("/activities/$slug")({
  loader: async ({ params }) => {
    const activity = await getActivityBySlug({ data: { slug: params.slug } });
    return { slug: params.slug, initialActivity: activity };
  },
  component: ActivityPage,
});

function ActivityPage() {
  const loaderData = Route.useLoaderData();
  const slug = loaderData.slug;
  const isSushi = slug === "sushi-boat";
  const isDrawing = slug === "drawing-boat";
  const { t, lang, pick } = useLang();
  const isAr = lang === "ar";
  const { user } = useAuth();
  const navigate = useNavigate();
  const fn = useServerFn(getActivityBySlug);
  const slotsFn = useServerFn(getSlots);
  const bookFn = useServerFn(createBooking);

  const { data: activity = loaderData.initialActivity, isLoading } = useQuery({
    queryKey: ["activity", slug],
    queryFn: () => fn({ data: { slug } }),
    initialData: loaderData.initialActivity,
  });

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [slotId, setSlotId] = useState<string>("");
  const [persons, setPersons] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [supplierChoice, setSupplierChoice] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  // Sushi specific state
  const [sushiPieces, setSushiPieces] = useState<Record<string, number>>({
    crunchy: 5,
    california: 5,
    "crispy-shrimp": 0,
    "salmon-avocado": 0,
    philadelphia: 0,
    dynamite: 0,
  });
  const [sauceType, setSauceType] = useState(SAUCE_TYPES[0].id);
  const [sushiMode, setSushiMode] = useState<"free_boat" | "paid_boat">("free_boat");

  // Drawing specific state
  const [selectedDrawingActivity, setSelectedDrawingActivity] = useState(DRAWING_ACTIVITIES[0].id);
  const [selectedColorType, setSelectedColorType] = useState(COLOR_TYPES[0].id);
  const [drawingMode, setDrawingMode] = useState<"free_boat" | "paid_boat">("free_boat");

  const [copiedInsta, setCopiedInsta] = useState(false);

  const totalSushiPieces = Object.values(sushiPieces).reduce((acc, val) => acc + (val || 0), 0);

  const handlePieceChange = (id: string, delta: number) => {
    setSushiPieces((prev) => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next < 0) return prev;
      const currentTotal = Object.values(prev).reduce((acc, val) => acc + (val || 0), 0);
      if (delta > 0 && currentTotal >= 10) {
        toast.error(isAr ? "الحد الأقصى هو 10 قطع في الوجبة" : "Maximum is 10 pieces per meal");
        return prev;
      }
      return { ...prev, [id]: next };
    });
  };

  const { data: slots = [] } = useQuery({
    queryKey: ["slots", activity?.id, date],
    queryFn: () => slotsFn({ data: { activity_id: activity!.id, date } }),
    enabled: !!activity?.id,
  });

  // Pre-fill from profile when authenticated
  useEffect(() => {
    if (!user) return;
    setEmail((e) => e || user.email || "");
    supabase.from("profiles").select("full_name,phone").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.full_name) setName((n) => n || data.full_name || "");
      if (data?.phone) setPhone((p) => p || data.phone || "");
    });
  }, [user]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">…</div>;
  if (!activity) throw notFound();

  const sushiUnitPrice = sushiMode === "free_boat" ? 200 : 240;
  const sushiTotal = (sushiUnitPrice * persons).toFixed(0);

  const drawingUnitPrice = drawingMode === "free_boat" ? 150 : 180;
  const drawingTotal = (drawingUnitPrice * persons).toFixed(0);

  const total = isSushi
    ? sushiTotal
    : isDrawing
      ? drawingTotal
      : (Number(activity.price) * persons).toFixed(2);

  const hasTwoSuppliers = !!(activity.supplier_name && activity.supplier_name_2);

  const currentSauceObj = SAUCE_TYPES.find((s) => s.id === sauceType) || SAUCE_TYPES[0];

  const openBooking = () => {
    if (!user) {
      toast.error(t.booking.authRequired);
      navigate({ to: "/auth" });
      return;
    }
    if (!slotId) return toast.error(t.booking.slot);
    if (hasTwoSuppliers && !supplierChoice) return toast.error(t.sections.supplier);
    setOpen(true);
  };

  const openSushiBooking = (mode: "free_boat" | "paid_boat") => {
    if (totalSushiPieces < 10) {
      toast.error(
        isAr
          ? `يرجى اختيار 10 قطع سوشي بالضبط (المحدد حالياً: ${totalSushiPieces} قطع - متبقي ${10 - totalSushiPieces})`
          : `Please select exactly 10 pieces (${10 - totalSushiPieces} remaining)`
      );
      return;
    }
    setSushiMode(mode);
    setOpen(true);
  };

  const openDrawingBooking = (mode: "free_boat" | "paid_boat") => {
    setDrawingMode(mode);
    setOpen(true);
  };

  const copyInstaPay = () => {
    navigator.clipboard.writeText(INSTAPAY_HANDLE);
    setCopiedInsta(true);
    toast.success(isAr ? "تم نسخ رقم / معرف إنستاباي!" : "InstaPay handle copied!");
    setTimeout(() => setCopiedInsta(false), 2500);
  };

  const handleWhatsAppConfirmation = () => {
    if (!name.trim() || !phone.trim()) {
      toast.error(isAr ? "يرجى كتابة الاسم ورقم الهاتف للمتابعة" : "Please provide your name and phone number");
      return;
    }

    if (isDrawing) {
      const currentDrawingObj = DRAWING_ACTIVITIES.find((d) => d.id === selectedDrawingActivity) || DRAWING_ACTIVITIES[0];
      const currentColorObj = COLOR_TYPES.find((c) => c.id === selectedColorType) || COLOR_TYPES[0];

      const packageName = drawingMode === "free_boat"
        ? (isAr ? "حجز ورشة الرسم + مركب مجاني (عرض الـ 30 طفل)" : "Drawing Workshop + Free Boat (30 Limit Offer)")
        : (isAr ? "حجز ورشة الرسم + سعر المركب (إضافة 30 جنيه)" : "Drawing Workshop + Boat Ticket (+30 EGP)");

      const msg = isAr 
        ? `🎨 *حجز نشاط أطفال - مركب الرسم* ⛵\n` +
          `----------------------------------------\n` +
          `📅 *التاريخ:* 19-11\n` +
          `👥 *عدد الأطفال:* ${persons} طفل\n` +
          `🖌️ *نشاط الرسم:* ${currentDrawingObj.name_ar}\n` +
          `🎨 *نوع الألوان:* ${currentColorObj.name_ar}\n` +
          `🎟️ *نوع الباقة:* ${packageName}\n` +
          `💵 *سعر الطفل:* ${drawingUnitPrice} ج.م\n` +
          `💰 *المبلغ الإجمالي:* ${drawingTotal} ج.م\n` +
          `----------------------------------------\n` +
          `👤 *اسم ولي الأمر / الطفل:* ${name}\n` +
          `📱 *رقم الهاتف:* ${phone}\n` +
          `💳 *طريقة الدفع:* إنستاباي (InstaPay)\n` +
          `----------------------------------------\n` +
          `📸 *مرفق اسكرين شوت إيصال التحويل لتأكيد الحجز.*`
        : `🎨 *Kids Activity Booking - Art & Drawing Boat* ⛵\n` +
          `----------------------------------------\n` +
          `📅 *Date:* 19-11\n` +
          `👥 *Number of Kids:* ${persons}\n` +
          `🖌️ *Activity:* ${currentDrawingObj.name_en}\n` +
          `🎨 *Colors:* ${currentColorObj.name_en}\n` +
          `🎟️ *Package:* ${packageName}\n` +
          `💵 *Per Child:* ${drawingUnitPrice} EGP\n` +
          `💰 *Total Amount:* ${drawingTotal} EGP\n` +
          `----------------------------------------\n` +
          `👤 *Name:* ${name}\n` +
          `📱 *Phone:* ${phone}\n` +
          `💳 *Payment:* InstaPay\n` +
          `----------------------------------------\n` +
          `📸 *Attached is the transfer screenshot for confirmation.*`;

      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
      return;
    }

    const packageName = sushiMode === "free_boat"
      ? (isAr ? "حجز سوشي + مركب مجاني (عرض الـ 40 فرد)" : "Sushi + Free Boat (40 Limit Offer)")
      : (isAr ? "حجز سوشي + سعر المركب (إضافة 40 جنيه)" : "Sushi + Boat Ticket (+40 EGP)");

    const sushiBreakdown = Object.entries(sushiPieces)
      .filter(([_, count]) => count > 0)
      .map(([id, count]) => {
        const item = SUSHI_TYPES.find((s) => s.id === id);
        const itemName = item ? (isAr ? item.name_ar : item.name_en) : id;
        return `   • ${itemName}: ${count} ${isAr ? "قطع" : "pcs"}`;
      })
      .join("\n");

    const msg = isAr 
      ? `🍣 *حجز نشاط صباحي - مركب سوشي* ⛵\n` +
        `----------------------------------------\n` +
        `📅 *التاريخ:* 19-11\n` +
        `👥 *عدد الأفراد:* ${persons} فرد\n` +
        `🍱 *اختيار الـ 10 قطع سوشي:*\n` +
        `${sushiBreakdown}\n` +
        `🥣 *نوع الصوص:* ${currentSauceObj.name_ar}\n` +
        `🎟️ *نوع الباقة:* ${packageName}\n` +
        `💵 *سعر الفرد:* ${sushiUnitPrice} ج.م\n` +
        `💰 *المبلغ الإجمالي:* ${sushiTotal} ج.م\n` +
        `----------------------------------------\n` +
        `👤 *الاسم:* ${name}\n` +
        `📱 *الهاتف:* ${phone}\n` +
        `💳 *طريقة الدفع:* إنستاباي (InstaPay)\n` +
        `----------------------------------------\n` +
        `📸 *مرفق اسكرين شوت إيصال التحويل لتأكيد الحجز.*`
      : `🍣 *Morning Activity Booking - Sushi Boat* ⛵\n` +
        `----------------------------------------\n` +
        `📅 *Date:* 19-11\n` +
        `👥 *Persons:* ${persons}\n` +
        `🍱 *Selected 10 Sushi Pieces:*\n` +
        `${sushiBreakdown}\n` +
        `🥣 *Sauce:* ${currentSauceObj.name_en}\n` +
        `🎟️ *Package:* ${packageName}\n` +
        `💵 *Per Person:* ${sushiUnitPrice} EGP\n` +
        `💰 *Total Amount:* ${sushiTotal} EGP\n` +
        `----------------------------------------\n` +
        `👤 *Name:* ${name}\n` +
        `📱 *Phone:* ${phone}\n` +
        `💳 *Payment:* InstaPay\n` +
        `----------------------------------------\n` +
        `📸 *Attached is the transfer screenshot for confirmation.*`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await bookFn({
        data: {
          time_slot_id: slotId, persons,
          contact_name: name, contact_phone: phone, contact_email: email,
          supplier_choice: hasTwoSuppliers ? supplierChoice : (activity.supplier_name ?? undefined),
        }
      });
      window.location.href = res.checkout_url;
    } catch (err) {
      const msg = (err as Error).message;
      toast.error(msg === "INSUFFICIENT_CAPACITY" ? t.booking.soldOut : msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <section className="relative isolate overflow-hidden">
        {activity.cover_image && (
          <div className="absolute inset-0">
            <img src={activity.cover_image} alt={pick(activity)} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/70 to-primary/95" />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-primary-foreground">
          <div className="text-sm uppercase tracking-wider text-accent font-semibold">
            {activity.category === "morning" ? t.sections.morning : t.sections.night}
          </div>
          <h1 className="mt-2 font-display text-4xl md:text-6xl font-bold">{pick(activity)}</h1>
          <p className="mt-4 max-w-2xl text-primary-foreground/85">{pick(activity, "description")}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{activity.duration_min} {t.activity.min}</span>
            <span className="inline-flex items-center gap-1">
              {activity.type === "group" ? <Users className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
              {activity.type === "group" ? `${activity.group_size ?? ""} ${t.activity.persons}` : t.activity.individual}
            </span>
            <span className="font-bold text-accent">{Number(activity.price).toFixed(0)} {t.activity.egp}</span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-3 gap-10 flex-1 w-full">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card rounded-2xl p-5 shadow-elegant flex items-center gap-4">
            {activity.supplier_logo ? (
              <img src={activity.supplier_logo} alt={activity.supplier_name ?? ""} className="h-14 w-14 rounded-xl object-cover" />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <Store className="h-7 w-7" />
              </div>
            )}
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{t.sections.supplier}</div>
              <div className="font-display text-lg font-bold text-primary">{activity.supplier_name || "—"}</div>
            </div>
          </div>

          {pick(activity, "rules") && (
            <Block icon={<ListChecks className="h-5 w-5" />} title={t.activity.rules} text={pick(activity, "rules")} />
          )}
          {pick(activity, "safety") && (
            <Block icon={<ShieldCheck className="h-5 w-5" />} title={t.activity.safety} text={pick(activity, "safety")} />
          )}
          {pick(activity, "requirements") && (
            <Block icon={<AlertTriangle className="h-5 w-5" />} title={t.activity.requirements} text={pick(activity, "requirements")} />
          )}
          {activity.images && activity.images.length > 0 && (
            <ActivityGallery images={activity.images} />
          )}
        </div>

        {/* RIGHT STICKY BOOKING CARD */}
        <div className="bg-card rounded-2xl shadow-elegant p-6 h-fit lg:sticky lg:top-24 space-y-4">
          <h2 className="font-display text-2xl font-bold text-primary">{t.booking.title}</h2>

          {isSushi ? (
            <>
              {/* DATE */}
              <div>
                <Label>{t.booking.date}</Label>
                <div className="mt-1 flex items-center justify-between rounded-lg border border-input bg-muted/40 px-3 py-2 text-sm font-semibold text-foreground">
                  <span>19-11 (19 نوفمبر)</span>
                  <span className="rounded bg-accent/20 px-2 py-0.5 text-xs text-accent">موعد الفعالية</span>
                </div>
              </div>

              {/* 10 PIECES SUSHI SELECTION WITH COUNTERS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {isAr ? "اختيار الـ 10 قطع سوشي" : "Select 10 Sushi Pieces"}
                  </Label>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      totalSushiPieces === 10
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {totalSushiPieces} / 10 {isAr ? "قطع" : "pcs"}
                    {totalSushiPieces === 10 && " ✓"}
                  </span>
                </div>

                <div className="space-y-1.5 rounded-xl border border-input/80 bg-muted/20 p-2">
                  {SUSHI_TYPES.map((st) => {
                    const count = sushiPieces[st.id] || 0;
                    return (
                      <div
                        key={st.id}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-colors ${
                          count > 0 
                            ? "bg-background border-accent/40 shadow-xs" 
                            : "bg-background/50 border-border/60 text-muted-foreground"
                        }`}
                      >
                        <span className={`font-medium ${count > 0 ? "text-foreground font-semibold" : ""}`}>
                          {isAr ? st.name_ar : st.name_en}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handlePieceChange(st.id, -1)}
                            disabled={count <= 0}
                            className="h-6 w-6 rounded-md border border-input bg-background flex items-center justify-center hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center font-bold text-xs">{count}</span>
                          <button
                            type="button"
                            onClick={() => handlePieceChange(st.id, 1)}
                            disabled={totalSushiPieces >= 10}
                            className="h-6 w-6 rounded-md border border-input bg-background flex items-center justify-center hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalSushiPieces < 10 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 font-medium flex items-center gap-1">
                    <span>⚠️</span>
                    <span>
                      {isAr
                        ? `متبقي ${10 - totalSushiPieces} قطع لاكتمال الـ 10 قطع المطلوبة`
                        : `${10 - totalSushiPieces} pieces remaining to complete 10`}
                    </span>
                  </p>
                )}
              </div>

              {/* SAUCE SELECTION */}
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {isAr ? "اختيار الصوص" : "Select Sauce"}
                </Label>
                <select
                  value={sauceType}
                  onChange={(e) => setSauceType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {SAUCE_TYPES.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {isAr ? sc.name_ar : sc.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* PERSONS NUMBER */}
              <div>
                <Label>{t.booking.persons}</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={persons}
                  onChange={(e) => setPersons(Math.max(1, Number(e.target.value)))}
                />
              </div>

              {/* LIMIT BADGE */}
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 font-medium">
                <Sparkles className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{isAr ? "limit للحجز 40 نفر مجاني مركب ⛵" : "Limit 40 persons free boat"}</span>
              </div>

              {/* TWO BOOKING BUTTONS */}
              <div className="space-y-3 pt-2 border-t border-border">
                {/* Button 1: حجز مع مركب مجاني */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{isAr ? "سعر الفرد: 200 ج.م" : "200 EGP / person"}</span>
                    <span className="font-bold text-accent">{200 * persons} {t.activity.egp}</span>
                  </div>
                  <Button
                    type="button"
                    onClick={() => openSushiBooking("free_boat")}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold py-5 text-sm"
                  >
                    {isAr ? "حجز (سوشي + مركب مجاني)" : "Book (Sushi + Free Boat)"}
                  </Button>
                </div>

                {/* Button 2: تحت زرار حجز الاولاني مكتوب فوقيه حجز السوشي + سعر المركب اضافه 40 جنيه */}
                <div className="pt-2 border-t border-dashed border-border/80">
                  <div className="bg-secondary/80 rounded-lg p-2.5 mb-2 text-xs flex items-center justify-between border border-border">
                    <div>
                      <div className="font-bold text-foreground">
                        {isAr ? "حجز السوشي + سعر المركب" : "Sushi Booking + Boat Fee"}
                      </div>
                      <div className="text-[11px] text-accent font-semibold">
                        {isAr ? "إضافة 40 جنيه" : "Add 40 EGP per person"}
                      </div>
                    </div>
                    <div className="font-bold text-accent text-sm">
                      {240 * persons} {t.activity.egp}
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => openSushiBooking("paid_boat")}
                    variant="outline"
                    className="w-full border-accent/60 bg-accent/10 hover:bg-accent/20 text-foreground font-bold py-5 text-sm"
                  >
                    {isAr ? "حجز (سوشي + سعر المركب)" : "Book (Sushi + Boat Ticket)"}
                  </Button>
                </div>
              </div>
            </>
          ) : isDrawing ? (
            <>
              {/* DATE */}
              <div>
                <Label>{t.booking.date}</Label>
                <div className="mt-1 flex items-center justify-between rounded-lg border border-input bg-muted/40 px-3 py-2 text-sm font-semibold text-foreground">
                  <span>19-11 (19 نوفمبر)</span>
                  <span className="rounded bg-accent/20 px-2 py-0.5 text-xs text-accent">موعد الفعالية</span>
                </div>
              </div>

              {/* ACTIVITY SELECTION */}
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {isAr ? "اختيار نشاط ورشة الرسم" : "Select Art Workshop"}
                </Label>
                <select
                  value={selectedDrawingActivity}
                  onChange={(e) => setSelectedDrawingActivity(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {DRAWING_ACTIVITIES.map((da) => (
                    <option key={da.id} value={da.id}>
                      {isAr ? da.name_ar : da.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* COLOR TYPE SELECTION */}
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {isAr ? "اختيار نوع الألوان والخامات" : "Select Colors & Materials"}
                </Label>
                <select
                  value={selectedColorType}
                  onChange={(e) => setSelectedColorType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {COLOR_TYPES.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {isAr ? ct.name_ar : ct.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* KIDS COUNT */}
              <div>
                <Label>{isAr ? "عدد الأطفال" : "Number of Kids"}</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={persons}
                  onChange={(e) => setPersons(Math.max(1, Number(e.target.value)))}
                />
              </div>

              {/* LIMIT BADGE */}
              <div className="rounded-xl bg-purple-500/10 border border-purple-500/30 p-2.5 text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1.5 font-medium">
                <Sparkles className="h-4 w-4 shrink-0 text-purple-600" />
                <span>{isAr ? "limit للحجز 30 طفل مجاني مركب 🎨⛵" : "Limit 30 kids free boat"}</span>
              </div>

              {/* TWO BOOKING BUTTONS */}
              <div className="space-y-3 pt-2 border-t border-border">
                {/* Button 1: حجز مع مركب مجاني */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{isAr ? "سعر الطفل: 150 ج.م" : "150 EGP / child"}</span>
                    <span className="font-bold text-accent">{150 * persons} {t.activity.egp}</span>
                  </div>
                  <Button
                    type="button"
                    onClick={() => openDrawingBooking("free_boat")}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold py-5 text-sm"
                  >
                    {isAr ? "حجز (ورشة الرسم + مركب مجاني)" : "Book (Drawing + Free Boat)"}
                  </Button>
                </div>

                {/* Button 2: تحت زرار حجز الاولاني مكتوب فوقيه حجز ورشة الرسم + سعر المركب اضافه 30 جنيه */}
                <div className="pt-2 border-t border-dashed border-border/80">
                  <div className="bg-secondary/80 rounded-lg p-2.5 mb-2 text-xs flex items-center justify-between border border-border">
                    <div>
                      <div className="font-bold text-foreground">
                        {isAr ? "حجز ورشة الرسم + سعر المركب" : "Drawing Booking + Boat Fee"}
                      </div>
                      <div className="text-[11px] text-accent font-semibold">
                        {isAr ? "إضافة 30 جنيه" : "Add 30 EGP per child"}
                      </div>
                    </div>
                    <div className="font-bold text-accent text-sm">
                      {180 * persons} {t.activity.egp}
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => openDrawingBooking("paid_boat")}
                    variant="outline"
                    className="w-full border-accent/60 bg-accent/10 hover:bg-accent/20 text-foreground font-bold py-5 text-sm"
                  >
                    {isAr ? "حجز (ورشة الرسم + سعر المركب)" : "Book (Drawing + Boat Ticket)"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label>{t.booking.date}</Label>
                <Input type="date" value={date} min={today} onChange={(e) => { setDate(e.target.value); setSlotId(""); }} />
              </div>
              <div>
                <Label>{t.booking.slot}</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {slots.length === 0 && <div className="col-span-2 text-sm text-muted-foreground py-2">—</div>}
                  {slots.map((s: any) => {
                    const disabled = s.remaining < persons;
                    return (
                      <button
                        type="button"
                        key={s.id}
                        disabled={disabled}
                        onClick={() => setSlotId(s.id)}
                        className={`rounded-lg border px-3 py-2 text-sm transition ${
                          slotId === s.id ? "border-accent bg-accent/10 text-accent font-semibold" :
                          disabled ? "border-border bg-muted text-muted-foreground cursor-not-allowed line-through" :
                          "border-border hover:border-accent"
                        }`}
                      >
                        {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                        <div className="text-[10px] opacity-70">{disabled ? t.booking.soldOut : `${s.remaining} ${t.booking.remaining}`}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              {hasTwoSuppliers && (
                <div>
                  <Label>{t.sections.supplier}</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {[
                      { name: activity.supplier_name as string, logo: activity.supplier_logo as string | null },
                      { name: activity.supplier_name_2 as string, logo: activity.supplier_logo_2 as string | null },
                    ].map((sup) => {
                      const active = supplierChoice === sup.name;
                      return (
                        <button
                          key={sup.name}
                          type="button"
                          onClick={() => setSupplierChoice(sup.name)}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-start transition ${
                            active ? "border-accent bg-accent/10 text-accent font-semibold" : "border-border hover:border-accent"
                          }`}
                        >
                          {sup.logo ? (
                            <img src={sup.logo} alt={sup.name} className="h-7 w-7 rounded-full object-cover" />
                          ) : (
                            <div className="h-7 w-7 rounded-full bg-accent/15" />
                          )}
                          <span className="truncate">{sup.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div>
                <Label>{t.booking.persons}</Label>
                <Input type="number" min={1} max={20} value={persons} onChange={(e) => setPersons(Math.max(1, Number(e.target.value)))} />
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-muted-foreground">{t.booking.total}</span>
                <span className="text-xl font-bold text-accent">{total} {t.activity.egp}</span>
              </div>
              <Button onClick={openBooking} className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={!slotId}>
                {t.sections.bookNow}
              </Button>
            </>
          )}
        </div>
      </section>

      {/* CONFIRMATION DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isSushi 
                ? (isAr ? "تأكيد حجز مركب سوشي" : "Confirm Sushi Boat Booking") 
                : isDrawing 
                  ? (isAr ? "تأكيد حجز مركب الرسم للأطفال" : "Confirm Kids Drawing Boat Booking")
                  : t.booking.title}
            </DialogTitle>
            <DialogDescription>
              {isSushi || isDrawing
                ? (isAr ? "أدخل بياناتك، أكمل التحويل عبر إنستاباي، وشارك اسكرين التحويل على واتساب للتأكيد." : "Enter your info, pay via InstaPay, and share transfer screenshot on WhatsApp.")
                : t.booking.reservedNote}
            </DialogDescription>
          </DialogHeader>

          {isSushi ? (
            <div className="space-y-4 pt-1">
              {/* SUMMARY BOX */}
              <div className="bg-secondary/60 rounded-xl p-3 border border-border text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isAr ? "التاريخ:" : "Date:"}</span>
                  <span className="font-bold text-foreground">19-11 (19 نوفمبر)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isAr ? "عدد الأفراد:" : "Persons:"}</span>
                  <span className="font-bold text-foreground">{persons}</span>
                </div>
                <div className="space-y-1 border-t border-border/60 pt-1.5">
                  <div className="text-muted-foreground font-medium">{isAr ? "اختيار الـ 10 قطع سوشي:" : "Selected 10 Sushi Pieces:"}</div>
                  <div className="ps-2 space-y-0.5">
                    {Object.entries(sushiPieces)
                      .filter(([_, count]) => count > 0)
                      .map(([id, count]) => {
                        const item = SUSHI_TYPES.find((s) => s.id === id);
                        return (
                          <div key={id} className="flex justify-between font-semibold text-foreground">
                            <span>• {item ? (isAr ? item.name_ar : item.name_en) : id}</span>
                            <span>{count} {isAr ? "قطع" : "pcs"}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isAr ? "الصوص:" : "Sauce:"}</span>
                  <span className="font-bold text-foreground">{isAr ? currentSauceObj.name_ar : currentSauceObj.name_en}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isAr ? "نوع الحجز:" : "Package:"}</span>
                  <span className="font-bold text-accent">
                    {sushiMode === "free_boat" 
                      ? (isAr ? "سوشي + مركب مجاني (200 ج.م)" : "Sushi + Free Boat (200 EGP)") 
                      : (isAr ? "سوشي + سعر المركب (240 ج.م)" : "Sushi + Boat Ticket (240 EGP)")}
                  </span>
                </div>
                <div className="border-t border-border pt-1.5 flex justify-between font-bold text-sm">
                  <span>{isAr ? "المبلغ الإجمالي:" : "Total:"}</span>
                  <span className="text-accent text-base">{sushiTotal} {isAr ? "جنيه مصري" : "EGP"}</span>
                </div>
              </div>

              {/* CONTACT INPUTS */}
              <div className="space-y-2.5">
                <div>
                  <Label className="text-xs">{isAr ? "الاسم الكامل *" : "Full Name *"}</Label>
                  <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder={isAr ? "مثال: أحمد محمود" : "e.g. John Doe"} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">{isAr ? "رقم الهاتف / الواتساب *" : "Phone Number *"}</Label>
                  <Input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01012345678" className="mt-1" />
                </div>
              </div>

              {/* INSTAPAY BOX */}
              <div className="rounded-xl border-2 border-purple-500/30 bg-purple-950/10 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <span className="bg-purple-600 text-white px-1.5 py-0.5 rounded text-[10px] font-black">IPA</span>
                    {isAr ? "دفع إنستا باي (InstaPay)" : "InstaPay Payment"}
                  </span>
                  <span className="font-black text-purple-600 dark:text-purple-400 text-sm">{sushiTotal} ج.م</span>
                </div>
                <div className="flex items-center justify-between bg-background rounded-lg p-2.5 border border-purple-500/20">
                  <div>
                    <div className="text-[10px] text-muted-foreground">{INSTAPAY_NAME}</div>
                    <div className="font-mono text-sm font-bold text-foreground" dir="ltr">{INSTAPAY_HANDLE}</div>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={copyInstaPay} className="h-8 gap-1 border-purple-500/30 text-xs">
                    {copiedInsta ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedInsta ? (isAr ? "تم النسخ" : "Copied") : (isAr ? "نسخ" : "Copy")}
                  </Button>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  💡 {isAr ? "حوّل المبلغ عبر إنستاباي والتقط اسكرين شوت للإيصال لتأكيد الحجز." : "Transfer via InstaPay and take a screenshot to confirm."}
                </div>
              </div>

              {/* WHATSAPP CONFIRMATION BUTTON */}
              <Button
                type="button"
                onClick={handleWhatsAppConfirmation}
                className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold py-5 text-sm flex items-center justify-center gap-2 shadow"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{isAr ? "مشاركة الحجز اسكرين وتساب للتأكيد" : "Share Screenshot on WhatsApp"}</span>
              </Button>
            </div>
          ) : isDrawing ? (
            <div className="space-y-4 pt-1">
              {/* SUMMARY BOX */}
              <div className="bg-secondary/60 rounded-xl p-3 border border-border text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isAr ? "التاريخ:" : "Date:"}</span>
                  <span className="font-bold text-foreground">19-11 (19 نوفمبر)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isAr ? "عدد الأطفال:" : "Number of Kids:"}</span>
                  <span className="font-bold text-foreground">{persons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isAr ? "نشاط الرسم:" : "Drawing Activity:"}</span>
                  <span className="font-bold text-foreground">
                    {DRAWING_ACTIVITIES.find((d) => d.id === selectedDrawingActivity)?.[isAr ? "name_ar" : "name_en"]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isAr ? "نوع الألوان والخامات:" : "Colors & Materials:"}</span>
                  <span className="font-bold text-foreground">
                    {COLOR_TYPES.find((c) => c.id === selectedColorType)?.[isAr ? "name_ar" : "name_en"]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isAr ? "نوع الحجز:" : "Package:"}</span>
                  <span className="font-bold text-accent">
                    {drawingMode === "free_boat" 
                      ? (isAr ? "ورشة الرسم + مركب مجاني (150 ج.م)" : "Drawing + Free Boat (150 EGP)") 
                      : (isAr ? "ورشة الرسم + سعر المركب (180 ج.م)" : "Drawing + Boat Ticket (180 EGP)")}
                  </span>
                </div>
                <div className="border-t border-border pt-1.5 flex justify-between font-bold text-sm">
                  <span>{isAr ? "المبلغ الإجمالي:" : "Total:"}</span>
                  <span className="text-accent text-base">{drawingTotal} {isAr ? "جنيه مصري" : "EGP"}</span>
                </div>
              </div>

              {/* CONTACT INPUTS */}
              <div className="space-y-2.5">
                <div>
                  <Label className="text-xs">{isAr ? "اسم ولي الأمر / الطفل *" : "Parent / Child Name *"}</Label>
                  <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder={isAr ? "مثال: سارة أحمد" : "e.g. Sarah Ahmed"} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">{isAr ? "رقم الهاتف / الواتساب *" : "Phone Number *"}</Label>
                  <Input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01012345678" className="mt-1" />
                </div>
              </div>

              {/* INSTAPAY BOX */}
              <div className="rounded-xl border-2 border-purple-500/30 bg-purple-950/10 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <span className="bg-purple-600 text-white px-1.5 py-0.5 rounded text-[10px] font-black">IPA</span>
                    {isAr ? "دفع إنستا باي (InstaPay)" : "InstaPay Payment"}
                  </span>
                  <span className="font-black text-purple-600 dark:text-purple-400 text-sm">{drawingTotal} ج.م</span>
                </div>
                <div className="flex items-center justify-between bg-background rounded-lg p-2.5 border border-purple-500/20">
                  <div>
                    <div className="text-[10px] text-muted-foreground">{INSTAPAY_NAME}</div>
                    <div className="font-mono text-sm font-bold text-foreground" dir="ltr">{INSTAPAY_HANDLE}</div>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={copyInstaPay} className="h-8 gap-1 border-purple-500/30 text-xs">
                    {copiedInsta ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedInsta ? (isAr ? "تم النسخ" : "Copied") : (isAr ? "نسخ" : "Copy")}
                  </Button>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  💡 {isAr ? "حوّل المبلغ عبر إنستاباي والتقط اسكرين شوت للإيصال لتأكيد الحجز." : "Transfer via InstaPay and take a screenshot to confirm."}
                </div>
              </div>

              {/* WHATSAPP CONFIRMATION BUTTON */}
              <Button
                type="button"
                onClick={handleWhatsAppConfirmation}
                className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold py-5 text-sm flex items-center justify-center gap-2 shadow"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{isAr ? "مشاركة الحجز اسكرين وتساب للتأكيد" : "Share Screenshot on WhatsApp"}</span>
              </Button>
            </div>
          ) : (
            <form onSubmit={confirm} className="space-y-3">
              <div>
                <Label>{t.booking.name}</Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>{t.booking.phone}</Label>
                <Input required value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <Label>{t.booking.email}</Label>
                <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-muted-foreground">{t.booking.total}</span>
                <span className="text-xl font-bold text-accent">{total} {t.activity.egp}</span>
              </div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={busy}>
                {busy ? "…" : t.booking.pay}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

function Block({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-elegant">
      <h3 className="flex items-center gap-2 font-display text-xl font-bold text-primary mb-3">{icon}{title}</h3>
      <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{text}</p>
    </div>
  );
}
