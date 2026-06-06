import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Sponsor = { id: string; name_ar: string; name_en: string; logo_url: string; link: string | null; tier: "platinum" | "gold" | "silver" | "partner"; sort_order: number; is_active: boolean };
const empty: Partial<Sponsor> = { name_ar: "", name_en: "", logo_url: "", tier: "partner", sort_order: 0, is_active: true };

export function SponsorsAdmin() {
  const [rows, setRows] = useState<Sponsor[]>([]);
  const [editing, setEditing] = useState<Partial<Sponsor> | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("sponsors").select("*").order("sort_order");
    setRows((data ?? []) as Sponsor[]);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const payload = { ...editing, sort_order: Number(editing.sort_order ?? 0) };
    const { error } = editing.id
      ? await supabase.from("sponsors").update(payload).eq("id", editing.id)
      : await supabase.from("sponsors").insert(payload as Sponsor);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); setEditing(null); load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("sponsors").delete().eq("id", id);
    if (error) return toast.error(error.message); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-2xl font-bold">Sponsors ({rows.length})</h3>
        <Button onClick={() => { setEditing(empty); setOpen(true); }} className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4 me-1" /> New</Button>
      </div>
      <div className="overflow-x-auto bg-card rounded-2xl shadow-elegant">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground"><tr>
            <th className="p-3 text-start">Logo</th><th className="p-3 text-start">Name</th><th className="p-3 text-start">Tier</th><th className="p-3 text-start">Active</th><th className="p-3"></th>
          </tr></thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3">{s.logo_url && <img src={s.logo_url} alt="" className="h-8" />}</td>
                <td className="p-3">{s.name_en} / {s.name_ar}</td>
                <td className="p-3">{s.tier}</td>
                <td className="p-3">{s.is_active ? "✓" : "—"}</td>
                <td className="p-3 flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Sponsor" : "New Sponsor"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Name (AR)</Label><Input value={editing.name_ar ?? ""} onChange={(e) => setEditing({ ...editing, name_ar: e.target.value })} /></div>
              <div><Label>Name (EN)</Label><Input value={editing.name_en ?? ""} onChange={(e) => setEditing({ ...editing, name_en: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Logo URL</Label><Input value={editing.logo_url ?? ""} onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Link</Label><Input value={editing.link ?? ""} onChange={(e) => setEditing({ ...editing, link: e.target.value })} /></div>
              <div>
                <Label>Tier</Label>
                <Select value={editing.tier} onValueChange={(v) => setEditing({ ...editing, tier: v as Sponsor["tier"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["platinum", "gold", "silver", "partner"] as const).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Order</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
              <label className="flex items-center gap-2"><Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /> Active</label>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} className="bg-accent text-accent-foreground hover:bg-accent/90">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
