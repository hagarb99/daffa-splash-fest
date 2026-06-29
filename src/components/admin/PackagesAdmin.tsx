import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Pkg = {
  id: string;
  name_ar: string; name_en: string;
  description_ar: string | null; description_en: string | null;
  price: number; display_order: number; is_active: boolean;
};
type Activity = { id: string; name_en: string; name_ar: string };

const empty: Partial<Pkg> = { name_ar: "", name_en: "", price: 0, display_order: 0, is_active: true };

export function PackagesAdmin() {
  const [rows, setRows] = useState<Pkg[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editing, setEditing] = useState<Partial<Pkg> | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const [{ data: pkgs }, { data: acts }] = await Promise.all([
      supabase.from("packages").select("*").order("display_order"),
      supabase.from("activities").select("id, name_en, name_ar").order("sort_order"),
    ]);
    setRows((pkgs ?? []) as Pkg[]);
    setActivities((acts ?? []) as Activity[]);
  };
  useEffect(() => { load(); }, []);

  const openEdit = async (p?: Pkg) => {
    if (p) {
      setEditing(p);
      const { data } = await supabase.from("package_activities").select("activity_id").eq("package_id", p.id);
      setSelected((data ?? []).map((r) => r.activity_id));
    } else {
      setEditing(empty);
      setSelected([]);
    }
    setOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    const payload = {
      name_ar: editing.name_ar ?? "", name_en: editing.name_en ?? "",
      description_ar: editing.description_ar ?? null, description_en: editing.description_en ?? null,
      price: Number(editing.price ?? 0), display_order: Number(editing.display_order ?? 0),
      is_active: editing.is_active ?? true,
    };
    let pkgId = editing.id as string | undefined;
    if (pkgId) {
      const { error } = await supabase.from("packages").update(payload).eq("id", pkgId);
      if (error) return toast.error(error.message);
    } else {
      const { data, error } = await supabase.from("packages").insert(payload).select("id").single();
      if (error || !data) return toast.error(error?.message || "Failed");
      pkgId = data.id;
    }
    // Sync links: replace
    await supabase.from("package_activities").delete().eq("package_id", pkgId!);
    if (selected.length > 0) {
      const links = selected.map((aid, i) => ({ package_id: pkgId!, activity_id: aid, position: i }));
      const { error: linkErr } = await supabase.from("package_activities").insert(links);
      if (linkErr) return toast.error(linkErr.message);
    }
    toast.success("Saved");
    setOpen(false); setEditing(null); setSelected([]); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this package?")) return;
    const { error } = await supabase.from("packages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const toggleAct = (aid: string) => {
    setSelected((prev) => prev.includes(aid) ? prev.filter((x) => x !== aid) : [...prev, aid]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-2xl font-bold">Packages ({rows.length})</h3>
        <Button onClick={() => openEdit()} className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4 me-1" /> New</Button>
      </div>

      <div className="overflow-x-auto bg-card rounded-2xl shadow-elegant">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr><th className="p-3 text-start">Name</th><th className="p-3 text-start">Price</th><th className="p-3 text-start">Order</th><th className="p-3 text-start">Active</th><th className="p-3 text-start">Actions</th></tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">{p.name_en} <span className="text-muted-foreground">/ {p.name_ar}</span></td>
                <td className="p-3">{p.price}</td>
                <td className="p-3">{p.display_order}</td>
                <td className="p-3">{p.is_active ? "✓" : "—"}</td>
                <td className="p-3 flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Package" : "New Package"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Name (AR)</Label><Input value={editing.name_ar ?? ""} onChange={(e) => setEditing({ ...editing, name_ar: e.target.value })} /></div>
              <div><Label>Name (EN)</Label><Input value={editing.name_en ?? ""} onChange={(e) => setEditing({ ...editing, name_en: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Description (AR)</Label><Textarea value={editing.description_ar ?? ""} onChange={(e) => setEditing({ ...editing, description_ar: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Description (EN)</Label><Textarea value={editing.description_en ?? ""} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} /></div>
              <div><Label>Price (EGP)</Label><Input type="number" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></div>
              <div><Label>Display Order</Label><Input type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} /></div>
              <label className="flex items-center gap-2"><Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /> Active</label>

              <div className="sm:col-span-2">
                <Label>Included Activities</Label>
                <div className="mt-2 grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-3 border border-border rounded-lg">
                  {activities.map((a) => (
                    <label key={a.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggleAct(a.id)} />
                      <span>{a.name_en} <span className="text-muted-foreground">/ {a.name_ar}</span></span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Selected: {selected.length}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-accent text-accent-foreground hover:bg-accent/90">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
