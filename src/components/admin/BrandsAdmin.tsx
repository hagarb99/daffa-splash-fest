import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Brand = { id: string; name_ar: string; name_en: string; logo_url: string; category: string | null; sort_order: number; is_active: boolean };
const empty: Partial<Brand> = { name_ar: "", name_en: "", logo_url: "", sort_order: 0, is_active: true };

export function BrandsAdmin() {
  const [rows, setRows] = useState<Brand[]>([]);
  const [editing, setEditing] = useState<Partial<Brand> | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("brands").select("*").order("sort_order");
    setRows((data ?? []) as Brand[]);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const payload = { ...editing, sort_order: Number(editing.sort_order ?? 0) };
    const { error } = editing.id
      ? await supabase.from("brands").update(payload).eq("id", editing.id)
      : await supabase.from("brands").insert(payload as Brand);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); setEditing(null); load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) return toast.error(error.message); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-2xl font-bold">Brands ({rows.length})</h3>
        <Button onClick={() => { setEditing(empty); setOpen(true); }} className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4 me-1" /> New</Button>
      </div>
      <div className="overflow-x-auto bg-card rounded-2xl shadow-elegant">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground"><tr>
            <th className="p-3 text-start">Logo</th><th className="p-3 text-start">Name</th><th className="p-3 text-start">Category</th><th className="p-3 text-start">Active</th><th className="p-3"></th>
          </tr></thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className="border-t border-border">
                <td className="p-3">{b.logo_url && <img src={b.logo_url} alt="" className="h-8" />}</td>
                <td className="p-3">{b.name_en} / {b.name_ar}</td>
                <td className="p-3 text-muted-foreground">{b.category ?? "—"}</td>
                <td className="p-3">{b.is_active ? "✓" : "—"}</td>
                <td className="p-3 flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(b); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Brand" : "New Brand"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Name (AR)</Label><Input value={editing.name_ar ?? ""} onChange={(e) => setEditing({ ...editing, name_ar: e.target.value })} /></div>
              <div><Label>Name (EN)</Label><Input value={editing.name_en ?? ""} onChange={(e) => setEditing({ ...editing, name_en: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Logo URL</Label><Input value={editing.logo_url ?? ""} onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })} /></div>
              <div><Label>Category</Label><Input value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
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
