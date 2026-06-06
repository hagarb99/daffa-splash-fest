import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

type Setting = { key: string; value: string | null; updated_at: string };

export function SettingsAdmin() {
  const [rows, setRows] = useState<Setting[]>([]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const load = async () => {
    const { data } = await supabase.from("app_settings").select("*").order("key");
    setRows((data ?? []) as Setting[]);
  };
  useEffect(() => { load(); }, []);

  const save = async (key: string, value: string) => {
    const { error } = await supabase.from("app_settings").upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) return toast.error(error.message);
    toast.success("Saved"); load();
  };
  const remove = async (key: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("app_settings").delete().eq("key", key);
    if (error) return toast.error(error.message); load();
  };
  const add = async () => {
    if (!newKey) return;
    await save(newKey, newValue);
    setNewKey(""); setNewValue("");
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display text-2xl font-bold">App Settings</h3>
      <div className="bg-card rounded-2xl shadow-elegant p-4 space-y-3">
        {rows.map((r) => <Row key={r.key} setting={r} onSave={save} onDelete={remove} />)}
        <div className="border-t border-border pt-3 grid sm:grid-cols-[1fr_2fr_auto] gap-2 items-end">
          <div><Label>New key</Label><Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="e.g. whatsapp_number" /></div>
          <div><Label>Value</Label><Input value={newValue} onChange={(e) => setNewValue(e.target.value)} /></div>
          <Button onClick={add} className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4 me-1" /> Add</Button>
        </div>
      </div>
    </div>
  );
}

function Row({ setting, onSave, onDelete }: { setting: Setting; onSave: (k: string, v: string) => void; onDelete: (k: string) => void }) {
  const [v, setV] = useState(setting.value ?? "");
  return (
    <div className="grid sm:grid-cols-[1fr_2fr_auto_auto] gap-2 items-center">
      <div className="font-mono text-sm">{setting.key}</div>
      <Input value={v} onChange={(e) => setV(e.target.value)} />
      <Button size="sm" onClick={() => onSave(setting.key, v)}>Save</Button>
      <Button size="icon" variant="ghost" onClick={() => onDelete(setting.key)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
    </div>
  );
}
