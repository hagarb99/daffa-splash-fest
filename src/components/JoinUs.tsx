import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useLang } from "@/lib/i18n";
import { getSetting } from "@/lib/festival.functions";
import { Gamepad2, MapPin, Building2, Globe2, MessageCircle } from "lucide-react";

export function JoinUs() {
  const { t, lang } = useLang();
  const settingFn = useServerFn(getSetting);
  const { data: whatsapp } = useQuery({
    queryKey: ["setting", "whatsapp_number"],
    queryFn: () => settingFn({ data: { key: "whatsapp_number" } }),
  });

  const number = (whatsapp ?? "").replace(/[^0-9]/g, "");
  const msg = encodeURIComponent(lang === "ar"
    ? "مرحبًا، أرغب في الانضمام إلى مهرجان دفّة."
    : "Hello, I'd like to join the Daffa Water Festival.");
  const waLink = number ? `https://wa.me/${number}?text=${msg}` : "#";

  const cards = [
    { icon: Gamepad2, label: t.sections.joinGame },
    { icon: MapPin, label: t.sections.joinPlace },
    { icon: Building2, label: t.sections.joinCity },
    { icon: Globe2, label: t.sections.joinCountry },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-primary">{t.sections.joinTitle}</h2>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">{t.sections.joinSub}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="group relative overflow-hidden rounded-2xl bg-card border border-border p-6 shadow-elegant hover:shadow-glow hover:-translate-y-1 transition-all duration-500"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-accent/60 to-transparent" />
            <div className="h-12 w-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
              <c.icon className="h-6 w-6" />
            </div>
            <div className="font-display text-lg font-bold text-primary">{c.label}</div>
          </motion.div>
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 rounded-full bg-[#25D366] text-white px-8 py-3.5 font-semibold shadow-glow hover:scale-105 transition-transform"
        >
          <MessageCircle className="h-5 w-5" />
          {t.sections.whatsapp}
        </a>
      </div>
    </section>
  );
}
