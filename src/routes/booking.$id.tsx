import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLang } from "@/lib/i18n";
import { getMyBooking } from "@/lib/booking.functions";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export const Route = createFileRoute("/booking/$id")({
  component: BookingPage,
});

function BookingPage() {
  const { id } = Route.useParams();
  const { t, pick } = useLang();
  const fn = useServerFn(getMyBooking);
  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => fn({ data: { id } }),
    refetchInterval: (q) => (q.state.data?.status === "pending" ? 4000 : false),
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <section className="flex-1 max-w-2xl mx-auto px-4 py-20 w-full">
        {isLoading && <div className="text-center text-muted-foreground">…</div>}
        {booking && (
          <div className="bg-card rounded-3xl shadow-elegant p-10 text-center">
            {booking.status === "confirmed" && <CheckCircle2 className="mx-auto h-16 w-16 text-accent" />}
            {booking.status === "pending" && <Clock className="mx-auto h-16 w-16 text-gold animate-pulse" />}
            {(booking.status === "expired" || booking.status === "cancelled") && <XCircle className="mx-auto h-16 w-16 text-destructive" />}
            <h1 className="mt-4 font-display text-3xl font-bold text-primary">
              {booking.status === "confirmed" && t.booking.success}
              {booking.status === "pending" && t.booking.pending}
              {booking.status === "expired" && t.booking.expired}
              {booking.status === "cancelled" && t.booking.cancelled}
            </h1>
            {booking.activities && (
              <div className="mt-6 text-muted-foreground">
                <div className="text-lg font-semibold text-foreground">{pick(booking.activities)}</div>
                {booking.time_slots && (
                  <div className="mt-1 text-sm">
                    {booking.time_slots.slot_date} • {booking.time_slots.start_time.slice(0,5)}
                  </div>
                )}
                <div className="mt-3 font-bold text-accent text-xl">{Number(booking.total_price).toFixed(2)} {t.activity.egp}</div>
              </div>
            )}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
