import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

const dict = {
  ar: {
    brand: "Daffa",
    tagline: "تجربة مائية لا تُنسى عبر مصر",
    nav: {
      home: "الرئيسية",
      activities: "الأنشطة",
      cities: "المدن",
      sponsors: "الرعاة",
      marketplace: "السوق",
      signIn: "تسجيل الدخول",
      admin: "لوحة الإدارة",
      signOut: "تسجيل الخروج",
    },
    hero: {
      eyebrow: "تجربة المهرجان",
      title: "Daffa",
      subtitle:
        "مجاري مياه مصر الفخمة تحتوي على إمكانات غير مستغلة للترفيه الحديث والسياحة الإقليمية والتكنولوجيا البحرية المستدامة. دفّة تقود هذا التحول.",
      cta: "احجز تجربتك",
      ctaSecondary: "استكشف الأنشطة",
    },
    sections: {
      experiences: "تجربة المهرجان",
      curated: "ترفيه نهاري وليلي مختار",
      curatedSub: "ثمانية تجارب صباحية وتسع تجارب ليلية في مدن مصر الجميلة.",
      morning: "أنشطة الصباح",
      night: "أنشطة المساء",
      sponsors: "شركاء النجاح",
      cities: "رحلة المدن",
      citiesSub: "ثماني مدن، عشرة أيام لكل مدينة، تجربة لا تنتهي.",
      marketplace: "الطعام وأسلوب الحياة",
      marketplaceSub: "سوق متكامل للأطعمة والمشروبات والعلامات التجارية الرائدة.",
      cta: "احجز الآن",
      joinTitle: "انضم إلينا",
      joinSub: "ساعدنا في توسيع المهرجان: اقترح لعبة أو مكانًا أو مدينة أو دولة جديدة.",
      joinGame: "إدراج لعبة جديدة",
      joinPlace: "اقتراح مكان جديد",
      joinCity: "اقتراح مدينة جديدة",
      joinCountry: "اقتراح دولة جديدة",
      whatsapp: "تواصل عبر واتساب",
      soon: "قريبًا",
      supplier: "المشغّل",
      bookNow: "احجز الآن",
      gallery: "معرض الصور",
      filters: { all: "الكل", group: "جماعية", individual: "فردية", kids: "أطفال", shows: "عروض" },
      packagesEyebrow: "باقات حصرية",
      packages: "الباقات",
      packagesSub: "اختر باقة متكاملة من عدة أنشطة بسعر مميز.",
      save: "وفر",
      bookPackage: "احجز الباقة",
      included: "الأنشطة المشمولة",
      packagePrice: "سعر الباقة",
      notes: "ملاحظات",
    },
    activity: {
      individual: "فردي",
      group: "جماعي",
      persons: "أشخاص",
      person: "شخص",
      duration: "المدة",
      min: "دقيقة",
      price: "السعر",
      egp: "ج.م",
      book: "احجز الآن",
      rules: "القواعد",
      safety: "السلامة",
      requirements: "المتطلبات",
      details: "تفاصيل النشاط",
    },
    booking: {
      title: "احجز موعدك",
      date: "اختر اليوم",
      slot: "اختر الموعد",
      persons: "عدد الأشخاص",
      name: "الاسم الكامل",
      phone: "رقم الهاتف",
      email: "البريد الإلكتروني",
      total: "الإجمالي",
      pay: "الدفع عبر فوري",
      remaining: "المتبقي",
      soldOut: "اكتمل العدد",
      success: "تم تأكيد الحجز",
      pending: "في انتظار الدفع",
      expired: "انتهى وقت الحجز",
      cancelled: "تم الإلغاء",
      authRequired: "يجب تسجيل الدخول للحجز",
      reservedNote: "سيتم حجز مقعدك مؤقتًا لمدة 15 دقيقة لإتمام الدفع.",
    },
    auth: {
      title: "تسجيل الدخول / إنشاء حساب",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      fullName: "الاسم الكامل",
      phone: "رقم الهاتف",
      signIn: "تسجيل الدخول",
      signUp: "إنشاء حساب",
      switchToSignUp: "ليس لديك حساب؟ سجّل الآن",
      switchToSignIn: "لديك حساب؟ سجّل دخولك",
    },
    footer: {
      rights: "جميع الحقوق محفوظة",
    },
  },
  en: {
    brand: "Daffa Water Festival",
    tagline: "An unforgettable water experience across Egypt",
    nav: {
      home: "Home",
      activities: "Activities",
      cities: "Cities",
      sponsors: "Sponsors",
      marketplace: "Marketplace",
      signIn: "Sign in",
      admin: "Admin",
      signOut: "Sign out",
    },
    hero: {
      eyebrow: "The Festival Experience",
      title: "Daffa Water Festival",
      subtitle:
        "Egypt's majestic waterways hold untapped potential for modern entertainment, regional tourism, and sustainable maritime technology. Daffa is steering this transformation.",
      cta: "Book your experience",
      ctaSecondary: "Explore activities",
    },
    sections: {
      experiences: "The Festival Experiences",
      curated: "Curated Day-to-Night Entertainment",
      curatedSub: "Eight morning experiences and nine night experiences across Egypt's beautiful cities.",
      morning: "Morning Activities",
      night: "Night Activities",
      sponsors: "Our Sponsors",
      cities: "Cities Journey",
      citiesSub: "Eight cities, ten days each, a non-stop experience.",
      marketplace: "Food & Lifestyle",
      marketplaceSub: "A fully integrated culinary and lifestyle marketplace hosting commercial retail powerhouses and restaurants.",
      cta: "Book now",
      joinTitle: "Join Us",
      joinSub: "Help us expand the festival: suggest a new game, place, city, or country.",
      joinGame: "Add a new game",
      joinPlace: "Suggest a new place",
      joinCity: "Suggest a new city",
      joinCountry: "Suggest a new country",
      whatsapp: "Chat on WhatsApp",
      soon: "Soon",
      supplier: "Supplier",
      bookNow: "Book Now",
      gallery: "Activity Gallery",
      filters: { all: "All", group: "Group", individual: "Individual", kids: "Kids", shows: "Shows" },
      packagesEyebrow: "Exclusive Bundles",
      packages: "Packages",
      packagesSub: "Choose a curated bundle of activities at a special price.",
      save: "Save",
      bookPackage: "Book Package",
      included: "Included Activities",
      packagePrice: "Package Price",
      notes: "Notes",
    },
    activity: {
      individual: "Individual",
      group: "Group",
      persons: "persons",
      person: "person",
      duration: "Duration",
      min: "min",
      price: "Price",
      egp: "EGP",
      book: "Book now",
      rules: "Rules",
      safety: "Safety",
      requirements: "Requirements",
      details: "Activity details",
    },
    booking: {
      title: "Book your slot",
      date: "Select date",
      slot: "Select time",
      persons: "Number of persons",
      name: "Full name",
      phone: "Phone",
      email: "Email",
      total: "Total",
      pay: "Pay with Fawry",
      remaining: "remaining",
      soldOut: "Sold out",
      success: "Booking confirmed",
      pending: "Awaiting payment",
      expired: "Booking expired",
      cancelled: "Cancelled",
      authRequired: "Please sign in to book",
      reservedNote: "Your seat is held for 15 minutes to complete payment.",
    },
    auth: {
      title: "Sign in / Create account",
      email: "Email",
      password: "Password",
      fullName: "Full name",
      phone: "Phone",
      signIn: "Sign in",
      signUp: "Create account",
      switchToSignUp: "Don't have an account? Sign up",
      switchToSignIn: "Already have an account? Sign in",
    },
    footer: {
      rights: "All rights reserved",
    },
  },
};

type Dict = typeof dict.ar;

interface LangContextValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  t: Dict;
  setLang: (l: Lang) => void;
  toggle: () => void;
  pick: <T extends { name_ar?: string | null; name_en?: string | null }>(row: T, field?: string) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && (localStorage.getItem("lang") as Lang)) || "ar";
    setLangState(saved === "en" ? "en" : "ar");
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    try { localStorage.setItem("lang", lang); } catch { /* ignore */ }
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggle = useCallback(() => setLangState((p) => (p === "ar" ? "en" : "ar")), []);

  const pick = useCallback(
    <T extends Record<string, unknown>>(row: T, field = "name") => {
      const key = `${field}_${lang}` as keyof T;
      const fallback = `${field}_${lang === "ar" ? "en" : "ar"}` as keyof T;
      return (row?.[key] as string) || (row?.[fallback] as string) || "";
    },
    [lang],
  );

  const value = useMemo<LangContextValue>(
    () => ({ lang, dir: lang === "ar" ? "rtl" : "ltr", t: dict[lang], setLang, toggle, pick: pick as LangContextValue["pick"] }),
    [lang, setLang, toggle, pick],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
