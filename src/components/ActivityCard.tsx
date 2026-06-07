import { Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { Clock, Users, User as UserIcon, Store } from "lucide-react";
import { motion } from "framer-motion";

export interface ActivityCardData {
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar?: string | null;
  description_en?: string | null;
  duration_min: number | null;
  price: number;
  type: "individual" | "group";
  group_size: number | null;
  category: "morning" | "night";
  cover_image: string | null;
  supplier_name?: string | null;
  supplier_logo?: string | null;
  is_kids?: boolean | null;
  is_show?: boolean | null;
}

export function ActivityCard({ activity, index = 0 }: { activity: ActivityCardData; index?: number }) {
  const { t, pick } = useLang();
  const supplierName = activity.supplier_name || t.sections.supplier;
  const supplierLogo = activity.supplier_logo;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
    >
      <Link
        to="/activities/$slug"
        params={{ slug: activity.slug }}
        className="group block rounded-2xl overflow-hidden bg-card shadow-elegant hover:shadow-glow transition-all duration-500 hover:-translate-y-1"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={activity.cover_image || ""}
            alt={pick(activity)}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
          <div className="absolute top-3 start-3 flex gap-2">
            <span className="rounded-full bg-background/90 backdrop-blur px-3 py-1 text-xs font-semibold">
              {activity.category === "morning" ? t.sections.morning : t.sections.night}
            </span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-display text-xl font-bold text-foreground group-hover:text-accent transition-colors text-[#bb9f63]">
            {pick(activity)}
          </h3>
          {pick(activity, "description") && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{pick(activity, "description")}</p>
          )}
          <div className="mt-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{activity.duration_min} {t.activity.min}</span>
              <span className="inline-flex items-center gap-1">
                {activity.type === "group" ? <Users className="h-3.5 w-3.5" /> : <UserIcon className="h-3.5 w-3.5" />}
                {activity.type === "group" ? `${activity.group_size ?? ""} ${t.activity.persons}` : t.activity.individual}
              </span>
            </div>
            <div className="font-bold text-accent">
              {Number(activity.price).toFixed(0)} {t.activity.egp}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
