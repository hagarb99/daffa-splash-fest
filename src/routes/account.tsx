import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User as UserIcon, Calendar, Shield } from "lucide-react";

export const Route = createFileRoute("/account")({ component: AccountPage });

function AccountPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string; phone: string }>({ full_name: "", phone: "" });
  const [bookings, setBookings] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: b }] = await Promise.all([
        supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
        supabase
          .from("bookings")
          .select("id, status, total_price, persons, created_at, booking_date, activities(name_en, name_ar), packages(name_en, name_ar), time_slots(slot_date, start_time, end_time)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      setProfile({ full_name: p?.full_name ?? "", phone: p?.phone ?? "" });
      setBookings(b ?? []);
    })();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">…</div>;
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link to="/auth" className="underline">Sign in</Link>
      </div>
    );
  }

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...profile });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-accent/20 text-accent flex items-center justify-center">
            <UserIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">{profile.full_name || user.email}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{user.email}</span>
              {isAdmin && <Badge variant="secondary"><Shield className="h-3 w-3 me-1" />Admin</Badge>}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-elegant p-6 space-y-4">
          <h2 className="font-display text-xl font-bold">My details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Full name</Label><Input value={profile.full_name} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} /></div>
            <div><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} /></div>
            <div><Label>Email</Label><Input value={user.email ?? ""} disabled /></div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90">{saving ? "…" : "Save"}</Button>
            {isAdmin && <Button variant="outline" onClick={() => navigate({ to: "/admin" })}>Admin Dashboard</Button>}
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-elegant p-6 space-y-4">
          <h2 className="font-display text-xl font-bold flex items-center gap-2"><Calendar className="h-5 w-5" /> My bookings ({bookings.length})</h2>
          {bookings.length === 0 && <p className="text-muted-foreground text-sm">No bookings yet.</p>}
          <div className="space-y-2">
            {bookings.map((b) => (
              <div key={b.id} className="border border-border rounded-lg p-3 flex justify-between gap-3 text-sm">
                <div>
                  <div className="font-medium">{b.activities?.name_en ?? b.packages?.name_en ?? "Booking"}</div>
                  <div className="text-xs text-muted-foreground">
                    {b.time_slots ? `${b.time_slots.slot_date} · ${b.time_slots.start_time}–${b.time_slots.end_time}` : b.booking_date ?? ""}
                    {" · "}{b.persons} pax
                  </div>
                </div>
                <div className="text-end">
                  <Badge>{b.status}</Badge>
                  <div className="text-xs mt-1">{b.total_price} EGP</div>
                  <div className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
