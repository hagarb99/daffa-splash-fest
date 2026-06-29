import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { getPackageById, createPackageBooking } from "@/lib/packages.functions";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/packages/$id")({
  loader: ({ params }) => ({ id: params.id }),
  component: PackageBookingPage,
});

function PackageBookingPage() {
  const { id } = Route.useLoaderData();
  const { t, pick } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fn = useServerFn(getPackageById);
  const bookFn = useServerFn(createPackageBooking);
  const { data: pkg, isLoading } = useQuery({ queryKey: ["package", id], queryFn: () => fn({ data: { id } }) });

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("10:00");
  const [persons, setPersons] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">…</div>;
  if (!pkg) throw notFound();

  const total = (Number(pkg.price) * persons).toFixed(2);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(t.booking.authRequired);
      navigate({ to: "/auth" });
      return;
    }
    setBusy(true);
    try {
      const res = await bookFn({ data: {
        package_id: pkg.id, persons, booking_date: date, booking_time: time,
        contact_name: name, contact_phone: phone, contact_email: email, notes: notes || undefined,
      }});
      window.location.href = res.checkout_url;
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <section className="bg-hero text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> {t.sections.packagesEyebrow}
          </span>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold">{pick(pkg)}</h1>
          {pick(pkg, "description") && <p className="mt-3 max-w-2xl text-primary-foreground/85">{pick(pkg, "description")}</p>}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-3 gap-10 flex-1 w-full">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl p-6 shadow-elegant">
            <h2 className="font-display text-2xl font-bold text-primary mb-4">{t.sections.included}</h2>
            <ul className="space-y-3">
              {pkg.activities.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="h-8 w-8 rounded-full bg-accent/15 flex items-center justify-center text-accent shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-foreground flex-1">{pick(a)}</span>
                  <span className="text-sm text-muted-foreground">{Number(a.price).toFixed(0)} {t.activity.egp}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">{t.sections.packagePrice}</span>
              <span className="font-display text-3xl font-bold text-accent">{Number(pkg.price).toFixed(0)} {t.activity.egp}</span>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="bg-card rounded-2xl shadow-elegant p-6 h-fit lg:sticky lg:top-24 space-y-4">
          <h2 className="font-display text-2xl font-bold text-primary">{t.booking.title}</h2>
          <div><Label>{t.booking.date}</Label><Input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} required /></div>
          <div><Label>{t.booking.slot}</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required /></div>
          <div><Label>{t.booking.persons}</Label><Input type="number" min={1} max={20} value={persons} onChange={(e) => setPersons(Math.max(1, Number(e.target.value)))} /></div>
          <div><Label>{t.booking.name}</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>{t.booking.phone}</Label><Input required value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div><Label>{t.booking.email}</Label><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label>{t.sections.notes}</Label><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">{t.booking.total}</span>
            <span className="text-xl font-bold text-accent">{total} {t.activity.egp}</span>
          </div>
          <p className="text-xs text-muted-foreground">{t.booking.reservedNote}</p>
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={busy}>
            {busy ? "…" : t.booking.pay}
          </Button>
        </form>
      </section>
      <Footer />
    </div>
  );
}
