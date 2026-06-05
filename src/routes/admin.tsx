import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

interface Booking { id: string; status: string; total_price: number; persons: number; created_at: string; activities?: { name_en: string } | null; }

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const { pick, t } = useLang();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activities, setActivities] = useState<{ id: string; name_ar: string; name_en: string; is_active: boolean; price: number; category: string }[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("bookings").select("id,status,total_price,persons,created_at,activities(name_en)").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setBookings((data as unknown as Booking[]) ?? []));
    supabase.from("activities").select("id,name_ar,name_en,is_active,price,category").order("sort_order")
      .then(({ data }) => setActivities(data ?? []));
  }, [isAdmin]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">…</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center"><Link to="/auth" className="underline">{t.nav.signIn}</Link></div>;
  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">403 — admin only</div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <h1 className="font-display text-4xl font-bold text-primary">Admin</h1>

        <h2 className="font-display text-2xl font-bold mt-10 mb-4">Bookings (latest 50)</h2>
        <div className="overflow-x-auto bg-card rounded-2xl shadow-elegant">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground"><tr>
              <th className="p-3 text-start">Activity</th><th className="p-3 text-start">Status</th>
              <th className="p-3 text-start">Persons</th><th className="p-3 text-start">Total</th><th className="p-3 text-start">Date</th>
            </tr></thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-border">
                  <td className="p-3">{b.activities?.name_en ?? "—"}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${b.status === "confirmed" ? "bg-accent/20 text-accent-foreground" : "bg-muted"}`}>{b.status}</span></td>
                  <td className="p-3">{b.persons}</td>
                  <td className="p-3">{Number(b.total_price).toFixed(2)}</td>
                  <td className="p-3">{new Date(b.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="font-display text-2xl font-bold mt-10 mb-4">Activities</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((a) => (
            <div key={a.id} className="bg-card rounded-xl shadow-elegant p-4">
              <div className="font-semibold">{pick(a)}</div>
              <div className="text-xs text-muted-foreground">{a.category} • {a.price} EGP • {a.is_active ? "active" : "inactive"}</div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">Full CRUD is available via Lovable Cloud backend dashboard.</p>
      </section>
      <Footer />
    </div>
  );
}
