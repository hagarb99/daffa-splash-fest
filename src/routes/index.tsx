import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ActivityCard } from "@/components/ActivityCard";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { getActivities, getCities, getSponsors, getBrands } from "@/lib/festival.functions";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Daffa Water Festival — مهرجان دفّة المائي" },
      { name: "description", content: "Egypt's premier water festival across 8 cities with day-to-night entertainment, water sports, cinema, and cultural shows." },
      { property: "og:title", content: "Daffa Water Festival" },
      { property: "og:description", content: "Eight Egyptian cities. Day-to-night water entertainment." },
      { property: "og:image", content: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { t, lang, pick } = useLang();
  const activitiesFn = useServerFn(getActivities);
  const sponsorsFn = useServerFn(getSponsors);
  const citiesFn = useServerFn(getCities);
  const brandsFn = useServerFn(getBrands);

  const { data: activities = [] } = useQuery({ queryKey: ["activities"], queryFn: () => activitiesFn() });
  const { data: sponsors = [] } = useQuery({ queryKey: ["sponsors"], queryFn: () => sponsorsFn() });
  const { data: cities = [] } = useQuery({ queryKey: ["cities"], queryFn: () => citiesFn() });
  const { data: brands = [] } = useQuery({ queryKey: ["brands"], queryFn: () => brandsFn() });

  const morning = activities.filter((a) => a.category === "morning").slice(0, 8);
  const night = activities.filter((a) => a.category === "night").slice(0, 9);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-hero text-primary-foreground">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1920')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/60 to-primary/90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-40">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/20 backdrop-blur px-4 py-1.5 text-sm font-semibold text-accent-foreground border border-accent/40">
              <Sparkles className="h-4 w-4" />
              {t.hero.eyebrow}
            </span>
            <h1 className="mt-6 font-display text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] max-w-4xl">
              {t.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg md:text-xl text-primary-foreground/85 leading-relaxed">
              {t.hero.subtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/event-details">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow text-base px-8">
                  {t.hero.cta}
                  <ArrowRight className={`h-5 w-5 ${lang === "ar" ? "rotate-180" : ""}`} />
                </Button>
              </Link>
              <a href="#activities">
                <Button size="lg" variant="outline" className="bg-background/10 border-background/40 text-primary-foreground hover:bg-background/20 text-base px-8">
                  {t.hero.ctaSecondary}
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* EXPERIENCES OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-primary">{t.sections.experiences}</h2>
        <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground leading-relaxed">{t.hero.subtitle}</p>
      </section>

      {/* MORNING / NIGHT ACTIVITIES */}
      <section id="activities" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary">{t.sections.curated}</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">{t.sections.curatedSub}</p>
        </div>

        <h3 className="font-display text-2xl font-bold text-primary mt-12 mb-6 flex items-center gap-3">
          <span className="h-1 w-12 bg-gold rounded-full" /> {t.sections.morning}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {morning.map((a, i) => <ActivityCard key={a.slug} activity={a} index={i} />)}
        </div>

        <h3 className="font-display text-2xl font-bold text-primary mt-16 mb-6 flex items-center gap-3">
          <span className="h-1 w-12 bg-accent rounded-full" /> {t.sections.night}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {night.map((a, i) => <ActivityCard key={a.slug} activity={a} index={i} />)}
        </div>
      </section>

      {/* CITIES JOURNEY */}
      <section className="bg-deep text-primary-foreground py-20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold">{t.sections.cities}</h2>
            <p className="mt-4 text-primary-foreground/70">{t.sections.citiesSub}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cities.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="relative rounded-2xl overflow-hidden aspect-[3/4] group"
              >
                {c.image && <img src={c.image} alt={pick(c)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />}
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/30 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <div className="text-xs text-accent font-semibold flex items-center gap-1"><MapPin className="h-3 w-3" />{i + 1}</div>
                  <div className="font-display text-2xl font-bold">{pick(c)}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SPONSORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-center font-display text-4xl font-bold text-primary mb-10">{t.sections.sponsors}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {sponsors.map((s) => (
            <div key={s.id} className="bg-card rounded-2xl p-6 flex flex-col items-center justify-center shadow-elegant hover:shadow-glow transition-all">
              <img src={s.logo_url} alt={pick(s)} className="max-h-16 object-contain" loading="lazy" />
              <div className="mt-3 text-xs uppercase tracking-wider text-accent font-semibold">{s.tier}</div>
              <div className="font-semibold text-primary text-sm">{pick(s)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MARKETPLACE */}
      <section className="bg-secondary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary">{t.sections.marketplace}</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">{t.sections.marketplaceSub}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {brands.map((b) => (
              <div key={b.id} className="bg-card rounded-2xl p-4 aspect-square flex flex-col items-center justify-center shadow-elegant hover:-translate-y-1 transition-transform">
                <img src={b.logo_url} alt={pick(b)} className="w-16 h-16 object-cover rounded-xl" loading="lazy" />
                <div className="mt-2 text-xs font-semibold text-primary text-center">{pick(b)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-hero text-primary-foreground py-20 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-display text-4xl md:text-5xl font-bold">{t.sections.cta}</h2>
          <p className="mt-4 text-primary-foreground/80">{t.hero.subtitle}</p>
          <Link to="/event-details" className="inline-block mt-8">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-10 shadow-glow">
              {t.hero.cta}
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
