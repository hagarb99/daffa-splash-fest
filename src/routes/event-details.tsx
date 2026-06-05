import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ActivityCard } from "@/components/ActivityCard";
import { getActivities } from "@/lib/festival.functions";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/event-details")({
  head: () => ({
    meta: [
      { title: "Festival Activities — Daffa Water Festival" },
      { name: "description", content: "Browse all morning and night water activities offered by the Daffa Water Festival." },
    ],
  }),
  component: EventDetailsPage,
});

function EventDetailsPage() {
  const { t } = useLang();
  const fn = useServerFn(getActivities);
  const { data = [] } = useQuery({ queryKey: ["activities"], queryFn: () => fn() });
  const [filter, setFilter] = useState<"all" | "morning" | "night">("all");
  const filtered = filter === "all" ? data : data.filter((a) => a.category === filter);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary">{t.sections.curated}</h1>
        <p className="mt-3 text-muted-foreground">{t.sections.curatedSub}</p>
        <div className="mt-6 flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>{t.nav.activities}</Button>
          <Button variant={filter === "morning" ? "default" : "outline"} onClick={() => setFilter("morning")}>{t.sections.morning}</Button>
          <Button variant={filter === "night" ? "default" : "outline"} onClick={() => setFilter("night")}>{t.sections.night}</Button>
        </div>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((a, i) => <ActivityCard key={a.slug} activity={a} index={i} />)}
        </div>
      </section>
      <Footer />
    </div>
  );
}
