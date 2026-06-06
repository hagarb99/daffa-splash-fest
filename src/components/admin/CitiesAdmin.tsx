import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

type City = { id: string; name_ar: string; name_en: string; image: string | null; start_date: string | null; end_date: string | null; order_index: number; is_active: boolean };
const empty: Partial<City> = { name_ar: "", name_en: "", order_index: 0, is_active: true };

export function CitiesAdmin() {
  const [rows, setRows] = useState<City[]>([]);
  const [editing, setEditing] = useState<Partial<City> | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("cities").select("*").order("order_index");
    setRows((data ?? []) as City[]);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const payload = { ...editing, order_index: Number(editing.order_index ?? 0) };
    const { error } = editing.id
      ? await supabase.from("cities").update(payload).eq("id", editing.id)
      : await supabase.from("cities").insert(payload as City);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); setEditing(null); load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("cities").delete().eq("id", id);
    if (error) return toast.error(error.message); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-2xl font-bold">Cities ({rows.length})</h3>
        <Button onClick={() => { setEditing(empty); setOpen(true); }} className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4 me-1" /> New</Button>
      </div>
      <div className="overflow-x-auto bg-card rounded-2xl shadow-elegant">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground"><tr>
            <th className="p-3 text-start">Name</th><th className="p-3 text-start">Dates</th><th className="p-3 text-start">Active</th><th className="p-3"></th>
          </tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3">{c.name_en} / {c.name_ar}</td>
                <td className="p-3 text-muted-foreground">{c.start_date} → {c.end_date}</td>
                <td className="p-3">{c.is_active ? "✓" : "—"}</td>
                <td className="p-3 flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit City" : "New City"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Name (AR)</Label><Input value={editing.name_ar ?? ""} onChange={(e) => setEditing({ ...editing, name_ar: e.target.value })} /></div>
              <div><Label>Name (EN)</Label><Input value={editing.name_en ?? ""} onChange={(e) => setEditing({ ...editing, name_en: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Image URL</Label><Input value={editing.image ?? ""} onChange={(e) => setEditing({ ...editing, image: e.target.value })} /></div>
              <div><Label>Start date</Label><Input type="date" value={editing.start_date ?? ""} onChange={(e) => setEditing({ ...editing, start_date: e.target.value })} /></div>
              <div><Label>End date</Label><Input type="date" value={editing.end_date ?? ""} onChange={(e) => setEditing({ ...editing, end_date: e.target.value })} /></div>
              <div><Label>Order</Label><Input type="number" value={editing.order_index ?? 0} onChange={(e) => setEditing({ ...editing, order_index: Number(e.target.value) })} /></div>
              <label className="flex items-center gap-2"><Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /> Active</label>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} className="bg-accent text-accent-foreground hover:bg-accent/90">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
