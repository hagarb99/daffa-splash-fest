import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { getActivityBySlug, getSlots } from "@/lib/festival.functions";
import { createBooking } from "@/lib/booking.functions";
import { Clock, Users, User as UserIcon, ShieldCheck, ListChecks, AlertTriangle, Store } from "lucide-react";
import { ActivityGallery } from "@/components/ActivityGallery";
import { toast } from "sonner";

export const Route = createFileRoute("/activities/$slug")({
  loader: async ({ params }) => ({ slug: params.slug }),
  component: ActivityPage,
});

function ActivityPage() {
  const { slug } = Route.useLoaderData();
  const { t, pick } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fn = useServerFn(getActivityBySlug);
  const slotsFn = useServerFn(getSlots);
  const bookFn = useServerFn(createBooking);

  const { data: activity, isLoading } = useQuery({ queryKey: ["activity", slug], queryFn: () => fn({ data: { slug } }) });

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [slotId, setSlotId] = useState<string>("");
  const [persons, setPersons] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [supplierChoice, setSupplierChoice] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const { data: slots = [] } = useQuery({
    queryKey: ["slots", activity?.id, date],
    queryFn: () => slotsFn({ data: { activity_id: activity!.id, date } }),
    enabled: !!activity?.id,
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">…</div>;
  if (!activity) throw notFound();

  const total = (Number(activity.price) * persons).toFixed(2);
  const hasTwoSuppliers = !!(activity.supplier_name && activity.supplier_name_2);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(t.booking.authRequired);
      navigate({ to: "/auth" });
      return;
    }
    if (!slotId) return toast.error(t.booking.slot);
    if (hasTwoSuppliers && !supplierChoice) return toast.error(t.sections.supplier);
    setBusy(true);
    try {
      const res = await bookFn({ data: {
        time_slot_id: slotId, persons,
        contact_name: name, contact_phone: phone, contact_email: email,
        supplier_choice: hasTwoSuppliers ? supplierChoice : (activity.supplier_name ?? undefined),
      } });
      window.location.href = res.checkout_url;
    } catch (err) {
      const msg = (err as Error).message;
      toast.error(msg === "INSUFFICIENT_CAPACITY" ? t.booking.soldOut : msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <section className="relative isolate overflow-hidden">
        {activity.cover_image && (
          <div className="absolute inset-0">
            <img src={activity.cover_image} alt={pick(activity)} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/70 to-primary/95" />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-primary-foreground">
          <div className="text-sm uppercase tracking-wider text-accent font-semibold">
            {activity.category === "morning" ? t.sections.morning : t.sections.night}
          </div>
          <h1 className="mt-2 font-display text-4xl md:text-6xl font-bold">{pick(activity)}</h1>
          <p className="mt-4 max-w-2xl text-primary-foreground/85">{pick(activity, "description")}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{activity.duration_min} {t.activity.min}</span>
            <span className="inline-flex items-center gap-1">
              {activity.type === "group" ? <Users className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
              {activity.type === "group" ? `${activity.group_size ?? ""} ${t.activity.persons}` : t.activity.individual}
            </span>
            <span className="font-bold text-accent">{Number(activity.price).toFixed(0)} {t.activity.egp}</span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-3 gap-10 flex-1 w-full">
        <div className="lg:col-span-2 space-y-8">
          {/* Supplier */}
          <div className="bg-card rounded-2xl p-5 shadow-elegant flex items-center gap-4">
            {activity.supplier_logo ? (
              <img src={activity.supplier_logo} alt={activity.supplier_name ?? ""} className="h-14 w-14 rounded-xl object-cover" />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <Store className="h-7 w-7" />
              </div>
            )}
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{t.sections.supplier}</div>
              <div className="font-display text-lg font-bold text-primary">{activity.supplier_name || "—"}</div>
            </div>
          </div>

          {pick(activity, "rules") && (
            <Block icon={<ListChecks className="h-5 w-5" />} title={t.activity.rules} text={pick(activity, "rules")} />
          )}
          {pick(activity, "safety") && (
            <Block icon={<ShieldCheck className="h-5 w-5" />} title={t.activity.safety} text={pick(activity, "safety")} />
          )}
          {pick(activity, "requirements") && (
            <Block icon={<AlertTriangle className="h-5 w-5" />} title={t.activity.requirements} text={pick(activity, "requirements")} />
          )}
          {activity.images && activity.images.length > 0 && (
            <ActivityGallery images={activity.images} />
          )}
        </div>

        <form onSubmit={submit} className="bg-card rounded-2xl shadow-elegant p-6 h-fit lg:sticky lg:top-24 space-y-4">
          <h2 className="font-display text-2xl font-bold text-primary">{t.booking.title}</h2>
          <div>
            <Label>{t.booking.date}</Label>
            <Input type="date" value={date} min={today} onChange={(e) => { setDate(e.target.value); setSlotId(""); }} />
          </div>
          <div>
            <Label>{t.booking.slot}</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {slots.length === 0 && <div className="col-span-2 text-sm text-muted-foreground py-2">—</div>}
              {slots.map((s) => {
                const disabled = s.remaining < persons;
                return (
                  <button
                    type="button"
                    key={s.id}
                    disabled={disabled}
                    onClick={() => setSlotId(s.id)}
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      slotId === s.id ? "border-accent bg-accent/10 text-accent font-semibold" :
                      disabled ? "border-border bg-muted text-muted-foreground cursor-not-allowed line-through" :
                      "border-border hover:border-accent"
                    }`}
                  >
                    {s.start_time.slice(0, 5)}
                    <div className="text-[10px] opacity-70">{disabled ? t.booking.soldOut : `${s.remaining} ${t.booking.remaining}`}</div>
                  </button>
                );
              })}
            </div>
          </div>
          {hasTwoSuppliers && (
            <div>
              <Label>{t.sections.supplier}</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {[
                  { name: activity.supplier_name as string, logo: activity.supplier_logo as string | null },
                  { name: activity.supplier_name_2 as string, logo: activity.supplier_logo_2 as string | null },
                ].map((sup) => {
                  const active = supplierChoice === sup.name;
                  return (
                    <button
                      key={sup.name}
                      type="button"
                      onClick={() => setSupplierChoice(sup.name)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-start transition ${
                        active ? "border-accent bg-accent/10 text-accent font-semibold" : "border-border hover:border-accent"
                      }`}
                    >
                      {sup.logo ? (
                        <img src={sup.logo} alt={sup.name} className="h-7 w-7 rounded-full object-cover" />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-accent/15" />
                      )}
                      <span className="truncate">{sup.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div>
            <Label>{t.booking.persons}</Label>
            <Input type="number" min={1} max={20} value={persons} onChange={(e) => setPersons(Math.max(1, Number(e.target.value)))} />
          </div>
          <div>
            <Label>{t.booking.name}</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>{t.booking.phone}</Label>
            <Input required value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label>{t.booking.email}</Label>
            <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">{t.booking.total}</span>
            <span className="text-xl font-bold text-accent">{total} {t.activity.egp}</span>
          </div>
          <p className="text-xs text-muted-foreground">{t.booking.reservedNote}</p>
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={busy || !slotId}>
            {busy ? "…" : t.booking.pay}
          </Button>
        </form>
      </section>
      <Footer />
    </div>
  );
}

function Block({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-elegant">
      <h3 className="flex items-center gap-2 font-display text-xl font-bold text-primary mb-3">{icon}{title}</h3>
      <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{text}</p>
    </div>
  );
}
