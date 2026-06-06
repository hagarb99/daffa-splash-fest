import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

interface Booking { id: string; status: string; total_price: number; persons: number; created_at: string; activities?: { name_en: string } | null; }

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const { pick, t } = useLang();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activities, setActivities] = useState<{ id: string; name_ar: string; name_en: string; is_active: boolean; price: number; category: string; supplier_name?: string | null; supplier_logo?: string | null }[]>([]);
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("bookings").select("id,status,total_price,persons,created_at,activities(name_en)").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setBookings((data as unknown as Booking[]) ?? []));
    supabase.from("activities").select("id,name_ar,name_en,is_active,price,category,supplier_name,supplier_logo").order("sort_order")
      .then(({ data }) => setActivities(data ?? []));
    supabase.from("app_settings").select("value").eq("key", "whatsapp_number").maybeSingle()
      .then(({ data }) => setWhatsapp(data?.value ?? ""));
  }, [isAdmin]);

  const saveWhatsapp = async () => {
    const { error } = await supabase.from("app_settings").upsert({ key: "whatsapp_number", value: whatsapp, updated_at: new Date().toISOString() });
    if (error) toast.error(error.message); else toast.success("Saved");
  };

  const updateSupplier = async (id: string, name: string, logo: string) => {
    const { error } = await supabase.from("activities").update({ supplier_name: name || null, supplier_logo: logo || null }).eq("id", id);
    if (error) toast.error(error.message); else toast.success("Supplier updated");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">…</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center"><Link to="/auth" className="underline">{t.nav.signIn}</Link></div>;
  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">403 — admin only</div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <h1 className="font-display text-4xl font-bold text-primary">Admin</h1>

        {/* Settings */}
        <h2 className="font-display text-2xl font-bold mt-10 mb-4">Settings</h2>
        <div className="bg-card rounded-2xl shadow-elegant p-5 max-w-md flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">WhatsApp Number</label>
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+201000000000" />
          </div>
          <Button onClick={saveWhatsapp} className="bg-accent text-accent-foreground hover:bg-accent/90">Save</Button>
        </div>

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

        <h2 className="font-display text-2xl font-bold mt-10 mb-4">Activities & Suppliers</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((a) => (
            <SupplierEditor key={a.id} activity={a} onSave={updateSupplier} pick={pick} />
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">Full CRUD is available via Lovable Cloud backend dashboard.</p>
      </section>
      <Footer />
    </div>
  );
}

function SupplierEditor({ activity, onSave, pick }: { activity: { id: string; name_ar: string; name_en: string; price: number; category: string; supplier_name?: string | null; supplier_logo?: string | null }; onSave: (id: string, n: string, l: string) => void; pick: (row: { name_ar?: string | null; name_en?: string | null }) => string }) {
  const [name, setName] = useState(activity.supplier_name ?? "");
  const [logo, setLogo] = useState(activity.supplier_logo ?? "");
  return (
    <div className="bg-card rounded-xl shadow-elegant p-4 space-y-2">
      <div className="font-semibold">{pick(activity)}</div>
      <div className="text-xs text-muted-foreground">{activity.category} • {activity.price} EGP</div>
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Supplier name" />
      <Input value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="Supplier logo URL" />
      <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => onSave(activity.id, name, logo)}>Save</Button>
    </div>
  );
}
