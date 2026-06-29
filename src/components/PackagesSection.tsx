import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { getPackages } from "@/lib/packages.functions";

export function PackagesSection() {
  const { t, pick } = useLang();
  const fn = useServerFn(getPackages);
  const { data: packages = [] } = useQuery({ queryKey: ["packages"], queryFn: () => fn() });

  if (packages.length === 0) return null;

  return (
    <section className="bg-secondary/40 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-1.5 text-xs font-bold text-accent uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            {t.sections.packagesEyebrow}
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold text-primary">{t.sections.packages}</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{t.sections.packagesSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((p, i) => {
            const sum = p.activities.reduce((acc, a) => acc + Number(a.price || 0), 0);
            const savePct = sum > 0 && sum > Number(p.price) ? Math.round(((sum - Number(p.price)) / sum) * 100) : 0;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative bg-card rounded-3xl p-8 shadow-elegant border border-border hover:border-accent/60 hover:shadow-glow transition-all flex flex-col"
              >
                {savePct > 0 && (
                  <div className="absolute -top-3 end-6 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full shadow-glow">
                    {t.sections.save} {savePct}%
                  </div>
                )}
                <h3 className="font-display text-2xl font-bold text-primary">{pick(p)}</h3>
                {pick(p, "description") && (
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{pick(p, "description")}</p>
                )}

                <ul className="mt-6 space-y-2 flex-1">
                  {p.activities.map((a) => (
                    <li key={a.id} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-accent shrink-0" />
                      <span>{pick(a)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-baseline gap-2 border-t border-border pt-5">
                  <span className="font-display text-3xl font-bold text-accent">{Number(p.price).toFixed(0)}</span>
                  <span className="text-sm text-muted-foreground">{t.activity.egp}</span>
                  {savePct > 0 && (
                    <span className="ms-auto text-xs text-muted-foreground line-through">{sum.toFixed(0)} {t.activity.egp}</span>
                  )}
                </div>

                <Link to="/packages/$id" params={{ id: p.id }} className="mt-5">
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow">
                    {t.sections.bookPackage}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
