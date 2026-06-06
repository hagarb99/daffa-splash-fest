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

type Filter = "all" | "group" | "individual" | "kids" | "shows" | "morning" | "night";

export const Route = createFileRoute("/event-details")({
  head: () => ({
    meta: [
      { title: "Festival Activities — Daffa Water Festival" },
      { name: "description", content: "Browse all morning, night, group, individual, kids, and show activities offered by the Daffa Water Festival." },
    ],
  }),
  component: EventDetailsPage,
});

function EventDetailsPage() {
  const { t } = useLang();
  const fn = useServerFn(getActivities);
  const { data = [] } = useQuery({ queryKey: ["activities"], queryFn: () => fn() });
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = data.filter((a) => {
    switch (filter) {
      case "all": return true;
      case "group": return a.type === "group";
      case "individual": return a.type === "individual";
      case "kids": return !!a.is_kids;
      case "shows": return !!a.is_show;
      case "morning": return a.category === "morning";
      case "night": return a.category === "night";
    }
  });

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: t.sections.filters.all },
    { id: "morning", label: t.sections.morning },
    { id: "night", label: t.sections.night },
    { id: "group", label: t.sections.filters.group },
    { id: "individual", label: t.sections.filters.individual },
    { id: "kids", label: t.sections.filters.kids },
    { id: "shows", label: t.sections.filters.shows },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary">{t.sections.curated}</h1>
        <p className="mt-3 text-muted-foreground">{t.sections.curatedSub}</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              size="sm"
              variant={filter === tab.id ? "default" : "outline"}
              onClick={() => setFilter(tab.id)}
              className={filter === tab.id ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow" : ""}
            >
              {tab.label}
            </Button>
          ))}
        </div>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((a, i) => <ActivityCard key={a.slug} activity={a} index={i} />)}
        </div>
      </section>
      <Footer />
    </div>
  );
}
