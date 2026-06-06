import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

type Img = { id: string; url: string; sort_order: number; activity_id: string };

export function ActivityImagesAdmin({ activityId }: { activityId: string }) {
  const [rows, setRows] = useState<Img[]>([]);
  const [url, setUrl] = useState("");

  const load = async () => {
    const { data } = await supabase.from("activity_images").select("*").eq("activity_id", activityId).order("sort_order");
    setRows((data ?? []) as Img[]);
  };
  useEffect(() => { load(); }, [activityId]);

  const add = async () => {
    if (!url) return;
    const { error } = await supabase.from("activity_images").insert({ activity_id: activityId, url, sort_order: rows.length });
    if (error) return toast.error(error.message);
    setUrl(""); load();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("activity_images").delete().eq("id", id);
    if (error) return toast.error(error.message); load();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input placeholder="Image URL" value={url} onChange={(e) => setUrl(e.target.value)} />
        <Button onClick={add} className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4" /></Button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {rows.map((r) => (
          <div key={r.id} className="relative group rounded-lg overflow-hidden border border-border">
            <img src={r.url} alt="" className="w-full h-24 object-cover" />
            <button onClick={() => remove(r.id)} className="absolute top-1 end-1 bg-destructive text-destructive-foreground rounded p-1 opacity-0 group-hover:opacity-100 transition"><Trash2 className="h-3 w-3" /></button>
          </div>
        ))}
        {rows.length === 0 && <p className="col-span-3 text-sm text-muted-foreground">No images yet.</p>}
      </div>
    </div>
  );
}
