import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

type Slot = { id: string; activity_id: string; slot_date: string; start_time: string; end_time: string; total_capacity: number; reserved_capacity: number; is_active: boolean };
type Activity = { id: string; name_en: string };

export function TimeSlotsAdmin() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityId, setActivityId] = useState<string>("");
  const [rows, setRows] = useState<Slot[]>([]);
  const [form, setForm] = useState({ slot_date: "", start_time: "10:00", end_time: "11:00", total_capacity: 10 });

  useEffect(() => {
    supabase.from("activities").select("id,name_en").order("sort_order").then(({ data }) => {
      setActivities((data ?? []) as Activity[]);
      if (data?.[0]) setActivityId(data[0].id);
    });
  }, []);

  const load = async () => {
    if (!activityId) return;
    const { data } = await supabase.from("time_slots").select("*").eq("activity_id", activityId).order("slot_date").order("start_time");
    setRows((data ?? []) as Slot[]);
  };
  useEffect(() => { load(); }, [activityId]);

  const add = async () => {
    if (!activityId || !form.slot_date) return toast.error("Pick activity & date");
    const { error } = await supabase.from("time_slots").insert({ activity_id: activityId, ...form, is_active: true });
    if (error) return toast.error(error.message);
    toast.success("Slot added"); load();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("time_slots").delete().eq("id", id);
    if (error) return toast.error(error.message); load();
  };
  const toggle = async (s: Slot) => {
    const { error } = await supabase.from("time_slots").update({ is_active: !s.is_active }).eq("id", s.id);
    if (error) return toast.error(error.message); load();
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display text-2xl font-bold">Time Slots</h3>
      <div className="bg-card rounded-2xl shadow-elegant p-4 space-y-3">
        <div>
          <Label>Activity</Label>
          <Select value={activityId} onValueChange={setActivityId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{activities.map((a) => <SelectItem key={a.id} value={a.id}>{a.name_en}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid sm:grid-cols-5 gap-2 items-end">
          <div><Label>Date</Label><Input type="date" value={form.slot_date} onChange={(e) => setForm({ ...form, slot_date: e.target.value })} /></div>
          <div><Label>Start</Label><Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
          <div><Label>End</Label><Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
          <div><Label>Capacity</Label><Input type="number" value={form.total_capacity} onChange={(e) => setForm({ ...form, total_capacity: Number(e.target.value) })} /></div>
          <Button onClick={add} className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4 me-1" /> Add</Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-card rounded-2xl shadow-elegant">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground"><tr>
            <th className="p-3 text-start">Date</th><th className="p-3 text-start">Start</th><th className="p-3 text-start">End</th>
            <th className="p-3 text-start">Reserved / Total</th><th className="p-3 text-start">Active</th><th className="p-3"></th>
          </tr></thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3">{s.slot_date}</td>
                <td className="p-3">{s.start_time}</td>
                <td className="p-3">{s.end_time}</td>
                <td className="p-3">{s.reserved_capacity} / {s.total_capacity}</td>
                <td className="p-3"><button onClick={() => toggle(s)} className="underline">{s.is_active ? "on" : "off"}</button></td>
                <td className="p-3"><Button size="icon" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No slots.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
