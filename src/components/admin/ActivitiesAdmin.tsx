import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Images } from "lucide-react";
import { ActivityImagesAdmin } from "./ActivityImagesAdmin";

type Activity = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  category: "morning" | "night";
  type: "individual" | "group";
  price: number;
  duration_min: number | null;
  group_size: number | null;
  cover_image: string | null;
  is_active: boolean;
  is_kids: boolean;
  is_show: boolean;
  sort_order: number;
  supplier_name: string | null;
  supplier_logo: string | null;
  supplier_name_2: string | null;
  supplier_logo_2: string | null;
  rules_ar: string | null;
  rules_en: string | null;
  safety_ar: string | null;
  safety_en: string | null;
  requirements_ar: string | null;
  requirements_en: string | null;
};

const empty: Partial<Activity> = {
  slug: "", name_ar: "", name_en: "", category: "morning", type: "individual",
  price: 0, duration_min: 30, is_active: true, is_kids: false, is_show: false, sort_order: 0,
};

export function ActivitiesAdmin() {
  const [rows, setRows] = useState<Activity[]>([]);
  const [editing, setEditing] = useState<Partial<Activity> | null>(null);
  const [open, setOpen] = useState(false);
  const [imagesFor, setImagesFor] = useState<Activity | null>(null);

  const load = async () => {
    const { data } = await supabase.from("activities").select("*").order("sort_order");
    setRows((data ?? []) as Activity[]);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const payload = { ...editing, price: Number(editing.price ?? 0), duration_min: Number(editing.duration_min ?? 30), sort_order: Number(editing.sort_order ?? 0), group_size: editing.group_size ? Number(editing.group_size) : null };
    const { error } = editing.id
      ? await supabase.from("activities").update(payload).eq("id", editing.id)
      : await supabase.from("activities").insert(payload as Activity);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false); setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this activity?")) return;
    const { error } = await supabase.from("activities").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-2xl font-bold">Activities ({rows.length})</h3>
        <Button onClick={() => { setEditing(empty); setOpen(true); }} className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4 me-1" /> New</Button>
      </div>

      <div className="overflow-x-auto bg-card rounded-2xl shadow-elegant">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-3 text-start">Name</th>
              <th className="p-3 text-start">Slug</th>
              <th className="p-3 text-start">Category</th>
              <th className="p-3 text-start">Price</th>
              <th className="p-3 text-start">Active</th>
              <th className="p-3 text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-t border-border">
                <td className="p-3">{a.name_en} <span className="text-muted-foreground">/ {a.name_ar}</span></td>
                <td className="p-3 text-muted-foreground">{a.slug}</td>
                <td className="p-3">{a.category} · {a.type}{a.is_kids ? " · kids" : ""}{a.is_show ? " · show" : ""}</td>
                <td className="p-3">{a.price}</td>
                <td className="p-3">{a.is_active ? "✓" : "—"}</td>
                <td className="p-3 flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => setImagesFor(a)}><Images className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(a); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Activity" : "New Activity"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Slug</Label><Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
              <div><Label>Sort Order</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
              <div><Label>Name (AR)</Label><Input value={editing.name_ar ?? ""} onChange={(e) => setEditing({ ...editing, name_ar: e.target.value })} /></div>
              <div><Label>Name (EN)</Label><Input value={editing.name_en ?? ""} onChange={(e) => setEditing({ ...editing, name_en: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Description (AR)</Label><Textarea value={editing.description_ar ?? ""} onChange={(e) => setEditing({ ...editing, description_ar: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Description (EN)</Label><Textarea value={editing.description_en ?? ""} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} /></div>
              <div>
                <Label>Category</Label>
                <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v as "morning" | "night" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="morning">Morning</SelectItem><SelectItem value="night">Night</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v as "individual" | "group" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="individual">Individual</SelectItem><SelectItem value="group">Group</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Price (EGP)</Label><Input type="number" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></div>
              <div><Label>Duration (min)</Label><Input type="number" value={editing.duration_min ?? 30} onChange={(e) => setEditing({ ...editing, duration_min: Number(e.target.value) })} /></div>
              <div><Label>Group size</Label><Input type="number" value={editing.group_size ?? ""} onChange={(e) => setEditing({ ...editing, group_size: e.target.value ? Number(e.target.value) : null })} /></div>
              <div className="sm:col-span-2"><Label>Cover image URL</Label><Input value={editing.cover_image ?? ""} onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })} /></div>
              <div><Label>Supplier name</Label><Input value={editing.supplier_name ?? ""} onChange={(e) => setEditing({ ...editing, supplier_name: e.target.value })} /></div>
              <div><Label>Supplier logo URL</Label><Input value={editing.supplier_logo ?? ""} onChange={(e) => setEditing({ ...editing, supplier_logo: e.target.value })} /></div>
              <div><Label>Supplier 2 name</Label><Input value={editing.supplier_name_2 ?? ""} onChange={(e) => setEditing({ ...editing, supplier_name_2: e.target.value })} /></div>
              <div><Label>Supplier 2 logo URL</Label><Input value={editing.supplier_logo_2 ?? ""} onChange={(e) => setEditing({ ...editing, supplier_logo_2: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Rules (AR)</Label><Textarea value={editing.rules_ar ?? ""} onChange={(e) => setEditing({ ...editing, rules_ar: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Rules (EN)</Label><Textarea value={editing.rules_en ?? ""} onChange={(e) => setEditing({ ...editing, rules_en: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Safety (AR)</Label><Textarea value={editing.safety_ar ?? ""} onChange={(e) => setEditing({ ...editing, safety_ar: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Safety (EN)</Label><Textarea value={editing.safety_en ?? ""} onChange={(e) => setEditing({ ...editing, safety_en: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Requirements (AR)</Label><Textarea value={editing.requirements_ar ?? ""} onChange={(e) => setEditing({ ...editing, requirements_ar: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Requirements (EN)</Label><Textarea value={editing.requirements_en ?? ""} onChange={(e) => setEditing({ ...editing, requirements_en: e.target.value })} /></div>
              <label className="flex items-center gap-2"><Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /> Active</label>
              <label className="flex items-center gap-2"><Switch checked={editing.is_kids ?? false} onCheckedChange={(v) => setEditing({ ...editing, is_kids: v })} /> Kids</label>
              <label className="flex items-center gap-2"><Switch checked={editing.is_show ?? false} onCheckedChange={(v) => setEditing({ ...editing, is_show: v })} /> Show</label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-accent text-accent-foreground hover:bg-accent/90">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!imagesFor} onOpenChange={(o) => !o && setImagesFor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Gallery — {imagesFor?.name_en}</DialogTitle></DialogHeader>
          {imagesFor && <ActivityImagesAdmin activityId={imagesFor.id} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
