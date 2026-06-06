import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Status = "pending" | "confirmed" | "cancelled" | "expired";
type Booking = {
  id: string; status: Status; total_price: number; persons: number; created_at: string;
  contact_name: string | null; contact_phone: string | null; contact_email: string | null;
  supplier_choice: string | null; fawry_ref: string | null;
  activities?: { name_en: string } | null;
  time_slots?: { slot_date: string; start_time: string } | null;
};

const STATUSES: Status[] = ["pending", "confirmed", "cancelled", "expired"];

export function BookingsAdmin() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<Status | "all">("all");

  const load = async () => {
    let q = supabase.from("bookings").select("id,status,total_price,persons,created_at,contact_name,contact_phone,contact_email,supplier_choice,fawry_ref,activities(name_en),time_slots(slot_date,start_time)").order("created_at", { ascending: false }).limit(200);
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setRows((data as unknown as Booking[]) ?? []);
  };
  useEffect(() => { load(); }, [filter]);

  const setStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated"); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-2xl font-bold">Bookings ({rows.length})</h3>
        <Select value={filter} onValueChange={(v) => setFilter(v as Status | "all")}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto bg-card rounded-2xl shadow-elegant">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground"><tr>
            <th className="p-3 text-start">Activity</th><th className="p-3 text-start">When</th><th className="p-3 text-start">Customer</th>
            <th className="p-3 text-start">Persons</th><th className="p-3 text-start">Total</th><th className="p-3 text-start">Supplier</th>
            <th className="p-3 text-start">Status</th><th className="p-3 text-start">Actions</th>
          </tr></thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className="border-t border-border align-top">
                <td className="p-3">{b.activities?.name_en ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{b.time_slots ? `${b.time_slots.slot_date} ${b.time_slots.start_time}` : "—"}</td>
                <td className="p-3"><div>{b.contact_name ?? "—"}</div><div className="text-xs text-muted-foreground">{b.contact_phone} {b.contact_email}</div></td>
                <td className="p-3">{b.persons}</td>
                <td className="p-3">{Number(b.total_price).toFixed(2)}</td>
                <td className="p-3 text-muted-foreground">{b.supplier_choice ?? "—"}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${b.status === "confirmed" ? "bg-accent/20" : b.status === "cancelled" ? "bg-destructive/20" : "bg-muted"}`}>{b.status}</span></td>
                <td className="p-3 flex gap-1 flex-wrap">
                  {b.status !== "confirmed" && <Button size="sm" variant="outline" onClick={() => setStatus(b.id, "confirmed")}>Confirm</Button>}
                  {b.status !== "cancelled" && <Button size="sm" variant="outline" onClick={() => setStatus(b.id, "cancelled")}>Cancel</Button>}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">No bookings.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
