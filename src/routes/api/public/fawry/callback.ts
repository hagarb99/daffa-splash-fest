import { createFileRoute } from "@tanstack/react-router";
import { verifyFawrySignature, fawryMerchantCodeMatches } from "@/lib/fawry.server";

async function handle(payload: Record<string, unknown>) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // 1) Merchant code
  if (!fawryMerchantCodeMatches(payload)) return new Response("BAD_MERCHANT", { status: 401 });
  // 2) Signature
  if (!verifyFawrySignature(payload)) return new Response("BAD_SIGNATURE", { status: 401 });

  const merchantRef = String(payload.merchantRefNumber || "");
  const fawryRef = String(payload.fawryRefNumber || "");
  const orderStatus = String(payload.orderStatus || "").toUpperCase();
  const amount = Number(payload.paymentAmount ?? payload.orderAmount ?? 0);
  if (!merchantRef) return new Response("BAD_REF", { status: 400 });

  // 3) Booking exists and is pending (or already confirmed for idempotency)
  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("id, status, total_price, time_slot_id, persons")
    .eq("id", merchantRef)
    .maybeSingle();
  if (!booking) return new Response("NOT_FOUND", { status: 404 });

  // 4) Amount matches exactly
  if (Math.abs(Number(booking.total_price) - amount) > 0.001) {
    return new Response("AMOUNT_MISMATCH", { status: 400 });
  }

  // 5) Idempotency: payment row keyed by fawry_reference
  const isPaid = orderStatus === "PAID";
  const isFailed = ["FAILED", "CANCELED", "CANCELLED", "EXPIRED", "REFUNDED"].includes(orderStatus);

  const { error: payErr } = await supabaseAdmin.from("payments").upsert(
    {
      booking_id: booking.id,
      provider: "fawry",
      fawry_reference: fawryRef || booking.id,
      amount,
      status: orderStatus,
      signature: String(payload.messageSignature || ""),
      raw_payload: payload,
    },
    { onConflict: "fawry_reference" },
  );
  if (payErr) console.error("payments upsert error", payErr);

  if (isPaid && booking.status === "pending") {
    await supabaseAdmin.from("bookings").update({ status: "confirmed" }).eq("id", booking.id).eq("status", "pending");
  } else if (isFailed && booking.status === "pending") {
    // Release capacity and mark cancelled
    const { error: cancelErr } = await supabaseAdmin
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", booking.id)
      .eq("status", "pending");
    if (!cancelErr) {
      await supabaseAdmin.rpc("expire_pending_bookings"); // safe net
      // Direct release: set reserved_capacity -= persons
      const { data: slot } = await supabaseAdmin
        .from("time_slots").select("reserved_capacity").eq("id", booking.time_slot_id).maybeSingle();
      if (slot) {
        await supabaseAdmin
          .from("time_slots")
          .update({ reserved_capacity: Math.max(0, slot.reserved_capacity - booking.persons) })
          .eq("id", booking.time_slot_id);
      }
    }
  }

  return new Response("OK", { status: 200 });
}

export const Route = createFileRoute("/api/public/fawry/callback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const payload = (await request.json()) as Record<string, unknown>;
          return await handle(payload);
        } catch (e) {
          console.error("Fawry callback error", e);
          return new Response("BAD_REQUEST", { status: 400 });
        }
      },
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const payload: Record<string, string> = {};
        url.searchParams.forEach((v, k) => { payload[k] = v; });
        return await handle(payload);
      },
    },
  },
});
